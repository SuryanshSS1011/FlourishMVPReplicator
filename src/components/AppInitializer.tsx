// src/components/AppInitializer.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useAuthStore } from '../store/authStore';
import { appwriteService } from '../lib/appwrite/config';
import { notificationService } from '../lib/services/notificationService';
import { imageManager } from '../lib/utils/imageManager';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

interface AppInitializerProps {
    children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const { initialize } = useAuthStore();

    const initializeApp = useCallback(async () => {
        try {
            // 1. Load fonts
            await loadFonts();

            // 2. Initialize Appwrite
            const appwriteResult = await appwriteService.initialize();
            if (!appwriteResult.success) {
                console.error('Failed to initialize Appwrite:', appwriteResult.error);
            }

            // 3. Initialize auth store
            await initialize();

            // 4. Request notification permissions
            await notificationService.requestPermissions();
            notificationService.setupNotificationHandlers();

            // 5. Preload critical images
            await preloadImages();

            // 6. Hide splash screen
            await SplashScreen.hideAsync();

            setIsReady(true);
        } catch (error) {
            console.error('App initialization error:', error);
            // Still hide splash screen even if there's an error
            await SplashScreen.hideAsync();
            setIsReady(true);
        }
    }, [initialize]);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    const loadFonts = async () => {
        await Font.loadAsync({
            'Roboto': require('../../assets/fonts/Roboto-Regular.ttf'),
            'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
        });
    };

    const preloadImages = async () => {
        // Preload critical images
        const criticalImages = [
            'flourish-logo',
            'home-icon',
            'garden',
            'shop',
            'encyclopedia',
        ];

        try {
            await imageManager.preloadImages(criticalImages);
        } catch (error) {
            console.error('Error preloading images:', error);
        }
    };

    if (!isReady) {
        return (
            <View style={styles.container}>
                <LoadingSpinner message="Initializing..." />
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
});