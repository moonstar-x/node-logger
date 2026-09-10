import util from 'node:util';
import type { StyleName, Styler } from './colors.js';
import type { LoggableLevel } from './levels.js';

/**
 * How the timestamp of an entry is rendered.
 *
 * - `'time'` renders a locale time, e.g. `11:49:58 PM`.
 * - `'iso'` renders an ISO 8601 timestamp, e.g. `2024-07-30T23:49:58.000Z`.
 * - `false` omits the timestamp.
 * - A function renders whatever it returns.
 */
export type TimestampFormat = 'iso' | 'time' | ((date: Date) => string) | false;

/**
 * The shape a message takes before it is rendered.
 */
export interface LogEntry {
  /** Structured fields inherited from the logger and its parents. */
  bindings: Readonly<Record<string, unknown>>;
  /** The color the entry is rendered in. */
  color: StyleName;
  /** The uppercase tag shown in pretty output, e.g. `LOG`. */
  label: string;
  /** The severity the message was emitted at. */
  level: LoggableLevel;
  /** The already serialized message. */
  message: string;
  /** The name of the logger that emitted the message, if any. */
  name?: string | undefined;
  /** When the message was emitted. */
  time: Date;
}

/**
 * Turns the arguments of a log call into a single string. Strings are used as-is, everything else is inspected, which
 * means objects are serialized and errors keep their stack trace.
 *
 * @param args - The arguments passed to a logger method.
 * @param depth - How deep objects are inspected. `null` means unlimited.
 */
export const serializeArgs = (args: readonly unknown[], depth: null | number = null): string => args
  .map((arg) => typeof arg === 'string' ? arg : util.inspect(arg, { colors: false, depth }))
  .join(' ');

/**
 * Renders the timestamp of an entry, or `null` when timestamps are disabled.
 *
 * @param time - The moment the entry was created.
 * @param format - How to render it.
 */
export const formatTimestamp = (time: Date, format: TimestampFormat): null | string => {
  if (format === false) {
    return null;
  }

  if (typeof format === 'function') {
    return format(time);
  }

  return format === 'iso' ? time.toISOString() : time.toLocaleTimeString();
};

/**
 * Renders an entry as a colored, human-readable line.
 *
 * @param entry - The entry to render.
 * @param styler - The styler used to colorize the line.
 * @param timestamp - How to render the timestamp.
 */
export const formatPretty = (entry: LogEntry, styler: Styler, timestamp: TimestampFormat): string => {
  const time = formatTimestamp(entry.time, timestamp);

  const segments: string[] = [];

  if (time !== null) {
    segments.push(styler(`(${time})`, 'dim'));
  }

  segments.push(styler(`[${entry.label}]`, entry.color, 'bold'));

  if (entry.name !== undefined) {
    segments.push(styler(`(${entry.name})`, 'dim', 'bold'));
  }

  const prefix = segments.join(' - ');
  const message = styler(entry.message, entry.color);

  return entry.message.length > 0 ? `${prefix} - ${message}` : prefix;
};

const safeReplacer = () => {
  const seen = new WeakSet<object>();

  // eslint-disable-next-line @typescript-eslint/promise-function-async -- A JSON.stringify replacer must be synchronous.
  return (_key: string, value: unknown): unknown => {
    if (value instanceof Error) {
      return { message: value.message, name: value.name, stack: value.stack };
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }

      seen.add(value);
    }

    return value;
  };
};

interface JsonLogEntry {
  level: LoggableLevel;
  msg?: string;
  name?: string;
  time?: string;
}

/**
 * Renders an entry as a single line of JSON, ready to be picked up by a log collector.
 *
 * @param entry - The entry to render.
 * @param timestamp - How to render the timestamp. Anything other than `false` results in an ISO 8601 `time` field.
 */
export const formatJson = (entry: LogEntry, timestamp: TimestampFormat): string => {
  const payload: JsonLogEntry = { level: entry.level };

  if (timestamp !== false) {
    payload.time = entry.time.toISOString();
  }

  if (entry.name !== undefined) {
    payload.name = entry.name;
  }

  Object.assign(payload, entry.bindings);
  payload.msg = entry.message;

  return JSON.stringify(payload, safeReplacer());
};
