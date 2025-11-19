import { GoogleGenerativeAI } from '@google/generative-ai';
import { RepositoryAnalysis } from './repo-analyzer.js';
import { PromptBuilder } from '../utils/prompt-builder.js';

/**
 * Options for wiki generation
 */
export interface WikiGenerationOptions {
  model?: string; // Default: gemini-2.5-flash
  sections?: string[]; // Default: all sections
  includeDiagrams?: boolean; // Default: true
}

/**
 * A wiki section
 */
export interface WikiSection {
  title: string;
  content: string;
  order: number;
}

/**
 * A Mermaid diagram
 */
export interface MermaidDiagram {
  title: string;
  type: 'architecture' | 'dataflow' | 'directory' | 'dependency';
  syntax: string; // Mermaid syntax
}

/**
 * Complete wiki generation result
 */
export interface WikiResult {
  title: string;
  description: string;
  sections: WikiSection[];
  diagrams: MermaidDiagram[];
  metadata: {
    generatedAt: string;
    model: string;
    totalTokens: number;
    estimatedCost: number;
  };
}

/**
 * Generates wiki documentation using Gemini AI
 */
export class WikiGenerator {
  private genAI: GoogleGenerativeAI | null = null;
  private promptBuilder: PromptBuilder;
  private readonly DEFAULT_SECTIONS = [
    'overview',
    'architecture',
    'setup',
    'development',
    'api',
    'testing',
  ];

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    this.promptBuilder = new PromptBuilder();
  }

  /**
   * Generate comprehensive wiki documentation
   */
  async generate(
    analysis: RepositoryAnalysis,
    options?: WikiGenerationOptions
  ): Promise<WikiResult> {
    const {
      model = 'gemini-2.5-flash',
      sections = this.DEFAULT_SECTIONS,
      includeDiagrams = true,
    } = options || {};

    // Check if API key is available
    if (!this.genAI) {
      throw new Error(
        'Gemini API key not provided. Set GEMINI_API_KEY environment variable or pass apiKey to constructor.'
      );
    }

    let totalTokens = 0;
    const generatedSections: WikiSection[] = [];
    const generatedDiagrams: MermaidDiagram[] = [];

    // Generate sections
    for (let i = 0; i < sections.length; i++) {
      const sectionType = sections[i];
      try {
        const section = await this.generateSection(sectionType, analysis, model);
        generatedSections.push({
          ...section,
          order: i,
        });

        // Rough token estimation (will be more accurate with actual API response)
        totalTokens += this.estimateTokens(section.content);
      } catch (error) {
        console.error(`Failed to generate section ${sectionType}:`, error);
        // Continue with other sections
        generatedSections.push({
          title: this.formatSectionTitle(sectionType),
          content: `*Section generation failed: ${error instanceof Error ? error.message : 'Unknown error'}*`,
          order: i,
        });
      }
    }

    // Generate diagrams
    if (includeDiagrams) {
      const diagramTypes: Array<'architecture' | 'dataflow'> = ['architecture', 'dataflow'];

      for (const diagramType of diagramTypes) {
        try {
          const diagram = await this.generateDiagram(diagramType, analysis, model);
          generatedDiagrams.push(diagram);
          totalTokens += this.estimateTokens(diagram.syntax);
        } catch (error) {
          console.error(`Failed to generate ${diagramType} diagram:`, error);
          // Continue with other diagrams
        }
      }
    }

    // Calculate estimated cost (rough approximation)
    const estimatedCost = this.estimateCost(totalTokens, model);

    return {
      title: analysis.metadata.name,
      description: analysis.metadata.description || `Documentation for ${analysis.metadata.name}`,
      sections: generatedSections,
      diagrams: generatedDiagrams,
      metadata: {
        generatedAt: new Date().toISOString(),
        model,
        totalTokens,
        estimatedCost,
      },
    };
  }

  /**
   * Generate a single wiki section
   */
  async generateSection(
    sectionType: string,
    analysis: RepositoryAnalysis,
    modelName: string
  ): Promise<WikiSection> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = this.promptBuilder.buildSectionPrompt(sectionType, analysis);
    const model = this.genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    return {
      title: this.formatSectionTitle(sectionType),
      content: content.trim(),
      order: 0, // Will be set by caller
    };
  }

  /**
   * Generate a Mermaid diagram
   */
  async generateDiagram(
    diagramType: 'architecture' | 'dataflow' | 'directory' | 'dependency',
    analysis: RepositoryAnalysis,
    modelName: string = 'gemini-2.5-flash'
  ): Promise<MermaidDiagram> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = this.promptBuilder.buildDiagramPrompt(diagramType, analysis);
    const model = this.genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text().trim();

    // Extract Mermaid code from markdown code blocks if present (handle different line endings)
    const mermaidMatch = content.match(/```\s*mermaid\s*[\r\n]+([\s\S]*?)```/i);
    if (mermaidMatch) {
      content = mermaidMatch[1].trim();
    } else {
      // Remove any other code block markers
      content = content.replace(/```[\s\S]*?[\r\n]+/, '').replace(/```\s*$/, '');
    }

    return {
      title: this.formatDiagramTitle(diagramType),
      type: diagramType,
      syntax: content,
    };
  }

  /**
   * Format section type into a title
   */
  private formatSectionTitle(sectionType: string): string {
    const titleMap: Record<string, string> = {
      overview: 'Overview',
      architecture: 'Architecture & Design',
      setup: 'Getting Started',
      development: 'Development Guide',
      api: 'API Reference',
      testing: 'Testing',
      deployment: 'Deployment',
      contributing: 'Contributing',
      security: 'Security',
    };

    return (
      titleMap[sectionType] ||
      sectionType
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  }

  /**
   * Format diagram type into a title
   */
  private formatDiagramTitle(diagramType: string): string {
    const titleMap: Record<string, string> = {
      architecture: 'Architecture Diagram',
      dataflow: 'Data Flow Diagram',
      directory: 'Directory Structure',
      dependency: 'Dependency Graph',
    };

    return titleMap[diagramType] || diagramType;
  }

  /**
   * Estimate tokens for cost calculation (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Estimate cost based on tokens and model
   * Note: Uses simplified flat-rate pricing for estimation
   * For tiered pricing, use CostEstimator class
   */
  private estimateCost(tokens: number, model: string): number {
    // Simplified pricing per 1M tokens (as of Nov 2025)
    // For full pricing with tiers, use cost-estimator.ts
    const pricing: Record<string, { input: number; output: number }> = {
      'gemini-2.5-pro': { input: 1.25, output: 10.0 }, // Simplified (actual has tiers)
      'gemini-2.5-flash': { input: 0.3, output: 2.5 },
      'gemini-2.5-flash-lite': { input: 0.1, output: 0.4 },
      'gemini-3-pro-preview': { input: 0.002, output: 0.012 }, // Simplified (actual has tiers)
      'gemini-2.0-flash-exp': { input: 0.1, output: 0.4 },
      'gemini-1.5-pro': { input: 1.25, output: 5.0 }, // Simplified (actual has tiers)
      'gemini-1.5-flash': { input: 0.075, output: 0.3 }, // Simplified (actual has tiers)
    };

    const modelPricing = pricing[model] || pricing['gemini-2.5-flash'];

    // Assume 70% input, 30% output tokens
    const inputTokens = tokens * 0.7;
    const outputTokens = tokens * 0.3;

    const inputCost = (inputTokens / 1000000) * modelPricing.input;
    const outputCost = (outputTokens / 1000000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Compile wiki sections and diagrams into a single markdown document
   */
  compileMarkdown(wiki: WikiResult): string {
    const lines: string[] = [];

    // Title
    lines.push(`# ${wiki.title}\n`);

    // Description
    if (wiki.description) {
      lines.push(`> ${wiki.description}\n`);
    }

    // Metadata
    lines.push(`**Generated:** ${new Date(wiki.metadata.generatedAt).toLocaleString()}`);
    lines.push(`**Model:** ${wiki.metadata.model}`);
    lines.push(`**Estimated Cost:** $${wiki.metadata.estimatedCost.toFixed(6)}\n`);

    // Table of Contents (use spread to avoid mutation)
    const sortedSections = [...wiki.sections].sort((a, b) => a.order - b.order);
    lines.push('## Table of Contents\n');
    for (const section of sortedSections) {
      const anchor = section.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      lines.push(`- [${section.title}](#${anchor})`);
    }
    if (wiki.diagrams.length > 0) {
      lines.push('- [Diagrams](#diagrams)');
    }
    lines.push('');

    // Sections
    for (const section of sortedSections) {
      lines.push(`## ${section.title}\n`);
      lines.push(`${section.content}\n`);
    }

    // Diagrams
    if (wiki.diagrams.length > 0) {
      lines.push('## Diagrams\n');

      for (const diagram of wiki.diagrams) {
        lines.push(`### ${diagram.title}\n`);
        lines.push('```mermaid');
        lines.push(diagram.syntax);
        lines.push('```\n');
      }
    }

    return lines.join('\n');
  }
}
