import util from 'node:util';
import { describe, expect, it } from '@jest/globals';
import { createStyler } from './colors.js';
import { formatJson, formatPretty, formatTimestamp, serializeArgs } from './format.js';
import type { LogEntry } from './format.js';

const TIME = new Date('2024-07-30T23:49:58.000Z');

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const parseJson = (line: string): Record<string, unknown> => JSON.parse(line) as Record<string, unknown>;

const createEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  bindings: {},
  color: 'cyan',
  label: 'INFO',
  level: 'info',
  message: 'hello',
  time: TIME,
  ...overrides
});

describe('serializeArgs()', () => {
  it('should return an empty string when there are no arguments.', () => {
    expect(serializeArgs([])).toBe('');
  });

  it('should use strings as they are.', () => {
    expect(serializeArgs(['hello', 'world'])).toBe('hello world');
  });

  it('should inspect anything that is not a string.', () => {
    const array = ['this', 'is', 'an array'];
    const object = { prop: 'prop' };

    expect(serializeArgs([array, object])).toBe(`${util.inspect(array, { colors: false, depth: null })} ${util.inspect(object, { colors: false, depth: null })}`);
  });

  it('should keep the stack trace of errors.', () => {
    const error = new Error('oops');

    expect(serializeArgs([error])).toContain('Error: oops');
    expect(serializeArgs([error])).toContain('at ');
  });

  it('should respect the inspection depth.', () => {
    const deep = { a: { b: { c: { d: 'e' } } } };

    expect(serializeArgs([deep], 1)).toContain('[Object]');
    expect(serializeArgs([deep], null)).toContain("d: 'e'");
  });
});

describe('formatTimestamp()', () => {
  it('should render an ISO timestamp.', () => {
    expect(formatTimestamp(TIME, 'iso')).toBe('2024-07-30T23:49:58.000Z');
  });

  it('should render a locale time.', () => {
    expect(formatTimestamp(TIME, 'time')).toBe(TIME.toLocaleTimeString());
  });

  it('should return null when disabled.', () => {
    expect(formatTimestamp(TIME, false)).toBeNull();
  });

  it('should delegate to a custom formatter.', () => {
    expect(formatTimestamp(TIME, (date) => String(date.getUTCFullYear()))).toBe('2024');
  });
});

describe('formatPretty()', () => {
  const plain = createStyler(false);

  it('should render the timestamp, the label and the message.', () => {
    expect(formatPretty(createEntry(), plain, 'iso')).toBe('(2024-07-30T23:49:58.000Z) - [INFO] - hello');
  });

  it('should omit the timestamp when disabled.', () => {
    expect(formatPretty(createEntry(), plain, false)).toBe('[INFO] - hello');
  });

  it('should render the name of the logger.', () => {
    expect(formatPretty(createEntry({ name: 'app:db' }), plain, false)).toBe('[INFO] - (app:db) - hello');
  });

  it('should not leave a dangling separator for empty messages.', () => {
    expect(formatPretty(createEntry({ message: '' }), plain, false)).toBe('[INFO]');
  });

  it('should colorize the label and the message.', () => {
    const line = formatPretty(createEntry(), createStyler(true), false);

    expect(line).toBe('\u{1B}[36m\u{1B}[1m[INFO]\u{1B}[0m - \u{1B}[36mhello\u{1B}[0m');
  });
});

describe('formatJson()', () => {
  it('should render a single line of JSON.', () => {
    const line = formatJson(createEntry(), 'iso');

    expect(parseJson(line)).toEqual({
      level: 'info',
      msg: 'hello',
      time: '2024-07-30T23:49:58.000Z'
    });
  });

  it('should always render the timestamp as ISO 8601.', () => {
    const line = formatJson(createEntry(), 'time');

    expect(parseJson(line)['time']).toBe('2024-07-30T23:49:58.000Z');
  });

  it('should omit the timestamp when disabled.', () => {
    const line = formatJson(createEntry(), false);

    expect(parseJson(line)).not.toHaveProperty('time');
  });

  it('should include the name and the bindings.', () => {
    const entry = createEntry({ bindings: { requestId: 'abc', service: 'api' }, name: 'app' });

    expect(parseJson(formatJson(entry, 'iso'))).toMatchObject({ name: 'app', requestId: 'abc', service: 'api' });
  });

  it('should never let a binding shadow the message.', () => {
    const entry = createEntry({ bindings: { msg: 'shadowed' } });

    expect(parseJson(formatJson(entry, 'iso'))['msg']).toBe('hello');
  });

  it('should serialize errors in the bindings.', () => {
    const entry = createEntry({ bindings: { err: new Error('oops') } });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const { err } = parseJson(formatJson(entry, 'iso')) as { err: { message: string; name: string; stack: string } };

    expect(err.message).toBe('oops');
    expect(err.name).toBe('Error');
    expect(err.stack).toContain('Error: oops');
  });

  it('should serialize bigints.', () => {
    const entry = createEntry({ bindings: { big: 10n } });

    expect(parseJson(formatJson(entry, 'iso'))['big']).toBe('10');
  });

  it('should not throw on circular bindings.', () => {
    const circular: Record<string, unknown> = { name: 'circular' };
    circular['self'] = circular;

    const line = formatJson(createEntry({ bindings: { circular } }), 'iso');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const parsed = parseJson(line) as { circular: { self: string } };

    expect(parsed.circular.self).toBe('[Circular]');
  });
});
