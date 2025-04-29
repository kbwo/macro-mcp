## How to Use

1. Build the project:
   ```
   npm run build
   ```

2. Start the MCP server:
   ```
   npm start
   ```

3. Interact with the server using the MCP protocol. The server provides a tool:
   - `runNeovimMacro`: Run a Neovim macro on a specified file and return the cursor position

## MCP Tool: runNeovimMacro

The MCP server provides a single tool called `runNeovimMacro` with these parameters:

- `targetFilePath`: Path to the file to run the macro on
- `macroRawPath`: Path to the raw macro file
- `cursorPosition` (optional): Current cursor position if continuing a macro
  - `line`: Line number
  - `column`: Column number

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
      "command": "npx",
      "args": [
        "tsx",
        "<path to mcp server>"
      ]
    }
  }
}
```
