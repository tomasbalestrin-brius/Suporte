/**
 * Centralized logging system
 * Logs only in development, can be extended to send logs to external service in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  log(message: string, ...args: any[]) {
    this.addLog('log', message, args);
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    this.addLog('info', message, args);
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    this.addLog('warn', message, args);
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
    // In production, could send to error tracking service
  }

  error(message: string, error?: any) {
    this.addLog('error', message, error);
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    }
    // In production, send to error tracking service (Sentry, etc)
    // this.sendToSentry(message, error);
  }

  debug(message: string, ...args: any[]) {
    this.addLog('debug', message, args);
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Get recent logs (useful for debugging)
   */
  getRecentLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs from memory
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON (for debugging)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

// Also export for debugging purposes
if (import.meta.env.DEV) {
  (window as any).__logger = logger;
}
