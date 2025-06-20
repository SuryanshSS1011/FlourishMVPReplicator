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

