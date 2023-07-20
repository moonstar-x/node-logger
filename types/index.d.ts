/**
 * Log a LOG level message in white.
 * @param  {...any} args
 * @returns {undefined}
 */
export function log(...args: any[]): undefined;
/**
 * Log an INFO level message in cyan.
 * @param  {...any} args
 * @returns {undefined}
 */
export function info(...args: any[]): undefined;
/**
 * Log an ERROR level message in red.
 * @param  {...any} args
 * @returns {undefined}
 */
export function error(...args: any[]): undefined;
/**
 * Log a FATAL level message in red.
 * @param  {...any} args
 * @returns {undefined}
 */
export function fatal(...args: any[]): undefined;
/**
 * Log a WARN level message in yellow.
 * @param  {...any} args
 * @returns {undefined}
 */
export function warn(...args: any[]): undefined;
/**
 * Log a DEBUG level message in green.
 * @param  {...any} args
 * @returns {undefined}
 */
export function debug(...args: any[]): undefined;
/**
 * Clears the console.
 * @returns {undefined}
 */
export function clear(): undefined;
