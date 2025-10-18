import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/build/presets/create-cjs-preset';
import * as path from 'path';

/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
const preset = {
  ...createCjsPreset(),
  collectCoverage: false,
  coverageDirectory: path.join(__dirname, 'dist/coverage/'),
  coverageReporters: ['html', 'cobertura', 'lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transformIgnorePatterns: ['node_modules/(?!@sisuite/sec-common)/'],
} satisfies Config;

export default preset;
