// app/(app)/greenhouse/nutrient.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../src/store/authStore';
import { usePlantsStore } from '../../../src/store/plantsStore';
import { plantService } from '../../../src/lib/appwrite';
import { theme } from '../../../src/styles';
import { LoadingSpinner } from '../../../src/components/ui';

export default function NutrientScreen() {
    const { user } = useAuthStore();
    const { nutrients } = usePlantsStore();
    const { nutrientId, color, plantId, userId } = useLocalSearchParams<{
        nutrientId: string;
        color?: string;
        plantId?: string;
        userId?: string;
    }>();

    const [nutrient, setNutrient] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (nutrientId && nutrients.length > 0) {
            const foundNutrient = nutrients.find(n => n.$id === nutrientId);
            setNutrient(foundNutrient);
        }
    }, [nutrientId, nutrients]);

    const getImageUrl = (fileId: string) => {
        if (!fileId) return 'https://via.placeholder.com/150';
        return `https://cloud.appwrite.io/v1/storage/buckets/67ddb9b20009978262ae/files/${fileId}/view?project=67cfa24f0031e006fba3`;
    };

    const handleUsePress = async () => {
        if (!plantId || !nutrient || !userId) {
            Alert.alert('Error', 'Missing required information');
            return;
        }

        if (nutrient.isPremium) {
            // Check if user has premium subscription
            const isSubscribed = false; // This would come from user preferences/subscription status
            if (!isSubscribed) {
                router.push('/(app)/premium');
                return;
            }
        }

        setLoading(true);
        try {
            const result = await plantService.applyNutrientToPlant(plantId, userId, nutrient);

            if (result.success) {
                Alert.alert(
                    'Success!',
                    `${nutrient.name} has been applied to your plant.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                router.back();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to apply nutrient');
            }
        } catch (error: any) {
            console.error('Error applying nutrient:', error);
            Alert.alert('Error', 'Failed to apply nutrient');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPress = () => {
        router.back();
    };

    if (!nutrient) {
        return <LoadingSpinner message="Loading nutrient..." />;
    }

    const renderCardContainer = () => {
        const cardContent = (
            <View style={[styles.cardContainer, { backgroundColor: '#FFF' }]}>
                {nutrient?.ima ? (
                    <Image
                        source={{ uri: getImageUrl(nutrient.ima) }}
                        style={styles.nutrientImage}
                    />
                ) : (
                    <Text style={styles.errorText}>No image available</Text>
                )}
                <View style={[styles.imageContainer, { backgroundColor: color || '#97DBB0' }]}>
                    <Text style={styles.nutrientTitle}>{nutrient.name}</Text>
                </View>
            </View>
        );

        if (nutrient?.isPremium) {
            return (
                <View style={styles.premiumBorderWrapper}>
                    <LinearGradient
                        colors={['#888DBE', '#FA6FB4']}
                        style={styles.premiumBorder}
                    >
                        <View style={styles.innerCardContainer}>
                            {cardContent}
                        </View>
                    </LinearGradient>
                </View>
            );
        }
        return cardContent;
    };

    const renderInfoContainer = () => {
        const infoContent = (
            <View style={styles.infoContainer}>
                <View style={[styles.infoContainer2, { backgroundColor: color || '#97DBB0' }]}>
                    <Text style={styles.roleTitle}>Role</Text>
                    <Text style={styles.infoText}>{nutrient.desc || 'No description available'}</Text>
                </View>
            </View>
        );

        if (nutrient?.isPremium) {
            return (
                <View style={styles.premiumBorderWrapper}>
                    <LinearGradient
                        colors={['#888DBE', '#FA6FB4']}
                        style={styles.premiumBorder}
                    >
                        <View style={styles.innerInfoContainer}>
                            {infoContent}
                        </View>
                    </LinearGradient>
                </View>
            );
        }
        return infoContent;
    };

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={['#FDE5A8', '#FCFFFF']}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.contentContainer}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleCancelPress}>
                        <Ionicons name="arrow-back" size={32} color={theme.colors.primary[900]} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Green House</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="information-circle-outline" size={32} color={theme.colors.primary[900]} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtitle}>Nutrients</Text>

                <View style={styles.containerWrapper}>
                    {/* Nutrient Card */}
                    {renderCardContainer()}

                    {/* Info Section */}
                    <View style={styles.infoWrapper}>
                        {renderInfoContainer()}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.useButton, loading && styles.disabledButton]}
                            onPress={handleUsePress}
                            disabled={loading}
                        >
                            {loading ? (
                                <Text style={styles.useButtonText}>Applying...</Text>
                            ) : (
                                <Text style={styles.useButtonText}>+ Use</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        backgroundColor: 'transparent',
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
    iconButton: {
        padding: 10
    },
    headerText: {
        color: theme.colors.primary[900],
        fontSize: 28,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        textAlign: 'center',
    },
    subtitle: {
        top: 90,
        color: '#000',
        textAlign: 'center',
        fontFamily: theme.typography.fonts.primary,
        fontSize: 28,
        fontWeight: theme.typography.weights.normal,
        letterSpacing: -1.12,
    },
    containerWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -60
    },
    cardContainer: {
        width: 245,
        height: 249,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#FFF',
        ...theme.shadows.md,
    },
    premiumBorderWrapper: {
        borderRadius: 18,
        padding: 3,
    },
    premiumBorder: {
        borderRadius: 18,
        padding: 3,
    },
    innerCardContainer: {
        width: 245,
        height: 249,
        borderRadius: 15,
        backgroundColor: '#FFF',
        overflow: 'hidden',
    },
    nutrientImage: {
        top: 20,
        transform: [{ scale: 1.6 }],
        width: 140,
        height: 100,
        resizeMode: 'contain',
    },
    imageContainer: {
        top: 50,
        width: 245,
        height: 52,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    nutrientTitle: {
        fontSize: 16,
        fontWeight: theme.typography.weights.medium,
        color: '#30459D',
        fontFamily: theme.typography.fonts.system,
        textAlign: 'center',
    },
    errorText: {
        top: 20,
        fontSize: 16,
        color: theme.colors.error,
        textAlign: 'center',
    },
    infoWrapper: {
        top: 40,
        borderRadius: 15,
        backgroundColor: 'transparent',
        overflow: 'visible',
    },
    infoContainer: {
        borderRadius: 15,
        padding: 0,
        backgroundColor: '#FFF',
        ...theme.shadows.md,
    },
    infoContainer2: {
        borderRadius: 15,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    innerInfoContainer: {
        borderRadius: 12,
    },
    roleTitle: {
        left: -1,
        width: 52,
        color: '#FFF',
        fontFamily: theme.typography.fonts.system,
        fontSize: 24,
        fontWeight: theme.typography.weights.bold,
    },
    infoText: {
        top: 10,
        width: 336,
        color: '#30459D',
        fontFamily: theme.typography.fonts.system,
        fontSize: 16,
        fontWeight: theme.typography.weights.medium,
        textAlign: 'left',
        marginBottom: 20,
    },
    buttonContainer: {
        top: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 250,
        marginTop: 20,
    },
    cancelButton: {
        top: 30,
        width: 107,
        height: 43,
        borderRadius: 30,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
    },
    useButton: {
        top: 30,
        width: 107,
        height: 43,
        borderRadius: 30,
        backgroundColor: '#DDFBCC',
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
    },
    disabledButton: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: '#000',
        fontSize: 24,
        fontWeight: theme.typography.weights.normal,
        fontFamily: theme.typography.fonts.primary,
    },
    useButtonText: {
        color: '#000',
        fontSize: 24,
        fontWeight: theme.typography.weights.normal,
        fontFamily: theme.typography.fonts.primary,
    },
});