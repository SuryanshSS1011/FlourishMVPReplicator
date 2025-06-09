// app/(auth)/success.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../src/styles';
import { Button } from '../../src/components/ui';

export default function SuccessScreen() {
    const { type, message } = useLocalSearchParams<{
        type?: 'registration' | 'password-reset' | 'verification';
        message?: string;
    }>();

    useEffect(() => {
        // Auto-redirect after 3 seconds if no user interaction
        const timer = setTimeout(() => {
            handleContinue();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const getSuccessConfig = () => {
        switch (type) {
            case 'registration':
                return {
                    icon: 'user-check',
                    title: 'Welcome to Flourish!',
                    subtitle: 'Your account has been created successfully.',
                    buttonText: 'Start Your Journey',
                };
            case 'password-reset':
                return {
                    icon: 'check-circle',
                    title: 'Password Reset Complete',
                    subtitle: 'Your password has been successfully updated.',
                    buttonText: 'Sign In',
                };
            case 'verification':
                return {
                    icon: 'shield-check',
                    title: 'Account Verified',
                    subtitle: 'Your account has been successfully verified.',
                    buttonText: 'Continue',
                };
            default:
                return {
                    icon: 'check-circle',
                    title: 'Success!',
                    subtitle: message || 'Operation completed successfully.',
                    buttonText: 'Continue',
                };
        }
    };

    const handleContinue = () => {
        switch (type) {
            case 'registration':
            case 'verification':
                router.replace('/(app)/(tabs)/dashboard');
                break;
            case 'password-reset':
                router.replace('/(auth)/login');
                break;
            default:
                router.replace('/');
                break;
        }
    };

    const config = getSuccessConfig();

    return (
        <View style={successStyles.container}>
            <View style={successStyles.contentContainer}>
                <View style={successStyles.iconContainer}>
                    <Feather
                        name={config.icon as any}
                        size={64}
                        color={theme.colors.primary[700]}
                    />
                </View>

                <Text style={successStyles.title}>{config.title}</Text>
                <Text style={successStyles.subtitle}>{config.subtitle}</Text>

                <View style={successStyles.buttonContainer}>
                    <Button
                        title={config.buttonText}
                        onPress={handleContinue}
                    />
                </View>

                <Text style={successStyles.autoRedirectText}>
                    Redirecting automatically in a few seconds...
                </Text>
            </View>
        </View>
    );
}

const successStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary[100],
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primary[300],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing['3xl'],
        ...theme.shadows.lg,
    },
    title: {
        fontSize: theme.typography.sizes['4xl'],
        fontWeight: theme.typography.weights.bold,
        textAlign: 'center',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
        fontFamily: theme.typography.fonts.primary,
    },
    subtitle: {
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: theme.spacing['3xl'],
        fontFamily: theme.typography.fonts.primary,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: theme.spacing.xl,
    },
    continueButton: {
        width: '100%',
    },
    autoRedirectText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.muted,
        textAlign: 'center',
        fontFamily: theme.typography.fonts.primary,
    },
});

