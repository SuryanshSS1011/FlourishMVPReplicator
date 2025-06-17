// app/onboarding.tsx

import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../src/styles';
import { getPreLoginImageSource, getUIImageSource } from '../src/lib/utils/imageManager';

const { width, height } = Dimensions.get('window');

const OnboardingPage = ({
    title,
    description,
    imagePath,
    backgroundColor = theme.colors.primary[100],
}: {
    title: string;
    description: string;
    imagePath: any;
    backgroundColor?: string;
}) => {
    return (
        <View style={[styles.page, { backgroundColor }]}>
            <View style={styles.imageContainer}>
                <Image source={imagePath} style={styles.image} resizeMode="contain" />
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
                            backgroundColor: activeIndex === index ? theme.colors.primary[900] : theme.colors.primary[500],
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
            imagePath: getPreLoginImageSource('onboarding1'),
        },
        {
            title: "Plant-Based Progress Tracking",
            description: "Complete wellness tasks to earn Water Droplets, nurturing a virtual plant as you track your progress.",
            imagePath: getPreLoginImageSource('onboarding2'),
        },
        {
            title: "Rewards and Customization",
            description: "Use Leaf currency to personalize your plants and create a space that reflects your journey.",
            imagePath: getPreLoginImageSource('onboarding3'),
        },
    ];

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
                        imagePath={item.imagePath}
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
                    style={[styles.nextButton, { backgroundColor: theme.colors.primary[700] }]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {activeIndex === 2 ? "Get Started" : "Next"}
                    </Text>
                    {activeIndex < 2 && (
                        <Image
                            source={getUIImageSource('arrow-right')}
                            style={styles.arrowIcon}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {activeIndex > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Image
                        source={getUIImageSource('arrow-left')}
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
        backgroundColor: theme.colors.primary[100],
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
        fontSize: theme.typography.sizes['4xl'],
        fontWeight: theme.typography.weights.bold,
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: theme.typography.fonts.primary,
        color: theme.colors.text.primary,
    },
    description: {
        fontSize: theme.typography.sizes.lg,
        textAlign: 'center',
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
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
        ...theme.shadows.sm,
    },
    nextButtonText: {
        color: theme.colors.text.inverse,
        fontSize: theme.typography.sizes.base,
        fontWeight: theme.typography.weights.medium,
        fontFamily: theme.typography.fonts.secondary,
    },
    arrowIcon: {
        width: 16,
        height: 16,
        marginLeft: 8,
        tintColor: theme.colors.text.inverse,
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
        tintColor: theme.colors.primary[900],
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: theme.colors.primary[900],
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.medium,
        fontFamily: theme.typography.fonts.secondary,
    },
    emptySpace: {
        width: 50,
    },
});

