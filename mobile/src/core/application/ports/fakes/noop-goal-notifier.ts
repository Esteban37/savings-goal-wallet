import type { GoalNotifier } from '../goal-notifier';

export class NoopGoalNotifier implements GoalNotifier {
  readonly calls: string[] = [];

  async notifyGoalCompleted(goalName: string): Promise<void> {
    this.calls.push(goalName);
  }
}
