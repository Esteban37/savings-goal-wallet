import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MoneyText } from '../../../../shared/ui/atoms/money-text';
import { ProgressBar } from '../../../../shared/ui/atoms/progress-bar';
import { color, spacing, type } from '../../../../shared/ui/tokens';
import type { GoalRow } from '../../store';

type GoalListItemProps = GoalRow & {
  onPress?: () => void;
};

export function GoalListItem({
  name,
  targetAmount,
  depositedAmount,
  progressPercent,
  onPress,
}: GoalListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Objetivo</Text>
        <MoneyText amount={targetAmount} style={styles.amount} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Acumulado</Text>
        <MoneyText amount={depositedAmount} style={styles.amount} />
      </View>
      <Text style={styles.percent}>{`${progressPercent}%`}</Text>
      <ProgressBar percent={progressPercent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  name: {
    ...type.subtitle,
    color: color.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...type.body,
    color: color.textMuted,
  },
  amount: {
    ...type.body,
    color: color.text,
  },
  percent: {
    ...type.caption,
    color: color.accent,
  },
});
