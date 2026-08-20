import { render } from '@testing-library/react-native';
import { MoneyText } from './money-text';
import { formatWholePesos } from './format-whole-pesos';

describe('MoneyText', () => {
  it('renders a grouped whole-peso amount without a decimal part', () => {
    const inputX = 25000;
    const expectedX = '25.000';
    const actualFormatted = formatWholePesos(inputX);
    const { getByText } = render(<MoneyText amount={inputX} />);

    expect(actualFormatted).toBe(expectedX);
    expect(actualFormatted).not.toMatch(/,\d|\.\d{1,2}$/);
    expect(getByText(expectedX)).toBeTruthy();
  });
});
