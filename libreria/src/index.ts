import NativeRnSavingsNotifier from './NativeRnSavingsNotifier';

export type ConfirmDialogInput = {
  readonly title: string;
  readonly message: string;
};

/**
 * Notifies that a savings goal is complete. Fase 1 stub resolves without UI.
 */
export function notifyGoalCompleted(goalName: string): Promise<void> {
  return NativeRnSavingsNotifier.notifyGoalCompleted(goalName);
}

/**
 * Shows a native confirm dialog. Fase 1 stub resolves `true` without UI.
 */
export function showConfirmDialog(
  input: ConfirmDialogInput,
): Promise<boolean> {
  return NativeRnSavingsNotifier.showConfirmDialog(input.title, input.message);
}
