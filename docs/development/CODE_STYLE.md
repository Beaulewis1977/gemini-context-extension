# Code Style Guide

Coding standards and best practices for the Gemini Context Extension.

## TypeScript Guidelines

### Strict Mode

Always use strict TypeScript:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Definitions

Always define interfaces for complex types:

```typescript
// ✅ Good
export interface RepositoryAnalysis {
  metadata: RepositoryMetadata;
  techStack: TechStack;
}

// ❌ Bad
export type RepositoryAnalysis = any;
```

### Avoid `any`

Use specific types or `unknown`:

```typescript
// ✅ Good
function process(data: unknown): Result {
  if (typeof data === 'string') {
    return parseString(data);
  }
}

// ❌ Bad
function process(data: any): Result {
  return parseString(data);
}
```

## Naming Conventions

### Files

- **kebab-case**: `file-scanner.ts`
- **Descriptive**: `repository-analyzer.ts` not `ra.ts`

### Classes

- **PascalCase**: `RepositoryAnalyzer`
- **Nouns**: Describe what it is

### Functions/Methods

- **camelCase**: `analyzeRepository`
- **Verbs**: Describe what it does

### Constants

- **UPPER_SNAKE_CASE**: `DEFAULT_MAX_DEPTH`

### Interfaces

- **PascalCase**: `RepositoryAnalysis`
- **No `I` prefix**: `Analysis` not `IAnalysis`

## Code Organization

### File Structure

```typescript
// 1. Imports
import { external } from 'package';
import { internal } from './internal.js';

// 2. Types/Interfaces
export interface MyInterface {}

// 3. Constants
const CONSTANT = 'value';

// 4. Classes/Functions
export class MyClass {}
export function myFunction() {}
```

### Function Length

Keep functions small (< 50 lines):

```typescript
// ✅ Good - focused, single responsibility
function validatePath(path: string): string {
  if (!path) throw new Error('Path required');
  return normalize(path);
}

// ❌ Bad - too many responsibilities
function processEverything(data: unknown): Result {
  // 200 lines of code
}
```

## Error Handling

### Always Handle Errors

```typescript
// ✅ Good
try {
  const data = await fs.readFile(path, 'utf-8');
  return JSON.parse(data);
} catch (error) {
  if (error instanceof Error && error.code === 'ENOENT') {
    return null;
  }
  throw error;
}

// ❌ Bad - silent failures
try {
  return await riskyOperation();
} catch {
  return null;
}
```

### Throw Descriptive Errors

```typescript
// ✅ Good
throw new Error(`Repository not found: ${repoPath}`);

// ❌ Bad
throw new Error('Error');
```

## Comments

### JSDoc for Public APIs

```typescript
/**
 * Analyzes a repository and returns comprehensive information
 * @param repoPath - Absolute path to the repository
 * @param options - Analysis options
 * @returns Promise resolving to analysis results
 * @throws {Error} If repository doesn't exist
 */
export async function analyze(
  repoPath: string,
  options?: AnalyzerOptions
): Promise<RepositoryAnalysis> {
  // Implementation
}
```

### Inline Comments for Complex Logic

```typescript
// Calculate similarity using cosine distance
// Formula: dot(a, b) / (norm(a) * norm(b))
const similarity = cosineSimilarity(embedding1, embedding2);
```

### Avoid Obvious Comments

```typescript
// ❌ Bad - obvious
let count = 0; // Initialize count to zero

// ✅ Good - explains why
let count = 0; // Track failed attempts for rate limiting
```

## Formatting

### Use Prettier

All code is auto-formatted:

```bash
npm run format
```

### Line Length

- **Max 100 characters**
- Break long lines logically

### Indentation

- **2 spaces** (enforced by Prettier)

## Async/Await

### Prefer async/await over .then()

```typescript
// ✅ Good
async function example() {
  const data = await fetchData();
  return processData(data);
}

// ❌ Bad
function example() {
  return fetchData().then(data => processData(data));
}
```

### Handle Promise Rejections

```typescript
// ✅ Good
try {
  await riskyOperation();
} catch (error) {
  handleError(error);
}

// ❌ Bad - unhandled rejection
await riskyOperation(); // Could reject!
```

## Imports

### Use Explicit Extensions

```typescript
// ✅ Good
import { something } from './module.js';

// ❌ Bad
import { something } from './module';
```

### Order Imports

1. External packages
2. Internal modules
3. Types

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

import { FileScanner } from '../utils/file-scanner.js';
import { TokenCounter } from '../utils/token-counter.js';

import type { RepositoryAnalysis } from './types.js';
```

## Testing

### Test File Naming

- `*.test.ts` for test files
- Same name as source: `analyzer.ts` → `analyzer.test.ts`

### Test Structure

```typescript
describe('RepositoryAnalyzer', () => {
  describe('analyze', () => {
    it('should analyze TypeScript projects', async () => {
      // Arrange
      const analyzer = new RepositoryAnalyzer();
      
      // Act
      const result = await analyzer.analyze('/path');
      
      // Assert
      expect(result.techStack.primaryLanguage).toBe('TypeScript');
    });
  });
});
```

## Linting

ESLint configuration is enforced:

```bash
npm run lint
```

Fix issues before committing!

## Pre-commit Checklist

- [ ] Code compiles: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Formatted: `npm run format`
- [ ] Documented: JSDoc for public APIs
- [ ] Types: No `any`, strict types

---

Follow these guidelines to maintain code quality. Happy coding! 🎉
