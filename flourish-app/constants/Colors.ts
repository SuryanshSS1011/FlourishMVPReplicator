/**
 * Flourish App Color Palette
 * Based on the design manual and brand guidelines
 */

export const Colors = {
  // Primary brand colors
  primary: {
    darkGreen: '#164432',
    lightGreen: '#B3CCA4',
    mediumGreen: '#78A88A',
    cream: '#DEDED0',
  },

  // Secondary colors
  secondary: {
    lightGreen: '#78A88A',
    paleGreen: '#B3CCA4',
  },

  // Accent colors
  accent: {
    mediumGreen: '#2B8761',
    brightGreen: '#68A1A1',
  },

  // Background colors
  background: {
    cream: '#DEDED0',
    lightGreen: '#B3CCA4',
    mediumGreen: '#78A88A',
    darkGreen: '#8BA89A', // Splash screen background
  },

  // Text colors
  text: {
    primary: '#164432',
    secondary: '#504D4D',
    light: '#FFFFFF',
    muted: '#999999',
  },

  // UI element colors
  ui: {
    white: '#FFFFFF',
    lightGray: '#F3F3F3',
    mediumGray: '#C7C7CC',
    darkGray: '#A0A0A0',
    error: '#FF4040',
    success: '#A3D977',
    warning: '#FFA500',
  },

  // Gradient colors for premium features
  premium: {
    purple: '#888DBE',
    pink: '#FA6FB4',
    lightBlue: '#B3E8E5',
    lightPurple: '#D7CFF5',
  },

  // Progress bar colors
  progress: {
    water: ['#2BE4FF', '#1681FF'], // Gradient for water level
    care: ['#FFFFFF', '#E26310'], // Gradient for care level
    success: ['#98FB98', '#A3D977'], // Gradient for success states
  },

  // Light and dark theme support (for future use)
  light: {
    text: '#164432',
    background: '#DEDED0',
    tint: '#164432',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#164432',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#78A88A',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#78A88A',
  },
} as const;

// Color utility functions
export const getColorWithOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Semantic color mappings for specific use cases
export const SemanticColors = {
  button: {
    primary: Colors.accent.mediumGreen,
    secondary: Colors.ui.white,
    danger: Colors.ui.error,
    success: Colors.ui.success,
  },
  task: {
    daily: Colors.accent.brightGreen,
    personal: Colors.secondary.lightGreen,
    completed: Colors.ui.success,
    favorite: Colors.primary.darkGreen,
  },
  plant: {
    healthy: Colors.ui.success,
    needsCare: Colors.ui.warning,
    premium: Colors.premium.purple,
  },
} as const;