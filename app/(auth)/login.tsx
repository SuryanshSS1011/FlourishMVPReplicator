// app/(auth)/login.tsx

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { OAuthProvider } from 'react-native-appwrite';
import { authService } from '../../src/lib/appwrite/auth';
import { storageService } from '../../src/lib/appwrite/storage';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/styles';

export default function LoginScreen() {
    const { login, clearError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        // Clear previous errors
        clearError();
        setEmailError('');
        setPasswordError('');

        // Validate inputs
        let hasError = false;

        if (!email.trim()) {
            setEmailError('Email is required');
            hasError = true;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            hasError = true;
        }

        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        } else if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        // Attempt login
        setLoading(true);
        try {
            const result = await login(email.trim().toLowerCase(), password);

            if (result.success) {
                // Check if onboarding is completed
                const onboardingCompleted = result.data?.prefs?.onboardingCompleted;

                if (onboardingCompleted) {
                    router.replace('/(app)/(tabs)/dashboard');
                } else {
                    router.replace('/onboarding');
                }
            }
            else if (result.message.includes('Invalid credentials') || result.message.includes('Invalid email or password')) {
                Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
            }
            else if (result.message.includes('User not found')) {
                Alert.alert('Login Failed', 'No account found with this email. Please sign up first.');
            } else {
                Alert.alert('Login Failed', result.message);
            }
        } catch {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: OAuthProvider) => {
        try {
            setLoading(true);
            const result = await authService.createOAuth2Session(provider);

            if (!result.success) {
                Alert.alert('Login Failed', result.message);
            }
        } catch {
            Alert.alert('Error', 'Failed to login with social provider');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <LinearGradient
                    colors={['#A8E6CF', '#7FD8A4']}
                    style={styles.background}
                />

                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <Image
                        source={{ uri: storageService.getFileView('preLoginAssets', 'flourish-logo') }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Sign in to continue your wellness journey</Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={theme.colors.text.secondary}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, emailError ? styles.inputError : null]}
                            placeholder="Email"
                            placeholderTextColor={theme.colors.text.secondary}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setEmailError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={theme.colors.text.secondary}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, passwordError ? styles.inputError : null]}
                            placeholder="Password"
                            placeholderTextColor={theme.colors.text.secondary}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setPasswordError('');
                            }}
                            secureTextEntry={!showPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                            disabled={loading}
                        >
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color={theme.colors.text.secondary}
                            />
                        </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => router.push('/(auth)/forgot-password')}
                        disabled={loading}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? ['#CCCCCC', '#AAAAAA'] : ['#4CAF50', '#45A049']}
                            style={styles.loginButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* OR Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialButtons}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialLogin(OAuthProvider.Google)}
                            disabled={loading}
                        >
                            <Image
                                source={{ uri: storageService.getFileView('preLoginAssets', 'google-icon') }}
                                style={styles.socialIcon}
                            />
                            <Text style={styles.socialButtonText}>Login with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialLogin(OAuthProvider.Apple)}
                            disabled={loading}
                        >
                            <Ionicons name="logo-apple" size={20} color="#000" />
                            <Text style={styles.socialButtonText}>Login with Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Don&apos;t have an account? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity disabled={loading}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    scrollContent: {
        flexGrow: 1,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    logoSection: {
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        fontFamily: theme.typography.fonts.primary,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFF',
        opacity: 0.9,
        fontFamily: theme.typography.fonts.primary,
    },
    formSection: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 40,
        marginTop: -30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fonts.primary,
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#F44336',
    },
    eyeButton: {
        padding: 8,
    },
    errorText: {
        fontSize: 12,
        color: '#F44336',
        marginBottom: 12,
        marginLeft: 4,
        fontFamily: theme.typography.fonts.primary,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: theme.colors.primary[700],
        fontFamily: theme.typography.fonts.primary,
    },
    loginButton: {
        marginBottom: 24,
        borderRadius: 25,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: 'bold',
        fontFamily: theme.typography.fonts.primary,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginHorizontal: 16,
        fontFamily: theme.typography.fonts.primary,
    },
    socialButtons: {
        marginBottom: 32,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 12,
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    socialButtonText: {
        fontSize: 16,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fonts.primary,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    signupText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.primary,
    },
    signupLink: {
        fontSize: 16,
        color: theme.colors.primary[700],
        fontFamily: theme.typography.fonts.primary,
    },
});