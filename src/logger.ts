import { createWriteStream, existsSync, mkdirSync, WriteStream } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

const DEFAULT_LOG_PATH = join(
  homedir(),
  ".local",
  "share",
  "neovim-macro-mcp",
  "logs",
  "app.log",
);

export class Logger {
  private static instance: Logger;
  private logStream: WriteStream | null = null;
  private logToConsole: boolean = true;
  private logFilePath: string | null = null;

  private constructor(logFilePath?: string) {
    if (logFilePath) {
      try {
        // Ensure the directory exists
        const dirPath = dirname(logFilePath);
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }

        this.logStream = createWriteStream(logFilePath, { flags: "a" });
        this.logFilePath = logFilePath;

        // Log that the logger was initialized
        this.debug(`Logger initialized with log file: ${logFilePath}`);
      } catch (error) {
        console.error(`Failed to create log file at ${logFilePath}:`, error);
        this.logFilePath = null;
      }
    }
  }

  public static getInstance(logFilePath: string = DEFAULT_LOG_PATH): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logFilePath);
    }
    return Logger.instance;
  }

  public setLogToConsole(value: boolean): void {
    this.logToConsole = value;
  }

  public getLogFilePath(): string | null {
    return this.logFilePath;
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private write(entry: LogEntry): void {
    const logString = JSON.stringify(entry);

    if (this.logStream) {
      this.logStream.write(logString + "\n");
    }

    if (this.logToConsole) {
      const consoleMethod = entry.level === LogLevel.ERROR
        ? console.error
        : entry.level === LogLevel.WARN
          ? console.warn
          : entry.level === LogLevel.INFO
            ? console.info
            : console.debug;

      consoleMethod(logString);
    }
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.write(this.formatLogEntry(LogLevel.DEBUG, message, context));
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.write(this.formatLogEntry(LogLevel.INFO, message, context));
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.write(this.formatLogEntry(LogLevel.WARN, message, context));
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.write(this.formatLogEntry(LogLevel.ERROR, message, context));
  }

  public close(): void {
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }
}
