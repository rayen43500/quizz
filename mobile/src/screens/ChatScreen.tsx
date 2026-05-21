import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import api from '../api/client';
import ScreenHeader from '../components/ScreenHeader';

export default function ChatScreen({ route }: any) {
  const ctx = route.params;
  const [message, setMessage] = useState(ctx ? 'Pourquoi ma réponse est-elle fausse ?' : '');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/ai/chat', {
        message: userMsg,
        context: ctx?.question
          ? {
              questionText: ctx.question.text,
              studentAnswer: ctx.answer,
              correctAnswer: ctx.question.options?.find((o: any) => o.isCorrect)?.id,
              explanation: ctx.question.explanation,
            }
          : {},
      });
      setMessages((m) => [...m, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Service indisponible. Réessayez plus tard.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        label="Assistant"
        title="Chat éducatif"
        subtitle="Posez vos questions — réponses pédagogiques, pas des réponses brutes."
      />

      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 && (
          <Text style={styles.hint}>Exemple : « Pourquoi ma réponse est fausse ? »</Text>
        )}
        {messages.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>{msg.text}</Text>
          </View>
        ))}
        {loading && <Text style={styles.hint}>Réflexion en cours…</Text>}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Votre question…"
          placeholderTextColor={colors.textFaint}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
          <Text style={styles.sendIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  messages: { flex: 1 },
  messagesContent: { paddingBottom: spacing.md },
  hint: { color: colors.textFaint, textAlign: 'center', marginVertical: spacing.xl, fontSize: typography.sm },
  bubble: {
    maxWidth: '88%',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  bubbleText: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 22 },
  userText: { color: '#0a0c10', fontWeight: '500' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: '#0a0c10', fontSize: 22, fontWeight: '700' },
});
