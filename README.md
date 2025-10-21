# Gemini Context Extension

> Essential context window tracking and cost estimation tools for Gemini CLI

[![CI](https://github.com/Beaulewis1977/gemini-context-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/Beaulewis1977/gemini-context-extension/actions/workflows/ci.yml)
[![License: MIT](https://i.ytimg.com/vi/4cgpu9L2AE8/maxresdefault.jpg)

## What It Does

This extension adds two powerful tools to your Gemini CLI that solve critical visibility gaps:

1. **Context Window Tracker** - Real-time monitoring of your token usage and context capacity
2. **Cost Estimator** - Accurate API cost calculations with model comparisons

### Why You Need This

- ❌ **Before**: No idea how much context you're using or what it costs
- ✅ **After**: Complete visibility into token usage and costs with optimization recommendations

## Features

### 🎯 Context Window Tracker

- **Real-time Analysis**: See exactly how your context window is being used
- **Component Breakdown**: Understand token distribution across system, tools, MCP servers, extensions, and context files
- **Multiple Views**: Compact, standard, and detailed modes for different use cases
- **Smart Recommendations**: Get actionable suggestions for optimization

### 💰 Cost Estimator

- **Accurate Pricing**: Calculate costs based on current Gemini model pricing
- **Model Comparison**: See cost differences across all Gemini models
- **Budget Planning**: Estimate costs for multiple requests
- **Cost Breakdown**: Input vs output token costs clearly separated

## Installation

### Prerequisites

- [Gemini CLI](https://geminicli.com/) installed and configured
- Node.js 18+ installed
- Git (for GitHub installation)

### Install from GitHub

```bash
gemini extensions install https://github.com/Beaulewis1977/gemini-context-extension
```

### Install Locally (Development)

```bash
# Clone the repository
git clone https://github.com/Beaulewis1977/gemini-context-extension.git
cd gemini-context-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Link for development
gemini extensions link .
```

### Verify Installation

After installation, restart your Gemini CLI and verify the tools are available:

```bash
gemini

# In the CLI, list tools
/tools list
```

You should see `track_context_usage` and `estimate_api_cost` in the list.

## Usage

### Context Window Tracker

Ask Gemini to analyze your context usage:

```
> How much of my context window am I using?
```

The model will automatically invoke the `track_context_usage` tool and explain the results.

**Modes:**

- **Compact**: Quick overview of usage percentage
- **Standard**: Detailed breakdown by component (default)
- **Detailed**: Full analysis with optimization recommendations

Example with specific mode:

```
> Show me a detailed analysis of my context usage including optimization recommendations
```

### Cost Estimator

Ask Gemini to estimate your API costs:

```
> What are my current API costs?
```

Or for specific scenarios:

```
> Estimate the cost if I make 100 requests with this context
```

```
> Compare costs between gemini-1.5-pro and gemini-2.0-flash-exp
```

## Platform-Specific Instructions

### Linux & macOS

The extension works out of the box on Unix-like systems. The manifest uses path variables that automatically resolve correctly.

### Windows

The extension supports Windows through cross-platform path variables (`${pathSeparator}`). If you encounter issues:

1. Ensure Node.js is in your PATH
2. Use PowerShell or CMD (not Git Bash for Gemini CLI)
3. Verify the extension installed correctly:
   ```powershell
   dir %USERPROFILE%\.gemini\extensions\gemini-context-extension
   ```

### WSL (Windows Subsystem for Linux)

WSL is fully supported. Install and use the extension as you would on Linux:

```bash
gemini extensions install https://github.com/Beaulewis1977/gemini-context-extension
```

The extension will automatically detect the WSL environment and configure paths appropriately.

## Configuration

### Extension Settings

The extension automatically loads configuration from:

- `gemini-extension.json`: Core extension manifest
- `GEMINI.md`: Contextual instructions for the AI model

### Pricing Updates

Model pricing is defined in `src/tools/cost-estimator.ts`. To update:

1. Edit the `PRICING` constant
2. Rebuild: `npm run build`
3. Update the extension: `gemini extensions update gemini-context-extension`

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development mode (watch for changes)
npm run dev
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without modifying files

### Project Structure

```
gemini-context-extension/
├── src/
│   ├── server.ts              # MCP server entry point
│   ├── tools/
│   │   ├── context-tracker.ts # Context analysis tool
│   │   └── cost-estimator.ts  # Cost estimation tool
│   └── utils/
│       ├── token-counter.ts   # Token estimation utilities
│       └── project-detection.ts # Gemini directory finder
├── dist/                      # Compiled JavaScript (generated)
├── gemini-extension.json      # Extension manifest
├── GEMINI.md                  # Context instructions
├── package.json               # Node.js package config
├── tsconfig.json              # TypeScript config
└── .github/
    └── workflows/
        └── ci.yml             # GitHub Actions CI/CD
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that automatically:

- Format code with Prettier
- Run ESLint checks

To set up hooks after cloning:

```bash
npm install
npm run prepare
```

## Troubleshooting

### Extension Not Loading

1. **Check Installation**:
   ```bash
   # List installed extensions
   gemini extensions list
   ```

2. **Verify Build Output**:
   ```bash
   ls dist/server.js
   # Should exist and be a valid JavaScript file
   ```

3. **Check Manifest**:
   Ensure `gemini-extension.json` is in the extension root directory.

4. **Restart CLI**:
   Extension changes require a full CLI restart.

### Tools Not Appearing

1. **Check Tool Registration**:
   ```
   /tools list
   ```
   Look for `track_context_usage` and `estimate_api_cost`.

2. **Check MCP Server Logs**:
   The server logs to stderr. Check your terminal for error messages.

3. **Verify Node Version**:
   ```bash
   node --version
   # Should be 18.x or higher
   ```

### Path Issues on Windows

If you see path-related errors on Windows:

1. Verify the extension manifest uses `${pathSeparator}`:
   ```json
   "args": ["${extensionPath}${pathSeparator}dist${pathSeparator}server.js"]
   ```

2. Check that backslashes are handled correctly in the resolved path.

### Token Counting Accuracy

The extension uses estimation (~3.5 characters per token for Gemini). For production use with precise requirements, consider integrating with Gemini's token counting API endpoint.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run lint && npm run build`
5. Commit with clear messages: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all source files
- Follow existing code style (enforced by ESLint + Prettier)
- Add comments for complex logic
- Keep functions small and focused

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and future development.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Beaulewis1977/gemini-context-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Beaulewis1977/gemini-context-extension/discussions)
- **Documentation**: [Gemini CLI Docs](https://geminicli.com/docs/extensions/)

## Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Inspired by the need for better visibility in AI CLI tools
- Thanks to the Gemini CLI team for building an extensible platform

---

**Made with ❤️ for the Gemini CLI community**
