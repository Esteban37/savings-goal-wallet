import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks';
import { fetchGoals, selectGoalRows } from '../../store';
import { GoalListPresenter } from '../presenters/goal-list-presenter';

export function GoalListContainer() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectGoalRows);
  const status = useAppSelector(state => state.goals.status);

  useEffect(() => {
    void dispatch(fetchGoals());
  }, [dispatch]);

  const onGoalPress = useCallback((_goalId: string) => {
    return;
  }, []);

  return (
    <GoalListPresenter
      rows={rows}
      status={status}
      onGoalPress={onGoalPress}
    />
  );
}
