import { join } from "node:path";
import { promises as fs } from "node:fs";
import { exec } from "node:child_process";
import { Logger } from "./logger.ts";
import { tmpdir } from "node:os";

type CursorPosition = {
  line: number;
  column: number;
};

export function runMacro(
  targetFilePath: string,
  macroRawPath: string,
  cursorPosition: CursorPosition | null,
  useConfig: boolean = true,
): Promise<CursorPosition> {
  const cursorPosFile = join(tmpdir(), "nvim_cursor_pos.txt");
  const logger = Logger.getInstance();

  const cursorCommand = cursorPosition
    ? `-c 'call cursor(${cursorPosition.line}, ${cursorPosition.column})'`
    : '-c "call cursor(0, 0)"';
  const configFlag = useConfig ? "" : "--noplugin -u NONE";

  const command = `nvim --headless ${configFlag} ${targetFilePath} \
  -c 'call setreg("a", readfile("${macroRawPath}", 1), "b")' \
  ${cursorCommand} \
  -c 'normal! @a' \
  -c 'redir! > ${cursorPosFile}' \
  -c 'echo line(".")." ".col(".")' \
  -c 'redir END' \
  -c 'wq'`;

  logger.debug("Executing nvim command", { command, useConfig });

  return new Promise((resolve, reject) => {
    exec(
      command,
      async (error: Error | null, stdout: string, stderr: string) => {
        let positionData: string = "";
        try {
          if (error) {
            logger.error("Error executing macro", {
              error: error.message,
              stderr,
            });
            throw error;
          }

          // Read cursor position from file
          logger.debug("Reading cursor position from file", {
            file: cursorPosFile,
          });
          positionData = await fs.readFile(cursorPosFile, "utf8");
        } catch (err) {
          logger.error("Error during macro execution", {
            error: err instanceof Error ? err.message : "Unknown error",
          });
          try {
            // Attempt to clean up the temp file even if an error occurred
            await fs.unlink(cursorPosFile);
          } catch (unlinkErr) {
            logger.debug("Failed to delete temp file during error handling", {
              file: cursorPosFile,
              error: unlinkErr instanceof Error
                ? unlinkErr.message
                : "Unknown error",
            });
          }
          reject(err);
          return;
        }

        try {
          // Parse cursor position
          const [line, column] = positionData.trim().split(" ").map(Number);

          // Delete temporary file
          logger.debug("Deleting temporary file", { file: cursorPosFile });
          await fs.unlink(cursorPosFile);

          // Return position
          logger.debug("Returning cursor position", { line, column });
          resolve({ line, column });
        } catch (parseError) {
          // Ensure the temp file is deleted even if parsing fails
          try {
            await fs.unlink(cursorPosFile);
          } catch (unlinkErr) {
            logger.debug("Failed to delete temp file during parse error", {
              file: cursorPosFile,
              error: unlinkErr instanceof Error
                ? unlinkErr.message
                : "Unknown error",
            });
          }

          logger.error("Error parsing cursor position", {
            error: parseError instanceof Error
              ? parseError.message
              : "Unknown error",
            data: positionData,
          });
          reject(parseError);
        }
      },
    );
  });
}
