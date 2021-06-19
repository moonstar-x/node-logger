const chalk = require('chalk');
const util = require('util');

const parseArguments = (args) => {
  return args.map((item) => {
    if (typeof item === 'string') {
      return item;
    }

    return util.inspect(item, { colors: false, depth: null });
  });
};

const prepareMessage = (chalkStyle, prefix, args) => {
  return chalkStyle(`(${new Date().toLocaleTimeString()}) - ${chalk.bold(prefix)} - `, ...parseArguments(Array.prototype.slice.call(args)));
};

/**
 * Log a LOG level message in white.
 * @param  {...any} args
 * @returns {undefined}
 */
const log = (...args) => {
  console.log(prepareMessage(chalk.white, '[LOG]', args));
};

/**
 * Log an INFO level message in cyan.
 * @param  {...any} args
 * @returns {undefined}
 */
const info = (...args) => {
  console.info(prepareMessage(chalk.cyan, '[INFO]', args));
};

/**
 * Log an ERROR level message in red.
 * @param  {...any} args
 * @returns {undefined}
 */
const error = (...args) => {
  console.error(prepareMessage(chalk.red, '[ERROR]', args));
};

/**
 * Log a FATAL level message in red.
 * @param  {...any} args
 * @returns {undefined}
 */
const fatal = (...args) => {
  console.error(prepareMessage(chalk.red, '[FATAL]', args));
};

/**
 * Log a WARN level message in yellow.
 * @param  {...any} args
 * @returns {undefined}
 */
const warn = (...args) => {
  console.warn(prepareMessage(chalk.yellow, '[WARN]', args));
};

/**
 * Log a DEBUG level message in green.
 * @param  {...any} args
 * @returns {undefined}
 */
const debug = (...args) => {
  console.debug(prepareMessage(chalk.green, '[DEBUG]', args));
};

/**
 * Clears the console.
 * @returns {undefined}
 */
const clear = () => {
  console.clear();
};

module.exports = {
  log,
  info,
  error,
  fatal,
  warn,
  debug,
  clear
};
