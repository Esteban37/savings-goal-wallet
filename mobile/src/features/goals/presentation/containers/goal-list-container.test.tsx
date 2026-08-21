import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { render, waitFor } from '@testing-library/react-native';
import { ok } from '../../../../core/domain/result';
import { createAppDependencies } from '../../../../app/di/create-app-dependencies';
import { createAppStore } from '../../../../app/store/store';
import { GoalListContainer } from './goal-list-container';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('GoalListContainer', () => {
  it('shows a seeded goal name and progress percent', async () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);

    const { getByText, getAllByText, queryByText } = render(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <GoalListContainer />
        </SafeAreaProvider>
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('Vacaciones')).toBeTruthy();
      expect(getAllByText('25%').length).toBeGreaterThan(0);
    });
    expect(queryByText('Metas de ahorro')).toBeNull();
  });

  it('shows the FAB when the list is empty', async () => {
    const mockDeps = {
      ...createAppDependencies(),
      getGoals: async () => ok([]),
    };
    const store = createAppStore(mockDeps);

    const { getByLabelText } = render(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <GoalListContainer />
        </SafeAreaProvider>
      </Provider>,
    );

    await waitFor(() => {
      expect(getByLabelText('Agregar meta')).toBeTruthy();
    });
  });
});
