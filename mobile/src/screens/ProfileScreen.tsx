import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import Avatar from '../components/Avatar';
import PrimaryButton from '../components/PrimaryButton';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', institution: '' });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        institution: user.institution || '',
      });
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission', 'Accès à la galerie requis');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0]?.base64) {
        const mime = result.assets[0].mimeType || 'image/jpeg';
        await api.post('/auth/avatar', { image: `data:${mime};base64,${result.assets[0].base64}` });
        await refreshUser();
        Alert.alert('Succès', 'Photo mise à jour');
      }
    } catch {
      Alert.alert('Info', 'Installez expo-image-picker ou utilisez le dashboard web pour la photo.');
    }
  };

  const save = async () => {
    try {
      await api.patch('/auth/profile', form);
      await refreshUser();
      Alert.alert('Profil enregistré');
    } catch {
      Alert.alert('Erreur', 'Sauvegarde impossible');
    }
  };

  const removeAvatar = async () => {
    await api.delete('/auth/avatar');
    await refreshUser();
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Mon profil" subtitle="Photo, informations et compte étudiant." />

      <View style={styles.avatarSection}>
        <Avatar uri={user.avatar} firstName={user.firstName} lastName={user.lastName} size={96} />
        <TouchableOpacity onPress={pickImage} style={styles.changePhoto}>
          <Text style={styles.changePhotoText}>Changer la photo</Text>
        </TouchableOpacity>
        {user.avatar ? (
          <TouchableOpacity onPress={removeAvatar}>
            <Text style={styles.removeText}>Supprimer la photo</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput style={styles.input} value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
        <Text style={styles.label}>Nom</Text>
        <TextInput style={styles.input} value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, styles.disabled]} value={user.email} editable={false} />
        <Text style={styles.label}>Établissement</Text>
        <TextInput style={styles.input} value={form.institution} onChangeText={(v) => setForm({ ...form, institution: v })} placeholder="Optionnel" placeholderTextColor={colors.textFaint} />
        <PrimaryButton title="Enregistrer" onPress={save} style={{ marginTop: spacing.lg }} />
        <PrimaryButton title="Déconnexion" onPress={logout} variant="ghost" style={{ marginTop: spacing.md }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  changePhoto: { marginTop: spacing.md },
  changePhotoText: { color: colors.primary, fontWeight: '600', fontSize: typography.body },
  removeText: { color: colors.textMuted, marginTop: spacing.sm, fontSize: typography.sm },
  label: { fontSize: typography.sm, color: colors.textMuted, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.body,
  },
  disabled: { opacity: 0.5 },
});
