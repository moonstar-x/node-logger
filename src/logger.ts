import process from 'node:process';
import { createStyler, isColorSupported } from './colors.js';
import type { Destination, Styler } from './colors.js';
import { formatJson, formatPretty, serializeArgs } from './format.js';
import type { LogEntry, TimestampFormat } from './format.js';
import { isLogLevel, LOG_METHODS, shouldLog } from './levels.js';
import type { LoggableLevel, LogLevel, LogMethod } from './levels.js';

const CLEAR_SCREEN = '\u{1B}[2J\u{1B}[3J\u{1B}[H';

/**
 * How the logger renders its output.
 *
 * - `'pretty'` renders colored, human -eadable lines.
 * - `'json'` renders one JSON object per line, for log collectors.
 */
export type LogFormat = 'json' | 'pretty';

/**
 * Everything a {@link Logger} can be configured with. Every option has a sensible default, so `{}` is a valid config.
 */
export interface LoggerOptions {
  /** Structured fields added to every entry. Only rendered in `json` format. Defaults to `{}`. */
  bindings?: Record<string, unknown>;
  /** Force colors on or off. Defaults to auto-detection through `NO_COLOR`, `FORCE_COLOR` and TTY checks. */
  color?: boolean;
  /** How deep objects are inspected. `null` means unlimited, which is the default. */
  depth?: null | number;
  /** Output format. Defaults to `'pretty'`. */
  format?: LogFormat;
  /** The minimum severity that gets logged. Defaults to `'info'`. */
  level?: LogLevel;
  /** A name shown on every entry, useful to tell subsystems apart. */
  name?: string | undefined;
  /** Where `warn`, `error` and `fatal` are written. Defaults to `process.stderr`. */
  stderr?: Destination;
  /** Where `trace`, `debug`, `info` and `log` are written. Defaults to `process.stdout`. */
  stdout?: Destination;
  /** How the timestamp is rendered. `true` (the default) picks a locale time for `pretty` and ISO 8601 for `json`. */
  timestamp?: TimestampFormat | true;
}

const assertLevel = (level: LogLevel): LogLevel => {
  if (!isLogLevel(level)) {
    throw new TypeError(`Invalid log level: ${String(level)}.`);
  }

  return level;
};

/**
 * A logger. Prefer {@link createLogger} unless you explicitly want to ignore the environment defaults.
 *
 * Methods live on the prototype and are not bound, so always call them on the instance: `logger.info('hello')`.
 */
export class Logger {
  private readonly _bindings: Record<string, unknown>;
  private readonly _depth: null | number;
  private readonly _format: LogFormat;
  private _level: LogLevel;
  private readonly _name: string | undefined;
  private readonly _options: LoggerOptions;
  private readonly _stderr: Destination;
  private readonly _stderrStyler: Styler;
  private readonly _stdout: Destination;
  private readonly _stdoutStyler: Styler;
  private readonly _timestamp: TimestampFormat;

  constructor(options: LoggerOptions = {}) {
    const {
      bindings = {},
      color,
      depth = null,
      format = 'pretty',
      level = 'info',
      name,
      stderr = process.stderr,
      stdout = process.stdout,
      timestamp = true
    } = options;

    this._options = options;
    this._bindings = { ...bindings };
    this._depth = depth;
    this._format = format;
    this._level = assertLevel(level);
    this._name = name;
    this._stderr = stderr;
    this._stdout = stdout;
    this._timestamp = timestamp === true ? (format === 'json' ? 'iso' : 'time') : timestamp;

    this._stdoutStyler = createStyler(color ?? isColorSupported(stdout));
    this._stderrStyler = createStyler(color ?? isColorSupported(stderr));
  }

  /**
   * The minimum severity this logger emits. Assigning an invalid level throws.
   */
  public get level(): LogLevel {
    return this._level;
  }

  public set level(level: LogLevel) {
    this._level = assertLevel(level);
  }

  /**
   * The name of this logger, if it has one.
   */
  public get name(): string | undefined {
    return this._name;
  }

  /**
   * Creates a logger that inherits this one's configuration. Names are joined with a colon and bindings are merged, so
   * `createLogger({ name: 'app' }).child('db')` is named `app:db`.
   *
   * @param options - A name, or any option to override on the child.
   */
  public child(options: LoggerOptions | string = {}): Logger {
    const overrides = typeof options === 'string' ? { name: options } : options;
    const name = overrides.name === undefined || this._name === undefined
      ? overrides.name ?? this._name
      : `${this._name}:${overrides.name}`;

    return new Logger({
      ...this._options,
      ...overrides,
      bindings: { ...this._bindings, ...overrides.bindings },
      level: overrides.level ?? this._level,
      name
    });
  }

  /**
   * Clears the terminal. Does nothing when the output is not a TTY.
   */
  public clear(): void {
    if (this._stdout.isTTY === true) {
      this._stdout.write(CLEAR_SCREEN);
    }
  }

  /**
   * Log a DEBUG level message in green.
   *
   * @param args - Anything. Objects are serialized and errors keep their stack trace.
   */
  public debug(...args: unknown[]): void {
    this.emit('debug', args);
  }

  /**
   * Log an ERROR level message in red, to `stderr`.
   *
   * @param args - Anything. Objects are serialized and errors keep their stack trace.
   */
  public error(...args: unknown[]): void {
    this.emit('error', args);
  }

  /**
   * Log a FATAL level message in magenta, to `stderr`.
   *
   * @param args - Anything. Objects are serialized and errors keep their stack trace.
   */
  public fatal(...args: unknown[]): void {
    this.emit('fatal', args);
  }

  /**
   * Log an INFO level message in cyan.
   *
   * @param args - Anything. Objects are serialized and errors keep their stack trace.
   */
  public info(...args: unknown[]): void {
    this.emit('info', args);
  }

  /**
   * Whether a message at the given level would be emitted. Use it to skip work that is only needed for logging.
   *
   * @param level - The level to check.
   */
  public isLevelEnabled(level: LoggableLevel): boolean {
    return shouldLog(level, this._level);
  }

  /**
   * Log a LOG level message in white. Emitted at the same severity as {@link Logger.info}.
   *
   * @param args - Anything. Objects are serialized and errors keep their stack trace.
   */
  public log(...args: unknown[]): void {
    this.emit('log', args);
  }

  /**
   * Sets the minimum severity this logger emits and returns the logger, so it can be chained.
   *
   * @param level - The new level.
   */
  public setLevel(level: LogLevel): this {
    this.level = level;

    return this;
  }

  /**
   * Log a TRACE level message in gray.
   *
   * @param args - Anything. Objects are serialized and errors keep their stack trace.
   */
  public trace(...args: unknown[]): void {
    this.emit('trace', args);
  }

  /**
   * Log a WARN level message in yellow, to `stderr`.
   *
   * @param args - Anything. Objects are serialized and errors keep their stack trace.
   */
  public warn(...args: unknown[]): void {
    this.emit('warn', args);
  }

  // eslint-disable-next-line unicorn/consistent-class-member-order -- `perfectionist/sort-classes` wants private methods last.
  private emit(method: LogMethod, args: readonly unknown[]): void {
    const spec = LOG_METHODS[method];

    if (!shouldLog(spec.level, this._level)) {
      return;
    }

    const entry: LogEntry = {
      bindings: this._bindings,
      color: spec.color,
      label: spec.label,
      level: spec.level,
      message: serializeArgs(args, this._depth),
      name: this._name,
      time: new Date()
    };

    const destination = spec.stderr ? this._stderr : this._stdout;
    const line = this._format === 'json'
      ? formatJson(entry, this._timestamp)
      : formatPretty(entry, spec.stderr ? this._stderrStyler : this._stdoutStyler, this._timestamp);

    destination.write(`${line}\n`);
  }
}

/**
 * Reads logger defaults from the environment.
 *
 * | Variable        | Effect                                                          |
 * | --------------- | --------------------------------------------------------------- |
 * | `LOG_LEVEL`     | The minimum severity, e.g. `debug`. Invalid values are ignored.  |
 * | `LOG_FORMAT`    | `json` switches to structured output.                            |
 * | `LOG_TIMESTAMP` | `iso`, `time`, or `off` to drop the timestamp.                    |
 * | `NO_COLOR`      | Disables colors, per the `NO_COLOR` convention.                   |
 * | `FORCE_COLOR`   | Forces colors on, even when the output is not a TTY.              |
 *
 * @param environment - The environment to read from. Defaults to `process.env`.
 */
export const optionsFromEnvironment = (environment: NodeJS.ProcessEnv = process.env): LoggerOptions => {
  const options: LoggerOptions = {};

  if (isLogLevel(environment['LOG_LEVEL'])) {
    options.level = environment['LOG_LEVEL'];
  }

  if (environment['LOG_FORMAT'] === 'json' || environment['LOG_FORMAT'] === 'pretty') {
    options.format = environment['LOG_FORMAT'];
  }

  if (environment['LOG_TIMESTAMP'] === 'iso' || environment['LOG_TIMESTAMP'] === 'time') {
    options.timestamp = environment['LOG_TIMESTAMP'];
  } else if (environment['LOG_TIMESTAMP'] === 'off' || environment['LOG_TIMESTAMP'] === 'false') {
    options.timestamp = false;
  }

  return options;
};

/**
 * Creates a logger configured from the environment, with the given options taking precedence.
 *
 * @param options - Options that override the environment defaults.
 */
export const createLogger = (options: LoggerOptions = {}): Logger => new Logger({ ...optionsFromEnvironment(), ...options });
