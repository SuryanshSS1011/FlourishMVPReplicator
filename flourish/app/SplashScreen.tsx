import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/_layout';
import { storage } from '@/lib/appwrite';

const { width, height } = Dimensions.get('window');

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

const splashImageIds = ['splash 1', 'splash 2', 'splash 3', 'splash 4', 'splash 5', 'splash 6']; // file IDs in Appwrite

const SplashScreen = () => {
    const navigation = useNavigation<SplashScreenNavigationProp>();
    const [splashImageUrls, setSplashImageUrls] = useState<(string | null)[]>([]);

    const imageOpacity1 = useRef(new Animated.Value(1));
    const imageOpacity2 = useRef(new Animated.Value(0));
    const imageOpacity3 = useRef(new Animated.Value(0));
    const imageOpacity4 = useRef(new Animated.Value(0));
    const imageOpacity5 = useRef(new Animated.Value(0));
    const imageOpacity6 = useRef(new Animated.Value(0));

    const imageOpacities = useMemo(() => [
        imageOpacity1.current,
        imageOpacity2.current,
        imageOpacity3.current,
        imageOpacity4.current,
        imageOpacity5.current,
        imageOpacity6.current,
    ], []);

    useEffect(() => {
        const fetchImageUrls = async () => {
            try {
                const urls = await Promise.all(
                    splashImageIds.map((id) =>
                        storage.getFilePreview('pre_login', id).href
                    )
                );
                setSplashImageUrls(urls);
            } catch (err) {
                console.error('Error fetching splash images:', err);
            }
        };

        fetchImageUrls();
    }, []);

    useEffect(() => {
        if (splashImageUrls.length !== splashImageIds.length) {
            return;
        }

        const timings = [
            { delay: 300, duration: 300 },
            { delay: 300, duration: 800 },
            { delay: 300, duration: 800 },
            { delay: 300, duration: 600 },
            { delay: 800, duration: 300 },
        ];

        const createTransition = (fromIndex: number, toIndex: number, timing: { delay: number; duration: number }) => {
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

        const transitions = timings.map((timing, index) =>
            createTransition(index, index + 1, timing)
        );

        Animated.sequence(transitions).start(() => {
            setTimeout(() => {
                navigation.navigate('OnboardingScreen');
            }, 300);
        });
    }, [splashImageUrls, imageOpacities, navigation]);

    return (
        <View style={styles.container}>
            {splashImageUrls.map((url, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.imageContainer,
                        { opacity: imageOpacities[index] },
                    ]}
                >
                    {url && (
                        <Image
                            source={{ uri: url }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    )}
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