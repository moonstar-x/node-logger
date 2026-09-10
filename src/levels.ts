import type { StyleName } from './colors.js';

/**
 * The severity of every level the logger can emit, plus `silent` which disables output entirely.
 * Higher numbers are more severe.
 */
export const LEVEL_SEVERITY = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: 99_999
} as const;

/**
 * Any value accepted as a logger threshold, including `silent`.
 */
export type LogLevel = keyof typeof LEVEL_SEVERITY;

/**
 * The levels a message can actually be emitted at.
 */
export type LoggableLevel = Exclude<LogLevel, 'silent'>;

/**
 * Every valid level, ordered from least to most severe.
 */
export const LOG_LEVELS: readonly LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'];

/**
 * Type guard that checks whether an arbitrary value is a valid {@link LogLevel}.
 *
 * @param value - The value to check.
 */
export const isLogLevel = (value: unknown): value is LogLevel => typeof value === 'string' && Object.hasOwn(LEVEL_SEVERITY, value);

/**
 * Whether a message at `level` should be emitted by a logger with the given `threshold`.
 *
 * @param level - The level of the message.
 * @param threshold - The level configured on the logger.
 */
export const shouldLog = (level: LoggableLevel, threshold: LogLevel): boolean => LEVEL_SEVERITY[level] >= LEVEL_SEVERITY[threshold];

/**
 * How a logger method presents itself: its color, its tag, the severity it emits at and whether it goes to `stderr`.
 */
export interface MethodSpec {
  color: StyleName;
  label: string;
  level: LoggableLevel;
  stderr: boolean;
}

/**
 * Every method a logger exposes. `log` is an alias of `info` that keeps its own tag and color.
 */
export const LOG_METHODS = {
  trace: { color: 'gray', label: 'TRACE', level: 'trace', stderr: false },
  debug: { color: 'green', label: 'DEBUG', level: 'debug', stderr: false },
  info: { color: 'cyan', label: 'INFO', level: 'info', stderr: false },
  log: { color: 'white', label: 'LOG', level: 'info', stderr: false },
  warn: { color: 'yellow', label: 'WARN', level: 'warn', stderr: true },
  error: { color: 'red', label: 'ERROR', level: 'error', stderr: true },
  fatal: { color: 'magenta', label: 'FATAL', level: 'fatal', stderr: true }
} as const;

/**
 * The name of a logging method, e.g. `warn`.
 */
export type LogMethod = keyof typeof LOG_METHODS;
