import { persistedGoalsEnvelopeSchema } from './persisted-goal-record';

describe('persistedGoalsEnvelopeSchema', () => {
  const inputValid = {
    version: 1,
    goals: [
      {
        id: 'goal-vacaciones',
        name: 'Vacaciones',
        targetAmount: 100000,
        depositedAmount: 25000,
      },
    ],
  };

  it('accepts a valid envelope', () => {
    const actualX = persistedGoalsEnvelopeSchema.safeParse(inputValid);

    expect(actualX.success).toBe(true);
    if (actualX.success) {
      expect(actualX.data.goals[0]?.id).toBe('goal-vacaciones');
      expect(actualX.data.goals[0]?.depositedAmount).toBe(25000);
    }
  });

  it('rejects a record missing id', () => {
    const inputX = {
      version: 1,
      goals: [
        {
          name: 'Vacaciones',
          targetAmount: 100000,
          depositedAmount: 25000,
        },
      ],
    };
    const actualX = persistedGoalsEnvelopeSchema.safeParse(inputX);

    expect(actualX.success).toBe(false);
  });

  it('rejects a non-integer amount', () => {
    const inputX = {
      version: 1,
      goals: [
        {
          id: 'goal-vacaciones',
          name: 'Vacaciones',
          targetAmount: 100000,
          depositedAmount: 25000.5,
        },
      ],
    };
    const actualX = persistedGoalsEnvelopeSchema.safeParse(inputX);

    expect(actualX.success).toBe(false);
  });
});
