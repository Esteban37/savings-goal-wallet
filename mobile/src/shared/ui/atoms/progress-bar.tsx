import { StyleSheet, View } from 'react-native';
import { useThemeTokens } from '../tokens';

type ProgressBarProps = {
  percent: number;
};

export function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const { color } = useThemeTokens();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={[styles.track, { backgroundColor: color.progressTrack }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped}%`, backgroundColor: color.progressFill },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
