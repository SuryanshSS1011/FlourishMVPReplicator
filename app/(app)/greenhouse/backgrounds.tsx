// app/(app)/greenhouse/backgrounds.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../src/styles';
import { storageService } from '../../../src/lib/appwrite/storage';
import { databaseService } from '../../../src/lib/appwrite/database';
import { useAuthStore } from '../../../src/store/authStore';
import { APPWRITE_CONFIG } from '../../../src/lib/appwrite/config';
import { Query } from 'react-native-appwrite';

interface Background {
    $id: string;
    name: string;
    fileId: string;
    isPremium: boolean;
    category?: string;
    sortOrder?: number;
}

interface BackgroundDocument {
    $id: string;
    name: string;
    fileId: string;
    isPremium: boolean;
    category?: string;
    sortOrder?: number;
}

export default function BackgroundsScreen() {
    const { user } = useAuthStore();
    const [backgrounds, setBackgrounds] = useState<Background[]>([]);
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewBackground, setPreviewBackground] = useState<Background | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadBackgrounds();
        loadUserPreferences();
    }, []);

    const loadBackgrounds = async () => {
        try {
            setLoading(true);
            
            // List all backgrounds from storage bucket
            const result = await storageService.listFiles(
                APPWRITE_CONFIG.buckets.backgrounds,
                [Query.limit(50), Query.orderAsc('name')]
            );

            if (result.success && result.data) {
                // Map file data to background objects
                const backgroundList: Background[] = result.data.files.map(file => {
                    // Parse metadata from filename or use a backgrounds collection
                    const isPremium = file.name.includes('premium') || 
                                    file.name.includes('galaxy') || 
                                    file.name.includes('ocean') ||
                                    file.name.includes('marble');
                    
                    return {
                        $id: file.$id,
                        name: formatBackgroundName(file.name),
                        fileId: file.$id,
                        isPremium,
                    };
                });

                setBackgrounds(backgroundList);
            }
        } catch (error) {
            console.error('Error loading backgrounds:', error);
            Alert.alert('Error', 'Failed to load backgrounds');
        } finally {
            setLoading(false);
        }
    };

    const loadUserPreferences = async () => {
        try {
            if (!user) return;

            const result = await databaseService.getUser(user.$id);
            if (result.success && result.data?.preferences?.selectedBackground) {
                setSelectedBackground(result.data.preferences.selectedBackground);
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    };

    const formatBackgroundName = (filename: string): string => {
        // Remove file extension and format name
        return filename
            .replace(/\.(jpg|jpeg|png|webp)$/i, '')
            .replace(/-|_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const handleBackgroundSelect = async (background: Background) => {
        if (background.isPremium) {
            // Check premium status from user preferences
            const isSubscribed = user?.prefs?.isPremium || false;
            
            if (!isSubscribed) {
                Alert.alert(
                    'Premium Background',
                    'This background is only available for premium users. Would you like to upgrade?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Upgrade', 
                            onPress: () => router.push('/(app)/premium')
                        },
                    ]
                );
                return;
            }
        }

        setPreviewBackground(background);
        setShowPreview(true);
    };

    const confirmBackgroundSelection = async () => {
        if (!previewBackground || !user) return;

        try {
            setSaving(true);

            // Update user preferences with selected background
            const result = await databaseService.updateUser(user.$id, {
                preferences: {
                    ...user.prefs,
                    selectedBackground: previewBackground.fileId,
                    selectedBackgroundName: previewBackground.name,
                }
            });

            if (result.success) {
                setSelectedBackground(previewBackground.fileId);
                setShowPreview(false);
                Alert.alert('Success', 'Background updated successfully!');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error saving background:', error);
            Alert.alert('Error', 'Failed to save background selection');
        } finally {
            setSaving(false);
        }
    };

    const renderBackgroundItem = (background: Background) => {
        const isSelected = selectedBackground === background.fileId;
        const imageUrl = storageService.getBackgroundImageUrl(background.fileId);

        return (
            <TouchableOpacity
                key={background.$id}
                style={[
                    styles.backgroundItem,
                    isSelected && styles.selectedItem,
                ]}
                onPress={() => handleBackgroundSelect(background)}
                activeOpacity={0.8}
            >
                <Image 
                    source={{ uri: imageUrl }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
                
                {background.isPremium && (
                    <View style={styles.premiumBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.premiumText}>Premium</Text>
                    </View>
                )}

                {isSelected && (
                    <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    </View>
                )}

                <View style={styles.backgroundInfo}>
                    <Text style={styles.backgroundName}>{background.name}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading backgrounds...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Greenhouse Backgrounds</Text>
            </LinearGradient>

            {/* Backgrounds Grid */}
            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {backgrounds.map(renderBackgroundItem)}
                </View>
            </ScrollView>

            {/* Preview Modal */}
            <Modal
                visible={showPreview}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPreview(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {previewBackground && (
                            <>
                                <Image
                                    source={{ 
                                        uri: storageService.getBackgroundImageUrl(
                                            previewBackground.fileId
                                        )
                                    }}
                                    style={styles.previewImage}
                                    resizeMode="cover"
                                />
                                
                                <Text style={styles.previewTitle}>
                                    {previewBackground.name}
                                </Text>

                                {previewBackground.isPremium && (
                                    <View style={styles.premiumNotice}>
                                        <Ionicons name="star" size={16} color="#FFD700" />
                                        <Text style={styles.premiumNoticeText}>
                                            Premium Background
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setShowPreview(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.confirmButton]}
                                        onPress={confirmBackgroundSelection}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <Text style={styles.confirmButtonText}>
                                                Apply Background
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
    },
    backButton: {
        marginRight: 16,
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
        fontFamily: theme.fonts.bold,
    },
    content: {
        flex: 1,
    },
    gridContainer: {
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    backgroundItem: {
        width: '48%',
        aspectRatio: 1.5,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedItem: {
        borderWidth: 3,
        borderColor: theme.colors.primary,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    premiumBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    premiumText: {
        fontSize: 10,
        color: '#FFD700',
        marginLeft: 4,
        fontFamily: theme.fonts.medium,
    },
    selectedBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
    },
    backgroundName: {
        fontSize: 14,
        color: '#FFF',
        fontFamily: theme.fonts.medium,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    previewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 8,
        fontFamily: theme.fonts.bold,
    },
    premiumNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    premiumNoticeText: {
        fontSize: 14,
        color: '#FFD700',
        marginLeft: 6,
        fontFamily: theme.fonts.medium,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontFamily: theme.fonts.medium,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontFamily: theme.fonts.medium,
    },
});