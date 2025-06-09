// src/components/ui/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../styles/';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: keyof typeof theme.spacing;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    padding = 'xl',
}) => {
    return (
        <View style={[cardStyles.container, { padding: theme.spacing[padding] }, style]}>
            {children}
        </View>
    );
};

const cardStyles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.layout.card.borderRadius,
        ...theme.shadows.md,
    },
});