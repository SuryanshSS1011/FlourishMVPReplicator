import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/_layout';

const { width, height } = Dimensions.get('window');

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Onboarding Page Component for individual screens
const OnboardingPage = ({
    title,
    description,
    imagePath,
    backgroundColor = "#DEDED0",
    accentColor = "#164432"
}: {
    title: string;
    description: string;
    imagePath: any;
    backgroundColor?: string;
    accentColor?: string;
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

// Pagination Component
const Pagination = ({ activeIndex, length, accentColor = "#164432" }: { activeIndex: number; length: number; accentColor?: string }) => {
    return (
        <View style={styles.paginationContainer}>
            {Array.from({ length }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        {
                            backgroundColor: activeIndex === index ? accentColor : "#78A88A",
                            borderColor: activeIndex === index ? accentColor : "#78A88A",
                        },
                    ]}
                />
            ))}
        </View>
    );
};

// Main Onboarding Component
const Onboarding = () => {
    const navigation = useNavigation<OnboardingScreenNavigationProp>();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleNext = () => {
        if (activeIndex < 2) {
            setActiveIndex(activeIndex + 1);
            scrollViewRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
        } 
        // Uncomment this when the RegisterScreen is available
/*      
        else {
            
            // Navigate to Register Screen
            navigation.navigate('RegisterScreen');
        }        
*/
    };

    const handleBack = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
            scrollViewRef.current?.scrollTo({ x: width * (activeIndex - 1), animated: true });
        }
    };

// Uncomment this when the RegisterScreen is available
    const handleSkip = () => {
//        navigation.navigate('RegisterScreen');
    };

    const onboardingData = [
        {
            title: "Personalized Wellness Journey",
            description: "Select wellness areas to focus on, and Flourish will create a personalized path to help you grow holistically.",
            imagePath: require('@/assets/images/onboarding1.png'),
            backgroundColor: "#DEDED0",
            accentColor: "#164432",
        },
        {
            title: "Plant-Based Progress Tracking",
            description: "Complete wellness tasks to earn Water Droplets, nurturing a virtual plant as you track your progress.",
            imagePath: require('@/assets/images/onboarding2.png'),
            backgroundColor: "#DEDED0",
            accentColor: "#164432",
        },
        {
            title: "Rewards and Customization",
            description: "Use Leaf currency to personalize your plants and create a space that reflects your journey.",
            imagePath: require('@/assets/images/onboarding3.png'),
            backgroundColor: "#DEDED0",
            accentColor: "#164432",
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
                        backgroundColor={item.backgroundColor}
                        accentColor={item.accentColor}
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

                <Pagination
                    activeIndex={activeIndex}
                    length={onboardingData.length}
                    accentColor={onboardingData[activeIndex].accentColor}
                />

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: "#2B8761" }]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {activeIndex === 2 ? "Get Started" : "Next"}
                    </Text>
                    {activeIndex < 2 && (
                        <Image
                            source={require('@/assets/images/arrow-right.png')}
                            style={styles.arrowIcon}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {activeIndex > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
        backgroundColor: '#DEDED0',
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
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#504D4D',
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
        tintColor: '#164432',
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: '#164432',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Ubuntu',
    },
    emptySpace: {
        width: 50,
    },
});

export default Onboarding;