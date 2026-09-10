import process from 'node:process';

const ESCAPE = '\u{1B}[';
const RESET = `${ESCAPE}0m`;

const CODES = {
  bold: 1,
  cyan: 36,
  dim: 2,
  gray: 90,
  green: 32,
  magenta: 35,
  red: 31,
  white: 37,
  yellow: 33
} as const;

/**
 * The styles a {@link Styler} understands.
 */
export type StyleName = keyof typeof CODES;

/**
 * Wraps a piece of text in the given styles. A styler created with colors disabled returns the text untouched.
 */
export type Styler = (text: string, ...styles: StyleName[]) => string;

/**
 * The subset of a writable stream the logger needs. Anything with a `write` method works, which makes it trivial to
 * point a logger at a file, a socket or an in-memory buffer.
 */
export interface Destination {
  isTTY?: boolean;
  write: (chunk: string) => unknown;
}

/**
 * Whether ANSI colors should be used for a given destination.
 *
 * Honors the `NO_COLOR` and `FORCE_COLOR` conventions before falling back to TTY detection.
 *
 * @param destination - The stream the output is written to.
 * @param environment - The environment to read the conventions from. Defaults to `process.env`.
 */
export const isColorSupported = (destination: Destination, environment: NodeJS.ProcessEnv = process.env): boolean => {
  if (environment['NO_COLOR'] !== undefined && environment['NO_COLOR'] !== '') {
    return false;
  }

  if (environment['FORCE_COLOR'] !== undefined && environment['FORCE_COLOR'] !== '') {
    return environment['FORCE_COLOR'] !== '0' && environment['FORCE_COLOR'] !== 'false';
  }

  if (environment['TERM'] === 'dumb') {
    return false;
  }

  return Boolean(destination.isTTY);
};

const plainStyler: Styler = (text) => text;

const ansiStyler: Styler = (text, ...styles) => {
  if (styles.length === 0) {
    return text;
  }

  const opening = styles.map((style) => `${ESCAPE}${String(CODES[style])}m`).join('');

  return `${opening}${text}${RESET}`;
};

/**
 * Creates a {@link Styler}. When `isEnabled` is `false` the styler is the identity function, so call sites never need
 * to branch on whether colors are on.
 *
 * @param isEnabled - Whether the styler should emit ANSI escape codes.
 */
export const createStyler = (isEnabled: boolean): Styler => isEnabled ? ansiStyler : plainStyler;
