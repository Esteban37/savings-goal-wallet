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
 * Notifies that a savings goal was registered (Android Toast; iOS may stub).
 */
export function notifyGoalCreated(goalName: string): Promise<void> {
  return NativeRnSavingsNotifier.notifyGoalCreated(goalName);
}

/**
 * Shows a native confirm dialog. Android shows AlertDialog; iOS may stub.
 */
export function showConfirmDialog(
  input: ConfirmDialogInput,
): Promise<boolean> {
  return NativeRnSavingsNotifier.showConfirmDialog(input.title, input.message);
}
