import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@repo/ui/(.*)$': '<rootDir>/src/$1',
    '\\.svg$': '<rootDir>/__mocks__/svg-mock.js'
  },
  collectCoverageFrom: [
    'src/components/ui/button/Button.tsx',
    'src/components/ui/badge/Badge.tsx',
    'src/components/ui/alert/Alert.tsx',
    'src/components/auth/SignInForm.tsx',
    'src/components/auth/SignUpForm.tsx',
  ],
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
};

export default config;
