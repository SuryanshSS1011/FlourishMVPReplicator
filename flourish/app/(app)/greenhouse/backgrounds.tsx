// app/(app)/greenhouse/backgrounds.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Modal,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../src/styles';

// Mock background data - replace with actual data from your backend
const backgrounds = [
    { id: '1', name: 'Brick Wall', image: 'brick-background.png', isPremium: false },
    { id: '2', name: 'Forest', image: 'forest-background.png', isPremium: false },
    { id: '3', name: 'Marble', image: 'marble-background.png', isPremium: true },
    { id: '4', name: 'Sky', image: 'sky-background.png', isPremium: false },
    { id: '5', name: 'Stone', image: 'stone-background.png', isPremium: false },
    { id: '6', name: 'Wood', image: 'wood-background.png', isPremium: false },
    { id: '7', name: 'Galaxy', image: 'galaxy-background.png', isPremium: true },
    { id: '8', name: 'Desert', image: 'desert-background.png', isPremium: false },
    { id: '9', name: 'Ocean', image: 'ocean-background.png', isPremium: true },
    { id: '10', name: 'Mountain', image: 'mountain-background.png', isPremium: false },
];

export default function BackgroundsScreen() {
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewBackground, setPreviewBackground] = useState<any>(null);

    const handleBackgroundSelect = (background: any) => {
        if (background.isPremium) {
            // Check premium status
            const isSubscribed = false; // This would come from user store
            if (!isSubscribed) {
                router.push('/(app)/premium');
                return;
            }
        }

        setPreviewBackground(background);
        setShowPreview(true);
    };

    const handleConfirmSelection = () => {
        if (previewBackground) {
            setSelectedBackground(previewBackground.id);
            setShowPreview(false);
            Alert.alert(
                'Background Selected',
                `${previewBackground.name} background has been applied to your greenhouse!`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        }
    };

    const renderBackgroundItem = (background: any) => (
        <TouchableOpacity
            key={background.id}
            style={styles.backgroundItem}
            onPress={() => handleBackgroundSelect(background)}
        >
            {background.isPremium && (
                <View style={styles.premiumBorder}>
                    <LinearGradient
                        colors={['#888DBE', '#FA6FB4']}
                        style={styles.premiumGradient}
                    />
                </View>
            )}

            <View style={styles.backgroundImageContainer}>
                <Image
                    source={require(`../../../assets/images/${background.image}`)} // Background image placeholder
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
                {background.isPremium && (
                    <View style={styles.premiumBadge}>
                        <Image
                            source={require('../../../assets/images/leafgradient.png')} // Premium leaf icon placeholder
                            style={styles.premiumIcon}
                        />
                    </View>
                )}
            </View>

            <View style={styles.backgroundLabel}>
                <Text style={styles.backgroundName}>{background.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primary[100], theme.colors.primary[500]]}
                style={styles.gradient}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Green House</Text>
                <View style={styles.placeholder} />
            </View>

            <Text style={styles.subtitle}>Background</Text>

            {/* Background Grid */}
            <View style={styles.contentContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.backgroundGrid}>
                        {backgrounds.map(renderBackgroundItem)}
                    </View>
                </ScrollView>
            </View>

            {/* Preview Modal */}
            <Modal
                visible={showPreview}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPreview(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.previewContainer}>
                        <Image
                            source={previewBackground ? require(`../../../assets/images/${previewBackground.image}`) : undefined}
                            style={styles.previewImage}
                            resizeMode="cover"
                        />

                        <View style={styles.previewActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowPreview(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={handleConfirmSelection}
                            >
                                <Text style={styles.selectButtonText}>Select</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary[900],
    },
    placeholder: {
        width: 44,
    },
    subtitle: {
        fontSize: 24,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.normal,
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#F3EFED',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 20,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    backgroundGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    backgroundItem: {
        width: '48%',
        marginBottom: 20,
        position: 'relative',
    },
    premiumBorder: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 17,
        zIndex: 1,
    },
    premiumGradient: {
        flex: 1,
        borderRadius: 17,
    },
    backgroundImageContainer: {
        height: 120,
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 2,
        ...theme.shadows.md,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    premiumBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        zIndex: 3,
    },
    premiumIcon: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    backgroundLabel: {
        backgroundColor: '#A3D977',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 8,
        zIndex: 2,
        ...theme.shadows.sm,
    },
    backgroundName: {
        fontSize: 14,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
        color: '#30459D',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        width: '80%',
        height: '60%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadows.lg,
    },
    previewImage: {
        flex: 1,
        width: '100%',
    },
    previewActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#FFF',
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    selectButton: {
        backgroundColor: '#A3D977',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
        color: '#666',
    },
    selectButtonText: {
        fontSize: 16,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
        color: '#FFF',
    },
});