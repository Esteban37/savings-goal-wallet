import { notifyGoalCompleted, notifyGoalCreated } from 'rn-savings-notifier';
import { RnSavingsNotifierAdapter } from './rn-savings-notifier-adapter';

jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(() => Promise.resolve()),
  notifyGoalCreated: jest.fn(() => Promise.resolve()),
  showConfirmDialog: jest.fn(() => Promise.resolve(true)),
}));

const mockNotifyGoalCompleted = notifyGoalCompleted as jest.MockedFunction<
  typeof notifyGoalCompleted
>;
const mockNotifyGoalCreated = notifyGoalCreated as jest.MockedFunction<
  typeof notifyGoalCreated
>;

describe('RnSavingsNotifierAdapter', () => {
  beforeEach(() => {
    mockNotifyGoalCompleted.mockClear();
    mockNotifyGoalCreated.mockClear();
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

  it('forwards a created goal name to the workspace package', async () => {
    const inputName = 'Viaje';
    const expectedName = 'Viaje';
    mockNotifyGoalCreated.mockResolvedValue(undefined);
    const adapter = new RnSavingsNotifierAdapter();

    const actualResult = await adapter.notifyGoalCreated(inputName);

    expect(mockNotifyGoalCreated).toHaveBeenCalledWith(expectedName);
    expect(actualResult).toBeUndefined();
  });
});
