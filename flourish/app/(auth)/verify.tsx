// app/(auth)/verify.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../src/styles';
import { Button } from '../../src/components/ui';

export default function VerifyScreen() {
    const { email, type } = useLocalSearchParams<{
        email?: string;
        type?: 'email' | 'phone';
    }>();

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (newCode.every(digit => digit !== '') && text) {
            Keyboard.dismiss();
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (verificationCode?: string) => {
        const codeToVerify = verificationCode || code.join('');

        if (codeToVerify.length !== 6) {
            Alert.alert('Error', 'Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement actual verification logic here
            // This would typically call your authentication service
            console.log('Verifying code:', codeToVerify);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // For demo purposes, accept any 6-digit code
            Alert.alert(
                'Verification Successful',
                'Your account has been verified successfully!',
                [
                    {
                        text: 'Continue',
                        onPress: () => router.replace('/(app)/(tabs)/dashboard'),
                    },
                ]
            );
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) {
            return;
        }

        setResendLoading(true);
        try {
            // TODO: Implement resend logic here
            console.log('Resending verification code to:', email);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reset timer
            setTimeLeft(60);
            setCanResend(false);

            Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to resend code');
        } finally {
            setResendLoading(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={verifyStyles.container}>
                <TouchableOpacity
                    style={verifyStyles.backButton}
                    onPress={() => router.back()}
                >
                    <Feather size={24} name="arrow-left" color={theme.colors.text.primary} />
                </TouchableOpacity>

                <View style={verifyStyles.contentContainer}>
                    <View style={verifyStyles.headerContainer}>
                        <View style={verifyStyles.iconContainer}>
                            <Feather
                                name={type === 'phone' ? 'smartphone' : 'mail'}
                                size={32}
                                color={theme.colors.primary[700]}
                            />
                        </View>

                        <Text style={verifyStyles.title}>Verify Your {type === 'phone' ? 'Phone' : 'Email'}</Text>
                        <Text style={verifyStyles.subtitle}>
                            We&apos;ve sent a 6-digit verification code to:
                        </Text>
                        <Text style={verifyStyles.contactText}>{email || 'your email'}</Text>
                    </View>

                    <View style={verifyStyles.codeContainer}>
                        <Text style={verifyStyles.codeLabel}>Enter verification code</Text>
                        <View style={verifyStyles.codeInputContainer}>
                            {code.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[
                                        verifyStyles.codeInput,
                                        digit && verifyStyles.codeInputFilled,
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text.replace(/[^0-9]/g, ''), index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    textAlign="center"
                                    selectTextOnFocus
                                />
                            ))}
                        </View>
                    </View>

                    <View style={verifyStyles.resendContainer}>
                        {canResend ? (
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={resendLoading}
                                style={verifyStyles.resendButton}
                            >
                                <Text style={verifyStyles.resendButtonText}>
                                    {resendLoading ? 'Sending...' : 'Resend Code'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={verifyStyles.timerText}>
                                Resend code in {formatTime(timeLeft)}
                            </Text>
                        )}
                    </View>

                    <View style={verifyStyles.verifyButton}>
                        <Button
                            title="Verify"
                            onPress={() => handleVerify()}
                            loading={loading}
                            disabled={code.some(digit => !digit)}
                        />
                    </View>

                    <TouchableOpacity
                        style={verifyStyles.changeEmailContainer}
                        onPress={() => router.back()}
                    >
                        <Text style={verifyStyles.changeEmailText}>
                            Wrong email address? <Text style={verifyStyles.changeEmailLink}>Change it</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const verifyStyles = StyleSheet.create({
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
        marginBottom: theme.spacing.sm,
        fontFamily: theme.typography.fonts.primary,
    },
    contactText: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.primary[700],
        fontFamily: theme.typography.fonts.primary,
    },
    codeContainer: {
        marginBottom: theme.spacing.xl,
    },
    codeLabel: {
        fontSize: theme.typography.sizes.base,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        fontFamily: theme.typography.fonts.primary,
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    codeInput: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 8,
        backgroundColor: theme.colors.card,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fonts.primary,
    },
    codeInputFilled: {
        borderColor: theme.colors.primary[700],
        backgroundColor: theme.colors.primary[100],
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    resendButton: {
        padding: theme.spacing.sm,
    },
    resendButtonText: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.primary[700],
        fontWeight: theme.typography.weights.semibold,
        fontFamily: theme.typography.fonts.primary,
    },
    timerText: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.primary,
    },
    verifyButton: {
        marginBottom: theme.spacing.lg,
    },
    changeEmailContainer: {
        alignItems: 'center',
    },
    changeEmailText: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.primary,
    },
    changeEmailLink: {
        color: theme.colors.primary[700],
        fontWeight: theme.typography.weights.semibold,
    },
});