import { createSeededGoalsRepository } from './create-seeded-goals-repository';

describe('createSeededGoalsRepository', () => {
  it('lists the three frozen seed goals with expected percents', async () => {
    const mockRepository = createSeededGoalsRepository();
    const actualGoals = await mockRepository.list();
    const actualX = actualGoals.map(goal => ({
      id: goal.id,
      percent: goal.progress().percent,
    }));
    const expectedX = [
      { id: 'goal-vacaciones', percent: 25 },
      { id: 'goal-emergencia', percent: 0 },
      { id: 'goal-bici', percent: 25 },
    ];

    expect(actualX).toEqual(expectedX);
  });
});
