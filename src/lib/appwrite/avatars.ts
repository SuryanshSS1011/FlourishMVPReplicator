// src/lib/appwrite/avatars.ts

import { Avatars, Browser, CreditCard, Flag } from 'react-native-appwrite';
import { appwriteService } from './config';

export interface AvatarOptions {
    width?: number;
    height?: number;
    quality?: number;
}

export interface InitialsOptions extends AvatarOptions {
    name?: string;
    background?: string;
}

export interface QRCodeOptions {
    text: string;
    size?: number;
    margin?: number;
    download?: boolean;
}

class AvatarService {
    private avatars: Avatars;

    constructor() {
        this.avatars = new Avatars(appwriteService.clientService);
    }

    /**
     * Get browser icon
     */
    getBrowserIcon(
        browserCode: Browser | string,
        options?: AvatarOptions
    ): string {
        return this.avatars.getBrowser(
            browserCode as Browser,
            options?.width || 100,
            options?.height || 100,
            options?.quality
        ).toString();
    }

    /**
     * Get country flag
     */
    getCountryFlag(
        countryCode: Flag | string,
        options?: AvatarOptions
    ): string {
        return this.avatars.getFlag(
            countryCode as Flag,
            options?.width || 100,
            options?.height || 100,
            options?.quality
        ).toString();
    }

    /**
     * Get credit card icon
     */
    getCreditCardIcon(
        cardCode: CreditCard | string,
        options?: AvatarOptions
    ): string {
        return this.avatars.getCreditCard(
            cardCode as CreditCard,
            options?.width || 100,
            options?.height || 100,
            options?.quality
        ).toString();
    }

    /**
     * Get favicon from URL
     */
    getFavicon(url: string): string {
        return this.avatars.getFavicon(url).toString();
    }

    /**
     * Get and resize image from URL
     */
    getImageFromUrl(
        url: string,
        width: number = 400,
        height: number = 400
    ): string {
        return this.avatars.getImage(url, width, height).toString();
    }

    /**
     * Generate QR code
     */
    getQRCode(options: QRCodeOptions): string {
        return this.avatars.getQR(
            options.text,
            options.size || 400,
            options.margin || 1,
            options.download || false
        ).toString();
    }

    /**
     * Get user initials avatar
     */
    getUserInitials(options?: InitialsOptions): string {
        return this.avatars.getInitials(
            options?.name,
            options?.width || 100,
            options?.height || 100,
            options?.background
        ).toString();
    }

    /**
     * Helper methods for common use cases
     */

    /**
     * Get user avatar - tries initials first, then generates from name
     */
    getUserAvatar(
        userName?: string,
        size: number = 100,
        background?: string
    ): string {
        return this.getUserInitials({
            name: userName,
            width: size,
            height: size,
            background,
        });
    }

    /**
     * Get plant category icon (using initials)
     */
    getPlantCategoryIcon(
        category: string,
        size: number = 64
    ): string {
        const colors: Record<string, string> = {
            'Houseplants': '4CAF50',
            'Succulents': '8BC34A',
            'Herbs': '66BB6A',
            'Flowers': 'E91E63',
            'Vegetables': 'FF9800',
            'Trees': '795548',
            'Cacti': '9CCC65',
            'Ferns': '00897B',
        };

        const background = colors[category] || '607D8B';

        return this.getUserInitials({
            name: category,
            width: size,
            height: size,
            background,
        });
    }

    /**
     * Get task category icon
     */
    getTaskCategoryIcon(
        category: string,
        size: number = 48
    ): string {
        const categoryIcons: Record<string, string> = {
            'watering': '💧',
            'fertilizing': '🌱',
            'pruning': '✂️',
            'repotting': '🪴',
            'cleaning': '🧹',
            'other': '📝',
        };

        const icon = categoryIcons[category] || '📝';

        return this.getUserInitials({
            name: icon,
            width: size,
            height: size,
            background: '2196F3',
        });
    }

    /**
     * Generate share QR code for plant
     */
    getPlantShareQRCode(
        plantId: string,
        size: number = 300
    ): string {
        const shareUrl = `https://flourish.app/plant/${plantId}`;

        return this.getQRCode({
            text: shareUrl,
            size,
            margin: 2,
        });
    }

    /**
     * Get achievement badge
     */
    getAchievementBadge(
        achievementName: string,
        size: number = 80
    ): string {
        const achievementColors: Record<string, string> = {
            'Green Thumb': '4CAF50',
            'Plant Parent': '8BC34A',
            'Botanist': '00BCD4',
            'Master Gardener': 'FFD700',
            'Rookie': '9E9E9E',
        };

        const background = achievementColors[achievementName] || 'FF5722';

        return this.getUserInitials({
            name: achievementName.substring(0, 2).toUpperCase(),
            width: size,
            height: size,
            background,
        });
    }

    /**
     * Get weather icon based on condition
     */
    getWeatherIcon(
        condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy',
        size: number = 64
    ): string {
        const weatherEmojis: Record<string, string> = {
            'sunny': '☀️',
            'cloudy': '☁️',
            'rainy': '🌧️',
            'snowy': '❄️',
        };

        const emoji = weatherEmojis[condition] || '🌤️';

        return this.getUserInitials({
            name: emoji,
            width: size,
            height: size,
            background: '03A9F4',
        });
    }

    /**
     * Get plant health status icon
     */
    getHealthStatusIcon(
        status: 'excellent' | 'good' | 'fair' | 'poor',
        size: number = 48
    ): string {
        const statusConfig: Record<string, { emoji: string; color: string }> = {
            'excellent': { emoji: '🌟', color: '4CAF50' },
            'good': { emoji: '✅', color: '8BC34A' },
            'fair': { emoji: '⚠️', color: 'FFC107' },
            'poor': { emoji: '🆘', color: 'F44336' },
        };

        const config = statusConfig[status] || statusConfig.fair;

        return this.getUserInitials({
            name: config.emoji,
            width: size,
            height: size,
            background: config.color,
        });
    }
}

// Create and export singleton instance
export const avatarService = new AvatarService();
export default avatarService;