module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/types.ts', // 不包括纯类型定义文件
    '!src/index.ts', // 可选择不包括入口文件
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
