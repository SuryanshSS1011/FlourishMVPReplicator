// app/(app)/greenhouse/index.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Modal,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../src/styles';
import { plantService } from '../../../src/lib/services/plantService';
import { storageService } from '../../../src/lib/appwrite/storage';
import { databaseService } from '../../../src/lib/appwrite/database';
import { useAuthStore } from '../../../src/store/authStore';
import type { PlantWithUserData } from '../../../src/lib/services/plantService';

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = 3;
const CELL_SIZE = (screenWidth - 60) / GRID_SIZE;

interface PlantSlot {
    position: number;
    plant?: PlantWithUserData;
}

export default function GreenhouseScreen() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [plantSlots, setPlantSlots] = useState<PlantSlot[]>([]);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [showPlantModal, setShowPlantModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [selectedPlant, setSelectedPlant] = useState<PlantWithUserData | null>(null);

    useEffect(() => {
        loadGreenhouseData();
    }, []);

    const loadGreenhouseData = async () => {
        try {
            setLoading(true);

            // Load user's plants
            const plantsResult = await plantService.getUserPlants();
            const userPlants = plantsResult.success ? plantsResult.data || [] : [];

            // Initialize grid slots
            const slots: PlantSlot[] = [];
            for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
                const plant = userPlants.find(p => 
                    p.userPlant?.location === `greenhouse_${i}`
                ) || (i < userPlants.length ? userPlants[i] : undefined);
                
                slots.push({
                    position: i,
                    plant: plant,
                });
            }
            setPlantSlots(slots);

            // Load user's selected background
            if (user) {
                const userResult = await databaseService.getUser(user.$id);
                if (userResult.success && userResult.data?.preferences?.selectedBackground) {
                    const bgUrl = storageService.getBackgroundImageUrl(
                        userResult.data.preferences.selectedBackground
                    );
                    setBackgroundImage(bgUrl);
                }
            }
        } catch (error) {
            console.error('Error loading greenhouse data:', error);
            Alert.alert('Error', 'Failed to load greenhouse data');
        } finally {
            setLoading(false);
        }
    };

    const handleSlotPress = (slot: PlantSlot) => {
        if (slot.plant) {
            setSelectedPlant(slot.plant);
            setShowPlantModal(true);
        } else {
            setSelectedSlot(slot.position);
            router.push({
                pathname: '/(app)/plants/add',
                params: { 
                    greenhouseSlot: slot.position,
                    returnTo: 'greenhouse'
                }
            });
        }
    };

    const handleWaterPlant = async () => {
        if (!selectedPlant?.userPlant) return;

        try {
            const result = await plantService.updatePlantCare(
                selectedPlant.userPlant.$id,
                'water'
            );

            if (result.success) {
                Alert.alert('Success', 'Plant watered successfully!');
                setShowPlantModal(false);
                loadGreenhouseData();
            }
        } catch (error) {
            console.error('Error watering plant:', error);
            Alert.alert('Error', 'Failed to water plant');
        }
    };

    const handleRemovePlant = async () => {
        if (!selectedPlant?.userPlant) return;

        Alert.alert(
            'Remove Plant',
            `Are you sure you want to remove ${selectedPlant.userPlant.nickname || selectedPlant.name} from greenhouse?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await databaseService.updateUserPlant(
                                selectedPlant.userPlant!.$id,
                                { location: null }
                            );
                            setShowPlantModal(false);
                            loadGreenhouseData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove plant');
                        }
                    }
                }
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Green House</Text>

            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push('/(app)/greenhouse/settings')}
            >
                <Ionicons name="settings-outline" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const renderPlantSlot = (slot: PlantSlot) => {
        const hasPlant = !!slot.plant;

        return (
            <TouchableOpacity
                key={slot.position}
                style={styles.plantSlot}
                onPress={() => handleSlotPress(slot)}
                activeOpacity={0.8}
            >
                {hasPlant ? (
                    <View style={styles.plantContainer}>
                        <Image
                            source={{ 
                                uri: slot.plant!.imageUrl || 
                                     storageService.getPlantImageUrl('default-plant')
                            }}
                            style={styles.plantImage}
                            resizeMode="contain"
                        />
                        <Image
                            source={require('../../../assets/images/pot.png')}
                            style={styles.potImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.plantName} numberOfLines={1}>
                            {slot.plant!.userPlant?.nickname || slot.plant!.name}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.emptySlot}>
                        <Ionicons 
                            name="add-circle-outline" 
                            size={48} 
                            color="rgba(255, 255, 255, 0.5)" 
                        />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderPlantModal = () => {
        if (!selectedPlant) return null;

        const healthStatus = selectedPlant.userPlant?.healthStatus || 'good';
        const healthColors = {
            excellent: '#4CAF50',
            good: '#8BC34A',
            fair: '#FFC107',
            poor: '#F44336',
        };

        return (
            <Modal
                visible={showPlantModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPlantModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setShowPlantModal(false)}
                        >
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>

                        <Image
                            source={{ 
                                uri: selectedPlant.imageUrl || 
                                     storageService.getPlantImageUrl('default-plant')
                            }}
                            style={styles.modalPlantImage}
                            resizeMode="contain"
                        />

                        <Text style={styles.modalPlantName}>
                            {selectedPlant.userPlant?.nickname || selectedPlant.name}
                        </Text>

                        <Text style={styles.modalPlantSpecies}>
                            {selectedPlant.scientificName}
                        </Text>

                        <View style={styles.plantStats}>
                            <View style={styles.statItem}>
                                <Ionicons 
                                    name="heart" 
                                    size={24} 
                                    color={healthColors[healthStatus]} 
                                />
                                <Text style={styles.statLabel}>Health</Text>
                                <Text style={[
                                    styles.statValue,
                                    { color: healthColors[healthStatus] }
                                ]}>
                                    {healthStatus}
                                </Text>
                            </View>

                            <View style={styles.statDivider} />

                            <View style={styles.statItem}>
                                <Ionicons name="water" size={24} color="#64B5F6" />
                                <Text style={styles.statLabel}>Water</Text>
                                <Text style={styles.statValue}>
                                    {selectedPlant.wateringFrequency} days
                                </Text>
                            </View>

                            <View style={styles.statDivider} />

                            <View style={styles.statItem}>
                                <Ionicons name="sunny" size={24} color="#FFD54F" />
                                <Text style={styles.statLabel}>Light</Text>
                                <Text style={styles.statValue}>
                                    {selectedPlant.lightRequirement}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.waterButton]}
                                onPress={handleWaterPlant}
                            >
                                <Ionicons name="water" size={20} color="#FFF" />
                                <Text style={styles.actionButtonText}>Water Now</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.detailsButton]}
                                onPress={() => {
                                    setShowPlantModal(false);
                                    router.push({
                                        pathname: '/(app)/plants/[id]',
                                        params: { id: selectedPlant.userPlant!.$id }
                                    });
                                }}
                            >
                                <Ionicons name="information-circle" size={20} color="#FFF" />
                                <Text style={styles.actionButtonText}>Details</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={handleRemovePlant}
                        >
                            <Text style={styles.removeButtonText}>Remove from Greenhouse</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderQuickActions = () => (
        <View style={styles.quickActions}>
            <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/(app)/greenhouse/backgrounds')}
            >
                <LinearGradient
                    colors={['#9C27B0', '#7B1FA2']}
                    style={styles.quickActionGradient}
                >
                    <Ionicons name="image" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Background</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/(app)/greenhouse/vases')}
            >
                <LinearGradient
                    colors={['#FF9800', '#F57C00']}
                    style={styles.quickActionGradient}
                >
                    <Ionicons name="color-palette" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Vases</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/(app)/nutrients')}
            >
                <LinearGradient
                    colors={['#4CAF50', '#388E3C']}
                    style={styles.quickActionGradient}
                >
                    <Ionicons name="nutrition" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Nutrients</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/(app)/premium')}
            >
                <LinearGradient
                    colors={['#FFD700', '#FFC107']}
                    style={styles.quickActionGradient}
                >
                    <Ionicons name="star" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Premium</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading greenhouse...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {backgroundImage && (
                <Image
                    source={{ uri: backgroundImage }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
            )}
            
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
                style={styles.overlay}
            />

            {renderHeader()}

            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.greenhouseGrid}>
                    {plantSlots.map(renderPlantSlot)}
                </View>

                {renderQuickActions()}
            </ScrollView>

            {renderPlantModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.regular,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        fontFamily: theme.fonts.bold,
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        zIndex: 5,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    greenhouseGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    plantSlot: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        marginBottom: 20,
    },
    plantContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    plantImage: {
        width: '60%',
        height: '50%',
        marginBottom: -10,
        zIndex: 2,
    },
    potImage: {
        width: '80%',
        height: '40%',
        zIndex: 1,
    },
    plantName: {
        fontSize: 12,
        color: '#FFF',
        marginTop: 4,
        fontFamily: theme.fonts.medium,
        textAlign: 'center',
    },
    emptySlot: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
    },
    quickActionButton: {
        alignItems: 'center',
        flex: 1,
    },
    quickActionGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        color: '#FFF',
        fontFamily: theme.fonts.medium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    modalPlantImage: {
        width: 150,
        height: 150,
        marginBottom: 16,
    },
    modalPlantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
        fontFamily: theme.fonts.bold,
    },
    modalPlantSpecies: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 24,
        fontFamily: theme.fonts.regular,
    },
    plantStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
        fontFamily: theme.fonts.regular,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 2,
        fontFamily: theme.fonts.bold,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E0E0E0',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 25,
        marginHorizontal: 8,
    },
    waterButton: {
        backgroundColor: '#64B5F6',
    },
    detailsButton: {
        backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
        fontSize: 16,
        color: '#FFF',
        marginLeft: 8,
        fontFamily: theme.fonts.medium,
    },
    removeButton: {
        paddingVertical: 12,
    },
    removeButtonText: {
        fontSize: 14,
        color: '#F44336',
        fontFamily: theme.fonts.medium,
    },
});