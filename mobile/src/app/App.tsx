import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { notifyGoalCompleted } from 'rn-savings-notifier';
import { GoalListContainer } from '../features/goals/public';
import { createAppDependencies } from './di/create-app-dependencies';
import { createAppStore } from './store/store';

const store = createAppStore(createAppDependencies());

function App() {
  useEffect(() => {
    notifyGoalCompleted('scaffold').catch((error: unknown) => {
      console.warn('notifyGoalCompleted failed', error);
    });
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}>
        <GoalListContainer />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
