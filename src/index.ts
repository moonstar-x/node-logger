import type { Logger } from './logger.js';
import { createLogger } from './logger.js';

export { createStyler, isColorSupported, type Destination, type StyleName, type Styler } from './colors.js';
export { formatJson, formatPretty, formatTimestamp, serializeArgs, type LogEntry, type TimestampFormat } from './format.js';
export { isLogLevel, LEVEL_SEVERITY, LOG_LEVELS, LOG_METHODS, shouldLog, type LoggableLevel, type LogLevel, type LogMethod, type MethodSpec } from './levels.js';
export { createLogger, Logger, optionsFromEnvironment, type LogFormat, type LoggerOptions } from './logger.js';

/**
 * The default logger, configured from the environment. Import it as the default export, or use the bound methods
 * exported alongside it.
 */
export const logger: Logger = createLogger();
export default logger;
