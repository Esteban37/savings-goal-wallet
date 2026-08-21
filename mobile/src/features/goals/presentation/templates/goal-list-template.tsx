import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, type, useThemeTokens } from '../../../../shared/ui/tokens';
import type { GoalRow } from '../../store';
import { GoalListItem } from '../molecules/goal-list-item';

const FAB_SIZE = 56;

type GoalListTemplateProps = {
  rows: GoalRow[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  onGoalPress?: (goalId: string) => void;
  onGoalLongPress?: (goalId: string, name: string) => void;
  onCreatePress?: () => void;
};

export function GoalListTemplate({
  rows,
  status,
  onGoalPress,
  onGoalLongPress,
  onCreatePress,
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
        contentContainerStyle={[
          styles.list,
          { paddingBottom: FAB_SIZE + spacing.lg },
        ]}
        ListEmptyComponent={
          status === 'succeeded' ? (
            <Text style={[styles.status, { color: color.textMuted }]}>
              No hay metas todavía
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <GoalListItem
            {...item}
            onPress={onGoalPress ? () => onGoalPress(item.id) : undefined}
            onLongPress={
              onGoalLongPress
                ? () => onGoalLongPress(item.id, item.name)
                : undefined
            }
          />
        )}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agregar meta"
        onPress={onCreatePress}
        style={[
          styles.fab,
          {
            backgroundColor: color.accent,
            bottom: insets.bottom + spacing.md,
          },
        ]}>
        <Text style={styles.fabGlyph}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  status: {
    ...type.body,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabGlyph: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '600',
  },
});
