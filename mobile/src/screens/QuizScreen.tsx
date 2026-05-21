import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, TextInput, Image } from 'react-native';
import { Video } from 'expo-av';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, radius, typography } from '../styles/theme';
import api from '../api/client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'quisi_token';

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window?.localStorage?.getItem(TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export default function QuizScreen({ route, navigation }: any) {
  const { sessionId, code } = route.params;
  const [question, setQuestion] = useState<any>(null);
  const [answered, setAnswered] = useState(false);
  const [timer, setTimer] = useState(0);
  const [shortAnswer, setShortAnswer] = useState('');
  const startTime = useRef(Date.now());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    getStoredToken().then((token) => {
      if (!token) {
        Alert.alert('Connexion requise', 'Veuillez vous reconnecter.');
        navigation.goBack();
        return;
      }

      const socket = io(SOCKET_URL, { auth: { token } });
      socketRef.current = socket;
      socket.emit('join_session', { sessionId });

      socket.on('question:show', ({ question: q, timerSec }) => {
        setQuestion(q);
        setAnswered(false);
        setTimer(timerSec || 30);
        setShortAnswer('');
        startTime.current = Date.now();
      });

      socket.on('session:ended', () => {
        Alert.alert('Session terminée', 'Merci pour votre participation.');
        navigation.goBack();
      });
    });

    interval = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => {
      clearInterval(interval);
      socketRef.current?.disconnect();
    };
  }, [sessionId]);

  const submitAnswer = async (answer: string) => {
    if (answered || !question) return;
    setAnswered(true);
    const responseTimeMs = Date.now() - startTime.current;

    try {
      const { data } = await api.post('/responses', {
        sessionId,
        questionId: question.id,
        answer,
        responseTimeMs,
      });

      Alert.alert(
        data.isCorrect === null ? 'Enregistré' : data.isCorrect ? 'Correct' : 'À revoir',
        data.isCorrect === false ? 'L\'assistant peut vous expliquer pourquoi.' : undefined,
        [
          { text: 'Assistant', onPress: () => navigation.navigate('Chat', { question, answer }) },
          { text: 'OK' },
        ]
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.error || 'Envoi impossible');
      setAnswered(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.codeLabel}>Session</Text>
          <Text style={styles.code}>{code}</Text>
        </View>
        <View style={[styles.timerWrap, timer < 10 && styles.timerUrgent]}>
          <Text style={styles.timer}>{timer}s</Text>
        </View>
      </View>

      {!question ? (
        <View style={styles.waiting}>
          <Text style={styles.waitingTitle}>En attente</Text>
          <Text style={styles.waitingSub}>L'enseignant va lancer la prochaine question</Text>
        </View>
      ) : (
        <View style={styles.questionBlock}>
          <Text style={styles.qIndex}>Question {(question.index ?? 0) + 1}</Text>
          <Text style={styles.questionText}>{question.text}</Text>

          {question.image && (
            <Image source={{ uri: question.image }} style={styles.mediaImage} resizeMode="contain" />
          )}

          {question.video && (
            <Video
              source={{ uri: question.video }}
              style={styles.mediaVideo}
              useNativeControls
              resizeMode="contain"
            />
          )}

          {(question.type === 'multiple_choice' || question.type === 'poll') &&
            question.options?.map((opt: any) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.option, answered && styles.optionDisabled]}
                onPress={() => submitAnswer(opt.id)}
                disabled={answered}
                activeOpacity={0.8}
              >
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}

          {question.type === 'true_false' && (
            <View style={styles.tfRow}>
              {['true', 'false'].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.tfBtn, answered && styles.optionDisabled]}
                  onPress={() => submitAnswer(v)}
                  disabled={answered}
                >
                  <Text style={styles.tfText}>{v === 'true' ? 'Vrai' : 'Faux'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {question.type === 'short_answer' && (
            <View style={styles.shortAnswerBlock}>
              <TextInput
                style={styles.shortAnswerInput}
                value={shortAnswer}
                onChangeText={setShortAnswer}
                placeholder="Votre reponse"
                placeholderTextColor={colors.textFaint}
                editable={!answered}
              />
              <TouchableOpacity
                style={[styles.shortAnswerBtn, answered && styles.optionDisabled]}
                onPress={() => submitAnswer(shortAnswer.trim())}
                disabled={answered || !shortAnswer.trim()}
              >
                <Text style={styles.shortAnswerBtnText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  codeLabel: { fontSize: typography.xs, color: colors.textFaint, textTransform: 'uppercase' },
  code: { fontSize: typography.h2, fontWeight: '800', color: colors.primary, letterSpacing: 4 },
  quizTitle: { marginTop: spacing.xs, color: colors.text, fontWeight: '700' },
  quizTopic: { color: colors.textMuted, marginTop: 2 },
  timerWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
  },
  timerUrgent: { backgroundColor: colors.accentMuted },
  timer: { fontSize: typography.h2, fontWeight: '800', color: colors.primary },
  waiting: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  waitingTitle: { fontSize: typography.h1, fontWeight: '700', color: colors.text },
  waitingSub: { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  waitingMeta: { color: colors.text, marginTop: spacing.md, fontWeight: '600' },
  questionBlock: { flex: 1, padding: spacing.lg },
  qIndex: { fontSize: typography.sm, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
  questionText: {
    fontSize: typography.h1,
    fontWeight: '700',
    color: colors.text,
    lineHeight: typography.h1 * typography.lineTight,
    marginBottom: spacing.xl,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  optionDisabled: { opacity: 0.6 },
  optionText: { color: colors.text, fontSize: typography.body, lineHeight: 22 },
  tfRow: { flexDirection: 'row', gap: spacing.md },
  tfBtn: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tfText: { color: colors.text, fontWeight: '700', fontSize: typography.h2 },
  shortAnswerBlock: { marginTop: spacing.md, gap: spacing.sm },
  shortAnswerInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortAnswerBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  shortAnswerBtnText: { color: '#0a0c10', fontWeight: '700', fontSize: typography.body },
  mediaImage: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceRaised,
  },
  mediaVideo: {
    width: '100%',
    height: 240,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceRaised,
  },
});
