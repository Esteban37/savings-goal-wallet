export interface ConfirmDialog {
  confirm(input: { title: string; message: string }): Promise<boolean>;
}
