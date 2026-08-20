import { selectGoalRows } from './selectors';
import type { GoalsState } from './goals-slice';
import type { GoalSnapshot } from './goal-snapshot';

describe('selectGoalRows', () => {
  it('exposes name, integer amounts, percent, and completed from snapshots', () => {
    const inputX: GoalSnapshot[] = [
      {
        id: 'goal-vacaciones',
        name: 'Vacaciones',
        targetAmount: 100000,
        depositedAmount: 25000,
        progressPercent: 25,
        isCompleted: false,
      },
      {
        id: 'goal-emergencia',
        name: 'Fondo de emergencia',
        targetAmount: 1000000,
        depositedAmount: 0,
        progressPercent: 0,
        isCompleted: false,
      },
    ];
    const inputState: { goals: GoalsState } = {
      goals: {
        status: 'succeeded',
        items: inputX,
        error: null,
      },
    };
    const actualX = selectGoalRows(inputState);
    const expectedX = [
      {
        id: 'goal-vacaciones',
        name: 'Vacaciones',
        targetAmount: 100000,
        depositedAmount: 25000,
        progressPercent: 25,
        isCompleted: false,
      },
      {
        id: 'goal-emergencia',
        name: 'Fondo de emergencia',
        targetAmount: 1000000,
        depositedAmount: 0,
        progressPercent: 0,
        isCompleted: false,
      },
    ];

    expect(actualX).toEqual(expectedX);
  });
});
