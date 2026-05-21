import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import api from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';

export default function ProgressScreen() {
  const [stats, setStats] = useState<any>(null);
  const [revisionPlan, setRevisionPlan] = useState<any[]>([]);

  useEffect(() => {
    api.get('/stats/me').then((r) => setStats(r.data));
    api.post('/ai/revision-plan', { days: 3 }).then((r) => setRevisionPlan(r.data.plan || [])).catch(() => {});
  }, []);

  const heatmap = stats?.topicsProgress || stats?.topicStats || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Statistiques" subtitle="Scores, maîtrise par sujet et plan de révision IA." />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.successRate ?? 0}%</Text>
          <Text style={styles.statLabel}>Succès</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.totalResponses ?? 0}</Text>
          <Text style={styles.statLabel}>Réponses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.avgResponseTimeMs ? `${(stats.avgResponseTimeMs / 1000).toFixed(1)}s` : '—'}</Text>
          <Text style={styles.statLabel}>Temps moy.</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Heatmap</Text>
      {heatmap.map((h: any) => (
        <View key={h.topic} style={styles.heatRow}>
          <View style={styles.heatHeader}>
            <Text style={styles.heatTopic}>{h.topic}</Text>
            <Text style={[styles.heatPct, (h.masteryPercent ?? h.successRate) < 50 && { color: colors.accent }]}>
              {h.masteryPercent ?? h.successRate}%
            </Text>
          </View>
          <View style={styles.heatTrack}>
            <View style={[styles.heatFill, { width: `${h.masteryPercent ?? h.successRate}%` }]} />
          </View>
        </View>
      ))}

      {revisionPlan.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Plan de révision IA</Text>
          {revisionPlan.map((day: any) => (
            <Card key={day.day}>
              <Text style={styles.planTitle}>Jour {day.day} — {day.title}</Text>
              {day.activities?.map((a: string, i: number) => (
                <Text key={i} style={styles.planItem}>· {a}</Text>
              ))}
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  statValue: { fontSize: typography.h2, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: typography.xs, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  sectionLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  heatRow: { marginBottom: spacing.lg },
  heatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  heatTopic: { color: colors.text, fontWeight: '600' },
  heatPct: { color: colors.primary, fontWeight: '700' },
  heatTrack: { height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden' },
  heatFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  planTitle: { fontSize: typography.h2, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  planItem: { color: colors.textMuted, fontSize: typography.sm, marginTop: spacing.xs },
});
