import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, spacing, type } from '../../../../shared/ui/tokens';
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

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom },
      ]}>
      <Text style={styles.title}>Metas de ahorro</Text>
      {status === 'loading' || status === 'idle' ? (
        <Text style={styles.status}>Cargando...</Text>
      ) : null}
      {status === 'failed' ? (
        <Text style={styles.status}>No se pudieron cargar las metas</Text>
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
    backgroundColor: color.background,
    paddingHorizontal: spacing.md,
  },
  title: {
    ...type.title,
    color: color.text,
    marginBottom: spacing.md,
  },
  status: {
    ...type.body,
    color: color.textMuted,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
