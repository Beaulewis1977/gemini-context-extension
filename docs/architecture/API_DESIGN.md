# API Design

Internal API design and patterns.

## Tool API Pattern

All tools follow this pattern:

```typescript
class ToolName {
  async execute(params: ParamsType): Promise<ResultType> {
    // 1. Validate inputs (Zod handles this at MCP level)
    // 2. Execute core logic
    // 3. Return typed result
  }
}
```

## Utility API Pattern

Utilities are stateless or maintain minimal state:

```typescript
class UtilityName {
  // Configuration in constructor
  constructor(config?: ConfigType) {
    this.config = config;
  }

  // Pure functions where possible
  publicMethod(input: InputType): OutputType {
    // Logic
    return output;
  }
}
```

## Type Safety

All interfaces are strongly typed:

```typescript
export interface RepositoryAnalysis {
  metadata: RepositoryMetadata;
  techStack: TechStack;
  structure: RepositoryStructure;
  statistics: RepositoryStatistics;
  timestamp: string;
}
```

## Error Handling

### Custom Error Types (Future)
```typescript
class RepositoryNotFoundError extends Error {
  constructor(path: string) {
    super(`Repository not found: ${path}`);
    this.name = 'RepositoryNotFoundError';
  }
}
```

### Current Pattern
```typescript
if (!exists) {
  throw new Error('Repository path does not exist: ' + path);
}
```

## Async Patterns

### Async/Await
```typescript
async function example() {
  const data = await fetchData();
  return processData(data);
}
```

### Promise.all for Parallelism
```typescript
const results = await Promise.all([
  task1(),
  task2(),
  task3()
]);
```

### Sequential When Needed
```typescript
for (const item of items) {
  await processItem(item);
}
```

## Configuration Pattern

### Environment Variables
```typescript
const apiKey = process.env.GEMINI_API_KEY;
```

### Optional Config Objects
```typescript
class Service {
  constructor(config?: ServiceConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }
}
```

### File-Based Config
```typescript
async loadConfig(path: string): Promise<Config | null> {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
```

## API Versioning

Currently v1.0.0, future considerations:

```json
{
  "version": "1.0",
  "apiVersion": "v1"
}
```

---

See implementation details in [../api-reference/](../api-reference/) directory.
