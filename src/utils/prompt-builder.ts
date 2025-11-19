import { RepositoryAnalysis } from '../tools/repo-analyzer.js';

/**
 * Builds prompts for wiki section generation
 */
export class PromptBuilder {
  /**
   * Build a prompt for generating a specific wiki section
   */
  buildSectionPrompt(sectionType: string, analysis: RepositoryAnalysis): string {
    const { metadata, techStack, structure, statistics } = analysis;

    const baseContext = `
Repository Context:
- Name: ${metadata.name}
- Primary Language: ${techStack.primaryLanguage}
- Frameworks: ${techStack.frameworks.join(', ') || 'None detected'}
- Total Files: ${structure.totalFiles}
- Total Lines: ${structure.totalLines}
- Code Files: ${statistics.codeFiles}
- Test Files: ${statistics.testFiles}

Languages Used:
${Object.entries(techStack.languages)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([lang, lines]) => `- ${lang}: ${lines} lines`)
  .join('\n')}

Package Managers: ${techStack.packageManagers.join(', ')}
Dependencies: ${Object.keys(techStack.dependencies).length} total
`;

    const prompts: Record<string, string> = {
      overview: `You are a technical documentation expert. Generate a comprehensive "Overview" section for the following repository.

${baseContext}

${metadata.readme ? `README Content (first 500 chars):\n${metadata.readme.substring(0, 500)}\n` : ''}

Instructions:
1. Write a clear, concise overview of what this project does
2. Include the project's purpose and key features
3. Mention the main technologies used
4. Target audience: developers familiar with ${techStack.primaryLanguage}
5. Keep the section length to approximately 300-500 words
6. Use markdown formatting
7. Do not include generic filler content
8. Focus on what makes this project unique

Generate the Overview section now:`,

      architecture: `You are a technical documentation expert. Generate a comprehensive "Architecture & Design" section for the following repository.

${baseContext}

Directory Structure (sample):
${this.getDirectoryTreeSample(analysis)}

Instructions:
1. Describe the overall architecture and design patterns
2. Explain the directory structure and organization
3. Identify key architectural decisions based on the tech stack
4. Mention design patterns commonly used with these frameworks
5. Keep the section length to approximately 400-600 words
6. Use markdown formatting
7. Be specific to this project's tech stack
8. If you see patterns like MVC, microservices, monorepo, mention them

Generate the Architecture & Design section now:`,

      setup: `You are a technical documentation expert. Generate a comprehensive "Getting Started / Setup" section for the following repository.

${baseContext}

Package Manager: ${techStack.packageManagers[0] || 'npm'}
${Object.keys(techStack.dependencies).length > 0 ? `Key Dependencies: ${Object.keys(techStack.dependencies).slice(0, 5).join(', ')}` : ''}

Instructions:
1. Provide clear installation and setup instructions
2. Include prerequisites (Node.js version, Python version, etc. based on the tech stack)
3. Provide step-by-step installation commands
4. Include how to run the project locally
5. Mention environment variable setup if applicable
6. Keep the section length to approximately 300-500 words
7. Use code blocks with proper syntax highlighting
8. Be specific to the detected package managers

Generate the Getting Started / Setup section now:`,

      development: `You are a technical documentation expert. Generate a comprehensive "Development Guide" section for the following repository.

${baseContext}

Instructions:
1. Explain the development workflow
2. Describe how to run the project in development mode
3. Explain the project structure for developers
4. Include information about code style and conventions
5. Mention testing practices (${statistics.testFiles} test files detected)
6. Keep the section length to approximately 400-600 words
7. Use markdown formatting with code examples
8. Focus on practical development tasks

Generate the Development Guide section now:`,

      api: `You are a technical documentation expert. Generate a comprehensive "API Reference" section for the following repository.

${baseContext}

Instructions:
1. Describe the main APIs, endpoints, or public interfaces
2. Based on the tech stack, infer common API patterns
3. Include example requests/responses if applicable
4. Document key functions, classes, or modules
5. Keep the section length to approximately 400-600 words
6. Use code blocks with proper syntax highlighting
7. If this is a library, document the main exports
8. If this is a web service, document the endpoints

Generate the API Reference section now:`,

      testing: `You are a technical documentation expert. Generate a comprehensive "Testing Guide" section for the following repository.

${baseContext}

Test Files: ${statistics.testFiles}

Instructions:
1. Explain how to run tests
2. Describe the testing strategy and frameworks used
3. Include examples of running unit tests, integration tests
4. Mention test coverage if relevant
5. Keep the section length to approximately 300-500 words
6. Use code blocks for test commands
7. Be specific to the detected tech stack and testing frameworks

Generate the Testing Guide section now:`,
    };

    return prompts[sectionType] || this.buildCustomSectionPrompt(sectionType, analysis);
  }

  /**
   * Build a custom section prompt
   */
  private buildCustomSectionPrompt(sectionType: string, analysis: RepositoryAnalysis): string {
    const { metadata, techStack } = analysis;

    return `You are a technical documentation expert. Generate a comprehensive "${sectionType}" section for the following repository.

Repository: ${metadata.name}
Primary Language: ${techStack.primaryLanguage}
Frameworks: ${techStack.frameworks.join(', ') || 'None'}

Instructions:
1. Write relevant content for the "${sectionType}" section
2. Keep the section length to approximately 300-500 words
3. Use markdown formatting
4. Be specific and avoid generic filler content

Generate the ${sectionType} section now:`;
  }

  /**
   * Build a prompt for generating a Mermaid diagram
   */
  buildDiagramPrompt(diagramType: string, analysis: RepositoryAnalysis): string {
    const { metadata, techStack, structure } = analysis;

    const prompts: Record<string, string> = {
      architecture: `Create a Mermaid diagram showing the architecture for this repository.

Repository: ${metadata.name}
Languages: ${Object.keys(techStack.languages).join(', ')}
Frameworks: ${techStack.frameworks.join(', ')}

Directory Structure (sample):
${this.getDirectoryTreeSample(analysis)}

Requirements:
1. Use valid Mermaid graph syntax (flowchart TD or graph TD)
2. Show the main components and their relationships
3. Keep the diagram focused and readable (max 12-15 nodes)
4. Include key directories like src/, tests/, config/, etc.
5. Show data flow or component relationships
6. Use appropriate Mermaid shapes (rectangles, cylinders, etc.)
7. Return ONLY the Mermaid code block, no explanation

Example format:
\`\`\`mermaid
graph TD
    A[Component A] --> B[Component B]
    B --> C[Component C]
\`\`\`

Generate the architecture diagram now:`,

      dataflow: `Create a Mermaid diagram showing the data flow for this repository.

Repository: ${metadata.name}
Type: ${this.inferProjectType(techStack)}
Frameworks: ${techStack.frameworks.join(', ')}

Requirements:
1. Use valid Mermaid flowchart syntax
2. Show how data flows through the system
3. Include main entry points, processing, and outputs
4. Keep the diagram focused and readable (max 12-15 nodes)
5. Use appropriate Mermaid arrow types (-->, -.->)
6. Return ONLY the Mermaid code block, no explanation

Generate the data flow diagram now:`,

      directory: `Create a Mermaid diagram showing the directory structure for this repository.

Repository: ${metadata.name}
Total Files: ${structure.totalFiles}
Max Depth: ${structure.maxDepth}

Directory Structure:
${this.getDirectoryTreeSample(analysis)}

Requirements:
1. Use valid Mermaid graph syntax
2. Show the main directories and their relationships
3. Keep the diagram focused (top-level directories and important subdirectories)
4. Use appropriate Mermaid shapes for folders and files
5. Return ONLY the Mermaid code block, no explanation

Generate the directory structure diagram now:`,
    };

    return prompts[diagramType] || prompts['architecture'];
  }

  /**
   * Get a sample of the directory tree for prompts
   */
  private getDirectoryTreeSample(analysis: RepositoryAnalysis): string {
    const lines: string[] = [];
    const { directories } = analysis.structure;

    const traverse = (nodes: typeof directories, prefix: string = '', depth: number = 0) => {
      if (depth > 2 || lines.length > 20) return; // Limit sample size

      for (let i = 0; i < Math.min(nodes.length, 10); i++) {
        const node = nodes[i];
        const isLast = i === nodes.length - 1;
        const marker = isLast ? '└── ' : '├── ';

        lines.push(`${prefix}${marker}${node.name}${node.type === 'directory' ? '/' : ''}`);

        if (node.children && node.children.length > 0 && depth < 2) {
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          traverse(node.children, newPrefix, depth + 1);
        }
      }
    };

    traverse(directories);
    return lines.slice(0, 20).join('\n');
  }

  /**
   * Infer project type from tech stack
   */
  private inferProjectType(techStack: RepositoryAnalysis['techStack']): string {
    const frameworks = techStack.frameworks.map((f: string) => f.toLowerCase());

    if (frameworks.some((f: string) => ['react', 'vue', 'angular', 'svelte'].includes(f))) {
      return 'Frontend Application';
    }
    if (
      frameworks.some((f: string) =>
        ['express', 'fastify', 'koa', 'nestjs', 'django', 'fastapi', 'flask'].includes(f)
      )
    ) {
      return 'Backend API';
    }
    if (frameworks.some((f: string) => ['next', 'nuxt', 'gatsby', 'remix'].includes(f))) {
      return 'Full-Stack Framework';
    }
    if (frameworks.some((f: string) => f.includes('mcp'))) {
      return 'MCP Server/Tool';
    }

    return 'Application';
  }

  /**
   * Select relevant code samples for a section type
   */
  selectRelevantCode(
    analysis: RepositoryAnalysis,
    sectionType: string
  ): { file: string; language: string }[] {
    const samples: { file: string; language: string }[] = [];
    const { structure } = analysis;

    // This is a simplified version - in a full implementation,
    // we would actually read file contents
    const relevantPatterns: Record<string, string[]> = {
      overview: ['README', 'package.json', 'index'],
      architecture: ['src/index', 'src/main', 'src/app'],
      setup: ['package.json', 'requirements.txt', 'Cargo.toml'],
      api: ['routes', 'api', 'controllers'],
      testing: ['test', 'spec', '.test.', '.spec.'],
    };

    const patterns = relevantPatterns[sectionType] || [];

    const findFiles = (nodes: typeof structure.directories) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          for (const pattern of patterns) {
            if (node.name.toLowerCase().includes(pattern.toLowerCase())) {
              samples.push({
                file: node.path,
                language: node.language || 'text',
              });
            }
          }
        }
        if (node.children) {
          findFiles(node.children);
        }
      }
    };

    findFiles(structure.directories);

    return samples.slice(0, 3); // Limit to top 3 relevant files
  }
}
