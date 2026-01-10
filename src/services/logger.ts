/**
 * Logging Service
 * Centralized logging for the application
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Logs an info message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || "");
    }
  }

  /**
   * Logs a warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || "");
    }
  }

  /**
   * Logs an error message
   */
  error(message: string, context?: LogContext | Error): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, context || "");
    }

    // In production, you would send this to an error tracking service
    // Example: Sentry, LogRocket, etc.
    // if (!this.isDevelopment) {
    //   this.sendToErrorTracking(message, context);
    // }
  }

  /**
   * Logs a debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  }

  /**
   * Logs based on log level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case "info":
        this.info(message, context);
        break;
      case "warn":
        this.warn(message, context);
        break;
      case "error":
        this.error(message, context);
        break;
      case "debug":
        this.debug(message, context);
        break;
    }
  }

  /**
   * Sends error to error tracking service (placeholder for future implementation)
   */
  // private sendToErrorTracking(message: string, context?: LogContext | Error): void {
  //   // Implement integration with error tracking service
  //   // Example: Sentry.captureException(context);
  // }
}

export const logger = new Logger();
