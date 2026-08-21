jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(() => Promise.resolve()),
  showConfirmDialog: jest.fn(() => Promise.resolve(true)),
}));
