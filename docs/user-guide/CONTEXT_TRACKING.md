# Context Tracking Guide

Monitor and optimize your context window usage with the `track_context_usage` tool.

## Overview

Track how much of your context window is being used and get recommendations for optimization.

## Basic Usage

```
How much context am I using?
```

## Modes

### Compact Mode
```
Show compact context summary
```

Quick percentage only.

### Standard Mode (Default)
```
Show context usage
```

Full breakdown by component.

### Detailed Mode
```
Give me detailed context analysis with recommendations
```

Includes optimization tips and model info.

## Supported Models

- gemini-2.5-pro (1M tokens)
- gemini-2.5-flash (1M tokens)
- gemini-2.5-flash-lite (1M tokens)
- gemini-2.0-flash-exp (1M tokens)
- gemini-1.5-pro (2M tokens)
- gemini-1.5-flash (1M tokens)

## Context Breakdown

```json
{
  "breakdown": {
    "systemContext": 12000,      // Claude's system prompt
    "builtInTools": 18000,       // Claude's built-in tools
    "mcpServers": 5000,          // MCP server definitions
    "extensions": 8230,          // Extension context (GEMINI.md files)
    "contextFiles": 2000         // Project context files
  }
}
```

## Best Practices

1. **Monitor regularly**: Check at start of each session
2. **Use 1.5 Pro for large context**: 2M token window
3. **Optimize context files**: Keep GEMINI.md files concise
4. **Disable unused MCP servers**: Reduces context usage
5. **Watch for 80%+**: Consider cleanup or larger model

## Optimization Tips

### Reduce Context Usage
- Remove unnecessary GEMINI.md files
- Disable unused MCP servers
- Use shorter system prompts
- Clear conversation and restart

### Increase Capacity
- Switch to Gemini 1.5 Pro (2M tokens)
- Use multiple shorter conversations
- Summarize long contexts

## Understanding Percentages

- **0-30%**: Plenty of room
- **30-60%**: Normal usage
- **60-80%**: Getting full
- **80-95%**: Consider optimization
- **95-100%**: Critical, optimize now

## Accuracy

**With API Key**: Uses exact token counts from Gemini API
**Without API Key**: Uses heuristic estimation (~3.5 chars/token)

For accuracy, set `GEMINI_API_KEY`.

See [Configuration Guide](../getting-started/CONFIGURATION.md) for setup.
