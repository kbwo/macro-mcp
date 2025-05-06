# Macro MCP

![Screenshot From 2025-05-02 23-32-28](https://github.com/user-attachments/assets/d69e5dfd-fa4d-414c-907c-845bc1164201)


## Motivation

This MCP server was created to address challenges when working with AI coding assistants. While AI assistants can help with code tasks, they sometimes:

- Generate large, difficult-to-review diffs when making changes
- Make unexpected modifications beyond what was requested
- Require extensive context for relatively simple edits

For mechanical text editing operations that follow predictable patterns, having an AI execute editor operations (like Neovim macros) offers several advantages:
- The AI follows the same editing workflow a human would use
- Results are more predictable and trustworthy even when diffs are complex
- The focus is on the editing operation itself rather than generating entirely new code

This server allows AI assistants to run Neovim macros on files, making them more effective for certain editing tasks.

## MCP Tool: runNeovimMacro

The MCP server provides a single tool called `runNeovimMacro` with these parameters:

- `targetFilePath`: Path to the file to run the macro on
- `macroRawPath`: Path to the raw macro file
- `cursorPosition` (optional): Current cursor position if continuing a macro
  - `line`: Line number
  - `column`: Column number
- `useConfig` (optional): Whether to use Neovim user configuration (default: false)

The tool returns:
- `success`: Boolean indicating if the macro ran successfully
- `cursorPosition`: New cursor position after running the macro
  - `line`: Line number
  - `column`: Column number

## Example settings

```
{
  "mcpServers": {
    ...
    "neovim-macro": {
      "command": "deno",
      "args": [
        "run",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        "--allow-run",
        "--allow-sys",
        "<path to mcp server>/main.ts"
      ]
    }
  }
}
```
