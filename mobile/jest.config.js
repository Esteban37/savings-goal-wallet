module.exports = {
  preset: 'react-native',
  watchman: false,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-redux|@reduxjs|immer)/)',
  ],
  collectCoverageFrom: [
    'src/core/domain/**/*.ts',
    'src/core/contracts/**/*.ts',
    'src/features/goals/application/**/*.ts',
    'src/features/goal-detail/application/**/*.ts',
    'src/features/goals/store/**/*.ts',
    'src/app/store/**/*.ts',
    '!src/**/index.ts',
    '!src/**/*.test.ts',
    '!src/app/store/listener-middleware.ts',
    '!src/app/store/hooks.ts',
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
