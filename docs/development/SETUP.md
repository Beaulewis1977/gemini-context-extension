# Development Setup

Guide for setting up a development environment to contribute to the Gemini Context Extension.

## Prerequisites

- Node.js 18+
- Git
- Text editor (VS Code recommended)
- Claude Desktop (for testing)

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/Beaulewis1977/gemini-context-extension.git
cd gemini-context-extension

# Install dependencies
npm install

# Build the project
npm run build
```

## Development Workflow

### Watch Mode

```bash
# Start TypeScript compiler in watch mode
npm run dev

# In another terminal, watch for changes and test
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint --fix
```

### Formatting

```bash
# Check formatting
npm run format:check

# Auto-format all files
npm run format
```

## Testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- tests/e2e/repository-analyzer.test.ts
```

## Project Structure

```
gemini-context-extension/
├── src/
│   ├── server.ts              # MCP server entry point
│   ├── tools/                  # MCP tool implementations
│   │   ├── context-tracker.ts
│   │   ├── cost-estimator.ts
│   │   ├── repo-analyzer.ts
│   │   ├── wiki-generator.ts
│   │   └── repo-search.ts
│   └── utils/                  # Utility modules
│       ├── file-scanner.ts
│       ├── gemini-client.ts
│       ├── token-counter.ts
│       ├── code-chunker.ts
│       ├── embedding-cache.ts
│       ├── prompt-builder.ts
│       └── project-detection.ts
├── tests/
│   └── e2e/                    # End-to-end tests
├── dist/                       # Compiled JavaScript (gitignored)
├── docs/                       # Documentation
├── .gemini/                    # Example configs
├── package.json
├── tsconfig.json
└── README.md
```

## Development Tools

### VS Code Extensions (Recommended)

- ES Lint
- Prettier
- TypeScript and JavaScript Language Features

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Pre-commit Hooks

Husky is configured to run checks before commits:

```bash
# Install hooks
npm run prepare

# Hooks run automatically on git commit
```

## Debugging

### Debug in VS Code

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/dist/server.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Debug Tests

```bash
# Run tests with debugger
node --inspect-brk node_modules/.bin/jest
```

## Environment Variables

Create `.env` for development:

```bash
GEMINI_API_KEY=your-test-api-key-here
NODE_ENV=development
```

**Important**: Never commit `.env` files!

## Making Changes

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Format code: `npm run format`
6. Commit: `git commit -m "feat: add my feature"`
7. Push: `git push origin feature/my-feature`
8. Create pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guidelines.
