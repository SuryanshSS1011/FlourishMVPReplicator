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

