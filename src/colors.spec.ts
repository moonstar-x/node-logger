import { describe, expect, it } from '@jest/globals';
import { createStyler, isColorSupported } from './colors.js';

const RESET = '\u{1B}[0m';

describe('isColorSupported()', () => {
  it('should return false when NO_COLOR is set to a non-empty value.', () => {
    expect(isColorSupported({ isTTY: true, write: () => true }, { NO_COLOR: '1' })).toBe(false);
  });

  it('should ignore an empty NO_COLOR.', () => {
    expect(isColorSupported({ isTTY: true, write: () => true }, { NO_COLOR: '' })).toBe(true);
  });

  it('should return true when FORCE_COLOR is set, even without a TTY.', () => {
    expect(isColorSupported({ write: () => true }, { FORCE_COLOR: '1' })).toBe(true);
  });

  it('should return false when FORCE_COLOR disables colors explicitly.', () => {
    expect(isColorSupported({ isTTY: true, write: () => true }, { FORCE_COLOR: '0' })).toBe(false);
    expect(isColorSupported({ isTTY: true, write: () => true }, { FORCE_COLOR: 'false' })).toBe(false);
  });

  it('should prefer NO_COLOR over FORCE_COLOR.', () => {
    expect(isColorSupported({ isTTY: true, write: () => true }, { FORCE_COLOR: '1', NO_COLOR: '1' })).toBe(false);
  });

  it('should return false on a dumb terminal.', () => {
    expect(isColorSupported({ isTTY: true, write: () => true }, { TERM: 'dumb' })).toBe(false);
  });

  it('should fall back to TTY detection.', () => {
    expect(isColorSupported({ isTTY: true, write: () => true }, {})).toBe(true);
    expect(isColorSupported({ isTTY: false, write: () => true }, {})).toBe(false);
    expect(isColorSupported({ write: () => true }, {})).toBe(false);
  });
});

describe('createStyler()', () => {
  it('should return the text untouched when disabled.', () => {
    const styler = createStyler(false);

    expect(styler('hello', 'red', 'bold')).toBe('hello');
  });

  it('should return the text untouched when no styles are given.', () => {
    const styler = createStyler(true);

    expect(styler('hello')).toBe('hello');
  });

  it('should wrap the text in the given styles.', () => {
    const styler = createStyler(true);

    expect(styler('hello', 'red')).toBe(`\u{1B}[31mhello${RESET}`);
  });

  it('should combine styles in the order they are given.', () => {
    const styler = createStyler(true);

    expect(styler('hello', 'red', 'bold')).toBe(`\u{1B}[31m\u{1B}[1mhello${RESET}`);
  });
});
