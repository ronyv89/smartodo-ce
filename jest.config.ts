import type { Config } from 'jest';

const config: Config = {
  coverageProvider: 'v8',
  projects: [
    '<rootDir>/apps/api',
    '<rootDir>/apps/web',
    '<rootDir>/apps/docs',
    '<rootDir>/packages/ui',
  ],
};

export default config;
