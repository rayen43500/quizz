import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, spacing, radius, shadows } from '../styles/theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
};

export default function Card({ children, onPress, style, elevated }: Props) {
  const content = (
    <View style={[styles.card, elevated && styles.elevated, style]}>{children}</View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
  elevated: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.92 },
});
