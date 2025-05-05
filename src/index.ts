import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runMacro } from "./neovim";
import { Logger } from "./logger";

// Initialize logger with default global path
const logger = Logger.getInstance();

// Create an MCP server
const server = new McpServer({
    name: "Neovim Macro MCP",
    version: "1.0.0"
});

// Add a tool to run a Neovim macro
server.tool("runNeovimMacro",
    {
        targetFilePath: z.string().describe("Path to the file to run the macro on"),
        macroRawPath: z.string().describe("Path to the raw macro file"),
        cursorPosition: z.object({
            line: z.number(),
            column: z.number()
        }).optional().describe("Current cursor position (if continuing a macro)"),
        useConfig: z.boolean().optional().describe("Whether to use Neovim user config (default: true)")
    },
    async ({ targetFilePath, macroRawPath, cursorPosition, useConfig }) => {
        logger.info("Running Neovim macro", { targetFilePath, macroRawPath, cursorPosition, useConfig });
        
        try {
            const newCursorPosition = await runMacro(
                targetFilePath,
                macroRawPath,
                cursorPosition || null,
                useConfig || true
            );

            logger.info("Macro executed successfully", { targetFilePath, newCursorPosition });
            
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        cursorPosition: newCursorPosition
                    })
                }]
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            
            logger.error("Failed to execute macro", { 
                targetFilePath, 
                macroRawPath, 
                error: errorMessage 
            });
            
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage
                    })
                }]
            };
        }
    }
);

async function main() {
    logger.info("Starting Neovim Macro MCP server", { 
        logPath: logger.getLogFilePath() 
    });
    
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        logger.info("MCP server connected to transport");
    } catch (error) {
        logger.error("Failed to connect to transport", { 
            error: error instanceof Error ? error.message : "Unknown error" 
        });
    }
}

main().catch((error) => {
    logger.error("Fatal error in main()", { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
});
