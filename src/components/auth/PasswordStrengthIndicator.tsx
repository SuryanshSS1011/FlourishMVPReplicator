// src/components/auth/PasswordStrengthIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles';

interface PasswordStrengthIndicatorProps {
    password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
    password,
}) => {
    const getPasswordStrength = (pass: string) => {
        let score = 0;
        const checks = {
            length: pass.length >= 8,
            lowercase: /[a-z]/.test(pass),
            uppercase: /[A-Z]/.test(pass),
            numbers: /\d/.test(pass),
            symbols: /[^A-Za-z0-9]/.test(pass),
        };

        Object.values(checks).forEach((check) => {
            if (check) {
                score++;
            }
        });

        if (score < 3) {
            return { level: 'weak', color: theme.colors.error };
        }
        if (score < 4) {
            return { level: 'medium', color: '#FFA500' };
        }
        return { level: 'strong', color: theme.colors.success };
    };

    if (!password) {
        return null;
    }

    const strength = getPasswordStrength(password);
    const strengthPercentage = (password.length > 0 ?
        Math.min((password.length / 12) * 100, 100) : 0);

    return (
        <View style={styles.container} >
            <View style={styles.strengthBar}>
                <View
                    style={
                        [
                            styles.strengthFill,
                            {
                                width: `${strengthPercentage}%`,
                                backgroundColor: strength.color,
                            },
                        ]
                    }
                />
            </View>
            < Text style={[styles.strengthText, { color: strength.color }]} >
                Password strength: {strength.level}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: theme.spacing.sm,
    },
    strengthBar: {
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: theme.spacing.xs,
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.primary,
    },
});