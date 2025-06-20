// app/onboarding.tsx

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { router } from 'expo-router';
import { getImageSource } from '../src/lib/utils/imageManager';

const { width, height } = Dimensions.get('window');

const OnboardingPage = ({
    title,
    description,
    imagePath,
    backgroundColor = '#E8F5E9',
}: {
    title: string;
    description: string;
    imagePath: { uri: string } | null;
    backgroundColor?: string;
}) => {
    return (
        <View style={[styles.page, { backgroundColor }]}>
            <View style={styles.imageContainer}>
                {imagePath && <Image source={imagePath} style={styles.image} resizeMode="contain" />}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
};

const Pagination = ({ activeIndex, length }: { activeIndex: number; length: number }) => {
    return (
        <View style={styles.paginationContainer}>
            {Array.from({ length }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        {
                            backgroundColor: activeIndex === index ? '#4CAF50' : '#9E9E9E',
                        },
                    ]}
                />
            ))}
        </View>
    );
};

export default function Onboarding() {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const [images, setImages] = useState<({ uri: string } | null)[]>([null, null, null]);
    const [arrowImages, setArrowImages] = useState<{ right: { uri: string } | null; left: { uri: string } | null }>({ right: null, left: null });

    const handleNext = () => {
        if (activeIndex < 2) {
            setActiveIndex(activeIndex + 1);
            scrollViewRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
        } else {
            router.push('/(auth)/register');
        }
    };

    const handleBack = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
            scrollViewRef.current?.scrollTo({ x: width * (activeIndex - 1), animated: true });
        }
    };

    const handleSkip = () => {
        router.push('/(auth)/register');
    };

    const onboardingData = [
        {
            title: "Personalized Wellness Journey",
            description: "Select wellness areas to focus on, and Flourish will create a personalized path to help you grow holistically.",
            imageName: 'onboarding1',
        },
        {
            title: "Plant-Based Progress Tracking",
            description: "Complete wellness tasks to earn Water Droplets, nurturing a virtual plant as you track your progress.",
            imageName: 'onboarding2',
        },
        {
            title: "Rewards and Customization",
            description: "Use Leaf currency to personalize your plants and create a space that reflects your journey.",
            imageName: 'onboarding3',
        },
    ];

    useEffect(() => {
        const loadImages = async () => {
            try {
                const imagePromises = onboardingData.map(async (item) => {
                    try {
                        return await getImageSource(item.imageName);
                    } catch {
                        return null;
                    }
                });
                const loadedImages = await Promise.all(imagePromises);
                setImages(loadedImages);

                // Load arrow images
                const [rightArrow, leftArrow] = await Promise.all([
                    getImageSource('arrow-right').catch(() => null),
                    getImageSource('arrow-left').catch(() => null),
                ]);
                setArrowImages({ right: rightArrow, left: leftArrow });
            } catch (error) {
                console.error('Error loading onboarding images:', error);
            }
        };

        loadImages();
    }, []); // onboardingData is constant, no need to include in deps

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / width);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
            >
                {onboardingData.map((item, index) => (
                    <OnboardingPage
                        key={index}
                        title={item.title}
                        description={item.description}
                        imagePath={images[index]}
                    />
                ))}
            </ScrollView>

            <View style={styles.footer}>
                {activeIndex < 2 ? (
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.emptySpace} />
                )}

                <Pagination activeIndex={activeIndex} length={onboardingData.length} />

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: '#4CAF50' }]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {activeIndex === 2 ? "Get Started" : "Next"}
                    </Text>
                    {activeIndex < 2 && arrowImages.right && (
                        <Image
                            source={arrowImages.right}
                            style={styles.arrowIcon}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {activeIndex > 0 && arrowImages.left && (
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Image
                        source={arrowImages.left}
                        style={styles.backArrowIcon}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    page: {
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    image: {
        width: width * 0.8,
        height: height * 0.45,
    },
    textContainer: {
        marginBottom: 60,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Roboto',
        color: '#333333',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666666',
        fontFamily: 'PlusJakartaSans-Regular',
        fontWeight: '500',
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Roboto',
    },
    arrowIcon: {
        width: 16,
        height: 16,
        marginLeft: 8,
        tintColor: '#FFF',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        bottom: 50,
        padding: 10,
    },
    backArrowIcon: {
        width: 16,
        height: 16,
        tintColor: '#4CAF50',
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Roboto',
    },
    emptySpace: {
        width: 50,
    },
});

