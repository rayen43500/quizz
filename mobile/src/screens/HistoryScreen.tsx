import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import api from '../api/client';
import ScreenHeader from '../components/ScreenHeader';

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get('/responses/me/progress').then((r) => setHistory(r.data.history || []));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Historique" subtitle="Vos dernières réponses et résultats." />

      {history.map((h, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.dot, h.isCorrect ? styles.dotOk : h.isCorrect === false ? styles.dotFail : styles.dotNeutral]} />
          <View style={styles.rowContent}>
            <Text style={styles.qText} numberOfLines={2}>{h.questionText || 'Question'}</Text>
            <Text style={styles.meta}>
              {h.isCorrect === true ? 'Correct' : h.isCorrect === false ? 'Incorrect' : 'Sondage'} · {(h.responseTimeMs / 1000).toFixed(1)}s
            </Text>
          </View>
        </View>
      ))}

      {history.length === 0 && (
        <Text style={styles.empty}>Aucune réponse — rejoignez une session live.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  dotOk: { backgroundColor: colors.success },
  dotFail: { backgroundColor: colors.accent },
  dotNeutral: { backgroundColor: colors.textFaint },
  rowContent: { flex: 1 },
  qText: { color: colors.text, fontWeight: '600', fontSize: typography.body },
  meta: { color: colors.textMuted, fontSize: typography.sm, marginTop: 4 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
