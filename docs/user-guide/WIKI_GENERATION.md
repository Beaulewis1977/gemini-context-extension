# Wiki Generation Guide

Generate comprehensive AI-powered documentation for your repositories.

## Overview

The wiki generator uses Gemini AI to create professional documentation including overviews, architecture guides, setup instructions, API references, and Mermaid diagrams.

## Basic Usage

```
Generate wiki for /path/to/project
```

## Features

- **6 Standard Sections**: Overview, Architecture, Setup, Development, API, Testing
- **Custom Sections**: Add your own with custom prompts
- **Mermaid Diagrams**: Architecture, dataflow, directory structure, dependencies
- **Multiple Models**: Use different models per section
- **Two Output Formats**: Markdown (default) or JSON

## Parameters

```typescript
{
  repoPath: string,
  model?: string,                   // Default: gemini-2.5-flash
  sections?: string[],              // Default: all
  includeDiagrams?: boolean,        // Default: true
  outputFormat?: 'json' | 'markdown' // Default: markdown
}
```

## Examples

### Basic Generation
```
Generate wiki for /Users/dev/my-project
```

### Specific Model
```
Generate wiki using gemini-2.5-pro
```

### Specific Sections
```
Generate only overview and architecture sections
```

### JSON Output
```
Generate wiki in JSON format
```

## Custom Configuration

Create `.gemini/wiki.json` in your repository:

```json
{
  "version": "1.0",
  "metadata": {
    "title": "My Project",
    "description": "Custom description"
  },
  "repoNotes": "Additional context for AI...",
  "sections": [
    { "type": "overview", "enabled": true },
    { "type": "architecture", "model": "gemini-2.5-pro" },
    {
      "type": "custom",
      "title": "Security",
      "prompt": "Analyze security measures..."
    }
  ],
  "diagrams": {
    "enabled": true,
    "types": ["architecture", "dataflow"]
  },
  "exclude": {
    "paths": ["node_modules/**", "dist/**"]
  }
}
```

## Standard Sections

1. **Overview**: Project purpose, features, technologies
2. **Architecture**: System design, patterns, structure
3. **Setup**: Installation and configuration
4. **Development**: Development workflow, conventions
5. **API**: API reference, endpoints, interfaces
6. **Testing**: Testing strategy, how to run tests

## Diagram Types

- **architecture**: System component diagrams
- **dataflow**: Data flow through the system
- **directory**: Directory structure visualization
- **dependency**: Dependency graphs

## Model Selection

- **gemini-2.5-flash-lite**: Fast, cheap, good for simple docs
- **gemini-2.5-flash**: Balanced (default)
- **gemini-2.5-pro**: Best quality for complex architecture

## Best Practices

1. **Analyze first**: Run `analyze_repository` to understand the codebase
2. **Use custom config**: Tailor to your project's needs
3. **Choose right model**: Pro for architecture, Flash for others
4. **Exclude unnecessary**: Skip build artifacts and dependencies
5. **Review and edit**: AI-generated docs need human review

## Cost Estimation

Wiki generation can be expensive for large repos. Estimate first:

```
Estimate cost for wiki generation
```

Typical costs:
- Small project (all sections): $0.01-0.05
- Medium project: $0.05-0.20
- Large project: $0.20-1.00

## Troubleshooting

**API key error**: Set `GEMINI_API_KEY` environment variable
**Rate limit**: Wait or use paid tier
**Poor quality**: Try gemini-2.5-pro
**Too expensive**: Use flash-lite, generate specific sections only

See [Configuration Guide](../getting-started/CONFIGURATION.md) for API key setup.
