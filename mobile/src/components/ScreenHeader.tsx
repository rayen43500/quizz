import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

type Props = {
  label?: string;
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({ label, title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    fontSize: typography.xs,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.display,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: typography.display * typography.lineTight,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: typography.body * typography.lineRelaxed,
    maxWidth: 320,
  },
});
