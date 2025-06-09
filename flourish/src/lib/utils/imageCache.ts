// src/lib/utils/imageCache.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

interface CachedImage {
    uri: string;
    localPath: string;
    timestamp: number;
    fileId: string;
}

class ImageCacheManager {
    private cacheDirectory = `${FileSystem.cacheDirectory}splash-images/`;
    private cacheKey = 'splash_image_cache';
    private maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    async ensureCacheDirectory() {
        const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
        }
    }

    async getCachedImagePath(fileId: string, remoteUri: string): Promise<string | null> {
        try {
            await this.ensureCacheDirectory();

            // Check if image is cached
            const cacheData = await AsyncStorage.getItem(this.cacheKey);
            const cache: Record<string, CachedImage> = cacheData ? JSON.parse(cacheData) : {};

            const cachedImage = cache[fileId];

            if (cachedImage) {
                // Check if cache is still valid
                const isExpired = Date.now() - cachedImage.timestamp > this.maxCacheAge;

                if (!isExpired) {
                    // Check if file still exists
                    const fileInfo = await FileSystem.getInfoAsync(cachedImage.localPath);
                    if (fileInfo.exists) {
                        console.log(`Using cached image for ${fileId}`);
                        return cachedImage.localPath;
                    }
                }

                // Clean up expired or missing cache entry
                delete cache[fileId];
                await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cache));
            }

            // Download and cache the image
            const localPath = `${this.cacheDirectory}${fileId}.png`;
            console.log(`Downloading splash image ${fileId}...`);

            const downloadResult = await FileSystem.downloadAsync(remoteUri, localPath);

            if (downloadResult.status === 200) {
                // Update cache
                cache[fileId] = {
                    uri: remoteUri,
                    localPath,
                    timestamp: Date.now(),
                    fileId,
                };

                await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cache));
                console.log(`Successfully cached image ${fileId}`);
                return localPath;
            }

            return null;
        } catch (error) {
            console.warn(`Failed to cache image ${fileId}:`, error);
            return null;
        }
    }

    async clearCache(): Promise<void> {
        try {
            await FileSystem.deleteAsync(this.cacheDirectory, { idempotent: true });
            await AsyncStorage.removeItem(this.cacheKey);
            console.log('Splash image cache cleared');
        } catch (error) {
            console.warn('Failed to clear splash image cache:', error);
        }
    }

    async getCacheSize(): Promise<number> {
        try {
            const cacheData = await AsyncStorage.getItem(this.cacheKey);
            const cache: Record<string, CachedImage> = cacheData ? JSON.parse(cacheData) : {};

            let totalSize = 0;
            for (const cachedImage of Object.values(cache)) {
                try {
                    const fileInfo = await FileSystem.getInfoAsync(cachedImage.localPath);
                    if (fileInfo.exists && fileInfo.size) {
                        totalSize += fileInfo.size;
                    }
                } catch (error) {
                    // Ignore errors for individual files
                }
            }

            return totalSize;
        } catch (error) {
            console.warn('Failed to calculate cache size:', error);
            return 0;
        }
    }
}

export const imageCacheManager = new ImageCacheManager();

