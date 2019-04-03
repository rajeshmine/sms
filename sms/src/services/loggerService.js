export default class LoggerService {
  static error(...args) {
    console.log("ERROR: ", ...args);
  }

  static warn(...args) {
    console.log("WARN: ", ...args);
  }

  static info(...args) {
    console.log("INFO: ", ...args);
  }

  static debug(...args) {
    console.log("DEBUG: ", ...args);
  }
}