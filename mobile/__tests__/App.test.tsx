/**
 * @format
 */

import { render, waitFor } from '@testing-library/react-native';
import App from '../src/app/App';

jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(() => Promise.resolve()),
  showConfirmDialog: jest.fn(() => Promise.resolve(true)),
}));

test('renders the native goal list', async () => {
  const { getByText } = render(<App />);

  await waitFor(() => {
    expect(getByText('Vacaciones')).toBeTruthy();
  });
});
