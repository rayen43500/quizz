import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      await register(form);
    } catch {
      Alert.alert('Erreur', 'Inscription échouée');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.sub}>Rejoignez Quisi en tant qu'étudiant</Text>

        {(['firstName', 'lastName', 'email', 'password'] as const).map((f) => (
          <View key={f}>
            <Text style={styles.label}>
              {f === 'firstName' ? 'Prénom' : f === 'lastName' ? 'Nom' : f === 'email' ? 'Email' : 'Mot de passe'}
            </Text>
            <TextInput
              style={styles.input}
              value={form[f]}
              onChangeText={(v) => setForm({ ...form, [f]: v })}
              secureTextEntry={f === 'password'}
              autoCapitalize={f === 'email' ? 'none' : 'words'}
              placeholderTextColor={colors.textFaint}
            />
          </View>
        ))}

        <PrimaryButton title="S'inscrire" onPress={handleRegister} style={{ marginTop: spacing.lg }} />
        <Text style={styles.footer}>
          Déjà inscrit ?{' '}
          <Text style={styles.link} onPress={() => navigation.goBack()}>
            Connexion
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: typography.display, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, marginBottom: spacing.lg, marginTop: spacing.xs },
  label: { fontSize: typography.sm, fontWeight: '600', color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.body,
  },
  footer: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
  link: { color: colors.primary, fontWeight: '600' },
});
