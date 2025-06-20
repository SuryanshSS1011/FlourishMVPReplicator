// src/lib/utils/imageManager.ts

import { storageService } from '../appwrite/storage';
import { APPWRITE_CONFIG } from '../appwrite/config';

/**
 * Centralized image manager for Appwrite storage
 * Maps image names to their bucket locations and file IDs
 */

export interface ImageMapping {
    fileId: string;
    bucket: string;
    fallback?: any; // Fallback to local asset if needed
}

// Image mappings by category
export const IMAGE_MAPPINGS = {
    // Pre-login assets (splash screens, onboarding, login)
    preLogin: {
        'login-page-1': { fileId: 'login-page-1', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'splash1': { fileId: 'splash1', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'splash2': { fileId: 'splash2', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'splash3': { fileId: 'splash3', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'splash4': { fileId: 'splash4', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'splash5': { fileId: 'splash5', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'splash6': { fileId: 'splash6', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'onboarding1': { fileId: 'onboarding1', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'onboarding2': { fileId: 'onboarding2', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
        'onboarding3': { fileId: 'onboarding3', bucket: APPWRITE_CONFIG.buckets.preLoginAssets },
    },

    // Dashboard assets (main app UI elements)
    dashboard: {
        'sunshine': { fileId: 'sunshine', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'base': { fileId: 'base', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'flower': { fileId: 'flower', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'profile-picture': { fileId: 'profile-picture', bucket: APPWRITE_CONFIG.buckets.userAvatars },
        'gift': { fileId: 'gift', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'bell': { fileId: 'bell', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
    },

    // Task icons (all the task-related icons)
    taskIcons: {
        '24 hours': { fileId: '24-hours', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'bag': { fileId: 'bag', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'bellring': { fileId: 'bellring', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'burger': { fileId: 'burger', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'call': { fileId: 'call', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'car': { fileId: 'car', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'cheers': { fileId: 'cheers', bucket: APPWRITE_CONFIG.buckets.taskImages }, // Rem
        'chef': { fileId: 'chef', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'cart': { fileId: 'cart', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'computer': { fileId: 'computer', bucket: APPWRITE_CONFIG.buckets.taskImages }, // Rem
        'cycle': { fileId: 'cycle', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'doctor': { fileId: 'doctor', bucket: APPWRITE_CONFIG.buckets.taskImages }, // Rem
        'email': { fileId: 'email', bucket: APPWRITE_CONFIG.buckets.taskImages }, // Rem
        'food': { fileId: 'food', bucket: APPWRITE_CONFIG.buckets.taskImages }, // Rem
        'game': { fileId: 'game', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'grad': { fileId: 'grad', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'guitar': { fileId: 'guitar', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'gym': { fileId: 'gym', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'heart': { fileId: 'heart', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'home': { fileId: 'home', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'paint': { fileId: 'paint', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'pet': { fileId: 'pet', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'pizza': { fileId: 'pizza', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'profile': { fileId: 'profile', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'ringbell': { fileId: 'ringbell', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'shopping': { fileId: 'shopping', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'video': { fileId: 'video', bucket: APPWRITE_CONFIG.buckets.taskImages },
        'tea': { fileId: 'tea', bucket: APPWRITE_CONFIG.buckets.taskImages },
    },

    // Background images
    backgrounds: {
        'leafgradient': { fileId: 'leafgradient', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'brick-background': { fileId: 'brick-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'forest-background': { fileId: 'forest-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'marble-background': { fileId: 'marble-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'sky-background': { fileId: 'sky-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'stone-background': { fileId: 'stone-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'wood-background': { fileId: 'wood-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'galaxy-background': { fileId: 'galaxy-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'desert-background': { fileId: 'desert-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'ocean-background': { fileId: 'ocean-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'mountain-background': { fileId: 'mountain-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
    },

    // Plant images
    plants: {
        'default-plant': { fileId: 'default-plant', bucket: APPWRITE_CONFIG.buckets.plantImages },
    },

    // Nutrient images
    nutrients: {
        'default-nutrient': { fileId: 'default-nutrient', bucket: APPWRITE_CONFIG.buckets.nutrientImages },
    },

    // UI elements (arrows, buttons, icons)
    ui: {
        'Waterdrop': { fileId: 'waterdrop', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'Clock': { fileId: 'clock', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'calendar_month': { fileId: 'calendar-month', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'Down arrow': { fileId: 'down-arrow', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'Repeat': { fileId: 'repeat', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'wplus': { fileId: 'wplus', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'MagnifyingGlass': { fileId: 'magnifying-glass', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'Plus': { fileId: 'plus', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'back-button': { fileId: 'back-button', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'arrow-right': { fileId: 'arrow-right', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'arrow-left': { fileId: 'arrow-left', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'home2': { fileId: 'home2', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'premium': { fileId: 'premium', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        // Tab bar icons
        'home-icon': { fileId: 'home-icon', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'garden': { fileId: 'garden', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'shop': { fileId: 'shop', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'encyclopedia': { fileId: 'encyclopedia', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
    },

    // Greenhouse specific elements
    greenhouse: {
        'border': { fileId: 'border', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'sand': { fileId: 'sand', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'sun': { fileId: 'sun', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'brick-background': { fileId: 'brick-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'vase': { fileId: 'vase', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'Flourish-logo': { fileId: 'flourish-logo', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
    },

    // Premium feature images
    premium: {
        'premium-background': { fileId: 'premium-background', bucket: APPWRITE_CONFIG.buckets.backgrounds },
        'leafff': { fileId: 'leafff', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
        'welcome-plant': { fileId: 'welcome-plant', bucket: APPWRITE_CONFIG.buckets.dashboardAssets },
    },
} as const;

class ImageManager {
    /**
     * Get image URL from Appwrite storage
     */
    getImageUrl(category: keyof typeof IMAGE_MAPPINGS, imageName: string): string {
        const categoryMappings = IMAGE_MAPPINGS[category] as Record<string, ImageMapping>;
        const mapping = categoryMappings?.[imageName];

        if (!mapping) {
            console.warn(`Image mapping not found for ${category}/${imageName}`);
            return 'https://via.placeholder.com/150';
        }

        return storageService.getFileUrl(mapping.bucket, mapping.fileId);
    }

    /**
     * Get image source object for React Native Image component
     */
    getImageSource(category: keyof typeof IMAGE_MAPPINGS, imageName: string): { uri: string } {
        return { uri: this.getImageUrl(category, imageName) };
    }

    /**
     * Get preview URL with dimensions
     */
    getImagePreview(
        category: keyof typeof IMAGE_MAPPINGS,
        imageName: string,
        width?: number,
        height?: number
    ): string {
        const categoryMappings = IMAGE_MAPPINGS[category] as Record<string, ImageMapping>;
        const mapping = categoryMappings?.[imageName];

        if (!mapping) {
            console.warn(`Image mapping not found for ${category}/${imageName}`);
            return 'https://via.placeholder.com/150';
        }

        return storageService.getFilePreview(mapping.bucket, mapping.fileId, width, height);
    }

    /**
     * Bulk get multiple image URLs
     */
    getMultipleImageUrls(requests: { category: keyof typeof IMAGE_MAPPINGS; imageName: string }[]): string[] {
        return requests.map(({ category, imageName }) => this.getImageUrl(category, imageName));
    }

    /**
     * Get all images in a category
     */
    getCategoryImages(category: keyof typeof IMAGE_MAPPINGS): Record<string, string> {
        const categoryMappings = IMAGE_MAPPINGS[category] as Record<string, ImageMapping>;
        const result: Record<string, string> = {};

        Object.keys(categoryMappings).forEach(imageName => {
            result[imageName] = this.getImageUrl(category, imageName);
        });

        return result;
    }

    /**
     * Helper method for task icons specifically
     */
    getTaskIcon(iconName: string): string {
        return this.getImageUrl('taskIcons', iconName);
    }

    /**
     * Helper method for task icon source
     */
    getTaskIconSource(iconName: string): { uri: string } {
        return this.getImageSource('taskIcons', iconName);
    }
}

// Export singleton instance
export const imageManager = new ImageManager();

// Convenience functions for common use cases
export const getTaskIcon = (iconName: string) => imageManager.getTaskIcon(iconName);
export const getTaskIconSource = (iconName: string) => imageManager.getTaskIconSource(iconName);
export const getPreLoginImage = (imageName: string) => imageManager.getImageUrl('preLogin', imageName);
export const getPreLoginImageSource = (imageName: string) => imageManager.getImageSource('preLogin', imageName);
export const getDashboardImage = (imageName: string) => imageManager.getImageUrl('dashboard', imageName);
export const getDashboardImageSource = (imageName: string) => imageManager.getImageSource('dashboard', imageName);
export const getUIImage = (imageName: string) => imageManager.getImageUrl('ui', imageName);
export const getUIImageSource = (imageName: string) => imageManager.getImageSource('ui', imageName);
export const getGreenhouseImage = (imageName: string) => imageManager.getImageUrl('greenhouse', imageName);
export const getGreenhouseImageSource = (imageName: string) => imageManager.getImageSource('greenhouse', imageName);
export const getPremiumImage = (imageName: string) => imageManager.getImageUrl('premium', imageName);
export const getPremiumImageSource = (imageName: string) => imageManager.getImageSource('premium', imageName);
export const getBackgroundImage = (imageName: string) => imageManager.getImageUrl('backgrounds', imageName);
export const getBackgroundImageSource = (imageName: string) => imageManager.getImageSource('backgrounds', imageName);