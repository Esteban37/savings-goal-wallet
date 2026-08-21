import NativeRnSavingsNotifier from './NativeRnSavingsNotifier';
import { notifyGoalCompleted, showConfirmDialog } from './index';

jest.mock('./NativeRnSavingsNotifier', () => ({
  __esModule: true,
  default: {
    notifyGoalCompleted: jest.fn(() => Promise.resolve()),
    showConfirmDialog: jest.fn(() => Promise.resolve(true)),
  },
}));

const mockNative = NativeRnSavingsNotifier as jest.Mocked<
  typeof NativeRnSavingsNotifier
>;

describe('rn-savings-notifier wrappers', () => {
  beforeEach(() => {
    mockNative.notifyGoalCompleted.mockClear();
    mockNative.showConfirmDialog.mockClear();
  });

  it('forwards the fixture goal name to the TurboModule', async () => {
    const inputName = 'Fondo de emergencia';
    const expectedName = 'Fondo de emergencia';
    mockNative.notifyGoalCompleted.mockResolvedValue(undefined);

    const actualResult = await notifyGoalCompleted(inputName);

    expect(mockNative.notifyGoalCompleted).toHaveBeenCalledWith(expectedName);
    expect(actualResult).toBeUndefined();
  });

  it('forwards title and message and settles to a boolean', async () => {
    const inputTitle = 'Confirmar abono';
    const inputMessage = '¿Aplicar el abono a esta meta?';
    const expectedBoolean = true;
    mockNative.showConfirmDialog.mockResolvedValue(expectedBoolean);

    const actualResult = await showConfirmDialog({
      title: inputTitle,
      message: inputMessage,
    });

    expect(mockNative.showConfirmDialog).toHaveBeenCalledWith(
      inputTitle,
      inputMessage,
    );
    expect(actualResult).toBe(expectedBoolean);
  });
});
