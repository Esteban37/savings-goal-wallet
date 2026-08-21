/**
 * @format
 */

import { render, waitFor } from '@testing-library/react-native';
import App from '../src/app/App';

jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(() => Promise.resolve()),
  notifyGoalCreated: jest.fn(() => Promise.resolve()),
  showConfirmDialog: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockWebView = React.forwardRef(function MockWebView(
    props: { children?: React.ReactNode },
    ref: React.Ref<{ injectJavaScript: (script: string) => void }>,
  ) {
    React.useImperativeHandle(ref, () => ({
      injectJavaScript: jest.fn(),
    }));
    return React.createElement(View, props);
  });
  return {
    __esModule: true,
    default: MockWebView,
    WebView: MockWebView,
  };
});

jest.mock('react-native-screens', () => {
  const actual = jest.requireActual('react-native-screens');
  return {
    ...actual,
    enableScreens: jest.fn(),
  };
});

test('renders the native goal list', async () => {
  const { getByText } = render(<App />);

  await waitFor(() => {
    expect(getByText('Vacaciones')).toBeTruthy();
  });
});
