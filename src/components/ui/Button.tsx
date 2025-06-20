// src/components/ui/Button.tsx

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
} from 'react-native';
import { theme } from '../../styles';
import type { ButtonProps } from '../../types';

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
}) => {
    const buttonStyle: ViewStyle = {
        ...styles.base,
        ...styles[variant as keyof typeof styles],
        ...styles[`size_${size}` as keyof typeof styles],
        ...(disabled && styles.disabled),
    };

    const textStyle: TextStyle = {
        ...styles.text,
        ...styles[`text_${variant}` as keyof typeof styles],
        ...styles[`text_${size}` as keyof typeof styles],
        ...(disabled && styles.textDisabled),
    };

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? theme.colors.text.inverse : theme.colors.primary[900]}
                />
            ) : (
                <>
                    {icon}
                    <Text style={textStyle}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.layout.button.borderRadius,
        ...theme.shadows.sm,
    },

    // Variants
    primary: {
        backgroundColor: theme.colors.primary[700],
    },
    secondary: {
        backgroundColor: theme.colors.secondary[500],
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary[900],
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    // Sizes
    size_sm: {
        height: 36,
        paddingHorizontal: theme.spacing.md,
    },
    size_md: {
        height: theme.layout.button.height,
        paddingHorizontal: theme.spacing.xl,
    },
    size_lg: {
        height: 52,
        paddingHorizontal: theme.spacing['2xl'],
    },

    // Text styles
    text: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.semibold,
    },
    text_primary: {
        color: theme.colors.text.inverse,
    },
    text_secondary: {
        color: theme.colors.text.inverse,
    },
    text_outline: {
        color: theme.colors.primary[900],
    },
    text_ghost: {
        color: theme.colors.primary[900],
    },
    text_sm: {
        fontSize: theme.typography.sizes.sm,
    },
    text_md: {
        fontSize: theme.typography.sizes.base,
    },
    text_lg: {
        fontSize: theme.typography.sizes.lg,
    },

    // Disabled styles
    disabled: {
        opacity: 0.6,
    },
    textDisabled: {
        color: theme.colors.text.muted,
    },
});