# @moonstar-x/logger

A tiny, zero-dependency logger for Node.js with levels, colors, timestamps, child loggers and JSON output.

- **Zero dependencies.** Nothing but `node:util` and `node:process`.
- **Seven levels**, from `trace` to `fatal`, with a `silent` threshold to turn everything off.
- **Pretty by default, JSON when you need it.** One colored line per message for humans, one JSON object per line for log collectors.
- **Child loggers.** Namespaced names and inherited structured bindings.
- **Configurable from the environment.** `LOG_LEVEL`, `LOG_FORMAT`, `LOG_TIMESTAMP`, `NO_COLOR` and `FORCE_COLOR` are all honored out of the box.
- **Written in TypeScript**, shipped as both ESM and CJS with full type declarations.

## Installation

```text
npm install @moonstar-x/logger
```

This package requires Node.js `>=22.12.0`.

## Usage

### The default logger

The package exports a ready-to-use logger, configured from the environment.

```js
import logger from '@moonstar-x/logger';

logger.info('server listening on port 3000');
logger.warn('cache miss, falling back to the database');
logger.error(new Error('could not reach the database'));
```

CommonJS works too:

```js
const { default: logger } = require('@moonstar-x/logger');

logger.info('server listening on port 3000');
```

> Logger methods are not bound to their instance, so call them on the logger (`logger.info(...)`) instead of
> destructuring them (`const { info } = logger`).

### Logging messages

Every method takes any number of arguments. Strings are used as-is, everything else is inspected, which means objects
are serialized and errors keep their stack trace.

```js
logger.trace('entering the request handler');           // gray,    stdout
logger.debug('resolved config', config);                // green,   stdout
logger.info('user signed in', { userId: 42 });          // cyan,    stdout
logger.log('plain message');                            // white,   stdout
logger.warn('token is about to expire');                // yellow,  stderr
logger.error(new Error('request failed'));              // red,     stderr
logger.fatal('unrecoverable, shutting down');           // magenta, stderr
```

Which prints:

```text
(1:57:54 PM) - [TRACE] - entering the request handler
(1:57:54 PM) - [DEBUG] - resolved config { port: 3000 }
(1:57:54 PM) - [INFO] - user signed in { userId: 42 }
(1:57:54 PM) - [LOG] - plain message
(1:57:54 PM) - [WARN] - token is about to expire
(1:57:54 PM) - [ERROR] - Error: request failed
    at file:///app/index.js:12:14
    ...
(1:57:54 PM) - [FATAL] - unrecoverable, shutting down
```

You can also clear the terminal, which is a no-op when the output is not a TTY:

```js
logger.clear();
```

### Log levels

A logger only emits messages at or above its own level. `log` is an alias of `info` that keeps its own tag and color.

| Level    | Severity | Method            | Color   | Destination |
| -------- | -------- | ----------------- | ------- | ----------- |
| `trace`  | 10       | `logger.trace()`  | gray    | `stdout`    |
| `debug`  | 20       | `logger.debug()`  | green   | `stdout`    |
| `info`   | 30       | `logger.info()`   | cyan    | `stdout`    |
| `info`   | 30       | `logger.log()`    | white   | `stdout`    |
| `warn`   | 40       | `logger.warn()`   | yellow  | `stderr`    |
| `error`  | 50       | `logger.error()`  | red     | `stderr`    |
| `fatal`  | 60       | `logger.fatal()`  | magenta | `stderr`    |
| `silent` | —        | —                 | —       | —           |

The level can be read, set, or checked at any time:

```js
logger.level;                      // 'info'
logger.level = 'debug';            // throws a TypeError on an invalid level
logger.setLevel('debug');          // same, but chainable

if (logger.isLevelEnabled('debug')) {
  logger.debug('expensive dump', buildExpensiveReport());
}
```

### Creating a logger

`createLogger` builds a logger from the environment, with the options you pass taking precedence.

```js
import { createLogger } from '@moonstar-x/logger';

const logger = createLogger({
  name: 'api',
  level: 'debug',
  format: 'pretty'
});

logger.info('ready');
// (1:57:54 PM) - [INFO] - (api) - ready
```

To ignore the environment entirely, construct the class directly:

```js
import { Logger } from '@moonstar-x/logger';

const logger = new Logger({ level: 'warn' });
```

### Child loggers

`child()` creates a logger that inherits its parent's configuration. Names are joined with a colon and bindings are
merged, so subsystems are easy to tell apart.

```js
const logger = createLogger({ name: 'api' });
const database = logger.child('db');
const pool = database.child({ name: 'pool', level: 'trace', bindings: { poolId: 1 } });

database.info('connected');
// (1:57:54 PM) - [INFO] - (api:db) - connected

pool.trace('acquired a connection');
// (1:57:54 PM) - [TRACE] - (api:db:pool) - acquired a connection
```

### JSON output

Switching the format to `json` renders one JSON object per line, ready to be picked up by a log collector. This is
where `bindings` come in: they are structured fields added to every entry.

```js
const logger = createLogger({
  format: 'json',
  name: 'api',
  bindings: { service: 'checkout', version: '2.0.0' }
});

logger.info('order placed');
```

```json
{"level":"info","time":"2026-09-10T18:57:54.678Z","name":"api","service":"checkout","version":"2.0.0","msg":"order placed"}
```

Bindings are serialized safely: circular references are replaced with `[Circular]`, `BigInt` values are stringified,
and errors are turned into their `name`, `message` and `stack`.

### Custom destinations

Anything with a `write` method is a valid destination, which makes it trivial to point a logger at a file, a socket or
an in-memory buffer — very handy in tests.

```js
import fs from 'node:fs';

const file = fs.createWriteStream('app.log', { flags: 'a' });
const logger = createLogger({ format: 'json', stdout: file, stderr: file });
```

```js
const lines = [];
const logger = createLogger({ stdout: { write: (line) => lines.push(line) }, color: false });
```

## Configuration

Every option has a sensible default, so `createLogger()` is a valid call.

| Option      | Type                                                           | Default          | Description                                                                                     |
|-------------|----------------------------------------------------------------|------------------|-------------------------------------------------------------------------------------------------|
| `bindings`  | `Record<string, unknown>`                                      | `{}`             | Structured fields added to every entry. Only rendered in `json` format.                         |
| `color`     | `boolean`                                                      | auto-detected    | Forces colors on or off, bypassing `NO_COLOR`, `FORCE_COLOR` and TTY detection.                 |
| `depth`     | `number \| null`                                               | `null`           | How deep objects are inspected. `null` means unlimited.                                         |
| `format`    | `'pretty' \| 'json'`                                           | `'pretty'`       | How the output is rendered.                                                                     |
| `level`     | `LogLevel`                                                     | `'info'`         | The minimum severity that gets logged.                                                          |
| `name`      | `string`                                                       | —                | A name shown on every entry, useful to tell subsystems apart.                                   |
| `stderr`    | `Destination`                                                  | `process.stderr` | Where `warn`, `error` and `fatal` are written.                                                  |
| `stdout`    | `Destination`                                                  | `process.stdout` | Where `trace`, `debug`, `info` and `log` are written.                                           |
| `timestamp` | `'iso' \| 'time' \| ((date: Date) => string) \| false \| true` | `true`           | How the timestamp is rendered. `true` picks a locale time for `pretty` and ISO 8601 for `json`. |

### Environment variables

`createLogger` and the default logger read these on startup. Explicit options always win.

| Variable        | Effect                                                                  |
|-----------------|-------------------------------------------------------------------------|
| `LOG_LEVEL`     | The minimum severity, e.g. `debug`. Invalid values are ignored.         |
| `LOG_FORMAT`    | `json` or `pretty`.                                                     |
| `LOG_TIMESTAMP` | `iso`, `time`, or `off` / `false` to drop the timestamp.                |
| `NO_COLOR`      | Disables colors, per the [`NO_COLOR`](https://no-color.org) convention. |
| `FORCE_COLOR`   | Forces colors on, even when the output is not a TTY.                    |

```text
LOG_LEVEL=debug LOG_FORMAT=json node index.js
```

## API

| Export                                                                   | Description                                                              |
|--------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `logger` (also the default export)                                       | The default logger, configured from the environment.                     |
| `createLogger(options?)`                                                 | Creates a logger from the environment, with `options` taking precedence. |
| `Logger`                                                                 | The logger class, for when the environment should be ignored.            |
| `optionsFromEnvironment(environment?)`                                   | Reads logger defaults from an environment object.                        |
| `LOG_LEVELS`, `LEVEL_SEVERITY`, `LOG_METHODS`                            | The level and method tables the logger is built on.                      |
| `isLogLevel(value)`, `shouldLog(level, threshold)`                       | Level helpers.                                                           |
| `formatPretty`, `formatJson`, `formatTimestamp`, `serializeArgs`         | The rendering primitives, exported for custom formatting.                |
| `createStyler(isEnabled)`, `isColorSupported(destination, environment?)` | The ANSI helpers.                                                        |

Types are shipped with the package: `LoggerOptions`, `LogFormat`, `LogLevel`, `LoggableLevel`, `LogMethod`,
`MethodSpec`, `LogEntry`, `TimestampFormat`, `Destination`, `Styler` and `StyleName`.
