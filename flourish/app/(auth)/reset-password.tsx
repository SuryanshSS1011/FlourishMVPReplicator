// app/(auth)/reset-password.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authService } from '../../src/lib/appwrite/auth';
import { theme } from '../../src/styles';
import { Input, Button } from '../../src/components/ui';

export default function ResetPasswordScreen() {
    const { userId, secret } = useLocalSearchParams<{
        userId?: string;
        secret?: string;
    }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        password?: string;
        confirmPassword?: string;
    }>({});

    useEffect(() => {
        if (!userId || !secret) {
            Alert.alert(
                'Invalid Reset Link',
                'This password reset link is invalid or has expired. Please request a new one.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(auth)/forgot-password'),
                    },
                ]
            );
        }
    }, [userId, secret]);

    const validatePassword = (pass: string): string | undefined => {
        if (pass.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])/.test(pass)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(pass)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(pass)) {
            return 'Password must contain at least one number';
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        const passwordError = validatePassword(password);
        if (passwordError) {
            newErrors.password = passwordError;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) {
            return;
        }

        if (!userId || !secret) {
            Alert.alert('Error', 'Invalid reset parameters');
            return;
        }

        setLoading(true);
        try {
            const result = await authService.completePasswordRecovery(
                userId,
                secret,
                password
            );

            if (result.success) {
                Alert.alert(
                    'Password Reset Successful',
                    'Your password has been successfully updated. You can now log in with your new password.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(auth)/login'),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to reset password');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={resetStyles.container}>
                <TouchableOpacity
                    style={resetStyles.backButton}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Feather size={24} name="arrow-left" color={theme.colors.text.primary} />
                </TouchableOpacity>

                <View style={resetStyles.contentContainer}>
                    <View style={resetStyles.headerContainer}>
                        <View style={resetStyles.iconContainer}>
                            <Feather name="lock" size={32} color={theme.colors.primary[700]} />
                        </View>
                        <Text style={resetStyles.title}>Create New Password</Text>
                        <Text style={resetStyles.subtitle}>
                            Please enter and confirm your new password. Make sure it&apos;s strong and secure.
                        </Text>
                    </View>

                    <View style={resetStyles.formContainer}>
                        <Input
                            label="New Password"
                            placeholder="Enter new password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: undefined }));
                                }
                            }}
                            secureTextEntry
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) {
                                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                }
                            }}
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        <View style={resetStyles.passwordRequirements}>
                            <Text style={resetStyles.requirementsTitle}>Password Requirements:</Text>
                            <Text style={resetStyles.requirementItem}>• At least 8 characters long</Text>
                            <Text style={resetStyles.requirementItem}>• Contains uppercase and lowercase letters</Text>
                            <Text style={resetStyles.requirementItem}>• Contains at least one number</Text>
                        </View>
                    </View>

                    <View style={resetStyles.resetButton}>
                        <Button
                            title="Reset Password"
                            onPress={handleResetPassword}
                            loading={loading}
                            disabled={!password || !confirmPassword}
                        />
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const resetStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary[100],
    },
    backButton: {
        marginTop: 60,
        marginLeft: theme.spacing.xl,
        padding: theme.spacing.sm,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing['3xl'],
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary[300],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontSize: theme.typography.sizes['5xl'],
        fontWeight: theme.typography.weights.bold,
        textAlign: 'center',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        fontFamily: theme.typography.fonts.primary,
    },
    subtitle: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: theme.typography.fonts.primary,
    },
    formContainer: {
        marginBottom: theme.spacing.xl,
    },
    passwordRequirements: {
        marginTop: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: 8,
    },
    requirementsTitle: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
        fontFamily: theme.typography.fonts.primary,
    },
    requirementItem: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
        marginBottom: 2,
        fontFamily: theme.typography.fonts.primary,
    },
    resetButton: {
        marginTop: theme.spacing.xl,
    },
});