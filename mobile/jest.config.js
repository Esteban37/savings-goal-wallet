module.exports = {
  preset: 'react-native',
  collectCoverageFrom: [
    'src/core/domain/**/*.ts',
    'src/core/contracts/**/*.ts',
    'src/features/goals/application/**/*.ts',
    'src/features/goal-detail/application/**/*.ts',
    '!src/**/index.ts',
    '!src/**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
