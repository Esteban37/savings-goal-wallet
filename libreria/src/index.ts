import NativeRnSavingsNotifier from './NativeRnSavingsNotifier';

export type ConfirmDialogInput = {
  readonly title: string;
  readonly message: string;
};

/**
 * Notifies that a savings goal is complete (Android Toast; iOS may stub).
 */
export function notifyGoalCompleted(goalName: string): Promise<void> {
  return NativeRnSavingsNotifier.notifyGoalCompleted(goalName);
}

/**
 * Shows a native confirm dialog. Android/iOS may still resolve `true` without UI.
 */
export function showConfirmDialog(
  input: ConfirmDialogInput,
): Promise<boolean> {
  return NativeRnSavingsNotifier.showConfirmDialog(input.title, input.message);
}
