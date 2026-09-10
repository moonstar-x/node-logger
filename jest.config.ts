import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],

  // The sources are ESM and import each other with explicit `.js` specifiers, so Jest has to run them as real modules
  // and resolve those specifiers back to the TypeScript files they came from.
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  },

  coverageProvider: 'v8',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts'],
  coverageReporters: ['text', 'lcov']
};

export default config;
