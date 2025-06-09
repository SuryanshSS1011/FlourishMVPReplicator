// src/components/SplashScreenManager.tsx

import React, { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SplashScreen } from './SplashScreen';
import { imageCacheManager } from '../../lib/utils/imageCache';

interface SplashScreenManagerProps {
    onComplete?: () => void;
    skipAnimation?: boolean;
    clearCacheOnBackground?: boolean;
}

export const SplashScreenManager: React.FC<SplashScreenManagerProps> = ({
    onComplete,
    skipAnimation = false,
    clearCacheOnBackground = false,
}) => {
    const [appState, setAppState] = useState(AppState.currentState);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                console.log('App has come to the foreground');
            } else if (nextAppState.match(/inactive|background/) && clearCacheOnBackground) {
                console.log('App has gone to the background, clearing cache');
                imageCacheManager.clearCache();
            }

            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [appState, clearCacheOnBackground]);

    // Show cache size in development
    useEffect(() => {
        if (__DEV__) {
            imageCacheManager.getCacheSize().then(size => {
                console.log(`Splash image cache size: ${(size / 1024 / 1024).toFixed(2)} MB`);
            });
        }
    }, []);

    return (
        <SplashScreen
            onComplete={onComplete}
            skipAnimation={skipAnimation}
            showProgress={__DEV__} // Show progress in development
        />
    );
};

export default SplashScreenManager;