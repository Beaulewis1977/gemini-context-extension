# Testing Guide

Comprehensive guide to testing the Gemini Context Extension.

## Test Structure

```
tests/
├── e2e/
│   ├── repository-analyzer.test.ts
│   ├── wiki-generator.test.ts
│   ├── semantic-search.test.ts
│   ├── context-tracker.test.ts
│   ├── cost-estimator.test.ts
│   └── integration.test.ts
├── fixtures/
│   ├── sample-repo/
│   └── test-configs/
└── setup.ts
```

## Running Tests

```bash
# All tests
npm test

# E2E tests only
npm run test:e2e

# Specific test file
npm test -- repository-analyzer

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## E2E Test Examples

### Repository Analyzer Test

```typescript
describe('Repository Analyzer', () => {
  it('should analyze a TypeScript project', async () => {
    const analysis = await analyzer.analyze('/path/to/fixture');
    
    expect(analysis.metadata.name).toBe('sample-repo');
    expect(analysis.techStack.primaryLanguage).toBe('TypeScript');
    expect(analysis.structure.totalFiles).toBeGreaterThan(0);
  });
});
```

### Wiki Generator Test

```typescript
describe('Wiki Generator', () => {
  it('should generate wiki with custom config', async () => {
    const wiki = await generator.generate(analysis, repoPath, {
      model: 'gemini-2.5-flash',
      sections: ['overview', 'architecture']
    });
    
    expect(wiki.sections).toHaveLength(2);
    expect(wiki.diagrams.length).toBeGreaterThan(0);
  });
});
```

## Test Fixtures

Create test repositories in `tests/fixtures/`:

```
sample-repo/
├── package.json
├── src/
│   ├── index.ts
│   └── utils.ts
├── tests/
│   └── example.test.ts
└── README.md
```

## Mocking

### Mock Gemini API

```typescript
jest.mock('@google/generative-ai');

const mockGenerateContent = jest.fn().mockResolvedValue({
  response: { text: () => 'Generated content' }
});
```

### Mock File System

```typescript
jest.mock('fs/promises');

fs.readFile.mockResolvedValue('file content');
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main
- Scheduled daily runs

See `.github/workflows/ci.yml` for CI configuration.

## Writing Good Tests

1. **Descriptive names**: `it('should analyze TypeScript projects')`
2. **Arrange-Act-Assert**: Setup, execute, verify
3. **Isolation**: Each test independent
4. **Fast**: Mock external APIs
5. **Comprehensive**: Test happy paths and errors

## Coverage Goals

- **Overall**: >80%
- **Critical paths**: 100%
- **Error handling**: All paths tested

See [SETUP.md](./SETUP.md) for environment setup.
