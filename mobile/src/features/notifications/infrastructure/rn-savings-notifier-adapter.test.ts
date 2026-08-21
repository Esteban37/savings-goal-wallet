import { notifyGoalCompleted } from 'rn-savings-notifier';
import { RnSavingsNotifierAdapter } from './rn-savings-notifier-adapter';

jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(() => Promise.resolve()),
}));

const mockNotifyGoalCompleted = notifyGoalCompleted as jest.MockedFunction<
  typeof notifyGoalCompleted
>;

describe('RnSavingsNotifierAdapter', () => {
  beforeEach(() => {
    mockNotifyGoalCompleted.mockClear();
  });

  it('forwards the fixture goal name to the workspace package', async () => {
    const inputName = 'Fondo de emergencia';
    const expectedName = 'Fondo de emergencia';
    mockNotifyGoalCompleted.mockResolvedValue(undefined);
    const adapter = new RnSavingsNotifierAdapter();

    const actualResult = await adapter.notifyGoalCompleted(inputName);

    expect(mockNotifyGoalCompleted).toHaveBeenCalledWith(expectedName);
    expect(actualResult).toBeUndefined();
  });
});
