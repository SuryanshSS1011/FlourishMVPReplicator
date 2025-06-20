import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { layout } from './layout';
import { shadows } from './shadows';

export const theme = {
    colors: {
        ...colors,
        textSecondary: colors.text.secondary,
    },
    typography,
    fonts: typography.fonts,
    spacing,
    layout,
    shadows,
} as const;

export type Theme = typeof theme;