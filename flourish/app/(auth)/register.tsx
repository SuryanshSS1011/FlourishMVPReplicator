
// app/(auth)/register.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '../../src/lib/appwrite/auth';
import { theme } from '../../src/styles';
import { Button } from '../../src/components/ui';

export default function RegisterScreen() {
    const handleSignupPress = () => router.push('/(auth)/signup');
    const handleLoginPress = () => router.push('/(auth)/login');

    const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
    if (!deepLink.hostname) {
        deepLink.hostname = 'localhost';
    }
    const scheme = `${deepLink.protocol}//`;

    const handleGooglePress = async () => {
        try {
            const result = await authService.createOAuth2Session('google');
            if (result.success && result.data) {
                const authResult = await WebBrowser.openAuthSessionAsync(result.data, scheme);

                if (authResult.type === 'success') {
                    const url = new URL(authResult.url);
                    const secret = url.searchParams.get('secret');
                    const userId = url.searchParams.get('userId');

                    if (userId && secret) {
                        const sessionResult = await authService.createOAuth2SessionFromCallback(userId, secret);
                        if (sessionResult.success) {
                            router.replace('/(app)/(tabs)/dashboard');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Google sign-in failed:', error);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#AEB1AE', '#4A7B56']} style={styles.gradient}>
                <Image
                    style={styles.backgroundImage}
                    source={require('../../assets/images/login-page-1.png')}
                />
                <View style={styles.buttonContainer}>
                    <View style={styles.authButtonsContainer}>
                        <View style={styles.authButton}>
                            <Button
                                title="Signup"
                                onPress={handleSignupPress}
                                variant="outline"
                            />
                        </View>
                        <View style={styles.authButton}>
                            <Button
                                title="Login"
                                onPress={handleLoginPress}
                                variant="primary"
                            />
                        </View>
                    </View>
                    <View style={styles.googleButton}>
                        <Button
                            title="Login with Google"
                            onPress={handleGooglePress}
                            variant="outline"
                        />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: '15%',
        paddingHorizontal: theme.spacing.xl,
    },
    authButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    authButton: {
        flex: 1,
        marginHorizontal: theme.spacing.xs,
    },
    googleButton: {
        width: '100%',
    },
});