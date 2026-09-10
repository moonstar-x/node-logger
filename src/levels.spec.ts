import { describe, expect, it } from '@jest/globals';
import { isLogLevel, LEVEL_SEVERITY, LOG_LEVELS, LOG_METHODS, shouldLog } from './levels.js';

describe('LOG_LEVELS', () => {
  it('should be ordered from least to most severe.', () => {
    const severities = LOG_LEVELS.map((level) => LEVEL_SEVERITY[level]);
    const sorted = severities.toSorted((a, b) => a - b);

    expect(severities).toEqual(sorted);
  });
});

describe('isLogLevel()', () => {
  it('should accept every known level.', () => {
    for (const level of LOG_LEVELS) {
      expect(isLogLevel(level)).toBe(true);
    }
  });

  it('should reject anything else.', () => {
    expect(isLogLevel('verbose')).toBe(false);
    expect(isLogLevel('')).toBe(false);
    expect(isLogLevel(30)).toBe(false);
    expect(isLogLevel(undefined)).toBe(false);
    expect(isLogLevel('toString')).toBe(false);
  });
});

describe('shouldLog()', () => {
  it('should emit levels at or above the threshold.', () => {
    expect(shouldLog('warn', 'warn')).toBe(true);
    expect(shouldLog('error', 'warn')).toBe(true);
    expect(shouldLog('fatal', 'warn')).toBe(true);
  });

  it('should drop levels below the threshold.', () => {
    expect(shouldLog('info', 'warn')).toBe(false);
    expect(shouldLog('debug', 'info')).toBe(false);
    expect(shouldLog('trace', 'debug')).toBe(false);
  });

  it('should drop everything when silent.', () => {
    expect(shouldLog('fatal', 'silent')).toBe(false);
    expect(shouldLog('trace', 'silent')).toBe(false);
  });

  it('should emit everything at trace.', () => {
    expect(shouldLog('trace', 'trace')).toBe(true);
    expect(shouldLog('fatal', 'trace')).toBe(true);
  });
});

describe('LOG_METHODS', () => {
  it('should log warnings and errors to stderr, and everything else to stdout.', () => {
    expect(LOG_METHODS.warn.stderr).toBe(true);
    expect(LOG_METHODS.error.stderr).toBe(true);
    expect(LOG_METHODS.fatal.stderr).toBe(true);

    expect(LOG_METHODS.trace.stderr).toBe(false);
    expect(LOG_METHODS.debug.stderr).toBe(false);
    expect(LOG_METHODS.info.stderr).toBe(false);
    expect(LOG_METHODS.log.stderr).toBe(false);
  });

  it('should emit log at the same severity as info.', () => {
    expect(LOG_METHODS.log.level).toBe(LOG_METHODS.info.level);
    expect(LOG_METHODS.log.label).toBe('LOG');
  });
});
