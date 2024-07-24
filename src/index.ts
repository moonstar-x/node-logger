import chalk, { Chalk } from 'chalk';
import util from 'util';

const parseArguments = (args: unknown[]): string[] => {
  return args.map((item) => {
    if (typeof item === 'string') {
      return item;
    }

    return util.inspect(item, { colors: false, depth: null });
  });
};

const prepareMessage = (chalkStyle: Chalk, prefix: string, args: unknown[]): string => {
  return chalkStyle(`(${new Date().toLocaleTimeString()}) - ${chalk.bold(prefix)} -`, ...parseArguments(Array.prototype.slice.call(args)));
};

/**
 * Log a LOG level message in white.
 * @param {...any} args
 */
export const log = (...args: any[]): void => {
  console.log(prepareMessage(chalk.white, '[LOG]', args));
};

/**
 * Log an INFO level message in cyan.
 * @param {...any} args
 */
export const info = (...args: any[]): void => {
  console.info(prepareMessage(chalk.cyan, '[INFO]', args));
};

/**
 * Log an ERROR level message in red.
 * @param {...any} args
 */
export const error = (...args: any[]): void => {
  console.error(prepareMessage(chalk.red, '[ERROR]', args));
};

/**
 * Log a FATAL level message in red.
 * @param {...any} args
 */
export const fatal = (...args: any[]): void => {
  console.error(prepareMessage(chalk.red, '[FATAL]', args));
};

/**
 * Log a WARN level message in yellow.
 * @param {...any} args
 */
export const warn = (...args: any[]): void => {
  console.warn(prepareMessage(chalk.yellow, '[WARN]', args));
};

/**
 * Log a DEBUG level message in green.
 * @param {...any} args
 */
export const debug = (...args: any[]): void => {
  console.debug(prepareMessage(chalk.green, '[DEBUG]', args));
};

/**
 * Clears the console.
 */
export const clear = (): void => {
  console.clear();
};
