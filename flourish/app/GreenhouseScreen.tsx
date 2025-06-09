import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    Pressable,
    Image,
    ImageBackground,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplet, Heart } from 'lucide-react-native';

import { databases, getAllPlants } from './appwriteGreenHouse';
import { Query } from 'appwrite';
import { ActiveNutrient, Nutrient, Plant, RootStackParamList, UserPlant } from './ types';


type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GreenHouseScreen'>;
type GreenHouseScreenRouteProp = RouteProp<RootStackParamList, 'GreenHouseScreen'>;

const tabs = ['Plants', 'Accessorize', 'Nutrients'];

const GreenHouseScreen = () => {
    const navigation = useNavigation<ScreenNavigationProp>();
    const route = useRoute<GreenHouseScreenRouteProp>();
    const [userId, setUserId] = useState<string | undefined>(route.params?.userId);
    const [activeTab, setActiveTab] = useState('Nutrients');
    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [nutrients, setNutrients] = useState<Nutrient[]>([]);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [selectedUserPlant, setSelectedUserPlant] = useState<UserPlant | null>(null);
    const [selectedNutrientImages, setSelectedNutrientImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const progressPercentage = route.params?.progressPercentage
        ? Math.min(Math.max(Number(route.params.progressPercentage), 0), 100)
        : null;
    const plantIdFromRoute = route.params?.plantId;

    useEffect(() => {
        if (route.params?.userId) {
            setUserId(route.params.userId);
        }
    }, [route.params?.userId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('Step 1: Fetching data from Appwrite for user:', userId);

                const plantsResponse = await getAllPlants();
                if (!plantsResponse.success) {
                    console.error('Failed to fetch plants:', plantsResponse.message);
                    setError(plantsResponse.message);
                    setLoading(false);
                    return;
                }
                const fetchedPlants = plantsResponse.data as unknown as Plant[];
                console.log('Fetched Plants in fetchData:', fetchedPlants);

                if (plantIdFromRoute) {
                    const selectedIndex = fetchedPlants.findIndex((plant) => plant.$id === plantIdFromRoute);
                    if (selectedIndex !== -1) {
                        const [selectedPlant] = fetchedPlants.splice(selectedIndex, 1);
                        fetchedPlants.splice(0, 0, selectedPlant);
                    }
                }

                setPlants(fetchedPlants);

                const userPlantsResponse = await databases.listDocuments(
                    '67d10458003794e7043a',
                    '67e1b2da0031720d3cac',
                    [Query.equal('userId', userId)]
                );
                const fetchedUserPlants = userPlantsResponse.documents as unknown as UserPlant[];
                console.log('Fetched UserPlants for user', userId, ':', fetchedUserPlants);

                setUserPlants(fetchedUserPlants);

                if (fetchedPlants.length > 0) {
                    let updatedSelectedPlant = plantIdFromRoute
                        ? fetchedPlants.find((plant) => plant.$id === plantIdFromRoute) || fetchedPlants[0]
                        : fetchedPlants[0];

                    let updatedSelectedUserPlant = fetchedUserPlants.find(
                        (up) => up.plant_id === updatedSelectedPlant.$id && up.userId === userId
                    );

                    if (progressPercentage !== null && updatedSelectedUserPlant) {
                        updatedSelectedUserPlant = {
                            ...updatedSelectedUserPlant,
                            waterlevel: progressPercentage.toString(),
                        };
                        setUserPlants((prev) =>
                            prev.map((up) =>
                                up.plant_id === updatedSelectedPlant.$id ? updatedSelectedUserPlant! : up
                            )
                        );
                    }

                    setSelectedPlant(updatedSelectedPlant);
                    setSelectedUserPlant(updatedSelectedUserPlant || null);
                } else {
                    console.log('No plants found in Plants collection.');
                }

                const nutrientsResponse = await databases.listDocuments(
                    '67d10458003794e7043a',
                    '67ddb48d002837798265'
                );
                const fetchedNutrients = nutrientsResponse.documents as unknown as Nutrient[];
                console.log('Fetched Nutrients in fetchData:', fetchedNutrients);
                setNutrients(fetchedNutrients);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError(error.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [progressPercentage, plantIdFromRoute, userId]);

    useEffect(() => {
        if (!userId || !selectedPlant || !selectedUserPlant || selectedUserPlant.userId !== userId) {
            return;
        }

        const interval = setInterval(async () => {
            const activeNutrients: ActiveNutrient[] = selectedUserPlant.activeNutrients
                ? JSON.parse(selectedUserPlant.activeNutrients)
                : [];
            console.log('Current activeNutrients for user', userId, ':', activeNutrients);

            const updatedActiveNutrients = activeNutrients
                .map((nutrient) => ({
                    ...nutrient,
                    timer: nutrient.timer > 0 ? nutrient.timer - 1 : 0,
                }))
                .filter((nutrient) => nutrient.timer > 0);

            console.log('Updated activeNutrients for user', userId, ':', updatedActiveNutrients);

            if (JSON.stringify(updatedActiveNutrients) !== selectedUserPlant.activeNutrients) {
                try {
                    const matchingUserPlant = userPlants.find(
                        (up) => up.plant_id === selectedPlant.$id && up.userId === userId
                    );
                    if (!matchingUserPlant) {
                        console.error(`No UserPlant found with plant_id: ${selectedPlant.$id} for userId: ${userId}`);
                        return;
                    }

                    await databases.updateDocument(
                        '67d10458003794e7043a',
                        '67e1b2da0031720d3cac',
                        matchingUserPlant.$id,
                        {
                            activeNutrients: JSON.stringify(updatedActiveNutrients),
                        }
                    );
                    console.log('Updated UserPlant with new activeNutrients for user', userId, ':', updatedActiveNutrients);

                    setSelectedUserPlant((prev) =>
                        prev ? { ...prev, activeNutrients: JSON.stringify(updatedActiveNutrients) } : null
                    );
                    setUserPlants((prev) =>
                        prev.map((up) =>
                            up.$id === matchingUserPlant.$id
                                ? { ...up, activeNutrients: JSON.stringify(updatedActiveNutrients) }
                                : up
                        )
                    );
                    setSelectedNutrientImages(
                        updatedActiveNutrients.map((nutrient) =>
                            getImageUrl(nutrients.find((n) => n.$id === nutrient.nutrientId)?.ima || '')
                        )
                    );
                } catch (error: any) {
                    console.error('Error updating plant nutrients:', error);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedPlant, selectedUserPlant, nutrients, userPlants, userId]);

    useEffect(() => {
        if (!selectedUserPlant || !selectedUserPlant.activeNutrients) {
            setSelectedNutrientImages([]);
            return;
        }

        const activeNutrients: ActiveNutrient[] = selectedUserPlant.activeNutrients
            ? JSON.parse(selectedUserPlant.activeNutrients)
            : [];
        const nutrientImageUrls = activeNutrients.map((activeNutrient) => {
            const nutrient = nutrients.find((n) => n.$id === activeNutrient.nutrientId);
            return getImageUrl(nutrient?.ima || '');
        });
        setSelectedNutrientImages(nutrientImageUrls);
    }, [selectedUserPlant, nutrients]);

    const getImageUrl = (fileId: string) => {
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

    const renderNutrientItem = (nutrient: Nutrient, index: number) => {
        const activeNutrients: ActiveNutrient[] = selectedUserPlant?.activeNutrients
            ? JSON.parse(selectedUserPlant.activeNutrients)
            : [];
        const activeNutrient = activeNutrients.find((an) => an.nutrientId === nutrient.$id);
        const isAppliedToPlant = !!activeNutrient;
        const timer = activeNutrient?.timer;
        const isPremium = nutrient.isPremium;
        const hasTimer = timer !== undefined && timer > 0;

        console.log(`Rendering nutrient: ${nutrient.name}, hasTimer: ${hasTimer}, timer: ${timer}, isAppliedToPlant: ${isAppliedToPlant}`);

        return (
            <View style={styles.nutrientWrapper}>
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
                                        onPress={() =>
                                            navigation.navigate('NutrientCard', {
                                                nutrient,
                                                color:
                                                    index === 0
                                                        ? '#C7A6F2'
                                                        : index === 1
                                                            ? 'rgba(230, 114, 64, 0.50)'
                                                            : index === 2
                                                                ? 'rgba(84, 108, 235, 0.50)'
                                                                : 'rgba(48, 182, 98, 0.50)',
                                                plantId: selectedPlant?.$id,
                                                userId: userId,
                                            })
                                        }
                                    >
                                        <Image
                                            source={{ uri: getImageUrl(nutrient.ima || '') }}
                                            style={index === 2 ? styles.nutrientImagesunshine : styles.nutrientImageaurora}
                                        />
                                        <View
                                            style={[
                                                styles.hydrationLabel,
                                                {
                                                    backgroundColor:
                                                        index === 0
                                                            ? '#C7A6F2'
                                                            : index === 1
                                                                ? 'rgba(230, 114, 64, 0.50)'
                                                                : index === 2
                                                                    ? 'rgba(84, 108, 235, 0.50)'
                                                                    : 'rgba(48, 182, 98, 0.50)',
                                                },
                                            ]}
                                        >
                                            <Text style={styles.nutrientText}>{nutrient.name}</Text>
                                        </View>
                                        {hasTimer && isAppliedToPlant && (
                                            <ImageBackground
                                                source={require('@/assets/images/border.png')}
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
                                    onPress={() =>
                                        navigation.navigate('NutrientCard', {
                                            nutrient,
                                            color:
                                                index === 0
                                                    ? '#C7A6F2'
                                                    : index === 1
                                                        ? 'rgba(230, 114, 64, 0.50)'
                                                        : index === 2
                                                            ? 'rgba(84, 108, 235, 0.50)'
                                                            : 'rgba(48, 182, 98, 0.50)',
                                            plantId: selectedPlant?.$id,
                                            userId: userId,
                                        })
                                    }
                                >
                                    <Image
                                        source={{ uri: getImageUrl(nutrient.ima || '') }}
                                        style={index === 2 ? styles.nutrientImagesunshine : styles.nutrientImageaurora}
                                    />
                                    <View
                                        style={[
                                            styles.hydrationLabel,
                                            {
                                                backgroundColor:
                                                    index === 0
                                                        ? '#C7A6F2'
                                                        : index === 1
                                                            ? 'rgba(230, 114, 64, 0.50)'
                                                            : index === 2
                                                                ? 'rgba(84, 108, 235, 0.50)'
                                                                : 'rgba(48, 182, 98, 0.50)',
                                            },
                                        ]}
                                    >
                                        <Text style={styles.nutrientText}>{nutrient.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                        <Image
                            source={require('@/assets/images/leafgradient.png')}
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
                            onPress={() =>
                                navigation.navigate('NutrientCard', {
                                    nutrient,
                                    color:
                                        index === 0
                                            ? '#C7A6F2'
                                            : index === 1
                                                ? 'rgba(230, 114, 64, 0.50)'
                                                : index === 2
                                                    ? 'rgba(84, 108, 235, 0.50)'
                                                    : 'rgba(48, 182, 98, 0.50)',
                                    plantId: selectedPlant?.$id,
                                    userId: userId,
                                })
                            }
                        >
                            <Image
                                source={{ uri: getImageUrl(nutrient.ima || '') }}
                                style={index === 2 ? styles.nutrientImagesunshine : styles.nutrientImageaurora}
                            />
                            <View
                                style={[
                                    styles.hydrationLabel,
                                    {
                                        backgroundColor:
                                            index === 0
                                                ? '#C7A6F2'
                                                : index === 1
                                                    ? 'rgba(230, 114, 64, 0.50)'
                                                    : index === 2
                                                        ? 'rgba(84, 108, 235, 0.50)'
                                                        : 'rgba(48, 182, 98, 0.50)',
                                    },
                                ]}
                            >
                                <Text style={styles.nutrientText}>{nutrient.name}</Text>
                            </View>
                            {hasTimer && isAppliedToPlant && (
                                <ImageBackground
                                    source={require('@/assets/images/border.png')}
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
                        onPress={() =>
                            navigation.navigate('NutrientCard', {
                                nutrient,
                                color:
                                    index === 0
                                        ? '#C7A6F2'
                                        : index === 1
                                            ? 'rgba(230, 114, 64, 0.50)'
                                            : index === 2
                                                ? 'rgba(84, 108, 235, 0.50)'
                                                : 'rgba(48, 182, 98, 0.50)',
                                plantId: selectedPlant?.$id,
                                userId: userId,
                            })
                        }
                    >
                        <Image
                            source={{ uri: getImageUrl(nutrient.ima || '') }}
                            style={index === 2 ? styles.nutrientImagesunshine : styles.nutrientImageaurora}
                        />
                        <View
                            style={[
                                styles.hydrationLabel,
                                {
                                    backgroundColor:
                                        index === 0
                                            ? '#C7A6F2'
                                            : index === 1
                                                ? 'rgba(230, 114, 64, 0.50)'
                                                : index === 2
                                                    ? 'rgba(84, 108, 235, 0.50)'
                                                    : 'rgba(48, 182, 98, 0.50)',
                                },
                            ]}
                        >
                            <Text style={styles.nutrientText}>{nutrient.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (!userId) {
        return (
            <View style={styles.background}>
                <Text style={styles.errorText}>User not authenticated. Please log in.</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#DEDED0', '#78A88A']}
            style={styles.background}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#164432" />
                </TouchableOpacity>
                <Text style={styles.text}>Green House</Text>
                <TouchableOpacity onPress={() => setShowInfoPopup(true)}>
                    <Ionicons name="information-circle-outline" style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.Container}>
                <ImageBackground
                    source={require('@/assets/images/sand.png')}
                    style={styles.image}
                    imageStyle={{ borderRadius: 20 }}
                >
                    <View style={styles.topContainer}>
                        <View style={styles.sunContainer}>
                            <Image source={require('@/assets/images/sun.png')} style={styles.sunIcon} />
                        </View>
                    </View>
                    <View style={styles.overlayContainer}>
                        {loading ? (
                            <Text style={styles.loadingText}>Loading image...</Text>
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : !selectedPlant || !selectedPlant.Image ? (
                            <Text style={styles.emptyText}>No plant selected</Text>
                        ) : (
                            <Image
                                source={{ uri: getCactusImageUrl(selectedPlant.Image) }}
                                style={styles.imageOverlay}
                            />
                        )}
                    </View>

                    <View style={styles.transparentContainer}>
                        {loading ? (
                            <Text style={styles.loadingText}>Loading plant...</Text>
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : !selectedPlant || !selectedUserPlant ? (
                            <Text style={styles.emptyText}>No plant selected</Text>
                        ) : (
                            <>
                                <Text style={styles.cactusTitle}>{selectedPlant.PlantName}</Text>
                                <Text style={styles.plantDate}>
                                    {`${selectedUserPlant.plantedat} days ago planted`}
                                </Text>
                                <View style={styles.smallContainer}>
                                    <View style={styles.rowContainer}>
                                        <View style={styles.circleContainer}>
                                            <Droplet size={18} color="#FFFFFF" />
                                        </View>
                                        <Text style={styles.waterText}>Water</Text>
                                    </View>
                                    <View style={styles.progressContainer}>
                                        <LinearGradient
                                            colors={['#2BE4FF', '#1681FF']}
                                            start={{ x: 1, y: 1 }}
                                            end={{ x: 0, y: 1 }}
                                            style={[styles.progresscareFill, { width: `${parseInt(selectedUserPlant.waterlevel, 10) || 0}%` }]}
                                        />
                                        <Text style={styles.progressText}>{parseInt(selectedUserPlant.waterlevel, 10) || 0}%</Text>
                                    </View>
                                </View>

                                <View style={styles.additionalContainer}>
                                    <View style={styles.smallcareContainer}>
                                        <View style={styles.rowcareContainer}>
                                            <View style={styles.circlecareContainer}>
                                                <Heart size={18} color="#FFFFFF" />
                                            </View>
                                            <Text style={styles.careText}>Care</Text>
                                        </View>
                                        <View style={styles.progressContainer}>
                                            <LinearGradient
                                                colors={['#FFFFFF', '#E26310']}
                                                start={{ x: 1, y: 1 }}
                                                end={{ x: 0, y: 1 }}
                                                style={[styles.progresscareFill, { width: `${parseInt(selectedUserPlant.carelevel, 10) || 0}%` }]}
                                            />
                                            <Text style={styles.progressText}>{parseInt(selectedUserPlant.carelevel, 10) || 0}%</Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}

                        <View style={styles.levelBadgeContainer}>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Lv: 10</Text>
                            </View>
                            {selectedNutrientImages.length > 0 && (
                                <View style={styles.nutrientBadgesContainer}>
                                    {selectedNutrientImages.map((imageUrl, index) => (
                                        <ImageBackground
                                            key={index}
                                            source={require('@/assets/images/border.png')}
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

            <View style={styles.tabContainer}>
                {tabs.map((tab, index) => (
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

            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={true}
                >
                    <Animatable.View animation="fadeInUp" duration={500} key={activeTab}>
                        {activeTab === 'Plants' && (
                            <View style={styles.plantGrid}>
                                {loading ? (
                                    <Text style={styles.loadingText}>Loading plants...</Text>
                                ) : error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : plants.length === 0 ? (
                                    <Text style={styles.emptyText}>
                                        No plants found in Plants collection. UserPlants: {userPlants.length}
                                    </Text>
                                ) : (
                                    <>
                                        <View style={styles.plantRow}>
                                            {plants[0] && (
                                                <View style={styles.plantWrapper}>
                                                    <TouchableOpacity
                                                        style={styles.plantItem}
                                                        onPress={() => {
                                                            setSelectedPlant(plants[0]);
                                                            setSelectedUserPlant(userPlants.find((up) => up.plant_id === plants[0].$id) || null);
                                                        }}
                                                    >
                                                        <Image
                                                            source={{ uri: getImageUrl(plants[0].Image || '') }}
                                                            style={styles.plantImage}
                                                        />
                                                        <View style={styles.plantLabel}>
                                                            <Text style={styles.plantText}>{plants[0].PlantName}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            {plants[1] && (
                                                <View style={styles.plantWrapper}>
                                                    <TouchableOpacity
                                                        style={styles.plantItem}
                                                        onPress={() => {
                                                            setSelectedPlant(plants[1]);
                                                            setSelectedUserPlant(userPlants.find((up) => up.plant_id === plants[1].$id) || null);
                                                        }}
                                                    >
                                                        <Image
                                                            source={{ uri: getImageUrl(plants[1].Image || '') }}
                                                            style={styles.plantImage}
                                                        />
                                                        <View style={styles.plantLabel}>
                                                            <Text style={styles.plantText}>{plants[1].PlantName}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.plantRow}>
                                            {plants[2] && (
                                                <View style={styles.plantWrapper}>
                                                    <TouchableOpacity
                                                        style={styles.plantItem}
                                                        onPress={() => {
                                                            setSelectedPlant(plants[2]);
                                                            setSelectedUserPlant(userPlants.find((up) => up.plant_id === plants[2].$id) || null);
                                                        }}
                                                    >
                                                        <Image
                                                            source={{ uri: getImageUrl(plants[2].Image || '') }}
                                                            style={styles.plantImage}
                                                        />
                                                        <View style={styles.plantLabel}>
                                                            <Text style={styles.plantText}>{plants[2].PlantName}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            {plants[3] && (
                                                <View style={styles.plantWrapper}>
                                                    <TouchableOpacity
                                                        style={styles.plantItem}
                                                        onPress={() => {
                                                            setSelectedPlant(plants[3]);
                                                            setSelectedUserPlant(userPlants.find((up) => up.plant_id === plants[3].$id) || null);
                                                        }}
                                                    >
                                                        <Image
                                                            source={{ uri: getImageUrl(plants[3].Image || '') }}
                                                            style={styles.plantImage}
                                                        />
                                                        <View style={styles.plantLabel}>
                                                            <Text style={styles.plantText}>{plants[3].PlantName}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                        {activeTab === 'Accessorize' && (
                            <Text style={styles.tabContentText}>Garden Accessories</Text>
                        )}
                        {activeTab === 'Nutrients' && (
                            <View style={styles.nutrientGrid}>
                                {loading ? (
                                    <Text style={styles.loadingText}>Loading nutrients...</Text>
                                ) : error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : nutrients.length === 0 ? (
                                    <Text style={styles.emptyText}>No nutrients found.</Text>
                                ) : (
                                    <>
                                        <View style={styles.nutrientRow}>
                                            {nutrients[0] && renderNutrientItem(nutrients[0], 0)}
                                            {nutrients[1] && renderNutrientItem(nutrients[1], 1)}
                                        </View>
                                        <View style={styles.nutrientRow}>
                                            {nutrients[2] && renderNutrientItem(nutrients[2], 2)}
                                            {nutrients[3] && renderNutrientItem(nutrients[3], 3)}
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                    </Animatable.View>
                </ScrollView>
            </View>

            <Modal
                visible={showInfoPopup}
                transparent
                animationType="fade"
                onRequestClose={() => setShowInfoPopup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.headerWrapper}>
                            <LinearGradient
                                colors={['#a6c29f', '#56817c']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientHeader}
                            />
                            <View style={styles.iconWrapper}>
                                <Image
                                    source={require('@/assets/images/Flourish-logo.png')}
                                    style={styles.modalIcon}
                                />
                            </View>
                        </View>
                        <Text style={styles.popupTitle}>Green House</Text>
                        <Text style={styles.popupDescription}>
                            The greenhouse is where you can store your plants, level them up, customize their
                            vase and background, and provide nutrients to help them grow.
                        </Text>
                        <View style={styles.popupButtonRow}>
                            <Pressable onPress={() => setShowInfoPopup(false)}>
                                <LinearGradient
                                    colors={['#a6c29f', '#56817c']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.popupButtonGradient}
                                >
                                    <Text style={styles.popupButtonTextopen}>Got it</Text>
                                </LinearGradient>
                            </Pressable>
                            <Pressable
                                style={[styles.popupButton, styles.popupButtonClose]}
                                onPress={() => setShowInfoPopup(false)}
                            >
                                <Text style={styles.popupButtonTextclose}>Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};


const styles = StyleSheet.create({
    progressText: {
        position: 'absolute',
        right: 58,
        top: -2,
        fontSize: 12,
        color: 'white',
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
        top: -3,
        color: '#2B8761',
        fontSize: 5,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        textAlign: 'center',
    },
    nutrientBadgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 10,
    },
    nutrientBadge: {
        top: 5,
        position: 'relative',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    plantDate: {
        top: 30,
        color: '#999999',
        fontSize: 10,
        fontFamily: 'Roboto',
        fontWeight: '400',
        lineHeight: 40,
        textAlign: 'center',
    },
    levelBadgeContainer: {
        position: 'absolute',
        bottom: -105,
        left: -158,
        top: 180,
        flexDirection: 'row',
        alignItems: 'center',
    },
    levelBadge: {
        backgroundColor: '#68A1A1',
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    levelText: {
        color: 'white',
        fontWeight: 'bold',
    },
    nutrientIcon: {
        width: 25,
        height: 25,
        marginLeft: 3,
        top: -5,
    },
    scrollView: {
        flex: 1,
        marginTop: 10,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    contentContainer: {
        position: 'absolute',
        top: 390,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#F3EFED',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        zIndex: 1,
    },
    cornerIcon: {
        position: 'absolute',
        top: 5,
        left: 128,
        right: -5,
        width: 30,
        height: 30,
        zIndex: 10,
    },
    premiumContainer: {
        position: 'relative',
    },
    tabContentText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginVertical: 20,
    },
    icon: {
        color: 'black',
        fontSize: 33,
        fontWeight: '500',
    },
    nutrientGrid: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
        overflow: 'visible',
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 16,
        overflow: 'visible',
    },
    plantGrid: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
    },
    plantRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 16,
    },
    topContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    sunContainer: {
        left: -160,
        top: -40,
        width: 35,
        height: 35,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    nutrientWrapper: {
        top: 25,
        backgroundColor: 'transparent',
    },
    plantWrapper: {
        top: 25,
    },
    gradientBorder: {
        width: 160,
        height: 166,
        borderRadius: 15,
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
        gap: 16,
        position: 'relative',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    timerGradientBorder: {
        width: 160,
        height: 166,
        borderRadius: 15,
        padding: 2,
    },
    plantItem: {
        width: 156,
        height: 162,
        backgroundColor: '#FFF',
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: 30,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
    },
    nutrientImagegranules: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    nutrientImagedrops: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    nutrientImagesunshine: {
        transform: [{ rotate: '-15deg' }],
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    nutrientImageaurora: {
        transform: [{ scale: 1.4 }],
        width: 100,
        height: 80,
        resizeMode: 'contain',
    },
    plantImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    nutrientLabel: {
        top: 1,
        width: 156,
        height: 32,
        backgroundColor: 'rgba(5, 2, 0, 0.5)',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    hydrationLabel: {
        top: 0,
        width: 156,
        height: 32,
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    auroraLabel: {
        width: 156,
        height: 32,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nutrientText: {
        color: '#30459D',
        textAlign: 'center',
        fontFamily: 'PlusJakartaSans-Regular',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 22.4,
    },
    plantText: {
        color: '#30459D',
        textAlign: 'center',
        fontFamily: 'PlusJakartaSans-Regular',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 22.4,
    },
    sunshineLabel: {
        width: 156,
        height: 32,
        backgroundColor: 'rgba(84, 108, 235, 0.50)',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    granulesLabel: {
        top: 1,
        width: 156,
        height: 32,
        backgroundColor: '#C7A6F2',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    plantLabel: {
        top: 1,
        width: 156,
        height: 32,
        backgroundColor: '#A3D977',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    background: {
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
    },
    text: {
        color: '#164432',
        fontSize: 28,
        fontFamily: 'Roboto',
        fontWeight: '700',
        lineHeight: 40,
        textAlign: 'center',
    },
    iconButton: {
        padding: 10,
    },
    Container: {
        left: 15,
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: 365,
        height: 233,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    image: {
        width: 385,
        height: 233,
        borderRadius: 29,
        overflow: 'hidden',
    },
    overlayContainer: {
        position: 'absolute',
        left: 20,
        top: '50%',
        transform: [{ translateY: -72 }],
    },
    imageOverlay: {
        width: 148,
        height: 145,
        borderRadius: 29,
    },
    columnContainer: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: [{ translateY: -72 }],
        justifyContent: 'space-between',
    },
    transparentContainer: {
        width: 194,
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.60)',
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
        borderRadius: 20,
        position: 'absolute',
        right: 15,
        top: 70,
        transform: [{ translateY: -60 }],
        justifyContent: 'center',
        alignItems: 'center',
    },
    cactusTitle: {
        top: 50,
        color: '#56AB2F',
        fontSize: 15,
        fontFamily: 'Roboto',
        fontWeight: '600',
        lineHeight: 40,
        textAlign: 'center',
    },
    smallContainer: {
        top: 28,
        width: 179,
        height: 51,
        backgroundColor: 'white',
        borderRadius: 15,
        marginTop: 5,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circleContainer: {
        left: 10,
        bottom: -10,
        width: 30,
        height: 30,
        backgroundColor: 'rgba(180, 228, 158, 1)',
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    waterText: {
        left: 40,
        bottom: 0,
        color: '#164432',
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: '500',
    },
    progressContainer: {
        left: 50,
        top: -5,
        width: 112,
        height: 13,
        backgroundColor: '#F3F3F3',
        borderRadius: 10,
        marginTop: 5,
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
        position: 'relative',
    },
    progresscareFill: {
        height: '100%',
        borderRadius: 10,
    },
    additionalContainer: {
        top: 40,
        width: 194,
        height: 73,
        backgroundColor: 'rgba(200, 200, 200, 0.60)',
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    smallcareContainer: {
        top: -5,
        width: 179,
        height: 51,
        backgroundColor: 'white',
        borderRadius: 15,
        marginTop: 5,
    },
    rowcareContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circlecareContainer: {
        left: 10,
        bottom: -10,
        width: 30,
        height: 30,
        backgroundColor: '#B4E49E',
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    careText: {
        left: 40,
        bottom: 0,
        color: '#164432',
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: '500',
    },
    gradientBackground: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    progressMainContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    modalContainer: {
        width: 338,
        height: 320,
        position: 'absolute',
        top: 287,
        left: 37,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    gradientHeader: {
        width: 338,
        height: 62,
        position: 'absolute',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBox: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 10,
    },
    progressBar: {
        height: 8,
        width: '100%',
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
    },
    progressFillCare: {
        height: '100%',
        backgroundColor: '#FFA500',
        borderRadius: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    cactusImage: {
        width: 100,
        height: 100,
        marginRight: 15,
    },
    transparentInfoBox: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 15,
        padding: 10,
        alignItems: 'center',
    },
    middleContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        elevation: 5,
        marginBottom: 10,
    },
    headerWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
        paddingBottom: 0,
    },
    popupTitle: {
        fontSize: 28,
        width: 309.16,
        top: 45,
        fontFamily: 'Roboto',
        fontWeight: '400',
        lineHeight: 40,
        letterSpacing: -0.04 * 28,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
    },
    iconWrapper: {
        width: 69,
        height: 11,
        position: 'absolute',
        top: -60,
        left: 130,
        alignSelf: 'center',
        borderRadius: 14,
        padding: 8,
        zIndex: 10,
    },
    sunIcon: {
        width: 30,
        height: 30,
        position: 'absolute',
        top: 2,
        left: 3,
    },
    plantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#69A14A',
    },
    plantInfo: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 10,
    },
    plantContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        elevation: 5,
        padding: 15,
        marginBottom: 10,
    },
    tabContainer: {
        top: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 0,
        borderRadius: 20,
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        borderWidth: 0,
        height: 50,
        width: 360,
        alignSelf: 'center',
    },
    tabButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    activeTab: {
        backgroundColor: '#A3D977',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        width: '100%',
        height: '100%',
    },
    tabText: {
        fontSize: 16,
        color: '#A0A0A0',
        zIndex: 3,
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
        zIndex: 3,
    },
    modalIcon: {
        top: -10,
        width: 70,
        height: 70,
        resizeMode: 'contain',
        shadowColor: '#0000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        borderRadius: 14,
    },
    activeNutrient: {
        borderColor: '#A3D977',
        borderWidth: 2,
    },
    popupDescription: {
        fontFamily: 'PlusJakartaSans-Regular',
        width: 290,
        height: 105,
        top: 40,
        left: 0,
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 25,
        letterSpacing: 0,
        textAlign: 'center',
        color: '#30459D',
        marginVertical: 15,
        paddingHorizontal: 20,
    },
    popupButtonRow: {
        top: -20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
        marginTop: 20,
    },
    popupButton: {
        top: 50,
        borderRadius: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
        marginHorizontal: 5,
        elevation: 5,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    popupButtonClose: {
        backgroundColor: '#D9D9D9',
        width: 130,
        height: 40,
    },
    popupButtonTextopen: {
        color: '#FFF',
        width: 43,
        height: 25,
        left: 45,
        top: 10,
        fontSize: 16,
        fontWeight: 500,
        textAlign: 'center',
    },
    popupButtonTextclose: {
        color: '#749989',
        width: 45,
        height: 25,
        left: 15,
        top: 0,
        fontSize: 16,
        fontWeight: 500,
        textAlign: 'center',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    popupButtonGradient: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5,
        top: 50,
        width: 130,
        height: 40,
        borderRadius: 10,
    },
    loadingText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default GreenHouseScreen;