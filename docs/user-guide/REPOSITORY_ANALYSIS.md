# Repository Analysis Guide

Complete guide to using the `analyze_repository` tool for codebase insights.

## Overview

The repository analyzer provides instant, comprehensive analysis of any codebase without requiring AI or API keys. It's perfect for understanding project structure, tech stack, and statistics.

## Basic Usage

```
Analyze the repository at /path/to/your/project
```

## Features

### 1. Tech Stack Detection
- **40+ Languages**: TypeScript, JavaScript, Python, Go, Rust, Java, C++, and more
- **20+ Frameworks**: React, Next.js, Django, FastAPI, Express, NestJS, etc.
- **Package Managers**: npm, pip, cargo, go modules, bundler, maven, gradle

### 2. Codebase Statistics
- Total files and lines of code
- Lines per language
- Directory depth
- File categorization (code, tests, config, docs)

### 3. Dependency Extraction
Automatically reads dependencies from:
- `package.json` (Node.js)
- `requirements.txt` / `pyproject.toml` (Python)
- `Cargo.toml` (Rust)
- `go.mod` (Go)
- `Gemfile` (Ruby)
- `pom.xml` / `build.gradle` (Java)

### 4. Metadata Extraction
- README content
- License detection
- Project description

## Parameters

```typescript
{
  repoPath: string,        // Absolute path to repository
  includeStats?: boolean,  // Count lines (default: true)
  maxDepth?: number       // Max directory depth (default: 10)
}
```

## Examples

### Basic Analysis
```
Analyze the repository at /Users/dev/my-project
```

### Fast Scan (No Stats)
```
Analyze /path/to/repo without stats
```

### Limited Depth
```
Analyze /path/to/large-repo with max depth 3
```

## Output Structure

```json
{
  "metadata": {
    "name": "project-name",
    "path": "/absolute/path",
    "description": "From README",
    "license": "MIT License"
  },
  "techStack": {
    "primaryLanguage": "TypeScript",
    "languages": {
      "TypeScript": 15420,
      "JavaScript": 3240
    },
    "frameworks": ["React", "Next.js"],
    "packageManagers": ["npm"],
    "dependencies": {...}
  },
  "structure": {
    "totalFiles": 145,
    "totalLines": 21834,
    "maxDepth": 6,
    "directories": [...]
  },
  "statistics": {
    "codeFiles": 98,
    "testFiles": 24,
    "configFiles": 12,
    "documentationFiles": 8
  }
}
```

## Best Practices

1. **Use absolute paths**: Always provide full paths
2. **Respect .gitignore**: The tool automatically respects .gitignore
3. **Optimize depth**: For large repos, limit depth to 5-7
4. **Skip stats for speed**: Set `includeStats: false` for faster scans

## Integration with Other Tools

- **Before Wiki Generation**: Analyze first to understand structure
- **Before Indexing**: Know what you're indexing
- **Cost Estimation**: Understand repo size before AI operations

## Troubleshooting

**Path doesn't exist**: Ensure the path is absolute and exists
**Permission denied**: Check file system permissions
**Too slow**: Reduce `maxDepth` or disable stats

See [Tools Overview](./TOOLS_OVERVIEW.md) for more information.
