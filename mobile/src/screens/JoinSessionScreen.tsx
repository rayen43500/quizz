import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, radius, typography } from '../styles/theme';
import api from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';

export default function JoinSessionScreen({ navigation }: any) {
  const [code, setCode] = useState('');
  const [sessionInfo, setSessionInfo] = useState<{ title?: string; topic?: string; status?: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');

  const storeSessionId = async (sessionId: string) => {
    if (Platform.OS === 'web') {
      try {
        window?.localStorage?.setItem('quisi_session_id', sessionId);
      } catch {
        // Ignore storage errors on web.
      }
      return;
    }

    await SecureStore.setItemAsync('quisi_session_id', sessionId);
  };

  const join = async () => {
    if (code.length !== 6) {
      Alert.alert('Code invalide', 'Le code comporte 6 caractères.');
      return;
    }
    try {
      const { data } = await api.post('/sessions/join', { code: code.toUpperCase() });
      await storeSessionId(data.session.id);
      navigation.navigate('Quiz', { sessionId: data.session.id, code: data.session.code });
    } catch {
      Alert.alert('Session introuvable', 'Vérifiez le code ou demandez à l\'enseignant.');
    }
  };

  useEffect(() => {
    if (code.length !== 6) {
      setSessionInfo(null);
      setCheckError('');
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      setCheckError('');
      try {
        const { data } = await api.get(`/sessions/code/${code.toUpperCase()}`);
        setSessionInfo({
          title: data.session?.quiz?.title,
          topic: data.session?.quiz?.topic,
          status: data.session?.status,
        });
      } catch (e: any) {
        setSessionInfo(null);
        setCheckError(e.response?.data?.error || 'Session introuvable');
      } finally {
        setChecking(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        label="Session live"
        title="Rejoindre"
        subtitle="Saisissez le code projeté en classe. Vous serez synchronisé en moins d'une seconde."
      />

      <View style={styles.codeGroup}>
        <Text style={styles.codeLabel}>Code de session</Text>
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().slice(0, 6))}
          placeholder="AB3K9X"
          placeholderTextColor={colors.textFaint}
          maxLength={6}
          autoCapitalize="characters"
          textAlign="center"
          autoFocus
        />
        {checking && <Text style={styles.checking}>Verification du quiz...</Text>}
        {!!sessionInfo && (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>{sessionInfo.title || 'Quiz'}</Text>
            {!!sessionInfo.topic && <Text style={styles.sessionTopic}>{sessionInfo.topic}</Text>}
            {!!sessionInfo.status && <Text style={styles.sessionStatus}>Statut: {sessionInfo.status}</Text>}
          </View>
        )}
        {!!checkError && <Text style={styles.checkError}>{checkError}</Text>}
      </View>

      <PrimaryButton title="Entrer dans la session" onPress={join} style={styles.cta} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  codeGroup: { marginBottom: spacing.xl },
  codeLabel: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.sm,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeInput: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 10,
    color: colors.primary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checking: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.md },
  checkError: { textAlign: 'center', color: colors.accent, marginTop: spacing.md, fontWeight: '600' },
  sessionCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sessionTitle: { fontSize: typography.h2, fontWeight: '700', color: colors.text, textAlign: 'center' },
  sessionTopic: { marginTop: spacing.xs, color: colors.textMuted, textAlign: 'center' },
  sessionStatus: { marginTop: spacing.sm, color: colors.textFaint, textAlign: 'center' },
  cta: { width: '100%' },
});
