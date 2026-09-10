import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { createLogger, Logger, optionsFromEnvironment } from './logger.js';
import type { LoggerOptions } from './logger.js';

interface Sink {
  chunks: string[];
  isTTY?: boolean;
  write: (chunk: string) => boolean;
}

const createSink = (isTTY = false): Sink => {
  const chunks: string[] = [];

  return {
    chunks,
    isTTY,
    write: (chunk: string): boolean => {
      chunks.push(chunk);

      return true;
    }
  };
};

const firstChunk = (sink: Sink): string => sink.chunks[0] ?? '';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const parseJson = (line: string): Record<string, unknown> => JSON.parse(line) as Record<string, unknown>;

interface TestLogger {
  logger: Logger;
  stderr: Sink;
  stdout: Sink;
}

const createTestLogger = (options: LoggerOptions = {}): TestLogger => {
  const stdout = createSink();
  const stderr = createSink();
  const logger = new Logger({ color: false, stderr, stdout, timestamp: false, ...options });

  return { logger, stderr, stdout };
};

const stubbedEnvironment = new Map<string, string | undefined>();

// Sets an environment variable for the duration of a test, remembering the original value so it can be put back.
const stubEnvironment = (key: string, value: string): void => {
  if (!stubbedEnvironment.has(key)) {
    stubbedEnvironment.set(key, process.env[key]);
  }

  process.env[key] = value;
};

afterEach(() => {
  for (const [key, value] of stubbedEnvironment) {
    if (value === undefined) {
      Reflect.deleteProperty(process.env, key);
    } else {
      process.env[key] = value;
    }
  }

  stubbedEnvironment.clear();
});

describe('Logger levels', () => {
  it('should log at info by default.', () => {
    const { logger, stderr, stdout } = createTestLogger();

    logger.trace('trace');
    logger.debug('debug');
    logger.info('info');
    logger.log('log');
    logger.warn('warn');
    logger.error('error');
    logger.fatal('fatal');

    expect(stdout.chunks).toEqual(['[INFO] - info\n', '[LOG] - log\n']);
    expect(stderr.chunks).toEqual(['[WARN] - warn\n', '[ERROR] - error\n', '[FATAL] - fatal\n']);
  });

  it('should log everything at trace.', () => {
    const { logger, stdout } = createTestLogger({ level: 'trace' });

    logger.trace('trace');
    logger.debug('debug');

    expect(stdout.chunks).toEqual(['[TRACE] - trace\n', '[DEBUG] - debug\n']);
  });

  it('should log nothing when silent.', () => {
    const { logger, stderr, stdout } = createTestLogger({ level: 'silent' });

    logger.info('info');
    logger.fatal('fatal');

    expect(stdout.chunks).toEqual([]);
    expect(stderr.chunks).toEqual([]);
  });

  it('should expose its name.', () => {
    expect(createTestLogger({ name: 'api' }).logger.name).toBe('api');
    expect(createTestLogger().logger.name).toBeUndefined();
    expect(createTestLogger({ name: 'api' }).logger.child('db').name).toBe('api:db');
  });

  it('should expose the current level.', () => {
    const { logger } = createTestLogger({ level: 'warn' });

    expect(logger.level).toBe('warn');
  });

  it('should allow the level to be changed at runtime.', () => {
    const { logger, stdout } = createTestLogger();

    logger.debug('before');
    logger.level = 'debug';
    logger.debug('after');

    expect(stdout.chunks).toEqual(['[DEBUG] - after\n']);
  });

  it('should be chainable through setLevel.', () => {
    const { logger, stdout } = createTestLogger();

    logger.setLevel('debug').debug('chained');

    expect(stdout.chunks).toEqual(['[DEBUG] - chained\n']);
  });

  it('should throw on an invalid level.', () => {
    // @ts-expect-error Testing the runtime guard.
    expect(() => new Logger({ level: 'verbose' })).toThrow(TypeError);
    // @ts-expect-error Testing the runtime guard.
    expect(() => createTestLogger().logger.setLevel('verbose')).toThrow(TypeError);
  });

  it('should report whether a level is enabled.', () => {
    const { logger } = createTestLogger({ level: 'warn' });

    expect(logger.isLevelEnabled('debug')).toBe(false);
    expect(logger.isLevelEnabled('warn')).toBe(true);
    expect(logger.isLevelEnabled('fatal')).toBe(true);
  });
});

describe('Logger messages', () => {
  it('should serialize every argument.', () => {
    const { logger, stdout } = createTestLogger();

    logger.info('hello', ['an', 'array'], { prop: 'prop' });

    expect(firstChunk(stdout)).toBe("[INFO] - hello [ 'an', 'array' ] { prop: 'prop' }\n");
  });

  it('should keep the stack trace of errors.', () => {
    const { logger, stderr } = createTestLogger();

    logger.error('failed:', new Error('oops'));

    expect(firstChunk(stderr)).toContain('Error: oops');
    expect(firstChunk(stderr)).toContain('at ');
  });

  it('should respect the inspection depth.', () => {
    const { logger, stdout } = createTestLogger({ depth: 0 });

    logger.info({ a: { b: 'c' } });

    expect(firstChunk(stdout)).toBe('[INFO] - { a: [Object] }\n');
  });

  it('should handle calls without arguments.', () => {
    const { logger, stdout } = createTestLogger();

    logger.info();

    expect(stdout.chunks).toEqual(['[INFO]\n']);
  });

  it('should render a timestamp.', () => {
    const { logger, stdout } = createTestLogger({ timestamp: () => 'AT-SOME-POINT' });

    logger.info('hello');

    expect(firstChunk(stdout)).toBe('(AT-SOME-POINT) - [INFO] - hello\n');
  });

  it('should render the name.', () => {
    const { logger, stdout } = createTestLogger({ name: 'api' });

    logger.info('hello');

    expect(firstChunk(stdout)).toBe('[INFO] - (api) - hello\n');
  });
});

describe('Logger colors', () => {
  // Auto-detection reads the real environment, so neutralize the conventions that would otherwise decide the outcome
  // before the destination is even looked at. The global `afterEach` puts the original values back.
  beforeEach(() => {
    stubEnvironment('FORCE_COLOR', '');
    stubEnvironment('NO_COLOR', '');
    stubEnvironment('TERM', 'xterm');
  });

  it('should colorize when forced on.', () => {
    const { logger, stdout } = createTestLogger({ color: true });

    logger.info('hello');

    expect(firstChunk(stdout)).toContain('\u{1B}[36m');
  });

  it('should not colorize a non-TTY destination.', () => {
    const stdout = createSink(false);
    const logger = new Logger({ stdout, timestamp: false });

    logger.info('hello');

    expect(firstChunk(stdout)).not.toContain('\u{1B}[');
  });

  it('should colorize a TTY destination.', () => {
    const stdout = createSink(true);
    const logger = new Logger({ stdout, timestamp: false });

    logger.info('hello');

    expect(firstChunk(stdout)).toContain('\u{1B}[36m');
  });
});

describe('Logger json format', () => {
  it('should render one JSON object per line.', () => {
    const { logger, stdout } = createTestLogger({ format: 'json', timestamp: false });

    logger.info('hello');

    expect(firstChunk(stdout).endsWith('\n')).toBe(true);
    expect(parseJson(firstChunk(stdout))).toEqual({ level: 'info', msg: 'hello' });
  });

  it('should default to ISO timestamps.', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const { logger, stdout } = createTestLogger({ format: 'json', timestamp: undefined as never });

    logger.info('hello');

    expect(parseJson(firstChunk(stdout))['time']).toMatch(/^\d{4}-\d{2}-\d{2}T/u);
  });

  it('should never colorize.', () => {
    const { logger, stdout } = createTestLogger({ color: true, format: 'json' });

    logger.info('hello');

    expect(firstChunk(stdout)).not.toContain('\u{1B}[');
  });

  it('should report log entries at the info level.', () => {
    const { logger, stdout } = createTestLogger({ format: 'json' });

    logger.log('hello');

    expect(parseJson(firstChunk(stdout))['level']).toBe('info');
  });
});

describe('Logger.child()', () => {
  it('should inherit the destinations of its parent.', () => {
    const { logger, stdout } = createTestLogger();

    logger.child('db').info('hello');

    expect(firstChunk(stdout)).toBe('[INFO] - (db) - hello\n');
  });

  it('should join names with a colon.', () => {
    const { logger, stdout } = createTestLogger({ name: 'app' });

    logger.child('db').child('pool').info('hello');

    expect(firstChunk(stdout)).toBe('[INFO] - (app:db:pool) - hello\n');
  });

  it('should keep the name of its parent when none is given.', () => {
    const { logger, stdout } = createTestLogger({ name: 'app' });

    logger.child({ level: 'debug' }).debug('hello');

    expect(firstChunk(stdout)).toBe('[DEBUG] - (app) - hello\n');
  });

  it('should inherit the level of its parent, including runtime changes.', () => {
    const { logger, stdout } = createTestLogger();

    logger.level = 'debug';
    logger.child('db').debug('hello');

    expect(firstChunk(stdout)).toBe('[DEBUG] - (db) - hello\n');
  });

  it('should not change the level of its parent.', () => {
    const { logger } = createTestLogger();
    const child = logger.child({ level: 'trace' });

    expect(child.level).toBe('trace');
    expect(logger.level).toBe('info');
  });

  it('should merge bindings.', () => {
    const { logger, stdout } = createTestLogger({ bindings: { service: 'api' }, format: 'json' });

    logger.child({ bindings: { requestId: 'abc' }, name: 'db' }).info('hello');

    expect(parseJson(firstChunk(stdout))).toMatchObject({ name: 'db', requestId: 'abc', service: 'api' });
  });

  it('should not leak bindings back into its parent.', () => {
    const { logger, stdout } = createTestLogger({ format: 'json' });

    logger.child({ bindings: { requestId: 'abc' } });
    logger.info('hello');

    expect(parseJson(firstChunk(stdout))).not.toHaveProperty('requestId');
  });
});

describe('Logger.clear()', () => {
  it('should clear a TTY.', () => {
    const stdout = createSink(true);

    new Logger({ stdout }).clear();

    expect(stdout.chunks).toEqual(['\u{1B}[2J\u{1B}[3J\u{1B}[H']);
  });

  it('should do nothing when the output is not a TTY.', () => {
    const { logger, stdout } = createTestLogger();

    logger.clear();

    expect(stdout.chunks).toEqual([]);
  });
});

describe('optionsFromEnvironment()', () => {
  it('should return nothing for an empty environment.', () => {
    expect(optionsFromEnvironment({})).toEqual({});
  });

  it('should read the level.', () => {
    expect(optionsFromEnvironment({ LOG_LEVEL: 'debug' })).toEqual({ level: 'debug' });
  });

  it('should ignore an invalid level.', () => {
    expect(optionsFromEnvironment({ LOG_LEVEL: 'verbose' })).toEqual({});
  });

  it('should read the format.', () => {
    expect(optionsFromEnvironment({ LOG_FORMAT: 'json' })).toEqual({ format: 'json' });
    expect(optionsFromEnvironment({ LOG_FORMAT: 'yaml' })).toEqual({});
  });

  it('should read the timestamp format.', () => {
    expect(optionsFromEnvironment({ LOG_TIMESTAMP: 'iso' })).toEqual({ timestamp: 'iso' });
    expect(optionsFromEnvironment({ LOG_TIMESTAMP: 'off' })).toEqual({ timestamp: false });
    expect(optionsFromEnvironment({ LOG_TIMESTAMP: 'false' })).toEqual({ timestamp: false });
  });
});

describe('createLogger()', () => {
  it('should read its defaults from the environment.', () => {
    stubEnvironment('LOG_LEVEL', 'debug');

    const stdout = createSink();

    createLogger({ color: false, stdout, timestamp: false }).debug('hello');

    expect(stdout.chunks).toEqual(['[DEBUG] - hello\n']);
  });

  it('should let explicit options win over the environment.', () => {
    stubEnvironment('LOG_LEVEL', 'silent');

    const stdout = createSink();

    createLogger({ color: false, level: 'info', stdout, timestamp: false }).info('hello');

    expect(stdout.chunks).toEqual(['[INFO] - hello\n']);
  });
});
