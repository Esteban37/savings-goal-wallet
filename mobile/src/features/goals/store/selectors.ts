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
