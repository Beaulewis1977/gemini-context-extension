# Real-World Examples

Practical examples of using the Gemini Context Extension in real scenarios.

## Example 1: Onboarding to New Codebase

**Scenario**: New developer joins team, needs to understand unfamiliar codebase.

**Workflow**:
```
1. Analyze the repository at /path/to/project
   → Understand tech stack, structure, dependencies

2. Generate wiki documentation for /path/to/project
   → Get comprehensive docs

3. Index the repository for semantic search
   → Enable code exploration

4. Search for "main application entry point"
   → Find where to start reading

5. Search for "database schema definition"
   → Understand data model

6. Search for "authentication flow"
   → Learn security implementation
```

**Time Saved**: 4-8 hours of manual exploration → 30 minutes

---

## Example 2: Cost Optimization Sprint

**Scenario**: Reduce Claude API costs by 50% across team.

**Workflow**:
```
1. How much context am I using?
   → Baseline: 450k tokens, Gemini 2.5 Flash

2. Compare all Gemini models
   → See: Flash-Lite is 70% cheaper

3. Show me detailed context analysis
   → Find: 150k tokens from unused MCP servers

4. Estimate cost for 1000 requests with Flash-Lite
   → Calculate: $0.006 vs $0.016 current

5. Test: Switch to Flash-Lite
   → Result: Same quality for simple tasks

6. Optimize: Remove 3 unused MCP servers
   → Save: 150k tokens per conversation
```

**Savings**: 65% cost reduction

---

## Example 3: Documentation Sprint

**Scenario**: Document 5 microservices for company wiki.

**Workflow**:
```
For each service:

1. Analyze the repository
   → Export JSON for wiki metadata

2. Create custom .gemini/wiki.json
   {
     "sections": [
       { "type": "overview" },
       { "type": "architecture", "model": "gemini-2.5-pro" },
       { "type": "api", "model": "gemini-2.5-pro" },
       { "type": "custom", "title": "Deployment", "prompt": "..." }
     ]
   }

3. Generate wiki with custom config
   → Review and edit

4. Export to company wiki (Confluence/Notion)
```

**Time**: 2 hours per service (vs 8 hours manual) = 30 hours saved

---

## Example 4: Large Monorepo Analysis

**Scenario**: Analyze 500k LOC monorepo, understand structure.

**Workflow**:
```
1. Analyze with depth limit
   Analyze /path/to/monorepo with max depth 3
   → Avoid scanning deep node_modules

2. Get high-level stats
   → 50+ services, 10 languages

3. Index specific directories
   Index /path/to/monorepo/services/auth
   Index /path/to/monorepo/services/payments
   → Index critical services only

4. Search across services
   Search for "user authentication"
   Search for "payment processing"
   → Find related code across services
```

**Result**: Understand complex monorepo in 1 hour vs 1 day

---

## Example 5: Budget Planning

**Scenario**: Plan API budget for AI-powered code review tool.

**Workflow**:
```
1. Analyze sample repository
   → 500 files, 50k LOC

2. Estimate indexing cost
   Estimate cost for indexing
   → Result: $0.15 per repo

3. Estimate wiki generation
   Estimate cost for wiki with Flash vs Pro
   → Flash: $0.08, Pro: $0.25

4. Calculate monthly budget
   - 100 repos to index: 100 × $0.15 = $15
   - 100 wikis (Flash): 100 × $0.08 = $8
   - Contingency: +20% = $27.60/month

5. Choose tier
   → Paid tier at $0.35/M tokens sufficient
```

**Budget**: $30/month for 100 repos

---

## Example 6: Finding Security Issues

**Scenario**: Audit codebase for security vulnerabilities.

**Workflow**:
```
1. Index the repository
   Index /path/to/project with exclude patterns: ["**/*.test.ts"]

2. Search for common issues
   Search for "SQL query construction"
   → Check for SQL injection

   Search for "password handling"
   → Check for plaintext passwords

   Search for "API key configuration"
   → Check for hardcoded keys

   Search for "file upload handling"
   → Check for path traversal

3. Generate security section
   Custom wiki section with security focus

4. Review findings
   → Create tickets for issues found
```

**Found**: 8 potential security issues in 30 minutes

---

## Example 7: Multi-Language Project

**Scenario**: Full-stack app (React + Python + Go), understand each layer.

**Workflow**:
```
1. Analyze full project
   Analyze /path/to/project
   → See: TypeScript 45%, Python 35%, Go 20%

2. Index by language
   Index with exclude patterns to focus on backend
   Index /path excluding: ["frontend/**"]

3. Generate language-specific docs
   Generate wiki sections per language

4. Search across languages
   Search for "data validation"
   → Find validation in all 3 languages

   Search for "error handling patterns"
   → Compare approaches
```

**Insight**: Identify inconsistencies across stack

---

## Example 8: Legacy Code Modernization

**Scenario**: Plan migration from old framework to new.

**Workflow**:
```
1. Analyze legacy codebase
   Analyze /path/to/legacy-app
   → Framework: Angular 1.x, 120k LOC

2. Index codebase
   → Create semantic index

3. Find migration targets
   Search for "controller definitions"
   Search for "service layer"
   Search for "state management"

4. Estimate scope
   → 450 controllers to migrate

5. Generate migration plan
   Use wiki to document:
   - Current architecture
   - Target architecture
   - Migration strategy
```

**Planning**: Complete migration scope in 2 days vs 2 weeks

---

## Common Patterns

### Pattern: Daily Workflow
```
1. Morning: Check context usage
2. Before bulk ops: Estimate costs
3. New project: Analyze → Wiki → Index
4. Exploring: Search for patterns
5. End of week: Review total costs
```

### Pattern: Team Onboarding
```
1. Analyze all team repositories
2. Generate wikis for each
3. Index for semantic search
4. Create onboarding checklist
5. New dev: Read wikis → Search code
```

### Pattern: Code Review
```
1. Analyze PR branch
2. Search for "similar implementations"
3. Compare with main branch stats
4. Estimate impact on context/cost
```

## Tips from Real Users

1. **Index once, search often**: Semantic search is incredibly fast after indexing
2. **Use custom wiki configs**: Saves regeneration time
3. **Monitor context daily**: Prevents surprise limits
4. **Start with Flash-Lite**: Upgrade to Pro only when needed
5. **Exclude test files**: Unless you need to search them

---

For more examples, see individual tool guides:
- [Repository Analysis](./REPOSITORY_ANALYSIS.md)
- [Wiki Generation](./WIKI_GENERATION.md)
- [Semantic Search](./SEMANTIC_SEARCH.md)
- [Context Tracking](./CONTEXT_TRACKING.md)
- [Cost Estimation](./COST_ESTIMATION.md)
