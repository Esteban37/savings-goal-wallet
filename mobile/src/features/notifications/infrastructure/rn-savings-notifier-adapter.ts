import { notifyGoalCompleted } from 'rn-savings-notifier';
import type { GoalNotifier } from '../../../core/application/ports/goal-notifier';

export class RnSavingsNotifierAdapter implements GoalNotifier {
  notifyGoalCompleted(goalName: string): Promise<void> {
    return notifyGoalCompleted(goalName);
  }
}
