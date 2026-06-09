module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 70,
      lines: 70,
      statements: 65,
    },
  },
};
