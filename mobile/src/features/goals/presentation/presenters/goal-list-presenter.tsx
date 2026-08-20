import type { GoalsStatus } from '../../store';
import type { GoalRow } from '../../store';
import { GoalListTemplate } from '../templates/goal-list-template';

type GoalListPresenterProps = {
  rows: GoalRow[];
  status: GoalsStatus;
  onGoalPress?: (goalId: string) => void;
};

export function GoalListPresenter({
  rows,
  status,
  onGoalPress,
}: GoalListPresenterProps) {
  return (
    <GoalListTemplate rows={rows} status={status} onGoalPress={onGoalPress} />
  );
}
