// src/lib/utils/imageManager.ts

import { avatarService } from '../appwrite/avatars';
import { APPWRITE_CONFIG } from '../appwrite/config';
import { storageService } from '../appwrite/storage';

/**
 * Centralized image manager for Appwrite storage
 * Maps image names to their file IDs and provides URLs
 */

export interface ImageMapping {
    fileId: string;
    bucket: string;
    fallback?: any;
}

// Default file IDs for common assets
// These should be populated after uploading initial assets to Appwrite
export const DEFAULT_FILE_IDS = {
    // Pre-login assets
    'login-page-1': 'default-login-bg',
    'splash1': 'splash-screen-1',
    'splash2': 'splash-screen-2',
    'splash3': 'splash-screen-3',
    'splash4': 'splash-screen-4',
    'splash5': 'splash-screen-5',
    'splash6': 'splash-screen-6',
    'onboarding1': 'onboarding-1',
    'onboarding2': 'onboarding-2',
    'onboarding3': 'onboarding-3',

    // Dashboard assets
    'sunshine': 'icon-sunshine',
    'base': 'icon-base',
    'flower': 'icon-flower',
    'gift': 'icon-gift',
    'bell': 'icon-bell',
    'back-button': 'icon-back',
    'arrow-right': 'icon-arrow-right',
    'arrow-left': 'icon-arrow-left',
    'home2': 'icon-home2',
    'premium': 'icon-premium',

    // Tab bar icons
    'home-icon': 'tab-home',
    'garden': 'tab-garden',
    'shop': 'tab-shop',
    'encyclopedia': 'tab-encyclopedia',

    // Greenhouse elements
    'border': 'greenhouse-border',
    'sand': 'greenhouse-sand',
    'sun': 'greenhouse-sun',
    'vase': 'greenhouse-vase',
    'flourish-logo': 'flourish-logo',

    // Premium features
    'leafff': 'premium-leaf',
    'welcome-plant': 'premium-welcome',

    // Default images
    'default-plant': 'default-plant-image',
    'default-nutrient': 'default-nutrient-image',
    'default-background': 'default-background',
};

class ImageManager {
    /**
     * Get image URL from Appwrite storage or fallback to default
     */
    async getImageUrl(imageName: string, bucket?: string): Promise<string> {
        try {
            // First, try to get the file ID from defaults
            const fileId = DEFAULT_FILE_IDS[imageName as keyof typeof DEFAULT_FILE_IDS];

            if (!fileId) {
                // If no default, use the image name as file ID
                console.warn(`No default file ID for image: ${imageName}`);
                return this.getFallbackUrl(imageName);
            }

            // Determine the bucket based on image type
            const bucketId = bucket || this.getBucketForImage(imageName);

            // Get the file URL from storage service
            return storageService.getFileView(bucketId, fileId);
        } catch (error) {
            console.error(`Error getting image URL for ${imageName}:`, error);
            return this.getFallbackUrl(imageName);
        }
    }

    /**
     * Get image source object for React Native Image component
     */
    async getImageSource(imageName: string, bucket?: string): Promise<{ uri: string }> {
        const url = await this.getImageUrl(imageName, bucket);
        return { uri: url };
    }

    /**
     * Get preview URL with dimensions
     */
    async getImagePreview(
        imageName: string,
        width?: number,
        height?: number,
        quality?: number,
        bucket?: string
    ): Promise<string> {
        try {
            const fileId = DEFAULT_FILE_IDS[imageName as keyof typeof DEFAULT_FILE_IDS] || imageName;
            const bucketId = bucket || this.getBucketForImage(imageName);

            return storageService.getFilePreview(bucketId, fileId, {
                width,
                height,
                quality,
            });
        } catch (error) {
            console.error(`Error getting image preview for ${imageName}:`, error);
            return this.getFallbackUrl(imageName);
        }
    }

    /**
     * Determine the appropriate bucket for an image based on its name
     */
    private getBucketForImage(imageName: string): string {
        // Pre-login assets
        if (['login', 'splash', 'onboarding'].some(prefix => imageName.startsWith(prefix))) {
            return APPWRITE_CONFIG.buckets.preLoginAssets;
        }

        // Background images
        if (imageName.includes('background')) {
            return APPWRITE_CONFIG.buckets.backgrounds;
        }

        // Task images
        if (imageName.includes('task') || this.isTaskIcon(imageName)) {
            return APPWRITE_CONFIG.buckets.taskImages;
        }

        // Plant images
        if (imageName.includes('plant')) {
            return APPWRITE_CONFIG.buckets.plantImages;
        }

        // Nutrient images
        if (imageName.includes('nutrient')) {
            return APPWRITE_CONFIG.buckets.nutrientImages;
        }

        // Default to dashboard assets
        return APPWRITE_CONFIG.buckets.dashboardAssets;
    }

    /**
     * Check if image name is a task icon
     */
    private isTaskIcon(imageName: string): boolean {
        const taskIconNames = [
            '24 hours', 'bag', 'bellring', 'burger', 'cat', 'clock',
            'dumbbell', 'family', 'flower-plant', 'game', 'game-console',
            'heart', 'home', 'love', 'medicine', 'money', 'music',
            'nature', 'notebook', 'personal', 'plant-hand', 'search',
            'sleep', 'study', 'television', 'travel', 'water', 'work',
        ];

        return taskIconNames.includes(imageName);
    }

    /**
     * Get fallback URL for missing images
     */
    private getFallbackUrl(imageName: string): string {
        // Use avatar service to generate a placeholder
        return avatarService.getUserInitials({
            name: imageName.charAt(0).toUpperCase(),
            width: 200,
            height: 200,
            background: '9E9E9E',
        });
    }

    /**
     * Upload and register a new image
     */
    async uploadAndRegisterImage(
        fileUri: string,
        imageName: string,
        bucket?: string
    ): Promise<{ success: boolean; fileId?: string; url?: string }> {
        try {
            const bucketId = bucket || this.getBucketForImage(imageName);
            const result = await storageService.uploadFile(
                bucketId,
                fileUri,
                imageName
            );

            if (result.success && result.fileId) {
                // Update the default file IDs mapping
                DEFAULT_FILE_IDS[imageName as keyof typeof DEFAULT_FILE_IDS] = result.fileId;

                const url = storageService.getFileView(bucketId, result.fileId);
                return {
                    success: true,
                    fileId: result.fileId,
                    url,
                };
            }

            return { success: false };
        } catch (error) {
            console.error('Error uploading image:', error);
            return { success: false };
        }
    }

    /**
     * Batch preload images for better performance
     */
    async preloadImages(imageNames: string[]): Promise<void> {
        const promises = imageNames.map(async (imageName) => {
            try {
                await this.getImageUrl(imageName);
            } catch (error) {
                console.error(`Failed to preload ${imageName}:`, error);
            }
        });

        await Promise.all(promises);
    }
}

// Create singleton instance
export const imageManager = new ImageManager();

// Export helper functions for backward compatibility
export const getImageUrl = (imageName: string, bucket?: string) =>
    imageManager.getImageUrl(imageName, bucket);

export const getImageSource = (imageName: string, bucket?: string) =>
    imageManager.getImageSource(imageName, bucket);

export const getImagePreview = (
    imageName: string,
    width?: number,
    height?: number,
    quality?: number,
    bucket?: string
) => imageManager.getImagePreview(imageName, width, height, quality, bucket);

// Specific helper functions
export const getBackgroundImageSource = (imageName: string) =>
    imageManager.getImageSource(imageName, APPWRITE_CONFIG.buckets.backgrounds);

export const getPlantImageSource = (fileId: string) => ({
    uri: storageService.getPlantImageUrl(fileId)
});

export const getTaskIconSource = (fileId: string) => ({
    uri: storageService.getTaskIconUrl(fileId)
});

export const getNutrientImageSource = (fileId: string) => ({
    uri: storageService.getNutrientImageUrl(fileId)
});