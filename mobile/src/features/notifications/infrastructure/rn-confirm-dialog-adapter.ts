import { showConfirmDialog } from 'rn-savings-notifier';
import type { ConfirmDialog } from '../../../core/application/ports/confirm-dialog';

export class RnConfirmDialogAdapter implements ConfirmDialog {
  confirm(input: { title: string; message: string }): Promise<boolean> {
    return showConfirmDialog(input);
  }
}
