export interface GoalNotifier {
  notifyGoalCompleted(goalName: string): Promise<void>;
}
