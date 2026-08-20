import type { ConfirmDialog } from '../confirm-dialog';

export class AlwaysConfirmDialog implements ConfirmDialog {
  async confirm(_input: { title: string; message: string }): Promise<boolean> {
    return true;
  }
}
