import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MoneyText } from '../../../../shared/ui/atoms/money-text';
import { ProgressBar } from '../../../../shared/ui/atoms/progress-bar';
import { spacing, type, useThemeTokens } from '../../../../shared/ui/tokens';
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
  const { color, scheme } = useThemeTokens();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: color.surface,
          borderColor: isDark ? color.surface : color.border,
          borderWidth: isDark ? 0 : StyleSheet.hairlineWidth,
          ...Platform.select({
            android: { elevation: isDark ? 0 : 2 },
            ios: isDark
              ? {}
              : {
                  shadowColor: '#111827',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                },
            default: {},
          }),
        },
      ]}>
      <Text style={[styles.name, { color: color.text }]}>{name}</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: color.textMuted }]}>Objetivo</Text>
        <MoneyText
          amount={targetAmount}
          style={[styles.amount, { color: color.text }]}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: color.textMuted }]}>
          Acumulado
        </Text>
        <MoneyText
          amount={depositedAmount}
          style={[styles.amount, { color: color.text }]}
        />
      </View>
      <Text style={[styles.percent, { color: color.accent }]}>
        {`${progressPercent}%`}
      </Text>
      <ProgressBar percent={progressPercent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  name: {
    ...type.subtitle,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...type.body,
  },
  amount: {
    ...type.body,
  },
  percent: {
    ...type.caption,
  },
});
