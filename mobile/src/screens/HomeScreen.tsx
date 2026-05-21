import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import Avatar from '../components/Avatar';

const FEATURES = [
  { emoji: '🎯', title: 'Session live', desc: 'Code à 6 caractères', screen: 'Join' as const },
  { emoji: '📈', title: 'Statistiques', desc: 'Heatmap & scores', screen: 'Progress' as const },
  { emoji: '📋', title: 'Historique', desc: 'Mes réponses', screen: 'History' as const },
  { emoji: '💬', title: 'Assistant IA', desc: 'Explications sur mesure', screen: 'Chat' as const },
  { emoji: '👤', title: 'Mon profil', desc: 'Photo & compte', screen: 'Profile' as const },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('Profile')}>
        <Avatar uri={user?.avatar} firstName={user?.firstName} lastName={user?.lastName} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.greetingSmall}>Quisi Student</Text>
          <Text style={styles.greetingName}>Bonjour, {user?.firstName}</Text>
        </View>
        <Text style={styles.profileChevron}>›</Text>
      </TouchableOpacity>

      {/* Primary action — terminal area, generous whitespace */}
      <View style={styles.ctaBlock}>
        <PrimaryButton
          title="Rejoindre une session"
          onPress={() => navigation.navigate('Join')}
          style={styles.primaryCta}
        />
        <Text style={styles.ctaHint}>Entrez le code affiché par votre enseignant</Text>
      </View>

      <Text style={styles.sectionLabel}>Explorer</Text>
      {FEATURES.map((f) => (
        <Card key={f.screen} onPress={() => navigation.navigate(f.screen)} elevated>
          <View style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </Card>
      ))}

      <View style={styles.innovation}>
        <Text style={styles.innovationTitle}>Intelligence pédagogique</Text>
        <Text style={styles.innovationBody}>
          Réponses synchronisées en moins d'une seconde · Feedback IA · Plans de révision personnalisés
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  greetingSmall: { fontSize: typography.xs, color: colors.primary, fontWeight: '600', textTransform: 'uppercase' },
  greetingName: { fontSize: typography.h2, fontWeight: '800', color: colors.text },
  profileChevron: { fontSize: 28, color: colors.textFaint },
  ctaBlock: { marginBottom: spacing.xl },
  primaryCta: { width: '100%' },
  ctaHint: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: typography.sm,
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureEmoji: { fontSize: 22 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: typography.h2, fontWeight: '700', color: colors.text },
  featureDesc: { fontSize: typography.sm, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 28, color: colors.textFaint, fontWeight: '300' },
  innovation: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.2)',
  },
  innovationTitle: { fontSize: typography.h2, fontWeight: '700', color: colors.accent, marginBottom: spacing.sm },
  innovationBody: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: 22 },
});
