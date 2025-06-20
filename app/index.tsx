// app/index.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';

export default function Index() {
    const { user, initialized } = useAuthStore();

    // Wait for initialization
    if (!initialized) {
        return (
            <View style={styles.container}>
                <LoadingSpinner message="Loading..." />
            </View>
        );
    }

    // Redirect based on authentication state
    if (user) {
        // Check if onboarding is completed
        const onboardingCompleted = user.prefs?.onboardingCompleted;
        
        if (onboardingCompleted) {
            return <Redirect href="/(app)/(tabs)/dashboard" />;
        } else {
            return <Redirect href="/onboarding" />;
        }
    }

    // Not authenticated - show login
    return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
});
