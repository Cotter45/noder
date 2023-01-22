module.exports = {
  preset: 'ts-jest',
  collectCoverage: false,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};
