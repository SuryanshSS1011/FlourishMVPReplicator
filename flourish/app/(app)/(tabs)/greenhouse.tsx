// app/(app)/(tabs)/greenhouse.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    Image,
    ImageBackground,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplet, Heart } from 'lucide-react-native';
import { useAuthStore } from '../../../src/store/authStore';
import { usePlantsStore } from '../../../src/store/plantsStore';
import { theme } from '../../../src/styles';
import { LoadingSpinner } from '../../../src/components/ui';

const tabs = ['Plants', 'Accessorize', 'Nutrients'];

export default function GreenhouseScreen() {
    const { user } = useAuthStore();
    const {
        plants,
        userPlants,
        nutrients,
        selectedPlant,
        selectedUserPlant,
        loading,
        error,
        fetchPlants,
        fetchUserPlants,
        fetchNutrients,
        selectPlant,
    } = usePlantsStore();

    const [activeTab, setActiveTab] = useState('Nutrients');
    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [selectedNutrientImages, setSelectedNutrientImages] = useState<string[]>([]);

    useEffect(() => {
        if (user?.$id) {
            fetchPlants();
            fetchUserPlants(user.$id);
            fetchNutrients();
        }
    }, [user?.$id]);

    useEffect(() => {
        // Update nutrient images based on active nutrients
        if (selectedUserPlant?.activeNutrients) {
            try {
                const activeNutrients = JSON.parse(selectedUserPlant.activeNutrients);
                const imageUrls = activeNutrients.map((activeNutrient: any) => {
                    const nutrient = nutrients.find(n => n.$id === activeNutrient.nutrientId);
                    return nutrient?.ima ? getNutrientImageUrl(nutrient.ima) : null;
                }).filter(Boolean);
                setSelectedNutrientImages(imageUrls);
            } catch (error) {
                console.error('Error parsing active nutrients:', error);
            }
        }
    }, [selectedUserPlant, nutrients]);

    const getNutrientImageUrl = (fileId: string) => {
        if (!fileId) return 'https://via.placeholder.com/150';
        return `https://cloud.appwrite.io/v1/storage/buckets/67ddb9b20009978262ae/files/${fileId}/view?project=67cfa24f0031e006fba3`;
    };

    const getCactusImageUrl = (fileId: string) => {
        if (!fileId) return 'https://via.placeholder.com/150';
        return `https://cloud.appwrite.io/v1/storage/buckets/67e227bf00075deadffc/files/${fileId}/view?project=67cfa24f0031e006fba3`;
    };

    const formatTimer = (seconds: number | undefined) => {
        if (!seconds) return '00:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleNutrientPress = (nutrient: any, index: number) => {
        const colors = ['#C7A6F2', 'rgba(230, 114, 64, 0.50)', 'rgba(84, 108, 235, 0.50)', 'rgba(48, 182, 98, 0.50)'];

        router.push({
            pathname: '/(app)/greenhouse/nutrient',
            params: {
                nutrientId: nutrient.$id,
                color: colors[index] || colors[0],
                plantId: selectedPlant?.$id || '',
                userId: user?.$id || '',
            }
        });
    };

    const handleBackgroundPress = () => {
        router.push('/(app)/greenhouse/backgrounds');
    };

    const handleVasesPress = () => {
        router.push('/(app)/greenhouse/vases');
    };

    const renderNutrientItem = (nutrient: any, index: number) => {
        const activeNutrients = selectedUserPlant?.activeNutrients
            ? JSON.parse(selectedUserPlant.activeNutrients)
            : [];
        const activeNutrient = activeNutrients.find((an: any) => an.nutrientId === nutrient.$id);
        const isAppliedToPlant = !!activeNutrient;
        const timer = activeNutrient?.timer;
        const isPremium = nutrient.isPremium;
        const hasTimer = timer !== undefined && timer > 0;

        const colors = ['#C7A6F2', 'rgba(230, 114, 64, 0.50)', 'rgba(84, 108, 235, 0.50)', 'rgba(48, 182, 98, 0.50)'];
        const backgroundColor = colors[index] || colors[0];

        return (
            <View key={nutrient.$id} style={styles.nutrientWrapper}>
                {isPremium ? (
                    <View style={styles.premiumContainer}>
                        <LinearGradient
                            colors={['#888DBE', '#FA6FB4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientBorder}
                        >
                            {hasTimer && isAppliedToPlant ? (
                                <LinearGradient
                                    colors={['#B3E8E5', '#D7CFF5']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={styles.timerGradientBorder}
                                >
                                    <TouchableOpacity
                                        style={styles.nutrientItem}
                                        onPress={() => handleNutrientPress(nutrient, index)}
                                    >
                                        <Image
                                            source={{ uri: getNutrientImageUrl(nutrient.ima || '') }}
                                            style={styles.nutrientImage}
                                        />
                                        <View style={[styles.nutrientLabel, { backgroundColor }]}>
                                            <Text style={styles.nutrientText}>{nutrient.name}</Text>
                                        </View>
                                        {hasTimer && (
                                            <ImageBackground
                                                source={require('../../../assets/images/border.png')} // Timer border image placeholder
                                                style={styles.timerBadge}
                                                resizeMode="contain"
                                            >
                                                <Text style={styles.timerText}>{formatTimer(timer)}</Text>
                                            </ImageBackground>
                                        )}
                                    </TouchableOpacity>
                                </LinearGradient>
                            ) : (
                                <TouchableOpacity
                                    style={styles.nutrientItem}
                                    onPress={() => handleNutrientPress(nutrient, index)}
                                >
                                    <Image
                                        source={{ uri: getNutrientImageUrl(nutrient.ima || '') }}
                                        style={styles.nutrientImage}
                                    />
                                    <View style={[styles.nutrientLabel, { backgroundColor }]}>
                                        <Text style={styles.nutrientText}>{nutrient.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                        <Image
                            source={require('../../../assets/images/leafgradient.png')} // Premium leaf icon placeholder
                            style={styles.cornerIcon}
                            resizeMode="contain"
                        />
                    </View>
                ) : hasTimer && isAppliedToPlant ? (
                    <LinearGradient
                        colors={['#98FB98', '#A3D977']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.timerGradientBorder}
                    >
                        <TouchableOpacity
                            style={styles.nutrientItem}
                            onPress={() => handleNutrientPress(nutrient, index)}
                        >
                            <Image
                                source={{ uri: getNutrientImageUrl(nutrient.ima || '') }}
                                style={styles.nutrientImage}
                            />
                            <View style={[styles.nutrientLabel, { backgroundColor }]}>
                                <Text style={styles.nutrientText}>{nutrient.name}</Text>
                            </View>
                            {hasTimer && (
                                <ImageBackground
                                    source={require('../../../assets/images/border.png')} // Timer border image placeholder
                                    style={styles.timerBadge}
                                    resizeMode="contain"
                                >
                                    <Text style={styles.timerText}>{formatTimer(timer)}</Text>
                                </ImageBackground>
                            )}
                        </TouchableOpacity>
                    </LinearGradient>
                ) : (
                    <TouchableOpacity
                        style={styles.nutrientItem}
                        onPress={() => handleNutrientPress(nutrient, index)}
                    >
                        <Image
                            source={{ uri: getNutrientImageUrl(nutrient.ima || '') }}
                            style={styles.nutrientImage}
                        />
                        <View style={[styles.nutrientLabel, { backgroundColor }]}>
                            <Text style={styles.nutrientText}>{nutrient.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading && plants.length === 0) {
        return <LoadingSpinner message="Loading greenhouse..." />;
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Please log in to access the greenhouse.</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={[theme.colors.primary[100], theme.colors.primary[500]]}
            style={styles.container}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Green House</Text>
                <TouchableOpacity onPress={() => setShowInfoPopup(true)}>
                    <Ionicons name="information-circle-outline" size={32} color={theme.colors.primary[900]} />
                </TouchableOpacity>
            </View>

            {/* Plant Display Container */}
            <View style={styles.plantContainer}>
                <ImageBackground
                    source={require('../../../assets/images/sand.png')} // Sand background placeholder
                    style={styles.plantBackground}
                    imageStyle={{ borderRadius: 20 }}
                >
                    {/* Sun Icon */}
                    <View style={styles.sunContainer}>
                        <Image
                            source={require('../../../assets/images/sun.png')} // Sun icon placeholder
                            style={styles.sunIcon}
                        />
                    </View>

                    {/* Plant Image */}
                    <View style={styles.plantImageContainer}>
                        {selectedPlant?.Image ? (
                            <Image
                                source={{ uri: getCactusImageUrl(selectedPlant.Image) }}
                                style={styles.plantImage}
                            />
                        ) : (
                            <View style={styles.placeholderPlant}>
                                <Text style={styles.placeholderText}>Select a plant</Text>
                            </View>
                        )}
                    </View>

                    {/* Plant Info Panel */}
                    <View style={styles.plantInfoPanel}>
                        {selectedPlant && selectedUserPlant ? (
                            <>
                                <Text style={styles.plantTitle}>{selectedPlant.PlantName}</Text>
                                <Text style={styles.plantDate}>
                                    {selectedUserPlant.plantedat} days ago planted
                                </Text>

                                {/* Water Level */}
                                <View style={styles.statusContainer}>
                                    <View style={styles.statusRow}>
                                        <View style={styles.statusIcon}>
                                            <Droplet size={18} color="#FFFFFF" />
                                        </View>
                                        <Text style={styles.statusLabel}>Water</Text>
                                    </View>
                                    <View style={styles.progressContainer}>
                                        <LinearGradient
                                            colors={['#2BE4FF', '#1681FF']}
                                            start={{ x: 1, y: 1 }}
                                            end={{ x: 0, y: 1 }}
                                            style={[
                                                styles.progressFill,
                                                { width: `${parseInt(selectedUserPlant.waterlevel, 10) || 0}%` }
                                            ]}
                                        />
                                        <Text style={styles.progressText}>
                                            {parseInt(selectedUserPlant.waterlevel, 10) || 0}%
                                        </Text>
                                    </View>
                                </View>

                                {/* Care Level */}
                                <View style={styles.statusContainer}>
                                    <View style={styles.statusRow}>
                                        <View style={styles.statusIcon}>
                                            <Heart size={18} color="#FFFFFF" />
                                        </View>
                                        <Text style={styles.statusLabel}>Care</Text>
                                    </View>
                                    <View style={styles.progressContainer}>
                                        <LinearGradient
                                            colors={['#FFFFFF', '#E26310']}
                                            start={{ x: 1, y: 1 }}
                                            end={{ x: 0, y: 1 }}
                                            style={[
                                                styles.progressFill,
                                                { width: `${parseInt(selectedUserPlant.carelevel, 10) || 0}%` }
                                            ]}
                                        />
                                        <Text style={styles.progressText}>
                                            {parseInt(selectedUserPlant.carelevel, 10) || 0}%
                                        </Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.placeholderText}>No plant selected</Text>
                        )}

                        {/* Level and Active Nutrients */}
                        <View style={styles.badgeContainer}>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Lv: 10</Text>
                            </View>
                            {selectedNutrientImages.length > 0 && (
                                <View style={styles.nutrientBadgesContainer}>
                                    {selectedNutrientImages.map((imageUrl, index) => (
                                        <ImageBackground
                                            key={index}
                                            source={require('../../../assets/images/border.png')} // Nutrient badge border placeholder
                                            style={styles.nutrientBadge}
                                            resizeMode="contain"
                                        >
                                            <Image
                                                source={{ uri: imageUrl }}
                                                style={styles.nutrientIcon}
                                                resizeMode="contain"
                                            />
                                        </ImageBackground>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {/* Tab Container */}
            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[styles.tabButton, activeTab === tab && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animatable.View animation="fadeInUp" duration={500} key={activeTab}>
                        {activeTab === 'Plants' && (
                            <View style={styles.itemGrid}>
                                {plants.slice(0, 4).map((plant, index) => (
                                    <TouchableOpacity
                                        key={plant.$id}
                                        style={styles.itemCard}
                                        onPress={() => selectPlant(plant)}
                                    >
                                        <Image
                                            source={{ uri: getCactusImageUrl(plant.Image || '') }}
                                            style={styles.itemImage}
                                        />
                                        <View style={styles.itemLabel}>
                                            <Text style={styles.itemText}>{plant.PlantName}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {activeTab === 'Accessorize' && (
                            <View style={styles.itemGrid}>
                                <TouchableOpacity style={styles.itemCard} onPress={handleBackgroundPress}>
                                    <Image
                                        source={require('../../../assets/images/brick-background.png')} // Background item placeholder
                                        style={styles.itemImage}
                                    />
                                    <View style={styles.itemLabel}>
                                        <Text style={styles.itemText}>Background</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.itemCard} onPress={handleVasesPress}>
                                    <Image
                                        source={require('../../../assets/images/vase.png')} // Vase item placeholder
                                        style={styles.itemImage}
                                    />
                                    <View style={styles.itemLabel}>
                                        <Text style={styles.itemText}>Vases</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {activeTab === 'Nutrients' && (
                            <View style={styles.nutrientGrid}>
                                <View style={styles.nutrientRow}>
                                    {nutrients.slice(0, 2).map((nutrient, index) =>
                                        renderNutrientItem(nutrient, index)
                                    )}
                                </View>
                                <View style={styles.nutrientRow}>
                                    {nutrients.slice(2, 4).map((nutrient, index) =>
                                        renderNutrientItem(nutrient, index + 2)
                                    )}
                                </View>
                            </View>
                        )}
                    </Animatable.View>
                </ScrollView>
            </View>

            {/* Info Modal */}
            <Modal
                visible={showInfoPopup}
                transparent
                animationType="fade"
                onRequestClose={() => setShowInfoPopup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <LinearGradient
                                colors={['#a6c29f', '#56817c']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientHeader}
                            />
                            <View style={styles.modalIconWrapper}>
                                <Image
                                    source={require('../../../assets/images/Flourish-logo.png')} // Flourish logo placeholder
                                    style={styles.modalIcon}
                                />
                            </View>
                        </View>
                        <Text style={styles.modalTitle}>Green House</Text>
                        <Text style={styles.modalDescription}>
                            The greenhouse is where you can store your plants, level them up, customize their
                            vase and background, and provide nutrients to help them grow.
                        </Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity onPress={() => setShowInfoPopup(false)}>
                                <LinearGradient
                                    colors={['#a6c29f', '#56817c']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.modalButton}
                                >
                                    <Text style={styles.modalButtonText}>Got it</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowInfoPopup(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        position: 'absolute',
        top: 40,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    iconButton: {
        padding: 10,
    },
    headerTitle: {
        color: theme.colors.primary[900],
        fontSize: 28,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        textAlign: 'center',
    },
    plantContainer: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        height: 233,
        alignSelf: 'center',
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    plantBackground: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    sunContainer: {
        position: 'absolute',
        left: 20,
        top: 10,
        width: 35,
        height: 35,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.md,
    },
    sunIcon: {
        width: 30,
        height: 30,
    },
    plantImageContainer: {
        position: 'absolute',
        left: 20,
        top: '50%',
        transform: [{ translateY: -72 }],
    },
    plantImage: {
        width: 148,
        height: 145,
        borderRadius: 29,
    },
    placeholderPlant: {
        width: 148,
        height: 145,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: theme.colors.text.muted,
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.primary,
    },
    plantInfoPanel: {
        width: 194,
        backgroundColor: 'rgba(255, 255, 255, 0.60)',
        borderRadius: 20,
        position: 'absolute',
        right: 15,
        top: 70,
        padding: 16,
        ...theme.shadows.md,
    },
    plantTitle: {
        color: '#56AB2F',
        fontSize: 15,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.semibold,
        textAlign: 'center',
        marginTop: 20,
    },
    plantDate: {
        color: '#999999',
        fontSize: 10,
        fontFamily: theme.typography.fonts.primary,
        textAlign: 'center',
        marginTop: 8,
    },
    statusContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 12,
        marginTop: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusIcon: {
        width: 30,
        height: 30,
        backgroundColor: '#B4E49E',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    statusLabel: {
        color: theme.colors.primary[900],
        fontSize: 14,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
    },
    progressContainer: {
        width: '100%',
        height: 13,
        backgroundColor: '#F3F3F3',
        borderRadius: 10,
        position: 'relative',
        ...theme.shadows.sm,
    },
    progressFill: {
        height: '100%',
        borderRadius: 10,
    },
    progressText: {
        position: 'absolute',
        right: 8,
        top: -2,
        fontSize: 12,
        color: 'white',
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    levelBadge: {
        backgroundColor: theme.colors.secondary[500],
        borderRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    levelText: {
        color: 'white',
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.primary,
    },
    nutrientBadgesContainer: {
        flexDirectio: 'row',
        marginLeft: 10,
    },
    nutrientBadge: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    nutrientIcon: {
        width: 20,
        height: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 0,
        borderRadius: 20,
        height: 50,
        width: '90%',
        alignSelf: 'center',
        marginTop: 35,
        ...theme.shadows.md,
    },
    tabButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: '#A3D977',
        borderRadius: 20,
    },
    tabText: {
        fontSize: 16,
        color: '#A0A0A0',
        fontFamily: theme.typography.fonts.primary,
    },
    activeTabText: {
        color: 'white',
        fontWeight: theme.typography.weights.bold,
    },
    contentContainer: {
        flex: 1,
        marginTop: 20,
        backgroundColor: '#F3EFED',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    scrollView: {
        flex: 1,
        marginTop: 10,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    itemGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    itemCard: {
        width: 156,
        height: 162,
        backgroundColor: '#FFF',
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 16,
        paddingTop: 30,
        ...theme.shadows.md,
    },
    itemImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    itemLabel: {
        width: '100%',
        height: 32,
        backgroundColor: '#A3D977',
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    itemText: {
        color: '#30459D',
        textAlign: 'center',
        fontFamily: theme.typography.fonts.system,
        fontSize: 16,
        fontWeight: theme.typography.weights.medium,
    },
    nutrientGrid: {
        alignItems: 'center',
        marginTop: 20,
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 16,
    },
    nutrientWrapper: {
        backgroundColor: 'transparent',
    },
    premiumContainer: {
        position: 'relative',
    },
    gradientBorder: {
        width: 160,
        height: 166,
        borderRadius: 15,
        padding: 2,
    },
    timerGradientBorder: {
        width: 156,
        height: 162,
        borderRadius: 13,
        padding: 2,
    },
    nutrientItem: {
        width: 156,
        height: 162,
        backgroundColor: '#FFF',
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: 30,
        position: 'relative',
        ...theme.shadows.md,
    },
    nutrientImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        transform: [{ scale: 1.4 }],
    },
    nutrientLabel: {
        width: '100%',
        height: 32,
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nutrientText: {
        color: '#30459D',
        textAlign: 'center',
        fontFamily: theme.typography.fonts.system,
        fontSize: 16,
        fontWeight: theme.typography.weights.medium,
    },
    cornerIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 30,
        height: 30,
        zIndex: 10,
    },
    timerBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        color: '#2B8761',
        fontSize: 8,
        fontWeight: theme.typography.weights.bold,
        fontFamily: theme.typography.fonts.primary,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: 338,
        height: 320,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    modalHeader: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    gradientHeader: {
        width: '100%',
        height: 62,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalIconWrapper: {
        position: 'absolute',
        top: -30,
        alignSelf: 'center',
        zIndex: 10,
    },
    modalIcon: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        borderRadius: 14,
        ...theme.shadows.lg,
    },
    modalTitle: {
        fontSize: 28,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.normal,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalDescription: {
        fontFamily: theme.typography.fonts.system,
        fontSize: 12,
        lineHeight: 25,
        textAlign: 'center',
        color: '#30459D',
        marginVertical: 15,
        paddingHorizontal: 20,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        marginTop: 20,
    },
    modalButton: {
        width: 130,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: theme.typography.weights.medium,
        textAlign: 'center',
    },
    modalCloseButton: {
        backgroundColor: '#D9D9D9',
        width: 130,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
    },
    modalCloseButtonText: {
        color: '#749989',
        fontSize: 16,
        fontWeight: theme.typography.weights.medium,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: theme.typography.fonts.primary,
    },
});