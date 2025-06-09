// src/components/ui/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/colors';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'large';
    color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message,
    size = 'large',
    color = theme.colors.primary[700],
}) => {
    return (
        <View style={spinnerStyles.container}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={spinnerStyles.message}>{message}</Text>}
        </View>
    );
};

const spinnerStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    message: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        fontFamily: theme.typography.fonts.primary,
    },
});
