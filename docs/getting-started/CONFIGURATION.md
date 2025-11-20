# Configuration Guide

Learn how to configure the Gemini Context Extension for optimal performance and unlock advanced features.

## Table of Contents

- [Overview](#overview)
- [API Key Configuration](#api-key-configuration)
  - [Getting Your API Key](#getting-your-api-key)
  - [Setting Up Environment Variables](#setting-up-environment-variables)
  - [Verifying API Key Setup](#verifying-api-key-setup)
  - [Security Best Practices](#security-best-practices)
- [Extension Settings](#extension-settings)
- [Wiki Configuration](#wiki-configuration)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Gemini Context Extension works in two modes:

### Basic Mode (No Configuration Required)
These tools work out-of-the-box without any setup:
- ✅ `track_context_usage` - Context window tracking
- ✅ `estimate_api_cost` - Cost estimation
- ✅ `compare_gemini_models` - Model comparison
- ✅ `analyze_repository` - Repository analysis

### Advanced Mode (Requires API Key)
These tools require a Gemini API key:
- 🔑 `generate_repository_wiki` - AI-powered wiki generation
- 🔑 `index_repository` - Semantic code indexing
- 🔑 `search_repository` - Semantic code search
- 🔑 Enhanced token counting (accurate vs estimated)

---

## API Key Configuration

### Getting Your API Key

1. **Visit Google AI Studio**

   Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

2. **Sign in with your Google account**

   - Personal Google accounts are supported
   - No payment required for free tier
   - Generous free quota for development

3. **Create an API key**

   - Click "Create API Key"
   - Optionally: Create a new Google Cloud project or use existing one
   - Copy the generated API key
   - **Important:** Save it securely - you won't be able to see it again!

4. **Understand the limits**

   **Free Tier (2025):**
   - 15 requests per minute
   - 1,500 requests per day
   - 1.5 million tokens per minute
   - No credit card required

   **Paid Tier:**
   - Higher rate limits
   - Pay-as-you-go pricing
   - See [Gemini API Pricing](https://ai.google.dev/pricing) for details

---

### Setting Up Environment Variables

Choose the method for your operating system:

#### macOS / Linux

**Option 1: Temporary (Current Session Only)**

```bash
# Set for current terminal session
export GEMINI_API_KEY='your-api-key-here'

# Verify it's set
echo $GEMINI_API_KEY
```

**Option 2: Permanent (Recommended)**

Add to your shell configuration file:

```bash
# For bash (most Linux, older macOS)
echo 'export GEMINI_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc

# For zsh (default on modern macOS)
echo 'export GEMINI_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc

# For fish shell
echo 'set -gx GEMINI_API_KEY "your-api-key-here"' >> ~/.config/fish/config.fish
source ~/.config/fish/config.fish
```

**Option 3: Using .env file (Project-specific)**

```bash
# Create .env file in your project directory
echo 'GEMINI_API_KEY=your-api-key-here' > .env

# Make sure .env is in .gitignore
echo '.env' >> .gitignore
```

**Note:** Claude Desktop needs to be restarted to pick up environment variable changes.

---

#### Windows

**Option 1: PowerShell (Current Session Only)**

```powershell
# Set for current PowerShell session
$env:GEMINI_API_KEY = 'your-api-key-here'

# Verify it's set
echo $env:GEMINI_API_KEY
```

**Option 2: PowerShell (Permanent - Current User)**

```powershell
# Set permanently for current user
[Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'your-api-key-here', 'User')

# Restart PowerShell to apply
```

**Option 3: System Settings (Permanent - GUI Method)**

1. Press `Windows + R`
2. Type `sysdm.cpl` and press Enter
3. Go to "Advanced" tab
4. Click "Environment Variables"
5. Under "User variables", click "New"
6. Variable name: `GEMINI_API_KEY`
7. Variable value: `your-api-key-here`
8. Click OK

**Option 4: Command Prompt (Permanent)**

```cmd
setx GEMINI_API_KEY "your-api-key-here"
```

**Note:** Windows requires restarting Claude Desktop (and sometimes logging out/in) to pick up environment variable changes.

---

#### Docker / Container Environments

```dockerfile
# In Dockerfile
ENV GEMINI_API_KEY=your-api-key-here

# Or use docker-compose.yml
version: '3.8'
services:
  claude:
    environment:
      - GEMINI_API_KEY=your-api-key-here
```

```bash
# Or pass at runtime
docker run -e GEMINI_API_KEY=your-api-key-here ...
```

---

### Verifying API Key Setup

After setting up your API key:

1. **Restart Claude Desktop completely**
   - Quit the application (don't just close the window)
   - Wait a few seconds
   - Relaunch Claude Desktop

2. **Test with a simple command**

   ```
   Generate wiki documentation for /path/to/small-project
   ```

3. **Look for error messages**

   - ✅ Success: Wiki generation proceeds
   - ❌ Error: "Wiki generator not available. Please set GEMINI_API_KEY"

4. **Check the extension logs (if available)**

   The server logs to stderr, so check your terminal for messages like:
   ```
   Gemini Context Extension MCP server running
   ```

---

### Security Best Practices

#### ⚠️ CRITICAL: Never Commit API Keys to Version Control

**Bad:**
```typescript
// ❌ NEVER DO THIS
const apiKey = "AIzaSyD..."; // Hardcoded key
```

**Good:**
```typescript
// ✅ Always use environment variables
const apiKey = process.env.GEMINI_API_KEY;
```

#### 🛡️ Protect Your API Key

1. **Never commit `.env` files**
   ```bash
   # Ensure .env is in .gitignore
   echo '.env' >> .gitignore
   git rm --cached .env  # Remove if already committed
   ```

2. **Use different keys for different environments**
   - Development key (local testing)
   - Production key (live usage)
   - Team key (shared development)

3. **Rotate keys periodically**
   - Generate new keys every 3-6 months
   - Delete old keys from Google AI Studio
   - Update environment variables

4. **Monitor usage**
   - Check [Google AI Studio](https://aistudio.google.com) for usage stats
   - Set up billing alerts if using paid tier
   - Review API logs for unexpected activity

5. **Limit key permissions**
   - If using Google Cloud, use IAM to restrict key permissions
   - Enable only necessary APIs

#### 🔒 What to Do If Your Key is Leaked

If you accidentally commit your API key:

1. **Immediately revoke the key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Delete the compromised key

2. **Generate a new key**
   - Create a replacement key
   - Update your environment variables

3. **Remove from Git history**
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (be careful!)
   git push origin --force --all
   ```

4. **Notify your team**
   - If using shared repositories
   - Update documentation

---

## Extension Settings

### Extension Manifest

The extension is configured via `gemini-extension.json` in the extension root:

```json
{
  "manifestVersion": 1,
  "name": "gemini-context-extension",
  "version": "1.0.0",
  "description": "Context tracking and repository analysis tools",
  "main": "dist/server.js",
  "runtime": "node",
  "mcp": {
    "protocol": "stdio"
  }
}
```

**Note:** You typically don't need to modify this file unless you're developing the extension.

---

### Context Files

The extension automatically loads context from `GEMINI.md` files in your project:

```
your-project/
├── GEMINI.md              # Project-level context
├── src/
│   └── GEMINI.md          # Module-level context
└── .claude/
    └── settings.json      # Claude Desktop settings
```

These files are used by Claude for understanding your project structure.

---

## Wiki Configuration

Customize wiki generation with `.gemini/wiki.json` in your repository:

### Basic Configuration

```json
{
  "version": "1.0",
  "metadata": {
    "title": "My Project",
    "description": "Custom project description"
  },
  "sections": [
    { "type": "overview", "enabled": true },
    { "type": "architecture", "enabled": true },
    { "type": "setup", "enabled": true },
    { "type": "development", "enabled": true },
    { "type": "api", "enabled": true },
    { "type": "testing", "enabled": true }
  ],
  "diagrams": {
    "enabled": true,
    "types": ["architecture", "dataflow"]
  }
}
```

### Advanced Configuration

```json
{
  "version": "1.0",
  "metadata": {
    "title": "Advanced Project",
    "description": "A complex system with custom docs"
  },
  "repoNotes": "This project uses microservices architecture. Focus on the service boundaries.",
  "sections": [
    {
      "type": "overview",
      "enabled": true,
      "model": "gemini-2.5-flash"
    },
    {
      "type": "architecture",
      "enabled": true,
      "model": "gemini-2.5-pro",
      "includeCodeExamples": true
    },
    {
      "type": "custom",
      "title": "Security Considerations",
      "prompt": "Analyze the security measures implemented in this {LANGUAGE} project. Focus on authentication, authorization, and data protection.",
      "model": "gemini-2.5-pro"
    }
  ],
  "diagrams": {
    "enabled": true,
    "types": ["architecture", "dataflow", "dependency"]
  },
  "exclude": {
    "paths": [
      "node_modules/**",
      "dist/**",
      "build/**",
      "*.min.js"
    ]
  },
  "generation": {
    "defaultModel": "gemini-2.5-flash",
    "maxTokensPerSection": 2000,
    "parallelSections": 3
  }
}
```

### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `version` | string | Config version | "1.0" |
| `metadata.title` | string | Override repo name | Repo name |
| `metadata.description` | string | Custom description | From README |
| `repoNotes` | string | Additional context for AI | "" |
| `sections[].type` | string | Section type | - |
| `sections[].enabled` | boolean | Include this section | true |
| `sections[].model` | string | Gemini model to use | "gemini-2.5-flash" |
| `sections[].title` | string | Custom section title | Auto-generated |
| `sections[].prompt` | string | Custom prompt | Auto-generated |
| `diagrams.enabled` | boolean | Generate diagrams | true |
| `diagrams.types` | array | Diagram types to create | ["architecture", "dataflow"] |
| `exclude.paths` | array | Paths to skip | Common build dirs |
| `generation.defaultModel` | string | Default model | "gemini-2.5-flash" |
| `generation.maxTokensPerSection` | number | Max tokens per section | 2000 |

See [WIKI_GENERATION.md](../user-guide/WIKI_GENERATION.md) for complete details.

---

## Advanced Configuration

### Token Counting

The extension supports two modes for token counting:

**1. Heuristic Estimation (Default)**
- No API key required
- ~3.5 characters per token (approximate)
- Fast and free
- Good for general usage

**2. Gemini API Counting (With API Key)**
- Requires `GEMINI_API_KEY`
- Exact token counts from Google's tokenizer
- Slightly slower (API call)
- 100% accurate

To use API-based counting, simply set your `GEMINI_API_KEY`. The extension automatically detects and uses it.

---

### Custom MCP Server Configuration

If you're running the extension as a standalone MCP server (outside Claude Desktop):

```json
// claude-config.json
{
  "mcpServers": {
    "gemini-context": {
      "command": "node",
      "args": ["/path/to/gemini-context-extension/dist/server.js"],
      "env": {
        "GEMINI_API_KEY": "your-key-here"
      }
    }
  }
}
```

---

### Embedding Cache Configuration

Semantic search uses a local cache at `.gemini/embeddings.json`:

**Default settings:**
- Cache file: `.gemini/embeddings.json`
- Max chunk size: 2000 characters
- Overlap: 200 characters
- Model: text-embedding-004

**To customize:**

These are currently not configurable through a config file but are passed as parameters:

```
Index the repository with max chunk size 1500
Index using model text-embedding-005
```

---

## Troubleshooting

### API Key Not Working

**Problem:** "Please set GEMINI_API_KEY" error even after setting the key

**Solutions:**

1. **Verify the key is set:**
   ```bash
   # macOS/Linux
   echo $GEMINI_API_KEY

   # Windows PowerShell
   echo $env:GEMINI_API_KEY

   # Windows CMD
   echo %GEMINI_API_KEY%
   ```

2. **Check for typos:**
   - API keys start with `AIza`
   - No spaces or quotes in the actual key value
   - Copy directly from Google AI Studio

3. **Restart Claude Desktop:**
   - Environment variables are loaded at startup
   - Completely quit and relaunch

4. **Check Claude Desktop process:**
   ```bash
   # macOS/Linux: Ensure Claude Desktop inherits env vars
   # You may need to launch from terminal:
   /Applications/Claude.app/Contents/MacOS/Claude
   ```

---

### Wiki Generation Fails

**Problem:** Wiki generation returns errors

**Solutions:**

1. **Check API quota:**
   - Visit [Google AI Studio](https://aistudio.google.com)
   - Check your usage limits
   - Wait if you've hit rate limits (15 req/min free tier)

2. **Try a smaller repository:**
   - Large repos may exceed token limits
   - Use `exclude` paths in wiki config

3. **Use a simpler model:**
   - Try `gemini-2.5-flash-lite` instead of `pro`
   - Reduce `maxTokensPerSection`

---

### Semantic Search Not Finding Results

**Problem:** Search returns no results or poor results

**Solutions:**

1. **Check if repository is indexed:**
   ```
   Is /path/to/repo indexed for semantic search?
   ```

2. **Re-index the repository:**
   ```
   Index the repository at /path/to/repo with force option
   ```

3. **Adjust search parameters:**
   ```
   Search with minimum score 0.3 and top 10 results
   ```

4. **Verify cache file exists:**
   ```bash
   ls -la /path/to/repo/.gemini/embeddings.json
   ```

---

### Performance Issues

**Problem:** Operations are slow

**Solutions:**

1. **For wiki generation:**
   - Use `gemini-2.5-flash-lite` (faster, cheaper)
   - Generate specific sections only
   - Reduce `maxTokensPerSection`

2. **For semantic search:**
   - Reduce chunk size during indexing
   - Use `excludePatterns` to skip large files
   - Index only code directories

3. **For repository analysis:**
   - Reduce `maxDepth` parameter
   - Skip stats with `includeStats: false`

---

## Next Steps

- **[Quick Start Guide](./QUICK_START.md)** - Learn to use the extension
- **[User Guide](../user-guide/TOOLS_OVERVIEW.md)** - Deep dive into each tool
- **[Wiki Generation Guide](../user-guide/WIKI_GENERATION.md)** - Master custom wiki configs
- **[Development Setup](../development/SETUP.md)** - Contribute to the project

---

## Need Help?

- 📖 **Documentation**: [docs/README.md](../README.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Beaulewis1977/gemini-context-extension/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Beaulewis1977/gemini-context-extension/discussions)

---

**Configuration complete!** You're ready to use all advanced features of the Gemini Context Extension. 🚀
