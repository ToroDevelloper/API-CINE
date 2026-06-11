process.env.NODE_ENV = 'test';

module.exports = {
  testEnvironment: 'node',
  maxWorkers: 1,
  testPathIgnorePatterns: ['/node_modules/', '/frontend/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
  ],
  coverageThreshold: {
    global: {
      branches: 69,
      functions: 88,
      lines: 82,
      statements: 80,
    },
  },
};
