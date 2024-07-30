import logger from '.';
import util from 'util';

const MOCKED_TIMESTAMP = '11:49:58 PM';
const ARGS = {
  str: 'hello',
  arr: ['this', 'is', 'an array'],
  obj: { prop: 'prop' },
  err: new Error('oops')
};

describe('Logger', () => {
  const messageToLog = [ARGS.str, ARGS.arr, ARGS.obj, ARGS.err];
  const arrString = util.inspect(ARGS.arr, { depth: null, colors: false });
  const objString = util.inspect(ARGS.obj, { depth: null, colors: false });
  const expectedMessage = `${ARGS.str} ${arrString} ${objString} ${ARGS.err.toString()}`;

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue(MOCKED_TIMESTAMP);

    // @ts-ignore
    jest.spyOn(console, 'log').mockReturnValue();
    // @ts-ignore
    jest.spyOn(console, 'info').mockReturnValue();
    // @ts-ignore
    jest.spyOn(console, 'error').mockReturnValue();
    // @ts-ignore
    jest.spyOn(console, 'warn').mockReturnValue();
    // @ts-ignore
    jest.spyOn(console, 'debug').mockReturnValue();
    // @ts-ignore
    jest.spyOn(console, 'clear').mockReturnValue();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('log()', () => {
    it('should be defined.', () => {
      expect(logger.log).toBeDefined();
    });

    it('should call console.log.', () => {
      logger.log();
      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('should log arguments.', () => {
      logger.log(...messageToLog);

      const actualLogged = (console.log as jest.Mock).mock.calls[0][0];

      expect(actualLogged).toContain(MOCKED_TIMESTAMP);
      expect(actualLogged).toContain('[LOG]');
      expect(actualLogged).toContain(expectedMessage);
    });
  });

  describe('info()', () => {
    it('should be defined.', () => {
      expect(logger.info).toBeDefined();
    });

    it('should call console.info.', () => {
      logger.info();
      expect(console.info).toHaveBeenCalledTimes(1);
    });

    it('should log arguments.', () => {
      logger.info(...messageToLog);

      const actualLogged = (console.info as jest.Mock).mock.calls[0][0];

      expect(actualLogged).toContain(MOCKED_TIMESTAMP);
      expect(actualLogged).toContain('[INFO]');
      expect(actualLogged).toContain(expectedMessage);
    });
  });

  describe('error()', () => {
    it('should be defined.', () => {
      expect(logger.error).toBeDefined();
    });

    it('should call console.error.', () => {
      logger.error();
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should log arguments.', () => {
      logger.error(...messageToLog);

      const actualLogged = (console.error as jest.Mock).mock.calls[0][0];

      expect(actualLogged).toContain(MOCKED_TIMESTAMP);
      expect(actualLogged).toContain('[ERROR]');
      expect(actualLogged).toContain(expectedMessage);
    });
  });

  describe('fatal()', () => {
    it('should be defined.', () => {
      expect(logger.fatal).toBeDefined();
    });

    it('should call console.error.', () => {
      logger.fatal();
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should log arguments.', () => {
      logger.fatal(...messageToLog);

      const actualLogged = (console.error as jest.Mock).mock.calls[0][0];

      expect(actualLogged).toContain(MOCKED_TIMESTAMP);
      expect(actualLogged).toContain('[FATAL]');
      expect(actualLogged).toContain(expectedMessage);
    });
  });

  describe('warn()', () => {
    it('should be defined.', () => {
      expect(logger.warn).toBeDefined();
    });

    it('should call console.warn.', () => {
      logger.warn();
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should log arguments.', () => {
      logger.warn(...messageToLog);

      const actualLogged = (console.warn as jest.Mock).mock.calls[0][0];

      expect(actualLogged).toContain(MOCKED_TIMESTAMP);
      expect(actualLogged).toContain('[WARN]');
      expect(actualLogged).toContain(expectedMessage);
    });
  });

  describe('debug()', () => {
    it('should be defined.', () => {
      expect(logger.debug).toBeDefined();
    });

    it('should call console.debug.', () => {
      logger.debug();
      expect(console.debug).toHaveBeenCalledTimes(1);
    });

    it('should log arguments.', () => {
      logger.debug(...messageToLog);

      const actualLogged = (console.debug as jest.Mock).mock.calls[0][0];

      expect(actualLogged).toContain(MOCKED_TIMESTAMP);
      expect(actualLogged).toContain('[DEBUG]');
      expect(actualLogged).toContain(expectedMessage);
    });
  });

  describe('clear()', () => {
    it('should be defined.', () => {
      expect(logger.clear).toBeDefined();
    });

    it('should call console.clear', () => {
      logger.clear();
      expect(console.clear).toHaveBeenCalledTimes(1);
    });
  });
});
