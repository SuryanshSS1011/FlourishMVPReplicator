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
import { getPreLoginImageSource } from '../../src/lib/utils/imageManager';

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
                    source={getPreLoginImageSource('login-page-1')}
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

                    <TouchableOpacity style={styles.googleButton} onPress={handleGooglePress}>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 50,
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    buttonContainer: {
        width: '90%',
        alignItems: 'center',
        marginBottom: 50,
    },
    authButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    authButton: {
        flex: 1,
        marginHorizontal: 10,
    },
    googleButton: {
        backgroundColor: theme.colors.background.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    googleButtonText: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});