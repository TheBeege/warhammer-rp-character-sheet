/**
 * Simple logging utility with timestamp and level
 */
export class Logger {
  /**
   * Log an info message
   * @param {string} message - Message to log
   */
  static info(message) {
    Logger._log('info', message);
  }

  /**
   * Log a warning message
   * @param {string} message - Message to log
   */
  static warn(message) {
    Logger._log('warn', message);
  }

  /**
   * Log an error message
   * @param {string} message - Message to log
   */
  static error(message) {
    Logger._log('error', message);
  }

  /**
   * Log a debug message
   * @param {string} message - Message to log
   */
  static debug(message) {
    Logger._log('debug', message);
  }

  /**
   * Internal logging method
   * @private
   * @param {string} level - Log level
   * @param {string} message - Message to log
   */
  static _log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}