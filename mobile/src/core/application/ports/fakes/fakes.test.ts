import { Money } from '../../../domain/money';
import { SavingsGoal } from '../../../domain/savings-goal';
import type { Result } from '../../../domain/result';
import { AlwaysConfirmDialog } from './always-confirm-dialog';
import { InMemoryGoalsRepository } from './in-memory-goals-repository';
import { NoopGoalNotifier } from './noop-goal-notifier';

function unwrap<T>(result: Result<T, string>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.error}`);
  }
  return result.value;
}

function seedGoal(id: string, deposited: number): SavingsGoal {
  return unwrap(
    SavingsGoal.create({
      id,
      name: id,
      target: unwrap(Money.ofPositive(100000)),
      deposited: unwrap(Money.ofNonNegative(deposited)),
    }),
  );
}

describe('port fakes', () => {
  it('round-trips a saved goal in the in-memory repository', async () => {
    const inputGoal = seedGoal('g1', 10000);
    const mockRepository = new InMemoryGoalsRepository([inputGoal]);
    const inputUpdated = unwrap(
      inputGoal.applyDeposit(unwrap(Money.ofPositive(5000))),
    );

    await mockRepository.save(inputUpdated);
    const actualById = await mockRepository.getById('g1');
    const actualList = await mockRepository.list();
    const expectedX = 15000;

    expect(actualById?.deposited.amount).toBe(expectedX);
    expect(actualList).toHaveLength(1);
    expect(actualList[0]?.deposited.amount).toBe(expectedX);
  });

  it('reports a missing goal as null', async () => {
    const mockRepository = new InMemoryGoalsRepository();
    const actualX = await mockRepository.getById('missing');
    const expectedX = null;

    expect(actualX).toBe(expectedX);
  });

  it('resolves confirm to true without UI', async () => {
    const mockDialog = new AlwaysConfirmDialog();
    const actualX = await mockDialog.confirm({
      title: 'Confirmar',
      message: '¿Abonar?',
    });
    const expectedX = true;

    expect(actualX).toBe(expectedX);
  });

  it('records notifier calls on the no-op fake', async () => {
    const mockNotifier = new NoopGoalNotifier();
    await mockNotifier.notifyGoalCompleted('Viaje');
    const expectedX = ['Viaje'];

    expect(mockNotifier.calls).toEqual(expectedX);
  });

  it('removes one of two seeded goals', async () => {
    const mockRepository = new InMemoryGoalsRepository([
      seedGoal('g1', 10000),
      seedGoal('g2', 0),
    ]);

    await mockRepository.remove('g1');
    const actualList = await mockRepository.list();
    const actualMissing = await mockRepository.getById('g1');
    const expectedRemaining = 'g2';

    expect(actualList).toHaveLength(1);
    expect(actualList[0]?.id).toBe(expectedRemaining);
    expect(actualMissing).toBeNull();
  });

  it('records created-goal calls on the no-op fake', async () => {
    const mockNotifier = new NoopGoalNotifier();
    await mockNotifier.notifyGoalCreated('Viaje');
    const expectedX = ['Viaje'];

    expect(mockNotifier.createdCalls).toEqual(expectedX);
  });
});

