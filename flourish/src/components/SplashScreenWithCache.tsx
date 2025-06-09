// src/components/SplashScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Animated,
    Image,
    Text,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSplashImages } from '../hooks/useSplashImages';
import { theme } from '../styles/colors';

const { width, height } = Dimensions.get('window');

const SPLASH_IMAGE_IDS = [
    'splash1',
    'splash2',
    'splash3',
    'splash4',
    'splash5',
    'splash6',
];

const FALLBACK_IMAGES = {
    splash1: require('../../assets/images/splash1.png'),
    splash2: require('../../assets/images/splash2.png'),
    splash3: require('../../assets/images/splash3.png'),
    splash4: require('../../assets/images/splash4.png'),
    splash5: require('../../assets/images/splash5.png'),
    splash6: require('../../assets/images/splash6.png'),
};

interface SplashScreenWithCacheProps {
    onComplete?: () => void;
    skipAnimation?: boolean;
    showProgress?: boolean;
}

export const SplashScreenWithCache: React.FC<SplashScreenWithCacheProps> = ({
    onComplete,
    skipAnimation = false,
    showProgress = false,
}) => {
    const { images, loading, error, progress } = useSplashImages(SPLASH_IMAGE_IDS);
    const [animationStarted, setAnimationStarted] = useState(false);

    const imageOpacities = useRef(
        SPLASH_IMAGE_IDS.map((_, index) =>
            new Animated.Value(index === 0 ? 1 : 0)
        )
    ).current;

    const animationTimings = [
        { delay: 300, duration: 300 },
        { delay: 300, duration: 800 },
        { delay: 300, duration: 800 },
        { delay: 300, duration: 600 },
        { delay: 800, duration: 300 },
    ];

    useEffect(() => {
        if (!loading && !animationStarted && images.length > 0) {
            if (skipAnimation) {
                handleAnimationComplete();
                return;
            }

            setAnimationStarted(true);
            startAnimations();
        }
    }, [loading, animationStarted, images, skipAnimation]);

    const startAnimations = () => {
        const createTransition = (fromIndex: number, toIndex: number, timing: any) => {
            return Animated.sequence([
                Animated.delay(timing.delay),
                Animated.parallel([
                    Animated.timing(imageOpacities[fromIndex], {
                        toValue: 0,
                        duration: timing.duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(imageOpacities[toIndex], {
                        toValue: 1,
                        duration: timing.duration,
                        useNativeDriver: true,
                    }),
                ]),
            ]);
        };

        const transitions = animationTimings.map((timing, index) =>
            createTransition(index, index + 1, timing)
        );

        Animated.sequence(transitions).start(({ finished }) => {
            if (finished) {
                handleAnimationComplete();
            }
        });
    };

    const handleAnimationComplete = () => {
        if (onComplete) {
            onComplete();
        } else {
            setTimeout(() => {
                router.replace('/');
            }, 300);
        }
    };

    const getImageSource = (index: number) => {
        const imageUri = images[index];
        const fallbackKey = SPLASH_IMAGE_IDS[index] as keyof typeof FALLBACK_IMAGES;

        if (imageUri && !error) {
            // Check if it's a local file path or remote URL
            if (imageUri.startsWith('file://') || imageUri.startsWith('/')) {
                return { uri: imageUri };
            }
            return { uri: imageUri };
        }

        return FALLBACK_IMAGES[fallbackKey] || FALLBACK_IMAGES.splash1;
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={theme.colors.text.inverse}
                />
                {showProgress && (
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                            Loading... {Math.round(progress)}%
                        </Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progress}%` }
                                ]}
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    }

    // Error state with fallback
    if (error && images.length === 0) {
        return (
            <View style={styles.container}>
                {SPLASH_IMAGE_IDS.map((_, index) => (
                    <Animated.View
                        key={`fallback-${index}`}
                        style={[
                            styles.imageContainer,
                            { opacity: imageOpacities[index] }
                        ]}
                    >
                        <Image
                            source={getImageSource(index)}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </Animated.View>
                ))}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {SPLASH_IMAGE_IDS.map((_, index) => (
                <Animated.View
                    key={`splash-${index}`}
                    style={[
                        styles.imageContainer,
                        {
                            opacity: imageOpacities[index],
                            zIndex: SPLASH_IMAGE_IDS.length - index,
                        }
                    ]}
                >
                    <Image
                        source={getImageSource(index)}
                        style={styles.image}
                        resizeMode="contain"
                        onError={(error) => {
                            console.warn(`Error loading splash image ${index}:`, error.nativeEvent.error);
                        }}
                    />
                </Animated.View>
            ))}

            {/* Debug overlay in development */}
            {__DEV__ && (
                <View style={styles.debugContainer}>
                    <Text style={styles.debugText}>
                        Images: {images.filter(Boolean).length}/{SPLASH_IMAGE_IDS.length}
                    </Text>
                    <Text style={styles.debugText}>
                        Cache: {error ? 'Error' : 'OK'}
                    </Text>
                    <Text style={styles.debugText}>
                        Progress: {Math.round(progress)}%
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary[500],
        width: '100%',
        height: '100%',
    },
    imageContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: theme.colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    progressContainer: {
        marginTop: theme.spacing.xl,
        alignItems: 'center',
        width: '80%',
    },
    progressText: {
        color: theme.colors.text.inverse,
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.primary,
        marginBottom: theme.spacing.md,
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.text.inverse,
        borderRadius: 2,
    },
    debugContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: theme.spacing.sm,
        borderRadius: 8,
    },
    debugText: {
        color: theme.colors.text.inverse,
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.primary,
    },
});

export default SplashScreenWithCache;

