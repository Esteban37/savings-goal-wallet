import type { GoalNotifier } from '../goal-notifier';

export class NoopGoalNotifier implements GoalNotifier {
  readonly calls: string[] = [];
  readonly createdCalls: string[] = [];

  async notifyGoalCompleted(goalName: string): Promise<void> {
    this.calls.push(goalName);
  }

  async notifyGoalCreated(goalName: string): Promise<void> {
    this.createdCalls.push(goalName);
  }
}
