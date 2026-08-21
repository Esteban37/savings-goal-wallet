import { AlwaysConfirmDialog } from '../../../core/application/ports/fakes/always-confirm-dialog';
import { createAppDependencies } from '../../../app/di/create-app-dependencies';
import { createAppStore } from '../../../app/store/store';
import { fetchGoals } from './goals-slice';
import { requestDelete } from './request-delete';

describe('requestDelete', () => {
  it('removes the snapshot when confirm returns true', async () => {
    const mockDeps = {
      ...createAppDependencies(),
      confirmDialog: new AlwaysConfirmDialog(),
    };
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());

    const result = await store.dispatch(
      requestDelete({ id: 'goal-vacaciones', name: 'Vacaciones' }),
    );
    const actualIds = store.getState().goals.items.map(item => item.id);

    expect(requestDelete.fulfilled.match(result)).toBe(true);
    expect(actualIds).not.toContain('goal-vacaciones');
  });

  it('leaves items unchanged when confirm returns false', async () => {
    const mockDeleteGoal = jest.fn();
    const mockDeps = {
      ...createAppDependencies(),
      confirmDialog: {
        confirm: jest.fn(async () => false),
      },
      deleteGoal: mockDeleteGoal,
    };
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());
    const expectedCount = store.getState().goals.items.length;

    const result = await store.dispatch(
      requestDelete({ id: 'goal-vacaciones', name: 'Vacaciones' }),
    );

    expect(requestDelete.fulfilled.match(result)).toBe(true);
    expect(mockDeleteGoal).not.toHaveBeenCalled();
    expect(store.getState().goals.items).toHaveLength(expectedCount);
    expect(
      store.getState().goals.items.find(item => item.id === 'goal-vacaciones'),
    ).toBeDefined();
  });
});
