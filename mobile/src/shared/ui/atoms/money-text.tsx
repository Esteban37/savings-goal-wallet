import { Text, type TextProps } from 'react-native';
import { formatWholePesos } from './format-whole-pesos';

type MoneyTextProps = TextProps & {
  amount: number;
};

export function MoneyText({ amount, ...rest }: MoneyTextProps) {
  return <Text {...rest}>{formatWholePesos(amount)}</Text>;
}
