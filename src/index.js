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
 * @param  {...any} arguments 
 * @returns {undefined}   
 */
const log = (...arguments) => {
  console.log(prepareMessage(chalk.white, '[LOG]', arguments));
};

/**
 * Log an INFO level message in cyan.
 * @param  {...any} arguments 
 * @returns {undefined}   
 */
const info = (...arguments) => {
  console.info(prepareMessage(chalk.cyan, '[INFO]', arguments));
};

/**
 * Log an ERROR level message in red.
 * @param  {...any} arguments 
 * @returns {undefined}   
 */
const error = (...arguments) => {
  console.error(prepareMessage(chalk.red, '[ERROR]', arguments));
};

/**
 * Log a FATAL level message in red.
 * @param  {...any} arguments 
 * @returns {undefined}   
 */
const fatal = (...arguments) => {
  console.error(prepareMessage(chalk.red, '[FATAL]', arguments));
};

/**
 * Log a WARN level message in yellow.
 * @param  {...any} arguments 
 * @returns {undefined}   
 */
const warn = (...arguments) => {
  console.warn(prepareMessage(chalk.yellow, '[WARN]', arguments));
};

/**
 * Log a DEBUG level message in green.
 * @param  {...any} arguments 
 * @returns {undefined}   
 */
const debug = (...arguments) => {
  console.debug(prepareMessage(chalk.green, '[DEBUG]', arguments));
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
