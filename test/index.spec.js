const logger = require('../src');
const util = require('util');

const logSpy = jest.spyOn(console, 'log');
const infoSpy = jest.spyOn(console, 'info');
const errorSpy = jest.spyOn(console, 'error');
const warnSpy = jest.spyOn(console, 'warn');
const debugSpy = jest.spyOn(console, 'debug');
const clearSpy = jest.spyOn(console, 'clear');

const dateSpy = jest.spyOn(Date.prototype, 'toLocaleTimeString');

const MOCKED_TIMESTAMP = '11:49:58 PM';
const ARGS = {
  str: 'hello',
  arr: ['this', 'is', 'an array'],
  obj: { prop: 'prop' },
  err: new Error('oops')
};

describe('Logger', () => {
  beforeAll(() => {
    dateSpy.mockReturnValue(MOCKED_TIMESTAMP);
    clearSpy.mockImplementation(() => null);
  });

  beforeEach(() => {
    logSpy.mockClear();
    infoSpy.mockClear();
    errorSpy.mockClear();
    warnSpy.mockClear();
    debugSpy.mockClear();
    clearSpy.mockClear();
  });

  describe('log()', () => {
    it('should return undefined.', () => {
      expect(logger.log()).toBeUndefined();
    });

    it('should call console.log.', () => {
      logger.log();
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('should contain the timestamp.', () => {
      logger.log();
      expect(logSpy.mock.calls[0][0]).toContain(MOCKED_TIMESTAMP);
    });

    it('should contain LOG level.', () => {
      logger.log();
      expect(logSpy.mock.calls[0][0]).toContain('[LOG]');
    });

    it('should log arguments.', () => {
      logger.log(ARGS.str, ARGS.arr, ARGS.obj, ARGS.err);
      expect(logSpy.mock.calls[0][0]).toContain(ARGS.str);
      expect(logSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.arr));
      expect(logSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.obj));
      expect(logSpy.mock.calls[0][0]).toContain(ARGS.err.toString());
    });
  });

  describe('info()', () => {
    it('should return undefined.', () => {
      expect(logger.info()).toBeUndefined();
    });

    it('should call console.info.', () => {
      logger.info();
      expect(infoSpy).toHaveBeenCalledTimes(1);
    });

    it('should contain the timestamp.', () => {
      logger.info();
      expect(infoSpy.mock.calls[0][0]).toContain(MOCKED_TIMESTAMP);
    });

    it('should contain INFO level.', () => {
      logger.info();
      expect(infoSpy.mock.calls[0][0]).toContain('[INFO]');
    });

    it('should log arguments.', () => {
      logger.info(ARGS.str, ARGS.arr, ARGS.obj, ARGS.err);
      expect(infoSpy.mock.calls[0][0]).toContain(ARGS.str);
      expect(infoSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.arr));
      expect(infoSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.obj));
      expect(infoSpy.mock.calls[0][0]).toContain(ARGS.err.toString());
    });
  });

  describe('error()', () => {
    it('should return undefined.', () => {
      expect(logger.error()).toBeUndefined();
    });

    it('should call console.error.', () => {
      logger.error();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should contain the timestamp.', () => {
      logger.error();
      expect(errorSpy.mock.calls[0][0]).toContain(MOCKED_TIMESTAMP);
    });

    it('should contain ERROR level.', () => {
      logger.error();
      expect(errorSpy.mock.calls[0][0]).toContain('[ERROR]');
    });

    it('should log arguments.', () => {
      logger.error(ARGS.str, ARGS.arr, ARGS.obj, ARGS.err);
      expect(errorSpy.mock.calls[0][0]).toContain(ARGS.str);
      expect(errorSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.arr));
      expect(errorSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.obj));
      expect(errorSpy.mock.calls[0][0]).toContain(ARGS.err.toString());
    });
  });

  describe('fatal()', () => {
    it('should return undefined.', () => {
      expect(logger.fatal()).toBeUndefined();
    });

    it('should call console.error.', () => {
      logger.fatal();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should contain the timestamp.', () => {
      logger.fatal();
      expect(errorSpy.mock.calls[0][0]).toContain(MOCKED_TIMESTAMP);
    });

    it('should contain FATAL level.', () => {
      logger.fatal();
      expect(errorSpy.mock.calls[0][0]).toContain('[FATAL]');
    });

    it('should log arguments.', () => {
      logger.fatal(ARGS.str, ARGS.arr, ARGS.obj, ARGS.err);
      expect(errorSpy.mock.calls[0][0]).toContain(ARGS.str);
      expect(errorSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.arr));
      expect(errorSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.obj));
      expect(errorSpy.mock.calls[0][0]).toContain(ARGS.err.toString());
    });
  });

  describe('warn()', () => {
    it('should return undefined.', () => {
      expect(logger.warn()).toBeUndefined();
    });

    it('should call console.warn.', () => {
      logger.warn();
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('should contain the timestamp.', () => {
      logger.warn();
      expect(warnSpy.mock.calls[0][0]).toContain(MOCKED_TIMESTAMP);
    });

    it('should contain WARN level.', () => {
      logger.warn();
      expect(warnSpy.mock.calls[0][0]).toContain('[WARN]');
    });

    it('should log arguments.', () => {
      logger.warn(ARGS.str, ARGS.arr, ARGS.obj, ARGS.err);
      expect(warnSpy.mock.calls[0][0]).toContain(ARGS.str);
      expect(warnSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.arr));
      expect(warnSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.obj));
      expect(warnSpy.mock.calls[0][0]).toContain(ARGS.err.toString());
    });
  });

  describe('debug()', () => {
    it('should return undefined.', () => {
      expect(logger.debug()).toBeUndefined();
    });

    it('should call console.debug.', () => {
      logger.debug();
      expect(debugSpy).toHaveBeenCalledTimes(1);
    });

    it('should contain the timestamp.', () => {
      logger.debug();
      expect(debugSpy.mock.calls[0][0]).toContain(MOCKED_TIMESTAMP);
    });

    it('should contain DEBUG level.', () => {
      logger.debug();
      expect(debugSpy.mock.calls[0][0]).toContain('[DEBUG]');
    });

    it('should log arguments.', () => {
      logger.debug(ARGS.str, ARGS.arr, ARGS.obj, ARGS.err);
      expect(debugSpy.mock.calls[0][0]).toContain(ARGS.str);
      expect(debugSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.arr));
      expect(debugSpy.mock.calls[0][0]).toContain(util.inspect(ARGS.obj));
      expect(debugSpy.mock.calls[0][0]).toContain(ARGS.err.toString());
    });
  });

  describe('clear()', () => {
    it('should call console.clear', () => {
      logger.clear();
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });
  });
});
