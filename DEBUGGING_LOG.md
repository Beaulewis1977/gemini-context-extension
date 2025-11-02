# Debugging Log: get_performance_profile Tool

This document tracks the steps taken to diagnose and fix the issue with the `get_performance_profile` tool not being found.

## 1. Initial Problem

The `get_performance_profile` tool was not found by the Gemini CLI, even though it was registered in `src/server.ts`.

## 2. Initial Diagnosis

It was suspected that the server was not running the latest code.

## 3. Action: Add Log Message

A log message was added to `src/server.ts` to confirm if the server was restarting automatically.

## 4. Result: Server Not Restarting

The log message did not appear, confirming that the `dev` script was not restarting the server.

## 5. Action: Update `dev` Script

The `dev` script in `package.json` was updated to use `nodemon` to automatically restart the server on file changes.

## 6. Result: Server Restarts, Tool Still Not Found

The server now restarts automatically, but the `get_performance_profile` tool is still not found by the Gemini CLI.

## 7. Action: Use MCP Inspector

The `@modelcontextprotocol/inspector` tool was used to directly inspect the tools exposed by the server.

## 8. Result: `tools/list` Fails

The `tools/list` method in the inspector UI failed with a "Failed to fetch" error, indicating a server-side issue when listing the tools.

## 9. Current Action: Isolate the Problem

To isolate the problem, the `get_performance_profile` tool registration is being temporarily commented out in `src/server.ts` to see if the `tools/list` method then succeeds.

## 10. Result: `tools/list` Succeeds

After commenting out the `get_performance_profile` tool, the `tools/list` method in the inspector UI succeeded, showing the other three tools. This confirms that the `get_performance_profile` tool registration is the source of the server-side issue.

## 11. Action: Fix the Code

The `get_performance_profile` tool was re-enabled in `src/server.ts`, but without the `withProfiling` wrapper.

## 12. Result: `get_performance_profile` is Registered

After re-enabling the tool without the wrapper, the `tools/list` method in the inspector UI now shows `get_performance_profile` in the list of available tools. This confirms that the `withProfiling` wrapper was the cause of the issue.
