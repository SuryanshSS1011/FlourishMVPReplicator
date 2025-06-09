// src/hooks/useSplashImages.ts

import { useState, useEffect } from 'react';
import { storageService } from '../lib/appwrite/storage';
import { APPWRITE_CONFIG } from '../lib/appwrite/config';
import { imageCacheManager } from '../lib/utils/imageCache';

interface SplashImageState {
    images: (string | null)[];
    loading: boolean;
    error: boolean;
    progress: number;
}

export const useSplashImages = (imageIds: string[]) => {
    const [state, setState] = useState<SplashImageState>({
        images: [],
        loading: true,
        error: false,
        progress: 0,
    });

    useEffect(() => {
        let isMounted = true;

        const loadImages = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: false, progress: 0 }));

                const imagePromises = imageIds.map(async (fileId, index) => {
                    try {
                        // Get remote URL
                        const remoteUrl = storageService.getFileUrl(
                            APPWRITE_CONFIG.buckets.preLogin,
                            fileId
                        );

                        // Try to get cached version first
                        const cachedPath = await imageCacheManager.getCachedImagePath(fileId, remoteUrl);

                        if (isMounted) {
                            setState(prev => ({
                                ...prev,
                                progress: ((index + 1) / imageIds.length) * 100,
                            }));
                        }

                        return cachedPath || remoteUrl;
                    } catch (error) {
                        console.warn(`Failed to load splash image ${fileId}:`, error);
                        return null;
                    }
                });

                const resolvedImages = await Promise.all(imagePromises);

                if (isMounted) {
                    setState({
                        images: resolvedImages,
                        loading: false,
                        error: resolvedImages.every(img => img === null),
                        progress: 100,
                    });
                }
            } catch (error) {
                console.error('Error loading splash images:', error);
                if (isMounted) {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: true,
                        progress: 100,
                    }));
                }
            }
        };

        loadImages();

        return () => {
            isMounted = false;
        };
    }, [imageIds]);

    return state;
};