import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation/root-navigator';
import { createAppDependencies } from './di/create-app-dependencies';
import { createAppStore } from './store/store';

const store = createAppStore(createAppDependencies());

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
