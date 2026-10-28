import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/build/presets/create-cjs-preset.js';

/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
const preset = {
  ...createCjsPreset(),
  collectCoverage: false,
  coverageDirectory: '<rootDir>/dist/coverage/',
  coverageReporters: ['html', 'cobertura', 'lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
} satisfies Config;

export default preset;
