import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks';
import { fetchGoals, requestDelete, selectGoalRows } from '../../store';
import { GoalListPresenter } from '../presenters/goal-list-presenter';

type GoalListContainerProps = {
  onGoalPress?: (goalId: string) => void;
  onCreatePress?: () => void;
};

export function GoalListContainer({
  onGoalPress,
  onCreatePress,
}: GoalListContainerProps) {
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

  const handleGoalLongPress = useCallback(
    (goalId: string, name: string) => {
      void dispatch(requestDelete({ id: goalId, name }));
    },
    [dispatch],
  );

  return (
    <GoalListPresenter
      rows={rows}
      status={status}
      onGoalPress={handleGoalPress}
      onGoalLongPress={handleGoalLongPress}
      onCreatePress={onCreatePress}
    />
  );
}
