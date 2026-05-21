/**
 * Quisi Mobile — Visual Balance Design Tokens
 * Aligné avec le dashboard (teal + coral, Plus Jakarta / Source Sans)
 */

export const colors = {
  /* 60% dominant */
  bg: '#0a0c10',
  bgElevated: '#0f1218',

  /* 30% surfaces */
  surface: '#161b24',
  surfaceRaised: '#1e2530',
  border: '#2a3444',
  borderSubtle: '#1f2733',

  /* 10% accent */
  primary: '#2dd4bf',
  primaryDark: '#14b8a6',
  primaryMuted: 'rgba(45, 212, 191, 0.12)',
  accent: '#fb7185',
  accentMuted: 'rgba(251, 113, 133, 0.12)',

  text: '#f1f5f9',
  textSecondary: 'rgba(241, 245, 249, 0.78)',
  textMuted: '#94a3b8',
  textFaint: 'rgba(148, 163, 184, 0.55)',

  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  display: 28,
  h1: 24,
  h2: 20,
  body: 16,
  sm: 14,
  xs: 12,
  lineTight: 1.2,
  lineNormal: 1.5,
  lineRelaxed: 1.65,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
};
