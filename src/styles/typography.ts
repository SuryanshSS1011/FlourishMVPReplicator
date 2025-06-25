// src/styles/typography.ts

export const typography = {
    fonts: {
        primary: 'Roboto-Regular',
        primaryLight: 'Roboto-Light',
        primaryMedium: 'Roboto-Medium',
        primaryBold: 'Roboto-Bold',
        secondary: 'Ubuntu-Regular',
        secondaryBold: 'Ubuntu-Bold',
        accent: 'Turbinado',
        system: 'PlusJakartaSans-Regular',
        mono: 'SpaceMono-Regular',
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
        light: '300',
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


