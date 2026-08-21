export interface GoalNotifier {
  notifyGoalCompleted(goalName: string): Promise<void>;
  notifyGoalCreated(goalName: string): Promise<void>;
}
