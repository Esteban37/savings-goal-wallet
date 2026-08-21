import { showConfirmDialog } from 'rn-savings-notifier';
import { RnConfirmDialogAdapter } from './rn-confirm-dialog-adapter';

jest.mock('rn-savings-notifier', () => ({
  showConfirmDialog: jest.fn(() => Promise.resolve(true)),
}));

const mockShowConfirmDialog = showConfirmDialog as jest.MockedFunction<
  typeof showConfirmDialog
>;

describe('RnConfirmDialogAdapter', () => {
  beforeEach(() => {
    mockShowConfirmDialog.mockClear();
  });

  it('forwards title and message to the workspace package', async () => {
    const inputTitle = 'Eliminar meta';
    const inputMessage = '¿Eliminar Vacaciones?';
    const expectedBoolean = true;
    mockShowConfirmDialog.mockResolvedValue(expectedBoolean);
    const adapter = new RnConfirmDialogAdapter();

    const actualResult = await adapter.confirm({
      title: inputTitle,
      message: inputMessage,
    });

    expect(mockShowConfirmDialog).toHaveBeenCalledWith({
      title: inputTitle,
      message: inputMessage,
    });
    expect(actualResult).toBe(expectedBoolean);
  });
});
