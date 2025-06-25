// src/components/AppInitializer.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useAuthStore } from '../store/authStore';
import { appwriteService } from '../lib/appwrite/config';
import { notificationService } from '../lib/services/notificationService';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(console.warn);

interface AppInitializerProps {
    children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);
    const { initialize } = useAuthStore();

    const loadFonts = async () => {
        try {
            await Font.loadAsync({
                // Roboto font family
                'Roboto-Light': require('../../assets/fonts/Roboto-Light.ttf'),
                'Roboto-Regular': require('../../assets/fonts/Roboto-Regular.ttf'),
                'Roboto-Medium': require('../../assets/fonts/Roboto-Medium.ttf'),
                'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
                
                // Other existing fonts
                'Ubuntu-Regular': require('../../assets/fonts/Ubuntu-Regular.ttf'),
                'Ubuntu-Bold': require('../../assets/fonts/Ubuntu-Bold.ttf'),
                'SpaceMono-Regular': require('../../assets/fonts/SpaceMono-Regular.ttf'),
            });
        } catch (error) {
            console.warn('Font loading error:', error);
            // Don't fail initialization for font errors
        }
    };

    const initializeApp = useCallback(async () => {
        try {
            // 1. Load fonts
            await loadFonts();

            // 2. Initialize Appwrite
            const appwriteResult = await appwriteService.initialize();
            if (!appwriteResult.success && appwriteResult.error) {
                // Check if it's a critical error
                if (appwriteResult.error.includes('Missing required configuration')) {
                    throw new Error(appwriteResult.error);
                }
                // Non-critical errors (like no session) are fine
                console.log('Appwrite init message:', appwriteResult.error);
            }

            // 3. Initialize auth store
            await initialize();

            // 4. Request notification permissions (don't fail if denied)
            try {
                await notificationService.requestPermissions();
                notificationService.setupNotificationHandlers();
            } catch (notifError) {
                console.warn('Notification setup error:', notifError);
            }

            // 5. Health check (optional)
            if (process.env.NODE_ENV === 'development') {
                const healthCheck = await appwriteService.healthCheck();
                console.log('Appwrite health check:', healthCheck);
            }

            setIsReady(true);
        } catch (error: any) {
            console.error('App initialization error:', error);
            setInitError(error.message || 'Failed to initialize app');
            setIsReady(true); // Still set ready to show error screen
        } finally {
            // Hide splash screen
            await SplashScreen.hideAsync();
        }
    }, [initialize]);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    if (!isReady) {
        return (
            <View style={styles.container}>
                <LoadingSpinner message="Initializing..." />
            </View>
        );
    }

    if (initError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Initialization Error</Text>
                <Text style={styles.errorMessage}>{initError}</Text>
                <Text style={styles.errorHint}>
                    Please check your configuration and try again
                </Text>
            </View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    errorHint: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});