// app/(auth)/forgot-password.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authService } from '../../src/lib/appwrite/auth';
import { theme } from '../../src/styles';
import { Input, Button } from '../../src/components/ui';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendInstructions = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const result = await authService.sendPasswordRecovery(email);

            if (result.success) {
                setEmailSent(true);
                Alert.alert(
                    'Email Sent!',
                    'Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.push('/(auth)/login')
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to send reset instructions');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to send reset instructions');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = () => {
        setEmailSent(false);
        handleSendInstructions();
    };

    if (emailSent) {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather size={24} name="arrow-left" color={theme.colors.text.primary} />
                </TouchableOpacity>

                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Feather name="mail" size={48} color={theme.colors.primary[700]} />
                    </View>

                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successMessage}>
                        We&apos;ve sent password reset instructions to:
                    </Text>
                    <Text style={styles.emailText}>{email}</Text>

                    <Text style={styles.instructionText}>
                        Click the link in the email to reset your password. If you don&apos;t see the email, check your spam folder.
                    </Text>

                    <Button
                        title="Resend Email"
                        onPress={handleResendEmail}
                        variant="outline"
                    />

                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather size={24} name="arrow-left" color={theme.colors.text.primary} />
                </TouchableOpacity>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        No worries! Enter your email address below and we will send you a code to reset your password.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Email Address"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.sendButton}>
                        <Button
                            title="Send Reset Instructions"
                            onPress={handleSendInstructions}
                            loading={loading}
                            disabled={!email.trim()}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.backToLoginContainer}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.backToLoginText}>
                            Remember your password? <Text style={styles.loginLink}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
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
        paddingTop: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.sizes['6xl'],
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
        marginBottom: theme.spacing['3xl'],
        lineHeight: 24,
        fontFamily: theme.typography.fonts.primary,
    },
    inputContainer: {
        marginBottom: theme.spacing.xl,
    },
    sendButton: {
        marginBottom: theme.spacing.xl,
    },
    backToLoginContainer: {
        alignItems: 'center',
    },
    backToLoginText: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.primary,
    },
    loginLink: {
        color: theme.colors.primary[700],
        fontWeight: theme.typography.weights.semibold,
    },
    // Success state styles
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary[300],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    successTitle: {
        fontSize: theme.typography.sizes['4xl'],
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        fontFamily: theme.typography.fonts.primary,
    },
    successMessage: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
        fontFamily: theme.typography.fonts.primary,
    },
    emailText: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.primary[700],
        marginBottom: theme.spacing.lg,
        fontFamily: theme.typography.fonts.primary,
    },
    instructionText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: theme.spacing.xl,
        fontFamily: theme.typography.fonts.primary,
    },
    resendButton: {
        marginBottom: theme.spacing.lg,
    },
});