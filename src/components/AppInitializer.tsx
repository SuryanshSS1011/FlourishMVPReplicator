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
            // Only load fonts that actually exist
            // Comment out fonts that don't exist in your assets folder
            const fontsToLoad: any = {};
            
            // Check if these font files exist in assets/fonts/
            try {
                fontsToLoad['Roboto-Light'] = require('../../assets/fonts/Roboto-Light.ttf');
            } catch {}
            try {
                fontsToLoad['Roboto-Regular'] = require('../../assets/fonts/Roboto-Regular.ttf');
            } catch {}
            try {
                fontsToLoad['Roboto-Medium'] = require('../../assets/fonts/Roboto-Medium.ttf');
            } catch {}
            try {
                fontsToLoad['Roboto-Bold'] = require('../../assets/fonts/Roboto-Bold.ttf');
            } catch {}
            try {
                fontsToLoad['Ubuntu-Regular'] = require('../../assets/fonts/Ubuntu-Regular.ttf');
            } catch {}
            try {
                fontsToLoad['Ubuntu-Bold'] = require('../../assets/fonts/Ubuntu-Bold.ttf');
            } catch {}
            try {
                fontsToLoad['SpaceMono-Regular'] = require('../../assets/fonts/SpaceMono-Regular.ttf');
            } catch {}

            if (Object.keys(fontsToLoad).length > 0) {
                await Font.loadAsync(fontsToLoad);
            }
        } catch (error) {
            console.warn('Font loading error:', error);
            // Don't fail initialization for font errors
        }
    };

    const initializeApp = useCallback(async () => {
        try {
            console.log('Starting app initialization...');
            
            // 1. Load fonts (with better error handling)
            console.log('Loading fonts...');
            await loadFonts();

            // 2. Initialize Appwrite (with fallback)
            console.log('Initializing Appwrite...');
            try {
                const appwriteResult = await appwriteService.initialize();
                if (!appwriteResult.success && appwriteResult.error) {
                    // Check if it's a critical error
                    if (appwriteResult.error.includes('Missing required configuration')) {
                        console.error('Appwrite configuration missing');
                        // Continue without Appwrite for development
                        if (__DEV__) {
                            console.warn('Running in development mode without Appwrite');
                        } else {
                            throw new Error(appwriteResult.error);
                        }
                    }
                    console.log('Appwrite init message:', appwriteResult.error);
                }
            } catch (appwriteError) {
                console.error('Appwrite initialization error:', appwriteError);
                // In development, continue without Appwrite
                if (!__DEV__) {
                    throw appwriteError;
                }
            }

            // 3. Initialize auth store
            console.log('Initializing auth store...');
            await initialize();

            // 4. Request notification permissions (don't fail if denied)
            console.log('Setting up notifications...');
            try {
                await notificationService.requestPermissions();
                notificationService.setupNotificationHandlers();
            } catch (notifError) {
                console.warn('Notification setup error:', notifError);
            }

            // 5. Health check (optional)
            if (process.env.NODE_ENV === 'development') {
                try {
                    const healthCheck = await appwriteService.healthCheck();
                    console.log('Appwrite health check:', healthCheck);
                } catch (healthError) {
                    console.warn('Health check failed:', healthError);
                }
            }

            console.log('App initialization complete');
            setIsReady(true);
        } catch (error: any) {
            console.error('App initialization error:', error);
            setInitError(error.message || 'Failed to initialize app');
            setIsReady(true); // Still set ready to show error screen
        } finally {
            // Hide splash screen
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn('Error hiding splash screen:', e);
            }
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
                {__DEV__ && (
                    <View style={styles.debugInfo}>
                        <Text style={styles.debugTitle}>Debug Info:</Text>
                        <Text style={styles.debugText}>
                            1. Check if environment variables are set in .env file
                        </Text>
                        <Text style={styles.debugText}>
                            2. Ensure Appwrite is configured properly
                        </Text>
                        <Text style={styles.debugText}>
                            3. Check console for detailed error logs
                        </Text>
                    </View>
                )}
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
    debugInfo: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    debugText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
});