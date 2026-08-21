import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks';
import { fetchGoals, selectGoalRows } from '../../store';
import { GoalListPresenter } from '../presenters/goal-list-presenter';

type GoalListContainerProps = {
  onGoalPress?: (goalId: string) => void;
};

export function GoalListContainer({ onGoalPress }: GoalListContainerProps) {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectGoalRows);
  const status = useAppSelector(state => state.goals.status);

  useEffect(() => {
    void dispatch(fetchGoals());
  }, [dispatch]);

  const handleGoalPress = useCallback(
    (goalId: string) => {
      onGoalPress?.(goalId);
    },
    [onGoalPress],
  );

  return (
    <GoalListPresenter
      rows={rows}
      status={status}
      onGoalPress={handleGoalPress}
    />
  );
}
