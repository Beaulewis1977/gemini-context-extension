# Agent Prompt: Implement Repository Wiki Generator

## Context

You are implementing a repository wiki generator feature for the Gemini Context Extension MCP server. A comprehensive implementation plan has been created at `WIKI_GENERATOR_PLAN.md` in the repository root.

## Your Task

Implement **Phase 1** of the repository wiki generator as specified in `WIKI_GENERATOR_PLAN.md`.

## Background

This is an MCP (Model Context Protocol) server that provides tools for Gemini CLI. The existing codebase includes:
- Context window tracking tools
- Cost estimation tools
- Token counting utilities
- Project detection utilities

**Existing Architecture Pattern:**
- Tool classes in `src/tools/` (e.g., `context-tracker.ts`, `cost-estimator.ts`)
- Utilities in `src/utils/`
- MCP tools registered in `src/server.ts` using Zod schemas
- TypeScript with strict type checking
- Pre-commit hooks for Prettier formatting and ESLint

## Phase 1 Requirements

Implement a repository analyzer that extracts structural information WITHOUT using AI.

### Deliverables

1. **New File: `src/tools/repo-analyzer.ts`**
   - Export `RepositoryAnalysis` interface
   - Implement `RepositoryAnalyzer` class
   - Method: `analyze(repoPath: string, options?: AnalyzerOptions): Promise<RepositoryAnalysis>`

2. **New File: `src/utils/file-scanner.ts`**
   - Implement `FileScanner` class
   - Methods for directory scanning, file type detection, line counting
   - Handle `.gitignore` patterns

3. **Update: `src/server.ts`**
   - Register new MCP tool: `analyze_repository`
   - Follow existing patterns (see `track_context_usage` and `estimate_api_cost` tools)

### Features to Implement

**Directory Scanning:**
- Recursive file tree traversal
- Configurable depth limits (default: 10)
- Respect `.gitignore` patterns
- File type categorization

**Tech Stack Detection:**
- Identify frameworks from package.json, requirements.txt, go.mod, Cargo.toml, etc.
- Detect languages by file extensions
- Parse package managers (npm, pip, cargo, etc.)
- Extract dependencies from manifest files

**Code Statistics:**
- Line counts by language
- File counts by type
- Directory structure depth
- Total repository size

**Metadata Extraction:**
- README content
- LICENSE information
- Repository name and description

### Data Structure (from Plan)

```typescript
export interface RepositoryAnalysis {
  metadata: {
    name: string;
    path: string;
    description?: string;
    readme?: string;
    license?: string;
  };
  techStack: {
    primaryLanguage: string;
    languages: Record<string, number>; // language -> line count
    frameworks: string[];
    packageManagers: string[];
    dependencies: Record<string, string>;
  };
  structure: {
    totalFiles: number;
    totalLines: number;
    maxDepth: number;
    directories: DirectoryNode[];
  };
  statistics: {
    codeFiles: number;
    testFiles: number;
    configFiles: number;
    documentationFiles: number;
  };
  timestamp: string;
}
```

### MCP Tool Schema

```typescript
server.registerTool(
  'analyze_repository',
  {
    description: 'Analyze repository structure, tech stack, and statistics',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to repository'),
      includeStats: z.boolean().optional().describe('Include detailed statistics (default: true)'),
      maxDepth: z.number().optional().describe('Maximum directory depth to scan (default: 10)'),
    }).shape,
  },
  async (params) => {
    try {
      const analysis = await repoAnalyzer.analyze(params.repoPath, {
        includeStats: params.includeStats ?? true,
        maxDepth: params.maxDepth ?? 10,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
      };
    }
  }
);
```

## Implementation Guidelines

### Follow Existing Patterns

1. **Study existing tools first:**
   - Read `src/tools/context-tracker.ts` for class structure patterns
   - Read `src/tools/cost-estimator.ts` for data structure patterns
   - Read `src/server.ts` for MCP tool registration patterns

2. **TypeScript standards:**
   - Export interfaces for all return types
   - Use proper typing (avoid `any`)
   - Private methods for internal logic
   - Public methods for API surface

3. **Error Handling:**
   - Use try-catch in tool handlers
   - Return errors in standard format: `{ error: string }`
   - Handle missing files gracefully

4. **Testing:**
   - Test with TypeScript/Node.js repository
   - Test with Python repository
   - Test with large repository (>50k LOC)
   - Verify `.gitignore` handling
   - Ensure performance < 30s for 100k LOC

### Dependencies

**You may need to add:**
```json
{
  "dependencies": {
    "ignore": "^6.0.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

Use `npm install <package>` to add dependencies.

### Git Workflow

1. Create a new branch: `git checkout -b claude/wiki-generator-phase1-<session-id>`
2. Implement the feature
3. Run `npm run build` to verify compilation
4. Run `npm run lint` to check linting
5. Run `npm run format` to format code
6. Commit with descriptive message
7. Push to remote
8. Create PR when ready

### Success Criteria

- [ ] `src/tools/repo-analyzer.ts` created with full implementation
- [ ] `src/utils/file-scanner.ts` created with scanning utilities
- [ ] `src/server.ts` updated with `analyze_repository` tool
- [ ] Build passes: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Formatting passes: `npm run format:check`
- [ ] Can analyze a real repository and return valid JSON
- [ ] Detects primary language correctly
- [ ] Counts files and lines accurately
- [ ] Respects `.gitignore` patterns
- [ ] Performance < 30s for 100k LOC repository

## Important Notes

1. **DO NOT use AI/Gemini API in Phase 1** - This is pure file system analysis
2. **Follow existing code style** - Study the current codebase patterns
3. **Use existing utilities** - Leverage `TokenCounter` if needed for estimation
4. **Keep it simple** - Focus on accuracy over complexity
5. **Document your code** - Add JSDoc comments for public methods

## Testing After Implementation

Test the tool manually:

```bash
# Start the MCP server
npm run build
node dist/server.js

# In another terminal, test with MCP inspector or Gemini CLI
# The tool should be available as: analyze_repository
```

Example invocation:
```typescript
{
  repoPath: "/path/to/some/repo",
  includeStats: true,
  maxDepth: 10
}
```

Expected output: Valid JSON matching `RepositoryAnalysis` interface

## Reference Files

**Must Read:**
- `WIKI_GENERATOR_PLAN.md` - Full implementation plan (Phase 1 is your focus)
- `src/tools/context-tracker.ts` - Example tool class
- `src/tools/cost-estimator.ts` - Example tool with static data
- `src/server.ts` - MCP tool registration patterns

**Helpful:**
- `src/utils/token-counter.ts` - Utility class pattern
- `src/utils/project-detection.ts` - File system operations example
- `package.json` - Dependencies and scripts

## Questions to Resolve During Implementation

1. How should we handle very large repositories? (Add progress logging?)
2. Should we cache analysis results? (Not required for Phase 1)
3. What file extensions map to which languages? (Create comprehensive mapping)
4. How deep should we scan by default? (Plan suggests 10, but verify performance)

## Final Deliverable

When complete, provide:
1. Summary of what was implemented
2. Any deviations from the plan (with justification)
3. Test results and performance metrics
4. Recommendations for Phase 2 based on Phase 1 learnings

---

**Ready to begin? Read `WIKI_GENERATOR_PLAN.md` first, then start implementing Phase 1!**
