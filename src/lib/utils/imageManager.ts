// src/lib/utils/imageManager.ts

import * as ImagePicker from 'expo-image-picker';
import { avatarService } from '../appwrite/avatars';
import { APPWRITE_CONFIG } from '../appwrite/config';
import { storageService } from '../appwrite/storage';

/**
 * Centralized image manager for handling all image operations
 */

export interface ImageSource {
    uri: string;
    headers?: Record<string, string>;
}

// Map of default file IDs for app assets
// These should be uploaded to Appwrite storage buckets
export const DEFAULT_IMAGE_IDS = {
    // Pre-login assets
    'login-bg': '6847c9cf00240ecc5f97',
    'splash-1': '6847c994002d72a883f6',
    'splash-2': '6847c99a002813f02e69',
    'splash-3': '6847c99f00176a858e29',
    'splash-4': '6847c9a40038fe8d82cf',
    'splash-5': '6847c9a9001863b51a8d',
    'splash-6': '6847c9ae001120c81361',
    'onboarding-1': '6847c9b30012242d16e7',
    'onboarding-2': '6847c9b7003bed08455f',
    'onboarding-3': '6847c9bc003074911ef2',
    'arrow-left': '6847c9c700309f4da37d',
    'arrow-right': '6847c9c2001124b6c519',

    // Dashboard assets
    'dashboard-bg': '684bb33f0026b8d4c616',
    'icon-plus': '684bb2ee0019251d6a07',
    'icon-hamburger-menu': '684bb2fa00033fe13084',
    'icon-waterdrop': '684bb26b00089765086c',
    'icon-gift': '684bb30b000faf3eac68',
    'icon-bell': '684bb36000023c63eb69',
    'icon-premium': '684bb2c0000551517c19',
    'tab-home': '684bb30500205e1b1768',
    'tab-garden': '684bb316003b7f7debee',
    'tab-shop': '684bb2ab000bb515220d',
    'tab-encyclopedia': '684bb3360012dc6ebc88',

    // Greenhouse elements
    'greenhouse-border': 'greenhouse_border',
    'greenhouse-sand': 'greenhouse_sand',
    'greenhouse-sun': 'greenhouse_sun',
    'default-vase': 'greenhouse_default_vase',

    // Default images
    'default-plant': 'default_plant_image',
    'default-nutrient': 'default_nutrient_image',
    'default-background': 'default_background',
    'default-task': 'default_task_icon',
};

class ImageManager {
    private imageCache: Map<string, string> = new Map();

    /**
     * Get image URL from storage
     */
    getImageUrl(fileId: string, bucketId: string, preview?: boolean): string {
        const cacheKey = `${bucketId}_${fileId}_${preview}`;
        
        // Check cache
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey)!;
        }

        let url: string;
        
        if (preview) {
            url = storageService.getFilePreview(bucketId, fileId, {
                width: 300,
                height: 300,
                quality: 85,
            });
        } else {
            url = storageService.getFileView(bucketId, fileId);
        }

        // Cache the URL
        this.imageCache.set(cacheKey, url);
        return url;
    }

    /**
     * Get plant image URL
     */
    getPlantImage(fileId: string, preview: boolean = true): string {
        return this.getImageUrl(
            fileId,
            APPWRITE_CONFIG.buckets.plantImages,
            preview
        );
    }

    /**
     * Get nutrient image URL
     */
    getNutrientImage(fileId: string): string {
        return this.getImageUrl(
            fileId,
            APPWRITE_CONFIG.buckets.nutrientImages,
            false
        );
    }

    /**
     * Get task icon URL
     */
    getTaskIcon(fileId: string): string {
        return this.getImageUrl(
            fileId,
            APPWRITE_CONFIG.buckets.taskImages,
            false
        );
    }

    /**
     * Get background image URL
     */
    getBackgroundImage(fileId: string): string {
        return this.getImageUrl(
            fileId,
            APPWRITE_CONFIG.buckets.backgrounds,
            false
        );
    }

    /**
     * Get pre-login asset URL
     */
    getPreLoginAsset(assetName: string): string {
        const fileId = DEFAULT_IMAGE_IDS[assetName as keyof typeof DEFAULT_IMAGE_IDS];
        if (!fileId) {
            console.warn(`No file ID found for asset: ${assetName}`);
            return '';
        }

        return this.getImageUrl(
            fileId,
            APPWRITE_CONFIG.buckets.preLoginAssets,
            false
        );
    }

    /**
     * Get dashboard asset URL
     */
    getDashboardAsset(assetName: string): string {
        const fileId = DEFAULT_IMAGE_IDS[assetName as keyof typeof DEFAULT_IMAGE_IDS];
        if (!fileId) {
            console.warn(`No file ID found for asset: ${assetName}`);
            return '';
        }

        return this.getImageUrl(
            fileId,
            APPWRITE_CONFIG.buckets.dashboardAssets,
            false
        );
    }

    /**
     * Get user avatar
     */
    getUserAvatar(userName?: string, size: number = 100): string {
        return avatarService.getUserAvatar(userName, size);
    }

    /**
     * Upload image from camera
     */
    async uploadFromCamera(
        bucketId: string,
        fileName?: string,
        permissions?: string[]
    ): Promise<{ success: boolean; fileId?: string; error?: string }> {
        try {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                return {
                    success: false,
                    error: 'Camera permission denied',
                };
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) {
                return {
                    success: false,
                    error: 'Camera capture cancelled',
                };
            }

            // Upload image
            const uploadResult = await storageService.uploadImageFromPicker(
                bucketId,
                result,
                fileName,
                permissions
            );

            return {
                success: uploadResult.success,
                fileId: uploadResult.fileId,
                error: uploadResult.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to capture image',
            };
        }
    }

    /**
     * Upload image from gallery
     */
    async uploadFromGallery(
        bucketId: string,
        fileName?: string,
        permissions?: string[]
    ): Promise<{ success: boolean; fileId?: string; error?: string }> {
        try {
            // Request gallery permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                return {
                    success: false,
                    error: 'Gallery permission denied',
                };
            }

            // Launch gallery
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) {
                return {
                    success: false,
                    error: 'Gallery selection cancelled',
                };
            }

            // Upload image
            const uploadResult = await storageService.uploadImageFromPicker(
                bucketId,
                result,
                fileName,
                permissions
            );

            return {
                success: uploadResult.success,
                fileId: uploadResult.fileId,
                error: uploadResult.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to select image',
            };
        }
    }

    /**
     * Clear image cache
     */
    clearCache() {
        this.imageCache.clear();
    }

    /**
     * Preload images
     */
    async preloadImages(imageIds: string[], bucketId: string): Promise<void> {
        const promises = imageIds.map(fileId => {
            // Get URL to trigger caching
            this.getImageUrl(fileId, bucketId, true);
        });

        await Promise.all(promises);
    }
}

// Export singleton instance
export const imageManager = new ImageManager();

// Helper function to get image source for React Native Image component
export const getImageSource = (url: string): ImageSource => {
    return { uri: url };
};

// Default export
export default imageManager;