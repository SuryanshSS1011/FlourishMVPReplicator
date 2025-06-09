// src/styles/colors.ts
export const colors = {
  // Primary brand colors from design manual
  primary: {
    900: '#164432',  // Primary dark green
    700: '#2B8761',  // Medium green
    500: '#78A88A',  // Light green
    300: '#B3CCA4',  // Very light green
    100: '#DEDED0',  // Background beige
  },

  // Secondary colors
  secondary: {
    500: '#68A1A1',  // Teal
    300: '#98FB98',  // Light green for timers
    100: '#DDFBCC',  // Very light green for buttons
  },

  // Premium gradient colors
  premium: {
    purple: '#888DBE',
    pink: '#FA6FB4',
  },

  // Functional colors
  text: {
    primary: '#164432',
    secondary: '#504D4D',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },

  // Status colors
  success: '#2BE4FF',
  warning: '#E26310',
  error: '#FF4040',
  info: '#3c9afb',

  // Background colors
  background: {
    primary: '#DEDED0',
    secondary: '#F3EFED',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Component specific
  card: '#FFFFFF',
  border: '#C7C7CC',
  shadow: 'rgba(0, 0, 0, 0.25)',
} as const;

// src/styles/typography.ts
export const typography = {
  fonts: {
    primary: 'Roboto',
    secondary: 'Ubuntu',
    accent: 'Turbinado',
    system: 'PlusJakartaSans-Regular',
  },

  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 22,
    '4xl': 24,
    '5xl': 28,
    '6xl': 30,
  },

  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// src/styles/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// src/styles/layout.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const layout = {
  // Screen dimensions
  screen: { width, height },

  // Design reference (for responsive scaling)
  figma: {
    width: 412,
    height: 917,
  },

  // Common component sizes
  button: {
    height: 44,
    borderRadius: 30,
  },

  input: {
    height: 44,
    borderRadius: 8,
  },

  card: {
    borderRadius: 15,
    padding: 16,
  },

  // Navigation
  tabBar: {
    height: 60,
  },

  header: {
    height: 56,
  },
} as const;

// Helper function for responsive scaling
export const scale = (size: number) => (width / layout.figma.width) * size;
export const verticalScale = (size: number) => (height / layout.figma.height) * size;

// src/styles/shadows.ts
export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },

  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Export all styles
export const theme = {
  colors,
  typography,
  spacing,
  layout,
  shadows,
  scale,
  verticalScale,
} as const;

export type Theme = typeof theme;