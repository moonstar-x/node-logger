[![ci-build-status](https://img.shields.io/github/actions/workflow/status/moonstar-x/node-logger/ci.yml?logo=github&label=build)](https://github.com/moonstar-x/node-logger)
[![issues](https://img.shields.io/github/issues/moonstar-x/node-logger?logo=github)](https://github.com/moonstar-x/node-logger)
[![bundle-size](https://img.shields.io/bundlephobia/min/@moonstar-x/logger)](https://www.npmjs.com/package/@moonstar-x/logger)
[![version](https://img.shields.io/npm/v/@moonstar-x/logger?logo=npm)](https://www.npmjs.com/package/@moonstar-x/logger)
[![downloads-week](https://img.shields.io/npm/dw/@moonstar-x/logger?logo=npm)](https://www.npmjs.com/package/@moonstar-x/logger)
[![downloads-total](https://img.shields.io/npm/dt/@moonstar-x/logger?logo=npm)](https://www.npmjs.com/package/@moonstar-x/logger)

# @moonstar-x/logger

This is a small logging module that helps with a more organized message logging through color, logging type and timestamps.

## Usage

### Installation

With `npm`:

``` text
npm install @moonstar-x/logger
```

or with `yarn`:

``` text
yarn add @moonstar-x/logger
```

### Importing the Package

``` js
const logger = require('@moonstar-x/logger');
import logger from '@moonstar-x/logger';
```

### Logging Messages

You can log multiple types of messages. Objects will be serialized and stack traces will be shown.

#### LOG

``` js
logger.log('message to log');
```

#### INFO

``` js
logger.info('message to log');
```

#### WARN

``` js
logger.warn('message to log');
```

#### ERROR

``` js
logger.error('message to log');
```

#### FATAL

``` js
logger.fatal('message to log');
```

#### DEBUG

``` js
logger.debug('message to log');
```

### Clear Console

You can clear the console with:

``` js
logger.clear();
```
