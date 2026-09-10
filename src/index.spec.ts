import process from 'node:process';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import defaultLogger, { LOG_LEVELS, logger, Logger } from './index.js';

const ANSI = new RegExp(String.raw`${String.fromCodePoint(27)}\[\d+m`, 'gu');

const stripAnsi = (value: string): string => value.replaceAll(ANSI, '');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('the default export', () => {
  it('should be a logger.', () => {
    expect(defaultLogger).toBeInstanceOf(Logger);
  });

  it('should also be available as a named export.', () => {
    expect(logger).toBe(defaultLogger);
  });

  it('should be configured with a valid level.', () => {
    expect(LOG_LEVELS).toContain(defaultLogger.level);
  });
});

describe('the named methods', () => {
  it('should write to stdout.', () => {
    const write = jest.spyOn(process.stdout, 'write').mockReturnValue(true);

    logger.info('hello');

    expect(write).toHaveBeenCalledTimes(1);
    expect(stripAnsi(String(write.mock.calls[0]?.[0]))).toContain('[INFO] - hello');
  });

  it('should write warnings and errors to stderr.', () => {
    const write = jest.spyOn(process.stderr, 'write').mockReturnValue(true);

    logger.warn('careful');
    logger.error('broken');
    logger.fatal('very broken');

    expect(write).toHaveBeenCalledTimes(3);
    expect(stripAnsi(String(write.mock.calls[0]?.[0]))).toContain('[WARN] - careful');
    expect(stripAnsi(String(write.mock.calls[1]?.[0]))).toContain('[ERROR] - broken');
    expect(stripAnsi(String(write.mock.calls[2]?.[0]))).toContain('[FATAL] - very broken');
  });
});
