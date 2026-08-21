export { toGoalSnapshot, type GoalSnapshot } from './goal-snapshot';
export {
  depositApplied,
  fetchGoals,
  goalCreated,
  goalDeleted,
  goalsReducer,
  type GoalsState,
  type GoalsStatus,
} from './goals-slice';
export { requestDelete } from './request-delete';
export { selectGoalById, selectGoalRows, type GoalRow } from './selectors';
