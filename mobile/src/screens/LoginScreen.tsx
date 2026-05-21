import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('student@quisi.edu');
  const [password, setPassword] = useState('Student123!');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch {
      Alert.alert('Erreur', 'Identifiants invalides');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBlock}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>Q</Text>
          </View>
          <Text style={styles.brandName}>Quisi</Text>
          <Text style={styles.tagline}>Apprentissage intelligent en temps réel</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Connexion étudiant</Text>
          <Text style={styles.formSub}>Accédez à vos sessions et votre progression</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.textFaint}
          />

          <PrimaryButton title="Se connecter" onPress={handleLogin} style={{ marginTop: spacing.lg }} />

          <Text style={styles.footer}>
            Pas de compte ?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
              S'inscrire
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  brandBlock: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: '#0a0c10' },
  brandName: { fontSize: typography.h1, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  tagline: { fontSize: typography.sm, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  formTitle: { fontSize: typography.h2, fontWeight: '700', color: colors.text },
  formSub: { fontSize: typography.sm, color: colors.textMuted, marginBottom: spacing.lg, marginTop: spacing.xs },
  label: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.body,
  },
  footer: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted, fontSize: typography.sm },
  link: { color: colors.primary, fontWeight: '600' },
});
