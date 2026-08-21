module.exports = {
  preset: 'react-native',
  watchman: false,
  setupFiles: ['<rootDir>/jest.rn-savings-notifier-mock.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-redux|@reduxjs|immer|@react-navigation|react-native-screens)/)',
  ],
  collectCoverageFrom: [
    'src/core/domain/**/*.ts',
    'src/core/contracts/**/*.ts',
    'src/features/goals/application/**/*.ts',
    'src/features/goal-detail/application/**/*.ts',
    'src/features/goals/store/**/*.ts',
    'src/features/goal-detail/store/**/*.ts',
    'src/features/goal-detail/infrastructure/**/*.ts',
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
