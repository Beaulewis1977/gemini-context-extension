# Installation Guide

This guide will walk you through installing the Gemini Context Extension for Claude Desktop.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [Method 1: Install from GitHub (Recommended)](#method-1-install-from-github-recommended)
  - [Method 2: Install Locally for Development](#method-2-install-locally-for-development)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## Prerequisites

Before installing the Gemini Context Extension, ensure you have the following:

### Required

1. **Node.js 18 or higher**
   ```bash
   # Check your Node.js version
   node --version
   # Should output v18.x.x or higher
   ```

   If you need to install or upgrade Node.js:
   - **Windows**: Download from [nodejs.org](https://nodejs.org/)
   - **macOS**: Use Homebrew: `brew install node`
   - **Linux**: Use your package manager: `sudo apt install nodejs npm` (Ubuntu/Debian)

2. **Claude Desktop** (MCP-compatible version)
   - Ensure you have the latest version of Claude Desktop installed
   - MCP support is required for extensions to work

3. **Git** (for GitHub installation)
   ```bash
   # Check if Git is installed
   git --version
   ```

   If Git is not installed:
   - **Windows**: Download from [git-scm.com](https://git-scm.com/)
   - **macOS**: Install Xcode Command Line Tools: `xcode-select --install`
   - **Linux**: `sudo apt install git` (Ubuntu/Debian)

### Optional

1. **Gemini API Key** (for advanced features)
   - Required for: Wiki generation, semantic search, accurate token counting
   - Free tier available at [Google AI Studio](https://aistudio.google.com/app/apikey)
   - See [CONFIGURATION.md](./CONFIGURATION.md) for setup instructions

---

## Installation Methods

### Method 1: Install from GitHub (Recommended)

This is the easiest method for most users.

1. **Open your terminal or command prompt**

2. **Install the extension using Claude Desktop's extension manager:**

   ```bash
   # NOT YET IMPLEMENTED - Coming soon
   # claude ext install gemini-context-extension
   ```

   **Alternative: Manual installation for now**

   ```bash
   # Clone the repository
   git clone https://github.com/Beaulewis1977/gemini-context-extension.git

   # Navigate to the directory
   cd gemini-context-extension

   # Install dependencies
   npm install

   # Build the extension
   npm run build

   # Link to Claude Desktop
   # The path varies by operating system
   ```

3. **Extension files will be installed to:**
   - **Windows**: `%USERPROFILE%\.claude\extensions\gemini-context-extension`
   - **macOS/Linux**: `~/.claude/extensions/gemini-context-extension`

4. **Restart Claude Desktop** to load the extension

---

### Method 2: Install Locally for Development

Use this method if you want to contribute to development or test changes.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Beaulewis1977/gemini-context-extension.git
   cd gemini-context-extension
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**

   ```bash
   npm run build
   ```

   This compiles TypeScript files from `src/` to JavaScript in `dist/`.

4. **Run in development mode (optional):**

   ```bash
   # Watch mode - automatically rebuilds on changes
   npm run dev
   ```

5. **Link to Claude Desktop for testing:**

   ```bash
   # Create a symbolic link in Claude's extensions directory
   # Adjust paths based on your system

   # Windows (PowerShell as Administrator)
   New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\extensions\gemini-context-extension" -Target "$(Get-Location)"

   # macOS/Linux
   ln -s "$(pwd)" ~/.claude/extensions/gemini-context-extension
   ```

6. **Restart Claude Desktop**

---

## Verification

After installation, verify the extension is working:

### Step 1: Check Extension is Loaded

1. Open Claude Desktop
2. Start a new conversation
3. Look for the extension in the loaded tools list

### Step 2: Test a Tool

Try running a simple command:

```
How much of my context window am I using?
```

Claude should automatically invoke the `track_context_usage` tool and provide detailed analysis.

### Step 3: List Available Tools

Ask Claude:

```
What tools are available from the gemini-context-extension?
```

You should see these 7 tools:
- ✅ `track_context_usage` - Context window tracking
- ✅ `estimate_api_cost` - Cost estimation
- ✅ `compare_gemini_models` - Model comparison
- ✅ `analyze_repository` - Repository analysis
- ✅ `generate_repository_wiki` - Wiki generation (requires API key)
- ✅ `index_repository` - Semantic indexing (requires API key)
- ✅ `search_repository` - Semantic search (requires API key)

---

## Troubleshooting

### Extension Not Loading

**Problem:** Extension doesn't appear in Claude Desktop

**Solutions:**

1. **Verify the build output exists:**
   ```bash
   # Check that dist/server.js exists
   ls dist/server.js
   ```

   If the file doesn't exist, rebuild:
   ```bash
   npm run build
   ```

2. **Check the manifest file:**
   ```bash
   # Verify gemini-extension.json exists in the extension root
   cat gemini-extension.json
   ```

3. **Check Claude Desktop logs:**
   - Logs location varies by OS
   - Look for error messages related to MCP servers or extensions

4. **Restart Claude Desktop completely:**
   - Quit the application (don't just close the window)
   - Relaunch

### Build Errors

**Problem:** `npm run build` fails

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version
   # Must be v18.x or higher
   ```

2. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Check for TypeScript errors:**
   ```bash
   npm run lint
   ```

### Tools Not Working

**Problem:** Tools are loaded but don't work correctly

**Solutions:**

1. **For wiki/search tools, check API key:**
   ```bash
   # Check if GEMINI_API_KEY is set
   echo $GEMINI_API_KEY   # macOS/Linux
   echo %GEMINI_API_KEY%  # Windows CMD
   ```

   If not set, see [CONFIGURATION.md](./CONFIGURATION.md)

2. **Check permissions:**
   - Ensure Claude Desktop has permission to read your files
   - On macOS, check System Preferences > Security & Privacy

3. **Try a simpler tool first:**
   - Start with `track_context_usage` (no API key needed)
   - Then try `analyze_repository` (no API key needed)
   - Finally test API-dependent tools

### Platform-Specific Issues

#### Windows

1. **Path separator issues:**
   - The extension automatically handles Windows paths
   - If you see path errors, ensure you're using absolute paths

2. **PowerShell execution policy:**
   ```powershell
   # If scripts don't run, you may need to adjust the execution policy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

#### macOS

1. **Gatekeeper warnings:**
   - If macOS blocks the extension, go to System Preferences > Security & Privacy
   - Click "Allow" for the extension

2. **Xcode Command Line Tools:**
   ```bash
   # Some npm packages require build tools
   xcode-select --install
   ```

#### Linux

1. **Permissions:**
   ```bash
   # Ensure the extension directory has correct permissions
   chmod -R 755 ~/.claude/extensions/gemini-context-extension
   ```

2. **Node.js version on Ubuntu/Debian:**
   ```bash
   # Use NodeSource for latest Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

---

## Next Steps

Now that you've installed the extension, you can:

1. **[Quick Start Guide](./QUICK_START.md)** - Learn to use the basic features
2. **[Configuration Guide](./CONFIGURATION.md)** - Set up advanced features like API key integration
3. **[User Guide](../user-guide/TOOLS_OVERVIEW.md)** - Deep dive into each tool's capabilities

---

## Getting Help

If you encounter issues not covered here:

1. **Check the [Troubleshooting](./TROUBLESHOOTING.md) guide** (coming soon)
2. **Review [GitHub Issues](https://github.com/Beaulewis1977/gemini-context-extension/issues)**
3. **Ask in [GitHub Discussions](https://github.com/Beaulewis1977/gemini-context-extension/discussions)**
4. **Consult the [Development Guide](../development/SETUP.md)** for advanced debugging

---

## Uninstallation

To remove the extension:

```bash
# Remove the extension directory
rm -rf ~/.claude/extensions/gemini-context-extension  # macOS/Linux
rmdir /s %USERPROFILE%\.claude\extensions\gemini-context-extension  # Windows

# Remove the local clone (if applicable)
rm -rf /path/to/gemini-context-extension
```

Then restart Claude Desktop.

---

**Installation complete!** You're ready to start using the Gemini Context Extension. Continue to the [Quick Start Guide](./QUICK_START.md) to learn the basics.
