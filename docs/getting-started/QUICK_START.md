# Quick Start Guide

Get up and running with the Gemini Context Extension in 5 minutes! This guide will walk you through the essential features to help you start being productive immediately.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Your First Commands](#your-first-commands)
  - [1. Track Context Usage](#1-track-context-usage)
  - [2. Estimate API Costs](#2-estimate-api-costs)
  - [3. Compare Models](#3-compare-models)
  - [4. Analyze a Repository](#4-analyze-a-repository)
- [Next-Level Features (Optional)](#next-level-features-optional)
  - [5. Generate Wiki Documentation](#5-generate-wiki-documentation)
  - [6. Semantic Code Search](#6-semantic-code-search)
- [Common Workflows](#common-workflows)
- [Tips & Tricks](#tips--tricks)
- [What's Next](#whats-next)

---

## Prerequisites

Before starting, ensure you've:
- ✅ Installed the extension ([Installation Guide](./INSTALLATION.md))
- ✅ Restarted Claude Desktop
- ✅ Opened a new conversation

**Optional for advanced features:**
- 🔑 Set up `GEMINI_API_KEY` ([Configuration Guide](./CONFIGURATION.md))

---

## Your First Commands

Let's try the basic features that work without any configuration!

### 1. Track Context Usage

**See how much of your context window you're using right now.**

**What to type:**
```
How much context am I using?
```

**What Claude will do:**
- Automatically invokes `track_context_usage` tool
- Analyzes your current conversation
- Shows token usage breakdown

**Example output:**
```json
{
  "model": "Gemini 2.5 Flash",
  "usage": {
    "used": 45230,
    "total": 1000000,
    "percentage": 5,
    "available": 954770
  },
  "breakdown": {
    "systemContext": 12000,
    "builtInTools": 18000,
    "mcpServers": 5000,
    "extensions": 8230,
    "contextFiles": 2000
  }
}
```

**Try different modes:**
- Compact: `Show me a compact context summary`
- Detailed: `Give me detailed context analysis with recommendations`
- Specific model: `What's my context usage for Gemini 2.5 Pro?`

---

### 2. Estimate API Costs

**Calculate how much your current usage would cost with different models.**

**What to type:**
```
What are my current API costs?
```

**What Claude will do:**
- Analyzes your token usage
- Calculates costs based on current Gemini pricing
- Shows comparison across all models

**Example output:**
```json
{
  "model": "Gemini 2.5 Flash",
  "contextTokens": 45230,
  "costs": {
    "perRequest": 0.000016,
    "totalRequests": 1,
    "total": 0.000016
  },
  "comparison": {
    "Gemini 2.5 Flash-Lite": {
      "savings": 0.000010,
      "savingsPercent": 62
    }
  },
  "recommendations": [
    "💰 Save 62% by switching to Gemini 2.5 Flash-Lite"
  ]
}
```

**Try it with multiple requests:**
```
Estimate the cost for 100 requests with Gemini 2.5 Pro
```

---

### 3. Compare Models

**See all available Gemini models side-by-side.**

**What to type:**
```
Compare all Gemini models
```

**What Claude will do:**
- Lists all available models
- Shows pricing and context windows
- Calculates costs for your current usage
- Sorts from cheapest to most expensive

**Example output:**
```json
{
  "models": [
    {
      "id": "gemini-2.5-flash-lite",
      "name": "Gemini 2.5 Flash-Lite",
      "contextWindow": 1000000,
      "description": "Most cost-effective for high-volume tasks",
      "pricing": {
        "input": "$0.100000/M tokens",
        "output": "$0.400000/M tokens"
      },
      "currentUsage": {
        "costPerRequest": 0.000006
      }
    },
    // ... other models
  ]
}
```

**Why this is useful:**
- Quickly find the best model for your use case
- Understand pricing differences
- Make informed decisions about model selection

---

### 4. Analyze a Repository

**Get comprehensive insights about any codebase without AI (instant results!).**

**What to type:**
```
Analyze the repository at /path/to/your/project
```

**Real example:**
```
Analyze the repository at /Users/dev/my-react-app
```

**What Claude will do:**
- Scans the directory structure
- Detects programming languages and frameworks
- Counts files and lines of code
- Identifies dependencies and package managers
- Categorizes files (code, tests, config, docs)

**Example output:**
```json
{
  "metadata": {
    "name": "my-react-app",
    "primaryLanguage": "TypeScript",
    "license": "MIT License"
  },
  "techStack": {
    "languages": {
      "TypeScript": 15420,
      "JavaScript": 3240,
      "CSS": 1200,
      "JSON": 450
    },
    "frameworks": ["React", "Next.js", "MCP"],
    "packageManagers": ["npm"],
    "dependencies": {
      "react": "^18.2.0",
      "next": "^14.0.0",
      // ... more dependencies
    }
  },
  "structure": {
    "totalFiles": 145,
    "totalLines": 21834,
    "maxDepth": 6
  },
  "statistics": {
    "codeFiles": 98,
    "testFiles": 24,
    "configFiles": 12,
    "documentationFiles": 8
  }
}
```

**Try these variations:**
- Analyze with depth limit: `Analyze /path/to/repo with max depth of 5`
- Focus on specific info: `What frameworks are used in /path/to/repo?`
- Get language breakdown: `How many lines of TypeScript are in /path/to/repo?`

**💡 Pro Tip:** This tool doesn't need an API key and runs instantly!

---

## Next-Level Features (Optional)

These features require a Gemini API key. [Set one up here](./CONFIGURATION.md) (takes 2 minutes).

### 5. Generate Wiki Documentation

**Create comprehensive documentation for your repository using AI.**

**What to type:**
```
Generate wiki documentation for /path/to/your/project
```

**What Claude will do:**
- Analyzes your codebase structure
- Generates multiple documentation sections using Gemini AI
- Creates Mermaid diagrams for visualization
- Compiles everything into markdown

**Example output:**
A complete markdown document with:
- 📖 Overview and project description
- 🏗️ Architecture and design patterns
- ⚙️ Setup and installation instructions
- 👨‍💻 Development guide
- 📚 API reference
- ✅ Testing guide
- 📊 Mermaid diagrams (architecture, dataflow)

**Try different options:**
- Specific model: `Generate wiki using gemini-2.5-pro`
- Specific sections: `Generate only overview and architecture sections`
- Get JSON output: `Generate wiki in JSON format`

**Advanced: Custom Configuration**

Create `.gemini/wiki.json` in your repo for custom sections:

```json
{
  "version": "1.0",
  "sections": [
    { "type": "overview", "enabled": true },
    { "type": "architecture", "model": "gemini-2.5-pro" },
    {
      "type": "custom",
      "title": "Security",
      "prompt": "Analyze security measures in {LANGUAGE}..."
    }
  ]
}
```

See [WIKI_GENERATION.md](../user-guide/WIKI_GENERATION.md) for full details.

---

### 6. Semantic Code Search

**Search your codebase using natural language (like a super-powered grep).**

**Step 1: Index your repository**

```
Index the repository at /path/to/your/project for semantic search
```

This creates embeddings of your code and caches them in `.gemini/embeddings.json`.

**Example output:**
```json
{
  "success": true,
  "metadata": {
    "totalChunks": 342,
    "indexedAt": "2025-11-20T10:30:00Z",
    "model": "text-embedding-004"
  }
}
```

**Step 2: Search with natural language**

```
Search for "authentication implementation" in /path/to/your/project
```

**Example output:**
```json
{
  "query": "authentication implementation",
  "resultsCount": 5,
  "results": [
    {
      "file": "src/auth/login.ts",
      "lines": "45-78",
      "language": "TypeScript",
      "similarity": "0.892",
      "content": "async function authenticateUser(credentials) {...}"
    }
  ]
}
```

**More search examples:**
- `Find examples of API endpoint definitions`
- `How does error handling work in this codebase?`
- `Show me database connection code`
- `Where is user validation implemented?`

**💡 Pro Tip:** Semantic search finds conceptually similar code, not just keyword matches!

---

## Common Workflows

### Workflow 1: Starting a New Project

```
1. How much context am I using?
2. Analyze the repository at /path/to/new-project
3. Generate wiki documentation for /path/to/new-project
4. Index the repository for semantic search
```

Now you have:
- ✅ Understanding of context usage
- ✅ Complete codebase analysis
- ✅ Comprehensive documentation
- ✅ Searchable code index

---

### Workflow 2: Optimizing Costs

```
1. What are my current API costs?
2. Compare all Gemini models
3. Show me context usage for Gemini 2.5 Flash-Lite
```

Use the recommendations to:
- Choose the most cost-effective model
- Optimize context usage
- Plan your API budget

---

### Workflow 3: Code Exploration

```
1. Analyze the repository at /path/to/unfamiliar-project
2. Index the repository for semantic search
3. Search for "main application entry point"
4. Search for "configuration setup"
```

Quickly understand:
- Project structure
- Key components
- How systems are organized

---

## Tips & Tricks

### 💡 Context Management

**Monitor your usage regularly:**
```
How much context am I using?
```

**Get recommendations:**
```
Give me detailed context analysis with optimization recommendations
```

**Switch models when needed:**
```
Show me context usage for Gemini 1.5 Pro
```
(Use 1.5 Pro when you need the 2M token context window!)

---

### 💰 Cost Optimization

**Always check costs before large operations:**
```
Estimate the cost for 1000 requests with Gemini 2.5 Flash
```

**Use the cheapest model that works:**
- Flash-Lite for simple tasks
- Flash for everyday work
- Pro for complex reasoning

**Compare before committing:**
```
Compare all Gemini models
```

---

### 🔍 Repository Analysis

**Start without API key:**
All these work instantly with no API key:
- Repository analysis
- Context tracking
- Cost estimation
- Model comparison

**Then add AI features:**
Once you have an API key, unlock:
- Wiki generation
- Semantic search
- Accurate token counting

---

### 📝 Wiki Generation

**Customize your wikis:**
Create `.gemini/wiki.json` for:
- Custom sections
- Different models per section
- Repository-specific notes
- Path exclusions

**Generate incrementally:**
```
Generate only overview and setup sections
```

**Use the right model:**
- `gemini-2.5-flash` for general docs (default)
- `gemini-2.5-pro` for complex architecture
- `gemini-2.5-flash-lite` for simple sections

---

### 🔎 Semantic Search

**Index once, search many times:**
```
Index the repository at /path/to/project
```

Embeddings are cached, so subsequent searches are instant!

**Update incrementally:**
If you modify files, the index can be updated without re-indexing everything.

**Adjust results:**
```
Search with top 10 results and minimum score 0.7
```

---

## What's Next?

Now that you've mastered the basics, dive deeper:

### User Guides
- 📘 [Tools Overview](../user-guide/TOOLS_OVERVIEW.md) - Complete reference for all tools
- 📊 [Repository Analysis](../user-guide/REPOSITORY_ANALYSIS.md) - Advanced analysis techniques
- 📝 [Wiki Generation](../user-guide/WIKI_GENERATION.md) - Custom wiki configurations
- 🔍 [Semantic Search](../user-guide/SEMANTIC_SEARCH.md) - Advanced search patterns
- 💰 [Cost Estimation](../user-guide/COST_ESTIMATION.md) - Budget planning strategies

### Configuration
- ⚙️ [Configuration Guide](./CONFIGURATION.md) - Set up API keys and advanced options

### Architecture
- 🏗️ [Architecture Overview](../architecture/OVERVIEW.md) - How it all works
- 📊 [Data Flow](../architecture/DATA_FLOW.md) - Understanding the system

### Development
- 👨‍💻 [Development Setup](../development/SETUP.md) - Contribute to the project
- ✅ [Testing Guide](../development/TESTING.md) - Run and write tests

---

## Need Help?

- 📖 **Full Documentation**: [docs/](../README.md)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/Beaulewis1977/gemini-context-extension/issues)
- 💬 **Ask Questions**: [GitHub Discussions](https://github.com/Beaulewis1977/gemini-context-extension/discussions)
- 📧 **Get Support**: See [CONTRIBUTING.md](../development/CONTRIBUTING.md)

---

**You're all set!** Start exploring your repositories with powerful AI-assisted tools. 🚀
