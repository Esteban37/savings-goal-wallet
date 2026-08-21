import { Text } from 'react-native';
import { render, userEvent } from '@testing-library/react-native';
import { AppearanceHeaderButton } from './appearance-header-button';
import { AppearanceProvider, useAppearance } from './appearance-provider';

function PreferenceProbe() {
  const { preference } = useAppearance();
  return <Text>{preference}</Text>;
}

describe('AppearanceHeaderButton', () => {
  it('cycles the preference and exposes the current accessibility label', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText } = render(
      <AppearanceProvider>
        <AppearanceHeaderButton />
        <PreferenceProbe />
      </AppearanceProvider>,
    );

    expect(getByLabelText('Apariencia: sistema')).toBeTruthy();
    await user.press(getByLabelText('Apariencia: sistema'));
    expect(getByLabelText('Apariencia: claro')).toBeTruthy();
    expect(getByText('light')).toBeTruthy();
  });
});
