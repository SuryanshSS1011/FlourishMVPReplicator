import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';


type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

// Splash animation images in sequence
const SPLASH_IMAGES = {
    1: require('@/assets/images/splash-1.png'),
    2: require('@/assets/images/splash-2.png'),
    3: require('@/assets/images/splash-3.png'),
    4: require('@/assets/images/splash-4.png'),
    5: require('@/assets/images/splash-5.png'),
    6: require('@/assets/images/splash-6.png'),
} as const;

// Animation timing configuration
const ANIMATION_TIMINGS = [
    { delay: 300, duration: 300 }, // Screen 1 to 2
    { delay: 300, duration: 800 }, // Screen 2 to 3
    { delay: 300, duration: 800 }, // Screen 3 to 4
    { delay: 300, duration: 600 }, // Screen 4 to 5 (dissolve)
    { delay: 800, duration: 300 }, // Screen 5 to 6 and navigate
] as const;

const SplashScreen: React.FC = () => {
    const navigation = useNavigation<SplashScreenNavigationProp>();

    // Create animated values for each image
    const imageOpacities = useRef([
        new Animated.Value(1), // First screen (blank green)
        new Animated.Value(0), // Circle
        new Animated.Value(0), // Circle with stem
        new Animated.Value(0), // Complete logo
        new Animated.Value(0), // Logo with text
        new Animated.Value(0), // Final screen
    ]).current;

    useEffect(() => {
        const createTransition = (
            fromIndex: number,
            toIndex: number,
            timing: { delay: number; duration: number }
        ) => {
            return Animated.sequence([
                Animated.delay(timing.delay),
                Animated.parallel([
                    // Fade out current
                    Animated.timing(imageOpacities[fromIndex], {
                        toValue: 0,
                        duration: timing.duration,
                        useNativeDriver: true,
                    }),
                    // Fade in next
                    Animated.timing(imageOpacities[toIndex], {
                        toValue: 1,
                        duration: timing.duration,
                        useNativeDriver: true,
                    }),
                ]),
            ]);
        };

        // Create all transitions
        const transitions = ANIMATION_TIMINGS.map((timing, index) =>
            createTransition(index, index + 1, timing)
        );

        // Run animations in sequence
        Animated.sequence(transitions).start(() => {
            // Navigate to onboarding after animation completes
            setTimeout(() => {
                navigation.navigate('OnboardingScreen');
            }, 300);
        });
    }, [navigation, imageOpacities]);

    return (
        <View style={styles.container}>
            {/* Layer each image with animated opacity */}
            {Object.entries(SPLASH_IMAGES).map(([key, image], index) => (
                <Animated.View
                    key={key}
                    style={[
                        styles.imageContainer,
                        { opacity: imageOpacities[index] }
                    ]}
                >
                    <Image
                        source={image}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </Animated.View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#8BA89A',
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
});

export default SplashScreen;