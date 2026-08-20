import type { SavingsGoal } from '../../../core/domain/savings-goal';

export type GoalSnapshot = {
  id: string;
  name: string;
  targetAmount: number;
  depositedAmount: number;
  progressPercent: number;
  isCompleted: boolean;
};

export function toGoalSnapshot(goal: SavingsGoal): GoalSnapshot {
  const progress = goal.progress();
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.target.amount,
    depositedAmount: goal.deposited.amount,
    progressPercent: progress.percent,
    isCompleted: progress.isCompleted,
  };
}
