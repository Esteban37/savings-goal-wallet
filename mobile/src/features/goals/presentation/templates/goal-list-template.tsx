import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, type, useThemeTokens } from '../../../../shared/ui/tokens';
import type { GoalRow } from '../../store';
import { GoalListItem } from '../molecules/goal-list-item';

type GoalListTemplateProps = {
  rows: GoalRow[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  onGoalPress?: (goalId: string) => void;
};

export function GoalListTemplate({
  rows,
  status,
  onGoalPress,
}: GoalListTemplateProps) {
  const insets = useSafeAreaInsets();
  const { color } = useThemeTokens();

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: color.background,
          paddingBottom: insets.bottom,
        },
      ]}>
      {status === 'loading' || status === 'idle' ? (
        <Text style={[styles.status, { color: color.textMuted }]}>
          Cargando...
        </Text>
      ) : null}
      {status === 'failed' ? (
        <Text style={[styles.status, { color: color.textMuted }]}>
          No se pudieron cargar las metas
        </Text>
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GoalListItem
            {...item}
            onPress={onGoalPress ? () => onGoalPress(item.id) : undefined}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  status: {
    ...type.body,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
