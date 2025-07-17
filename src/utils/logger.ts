type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogMessage {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /* eslint-disable no-console */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.isDevelopment) {
      // In production, we might want to send logs to a service
      // TODO: Implement production logging strategy
      return;
    }

    const formattedMessage = this.formatMessage(level, message, data);
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }
  /* eslint-enable no-console */

  public debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  public info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  public warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  public error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }
}

export const logger = Logger.getInstance(); 