// app/(auth)/oauth-callback.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../../src/lib/appwrite/auth';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/styles';
import { LoadingSpinner } from '../../src/components/ui';

export default function OAuthCallbackScreen() {
    const { userId, secret, error } = useLocalSearchParams<{
        userId?: string;
        secret?: string;
        error?: string;
    }>();

    const { checkSession } = useAuthStore();
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        handleOAuthCallback();
    }, []);

    const handleOAuthCallback = async () => {
        try {
            if (error) {
                console.error('OAuth error:', error);
                Alert.alert(
                    'Authentication Failed',
                    'There was an error during authentication. Please try again.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(auth)/login'),
                        },
                    ]
                );
                return;
            }

            if (!userId || !secret) {
                console.error('Missing OAuth parameters');
                Alert.alert(
                    'Invalid Callback',
                    'Invalid authentication callback. Please try again.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(auth)/login'),
                        },
                    ]
                );
                return;
            }

            console.log('Processing OAuth callback...');

            // Create session from OAuth callback
            const result = await authService.createOAuth2SessionFromCallback(userId, secret);

            if (result.success) {
                console.log('OAuth session created successfully');

                // Update auth store
                await checkSession();

                // Navigate to success screen or dashboard
                router.replace({
                    pathname: '/(auth)/success',
                    params: {
                        type: 'registration',
                        message: 'Welcome to Flourish! Your account has been created successfully.',
                    },
                });
            } else {
                console.error('OAuth session creation failed:', result.message);
                Alert.alert(
                    'Authentication Failed',
                    result.message || 'Failed to complete authentication',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(auth)/login'),
                        },
                    ]
                );
            }
        } catch (err: any) {
            console.error('OAuth callback error:', err);
            Alert.alert(
                'Authentication Error',
                err.message || 'An unexpected error occurred',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(auth)/login'),
                    },
                ]
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <View style={callbackStyles.container}>
            <LoadingSpinner
                message={processing ? 'Completing authentication...' : 'Redirecting...'}
                size="large"
            />
        </View>
    );
}

const callbackStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
});