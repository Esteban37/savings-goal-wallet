import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { notifyGoalCompleted } from 'rn-savings-notifier';

const LOCAL_WEB_URI = 'file:///android_asset/web/index.html';

function App() {
  useEffect(() => {
    notifyGoalCompleted('scaffold').catch((error: unknown) => {
      console.warn('notifyGoalCompleted failed', error);
    });
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: LOCAL_WEB_URI }}
        javaScriptEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        originWhitelist={['*', 'file://*']}
        mixedContentMode="always"
        onMessage={event => {
          console.log('web message', event.nativeEvent.data);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
