// app/(app)/premium.tsx
import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    ImageBackground,
    Text,
    TouchableOpacity,
    Platform,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaskedView from '@react-native-masked-view/masked-view';
import { theme } from '../../src/styles';
import { getPremiumImageSource, getUIImageSource } from '../../src/lib/utils/imageManager';

const { width } = Dimensions.get('window');

const GradientCheckmark = () => {
    return (
        <View style={styles.checkmarkContainer}>
            <MaskedView
                style={styles.maskedView}
                maskElement={
                    <Text
                        style={[styles.checkmarkText, { backgroundColor: 'transparent' }]}
                        allowFontScaling={false}
                    >
                        ✓
                    </Text>
                }
            >
                <LinearGradient
                    colors={['#888DBE', '#FA6FB4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBackground}
                >
                    <Text style={[styles.checkmarkText, { opacity: 0 }]} allowFontScaling={false}>
                        ✓
                    </Text>
                </LinearGradient>
            </MaskedView>
        </View>
    );
};

export default function PremiumScreen() {
    const handleSubscribePress = () => {
        // Handle subscription logic here
        console.log('Subscribe pressed');
        // For now, just go back to previous screen
        router.back();
    };

    const handleMaybeLaterPress = () => {
        router.back();
    };

    const handleRestorePress = () => {
        // Handle restore purchase logic
        console.log('Restore purchase pressed');
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerWrapper}>
                <View style={styles.headerContainer}>
                    <ImageBackground
                        source={getPremiumImageSource('premium-background')}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['rgba(104, 161, 161, 0.8)', 'rgba(179, 204, 164, 0.8)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.gradientOverlay}
                        >
                            <View style={styles.headerContent}>
                                <Image
                                    source={getPremiumImageSource('leafff')}
                                    style={styles.headerImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.title} allowFontScaling={false}>
                                    Flourish Premium
                                </Text>
                            </View>
                        </LinearGradient>
                    </ImageBackground>
                    <LinearGradient
                        colors={['#888DBE', '#FA6FB4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.line}
                    />
                </View>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle} allowFontScaling={false}>
                    Benefits
                </Text>
                {[
                    "Get exclusive plant only available to premium users",
                    "Get extra Seeds and Fertilizer every month",
                    "Unlock premium customization",
                    "Early access to events and items",
                    "Ad-Free",
                ].map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                        <GradientCheckmark />
                        <Text style={styles.benefitText} allowFontScaling={false}>
                            {benefit}
                        </Text>
                    </View>
                ))}

                {/* Welcome Plant Section */}
                <View style={styles.welcomeHeaderWrapper}>
                    <View style={styles.welcomeHeaderContainer}>
                        <ImageBackground
                            source={getPremiumImageSource('premium-background')}
                            style={styles.welcomeBackgroundImage}
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={['rgba(104, 161, 161, 0.8)', 'rgba(179, 204, 164, 0.8)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.welcomeGradientOverlay}
                            >
                                <View style={styles.welcomeContainer}>
                                    <Image
                                        source={getPremiumImageSource('welcome-plant')}
                                        style={styles.plantImage}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.textContainer}>
                                        <Text style={styles.welcomePlantTitle} allowFontScaling={false}>
                                            Exclusive Welcome Plant
                                        </Text>
                                        <Text style={styles.welcomePlantDescription} allowFontScaling={false}>
                                            Subscribe and receive a special premium only plant to start your journey!
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
                </View>
            </View>

            {/* Subscription Section */}
            <View style={styles.subscriptionContainer}>
                {/* Annual Plan */}
                <LinearGradient colors={['#8880BE', '#FA6FB4']} style={styles.subscriptionBox}>
                    <Text style={styles.subscriptionText} allowFontScaling={false}>
                        $79.99 Annual (Save 17%)
                    </Text>
                    <Text style={styles.freeTrialText} allowFontScaling={false}>
                        First 14 days free trial
                    </Text>
                </LinearGradient>
                <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>Best value</Text>
                </View>

                {/* Monthly Plan */}
                <View style={styles.monthlyContainer}>
                    <View style={styles.subscriptionBoxMonthly}>
                        <Text style={styles.subscriptionTextMonthly} allowFontScaling={false}>
                            $7.99 Monthly
                        </Text>
                        <Text style={styles.freeTrialTextMonthly} allowFontScaling={false}>
                            First 7 days free trial
                        </Text>
                    </View>
                </View>

                {/* Restore Purchase */}
                <TouchableOpacity onPress={handleRestorePress}>
                    <Text style={styles.restoreText} allowFontScaling={false}>
                        Restore Purchase - Terms & Conditions
                    </Text>
                </TouchableOpacity>

                {/* Subscribe Button */}
                <LinearGradient colors={['#888DBE', '#FA6FB4']} style={styles.subscribeButtonBorder}>
                    <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribePress}>
                        <Text style={styles.subscribeText} allowFontScaling={false}>
                            Try free and subscribe
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Maybe Later */}
                <TouchableOpacity onPress={handleMaybeLaterPress}>
                    <Text style={styles.maybeLater} allowFontScaling={false}>
                        Maybe Later
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary[100],
        paddingTop: 0,
    },
    headerWrapper: {
        width: '100%',
        alignItems: 'center',
        marginTop: 0,
    },
    headerContainer: {
        height: 137,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 0,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientOverlay: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        paddingHorizontal: 20,
    },
    headerImage: {
        width: width * 0.1,
        height: width * 0.1,
        marginRight: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: theme.typography.weights.bold,
        color: '#fff',
        textAlign: 'center',
        fontFamily: theme.typography.fonts.primary,
    },
    line: {
        width: '100%',
        height: 4,
        borderRadius: 2,
    },
    benefitsContainer: {
        flex: 2,
        width: '100%',
        padding: 15,
        alignItems: 'center',
    },
    benefitsTitle: {
        fontSize: 28,
        fontWeight: theme.typography.weights.black,
        color: '#487575',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: theme.typography.fonts.primary,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '90%',
        marginBottom: 5,
    },
    benefitText: {
        fontWeight: theme.typography.weights.bold,
        fontSize: 12,
        color: '#4A6A6A',
        textAlign: 'left',
        flex: 1,
        fontFamily: theme.typography.fonts.primary,
    },
    checkmarkContainer: {
        width: width * 0.08,
        height: width * 0.06,
        alignItems: 'center',
        justifyContent: 'center',
    },
    maskedView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        fontSize: 16,
        fontWeight: theme.typography.weights.bold,
        textAlign: 'center',
    },
    welcomeHeaderWrapper: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: -15,
    },
    welcomeHeaderContainer: {
        height: 118,
        width: '108.2%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 0,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    welcomeBackgroundImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeGradientOverlay: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    plantImage: {
        width: width * 0.1,
        height: width * 0.18,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    welcomePlantTitle: {
        left: -37,
        fontSize: 18,
        fontWeight: theme.typography.weights.black,
        color: '#fff',
        textAlign: 'center',
        fontFamily: theme.typography.fonts.primary,
    },
    welcomePlantDescription: {
        fontSize: 13,
        fontWeight: theme.typography.weights.medium,
        color: '#FFF',
        textAlign: 'left',
        fontFamily: theme.typography.fonts.primary,
    },
    subscriptionContainer: {
        flex: 2,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
    },
    subscriptionBox: {
        width: '90%',
        height: 79.74,
        padding: 15,
        paddingTop: 30,
        borderRadius: 15,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    subscriptionText: {
        top: -10,
        fontSize: 14,
        fontWeight: theme.typography.weights.extrabold,
        color: '#FFF',
        marginBottom: 5,
        fontFamily: theme.typography.fonts.primary,
    },
    freeTrialText: {
        top: -9,
        fontSize: 12,
        color: '#FFF',
        fontFamily: theme.typography.fonts.primary,
    },
    bestValueBadge: {
        position: 'absolute',
        right: 35,
        top: 10,
        backgroundColor: '#66D1C3',
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 10,
        ...theme.shadows.md,
    },
    bestValueText: {
        fontSize: 12,
        fontWeight: theme.typography.weights.black,
        color: '#FFF',
        fontFamily: theme.typography.fonts.primary,
    },
    monthlyContainer: {
        height: 79.74,
        width: '90%',
        alignItems: 'center',
        backgroundColor: '#F2EAD6',
        borderRadius: 15,
        marginTop: 0,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 5,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    subscriptionBoxMonthly: {
        height: 79.74,
        width: '99.9%',
        padding: 15,
        borderRadius: 15,
        justifyContent: 'center',
        marginBottom: 10,
        backgroundColor: '#68A1A1A8',
    },
    subscriptionTextMonthly: {
        fontSize: 14,
        fontWeight: theme.typography.weights.extrabold,
        color: '#487575',
        marginBottom: 5,
        fontFamily: theme.typography.fonts.primary,
    },
    freeTrialTextMonthly: {
        fontSize: 12,
        fontWeight: theme.typography.weights.medium,
        color: '#487575',
        fontFamily: theme.typography.fonts.primary,
    },
    restoreText: {
        top: -0,
        fontSize: 10,
        fontWeight: theme.typography.weights.medium,
        color: '#487575',
        marginVertical: 5,
        fontFamily: theme.typography.fonts.primary,
    },
    subscribeButtonBorder: {
        width: '70%',
        borderRadius: 25,
        padding: 4,
        alignSelf: 'center',
        marginVertical: 10,
    },
    subscribeButton: {
        backgroundColor: theme.colors.secondary[500],
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 5,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    subscribeText: {
        fontSize: 13,
        fontWeight: theme.typography.weights.medium,
        color: '#FFF',
        fontFamily: theme.typography.fonts.primary,
    },
    maybeLater: {
        bottom: -10,
        fontWeight: theme.typography.weights.bold,
        fontSize: 12,
        color: '#487575',
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fonts.primary,
    },
});