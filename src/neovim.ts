import { join } from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { Logger } from './logger';

type CursorPosition = {
  line: number;
  column: number;
};

export async function runMacro(targetFilePath: string, macroRawPath: string, cursorPosition: CursorPosition | null): Promise<CursorPosition> {
  const { tmpdir } = require('os');
  const cursorPosFile = join(tmpdir(), 'nvim_cursor_pos.txt');
  const logger = Logger.getInstance();

  const cursorCommand = cursorPosition ? `-c 'call cursor(${cursorPosition.line}, ${cursorPosition.column})'` : '-c "call cursor(0, 0)"';

  const command = `nvim --headless ${targetFilePath} \
  -c 'call setreg("a", readfile("${macroRawPath}", 1), "b")' \
  ${cursorCommand} \
  -c 'normal! @a' \
  -c 'redir! > ${cursorPosFile}' \
  -c 'echo line(".")." ".col(".")' \
  -c 'redir END' \
  -c 'wq'`;

  logger.debug('Executing nvim command', { command });

  return new Promise((resolve, reject) => {
    exec(command, async (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        logger.error('Error executing macro', { 
          error: error.message,
          stderr 
        });
        reject(error);
        return;
      }

      try {
        // Read cursor position from file
        logger.debug('Reading cursor position from file', { file: cursorPosFile });
        const positionData = await fs.readFile(cursorPosFile, 'utf8');
        const [line, column] = positionData.trim().split(' ').map(Number);

        // Delete temporary file
        logger.debug('Deleting temporary file', { file: cursorPosFile });
        await fs.unlink(cursorPosFile);

        // Return position
        logger.debug('Returning cursor position', { line, column });
        resolve({ line, column });
      } catch (readError) {
        logger.error('Error reading cursor position', { 
          error: readError instanceof Error ? readError.message : 'Unknown error'
        });
        reject(readError);
      }
    });
  });
}
