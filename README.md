# js-color-logger

This is a small logging module that helps with a more organized message logging through color, logging type and timestamps. Used in [Greencoast Studios](https://github.com/greencoast-studios) packages and projects.

## Usage

### Installation

With `npm`:

``` text
npm install @greencoast/logger
```

or with `yarn`:

``` text
yarn add @greencoast/logger
```

### Importing the Package

``` js
const logger = require('@greencoast/logger');
import logger from '@greencoast/logger';
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

## Author

This module was made by [Greencoast Studios](https://github.com/greencoast-studios).
