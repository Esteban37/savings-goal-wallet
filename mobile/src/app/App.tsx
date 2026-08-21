import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setIosWebBundleUris } from '../features/goal-detail/infrastructure/local-web-asset-uri';
import { AppearanceProvider } from './appearance';
import { RootNavigator } from './navigation/root-navigator';
import { createAppDependencies } from './di/create-app-dependencies';
import { createAppStore } from './store/store';

const store = createAppStore(createAppDependencies());

export type AppProps = {
  webIndexHtmlUri?: string;
  webDirectoryUri?: string;
};

function App({ webIndexHtmlUri, webDirectoryUri }: AppProps = {}) {
  setIosWebBundleUris({
    indexHtmlUri: webIndexHtmlUri,
    webDirectoryUri: webDirectoryUri,
  });
  return (
    <Provider store={store}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}>
        <AppearanceProvider>
          <RootNavigator />
        </AppearanceProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
