import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../styles/theme';

type Props = {
  uri?: string | null;
  firstName?: string;
  lastName?: string;
  size?: number;
};

export default function Avatar({ uri, firstName = '', lastName = '', size = 48 }: Props) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';

  if (uri) {
    return <Image source={{ uri }} style={[styles.img, { width: size, height: size, borderRadius: size * 0.22 }]} />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { borderWidth: 2, borderColor: colors.border },
  fallback: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#fff', fontWeight: '800' },
});
