import type { GoalsState } from './goals-slice';

export type GoalRow = {
  id: string;
  name: string;
  targetAmount: number;
  depositedAmount: number;
  progressPercent: number;
  isCompleted: boolean;
};

export function selectGoalRows(state: { goals: GoalsState }): GoalRow[] {
  return state.goals.items;
}

export function selectGoalById(
  state: { goals: GoalsState },
  goalId: string,
): GoalRow | undefined {
  return state.goals.items.find(item => item.id === goalId);
}
