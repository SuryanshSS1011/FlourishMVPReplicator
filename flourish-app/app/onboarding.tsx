import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView
} from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Brand colors
const Colors = {
    primary: {
        darkGreen: '#164432',
        lightGreen: '#B3CCA4',
        mediumGreen: '#78A88A',
    },
    background: {
        cream: '#DEDED0',
    },
    accent: {
        mediumGreen: '#2B8761',
    },
    text: {
        primary: '#164432',
        secondary: '#504D4D',
    },
    secondary: {
        lightGreen: '#78A88A',
    },
};

interface OnboardingPageProps {
    title: string;
    description: string;
    imagePath: any;
    backgroundColor?: string;
    accentColor?: string;
}

interface PaginationProps {
    activeIndex: number;
    length: number;
    accentColor?: string;
}

// Onboarding data configuration
const ONBOARDING_DATA = [
    {
        title: "Personalized Wellness Journey",
        description: "Select wellness areas to focus on, and Flourish will create a personalized path to help you grow holistically.",
        imagePath: require('@/assets/images/onboarding1.png'), // Use your existing image names
        backgroundColor: Colors.background.cream,
        accentColor: Colors.primary.darkGreen,
    },
    {
        title: "Plant-Based Progress Tracking",
        description: "Complete wellness tasks to earn Water Droplets, nurturing a virtual plant as you track your progress.",
        imagePath: require('@/assets/images/onboarding2.png'), // Use your existing image names
        backgroundColor: Colors.background.cream,
        accentColor: Colors.primary.darkGreen,
    },
    {
        title: "Rewards and Customization",
        description: "Use Leaf currency to personalize your plants and create a space that reflects your journey.",
        imagePath: require('@/assets/images/onboarding3.png'), // Use your existing image names
        backgroundColor: Colors.background.cream,
        accentColor: Colors.primary.darkGreen,
    },
] as const;

// Individual onboarding page component
const OnboardingPage: React.FC<OnboardingPageProps> = ({
    title,
    description,
    imagePath,
    backgroundColor = Colors.background.cream,
}) => {
    return (
        <View style={[styles.page, { backgroundColor }]}>
            <View style={styles.imageContainer}>
                <Image
                    source={imagePath}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
};

// Pagination dots component
const Pagination: React.FC<PaginationProps> = ({
    activeIndex,
    length,
    accentColor = Colors.primary.darkGreen
}) => {
    return (
        <View style={styles.paginationContainer}>
            {Array.from({ length }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        {
                            backgroundColor: activeIndex === index ? accentColor : Colors.secondary.lightGreen,
                            borderColor: activeIndex === index ? accentColor : Colors.secondary.lightGreen,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

// Main onboarding component
const OnboardingScreen: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleNext = () => {
        if (activeIndex < ONBOARDING_DATA.length - 1) {
            const nextIndex = activeIndex + 1;
            setActiveIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
                x: width * nextIndex,
                animated: true
            });
        } else {
            // Navigate to next screen - for now just go to tabs
            router.push('/(tabs)');
        }
    };

    const handleBack = () => {
        if (activeIndex > 0) {
            const prevIndex = activeIndex - 1;
            setActiveIndex(prevIndex);
            scrollViewRef.current?.scrollTo({
                x: width * prevIndex,
                animated: true
            });
        }
    };

    const handleSkip = () => {
        // Navigate to next screen - for now just go to tabs
        router.push('/(tabs)');
    };

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / width);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    };

    const isLastPage = activeIndex === ONBOARDING_DATA.length - 1;

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
                {ONBOARDING_DATA.map((item, index) => (
                    <OnboardingPage
                        key={index}
                        title={item.title}
                        description={item.description}
                        imagePath={item.imagePath}
                        backgroundColor={item.backgroundColor}
                        accentColor={item.accentColor}
                    />
                ))}
            </ScrollView>

            {/* Footer with navigation controls */}
            <View style={styles.footer}>
                {/* Skip button (hidden on last page) */}
                {!isLastPage ? (
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSkip}
                        accessibilityLabel="Skip onboarding"
                        accessibilityRole="button"
                    >
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.emptySpace} />
                )}

                {/* Pagination dots */}
                <Pagination
                    activeIndex={activeIndex}
                    length={ONBOARDING_DATA.length}
                    accentColor={ONBOARDING_DATA[activeIndex].accentColor}
                />

                {/* Next/Get Started button */}
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: Colors.accent.mediumGreen }]}
                    onPress={handleNext}
                    accessibilityLabel={isLastPage ? "Get started" : "Next page"}
                    accessibilityRole="button"
                >
                    <Text style={styles.nextButtonText}>
                        {isLastPage ? "Get Started" : "Next"}
                    </Text>
                    {!isLastPage && (
                        <Image
                            source={require('@/assets/images/arrow-right.png')}
                            style={styles.arrowIcon}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Back button (shown after first page) */}
            {activeIndex > 0 && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Image
                        source={require('@/assets/images/arrow-left.png')}
                        style={styles.backArrowIcon}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.cream,
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
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Roboto',
        color: Colors.text.primary,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: Colors.text.secondary,
        fontFamily: 'Roboto',
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
        borderWidth: 1,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Ubuntu',
    },
    arrowIcon: {
        width: 16,
        height: 16,
        marginLeft: 8,
        tintColor: 'white',
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
        tintColor: Colors.primary.darkGreen,
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: Colors.primary.darkGreen,
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Ubuntu',
    },
    emptySpace: {
        width: 50,
    },
});

export default OnboardingScreen;