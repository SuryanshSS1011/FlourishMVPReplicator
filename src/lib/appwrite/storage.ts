// src/lib/appwrite/storage.ts

import { ID, ImageGravity, ImageFormat } from 'react-native-appwrite';
import { appwriteService, APPWRITE_CONFIG } from './config';
import type { ApiResponse, UploadResponse } from '../../types/api';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface FileData {
    $id: string;
    bucketId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    name: string;
    signature: string;
    mimeType: string;
    sizeOriginal: number;
    chunksTotal: number;
    chunksUploaded: number;
}

export interface FileListResponse {
    total: number;
    files: FileData[];
}

export interface FilePreviewOptions {
    width?: number;
    height?: number;
    gravity?: ImageGravity;
    quality?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    opacity?: number;
    rotation?: number;
    background?: string;
    output?: ImageFormat;
}

class StorageService {
    private storage;

    constructor() {
        this.storage = appwriteService.storageService;
    }

    /**
     * Create a file from URI (for React Native)
     */
    private async createFileFromUri(uri: string, fileName?: string): Promise<any> {
        try {
            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            // Determine mime type
            const extension = uri.split('.').pop()?.toLowerCase() || '';
            const mimeTypes: Record<string, string> = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp',
            };
            const mimeType = mimeTypes[extension] || 'application/octet-stream';

            // Create file object for Appwrite
            const file = {
                name: fileName || `upload_${Date.now()}.${extension}`,
                type: mimeType,
                size: fileInfo.size || 0,
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            };

            return file;
        } catch (error) {
            console.error('Error creating file from URI:', error);
            throw error;
        }
    }

    /**
     * Upload a file to a specific bucket
     */
    async uploadFile(
        bucketId: string,
        fileUri: string,
        fileName?: string,
        permissions?: string[]
    ): Promise<UploadResponse> {
        try {
            console.log(`Uploading file to bucket: ${bucketId}`);

            // Create file object from URI
            const file = await this.createFileFromUri(fileUri, fileName);

            // Generate unique ID
            const fileId = ID.unique();

            // Upload file
            const response = await this.storage.createFile(
                bucketId,
                fileId,
                file,
                permissions
            );

            return {
                success: true,
                fileId: response.$id,
                message: 'File uploaded successfully',
            };
        } catch (error: any) {
            console.error('File upload error:', error);
            return {
                success: false,
                message: error.message || 'Failed to upload file',
            };
        }
    }

    /**
     * Get file metadata
     */
    async getFile(bucketId: string, fileId: string): Promise<ApiResponse<FileData>> {
        try {
            const file = await this.storage.getFile(bucketId, fileId);
            
            return {
                success: true,
                message: 'File retrieved successfully',
                data: file as FileData,
            };
        } catch (error: any) {
            console.error('Get file error:', error);
            return {
                success: false,
                message: error.message || 'Failed to get file',
                error: error.message,
            };
        }
    }

    /**
     * Get file for download
     */
    getFileDownload(bucketId: string, fileId: string): string {
        return this.storage.getFileDownload(bucketId, fileId).toString();
    }

    /**
     * Get file for view (no download headers)
     */
    getFileView(bucketId: string, fileId: string): string {
        return this.storage.getFileView(bucketId, fileId).toString();
    }

    /**
     * Get file preview with options
     */
    getFilePreview(
        bucketId: string,
        fileId: string,
        options?: FilePreviewOptions
    ): string {
        return this.storage.getFilePreview(
            bucketId,
            fileId,
            options?.width,
            options?.height,
            options?.gravity,
            options?.quality,
            options?.borderWidth,
            options?.borderColor,
            options?.borderRadius,
            options?.opacity,
            options?.rotation,
            options?.background,
            options?.output
        ).toString();
    }

    /**
     * List files in a bucket
     */
    async listFiles(
        bucketId: string,
        queries?: string[],
        search?: string
    ): Promise<ApiResponse<FileListResponse>> {
        try {
            const response = await this.storage.listFiles(
                bucketId,
                queries,
                search
            );

            return {
                success: true,
                message: 'Files listed successfully',
                data: {
                    total: response.total,
                    files: response.files as FileData[],
                },
            };
        } catch (error: any) {
            console.error('List files error:', error);
            return {
                success: false,
                message: error.message || 'Failed to list files',
                error: error.message,
            };
        }
    }

    /**
     * Update file metadata
     */
    async updateFile(
        bucketId: string,
        fileId: string,
        name?: string,
        permissions?: string[]
    ): Promise<ApiResponse<FileData>> {
        try {
            const response = await this.storage.updateFile(
                bucketId,
                fileId,
                name,
                permissions
            );

            return {
                success: true,
                message: 'File updated successfully',
                data: response as FileData,
            };
        } catch (error: any) {
            console.error('Update file error:', error);
            return {
                success: false,
                message: error.message || 'Failed to update file',
                error: error.message,
            };
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(bucketId: string, fileId: string): Promise<ApiResponse> {
        try {
            await this.storage.deleteFile(bucketId, fileId);

            return {
                success: true,
                message: 'File deleted successfully',
            };
        } catch (error: any) {
            console.error('Delete file error:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete file',
                error: error.message,
            };
        }
    }

    /**
     * Helper method to upload plant image
     */
    async uploadPlantImage(
        fileUri: string,
        plantName: string
    ): Promise<UploadResponse> {
        const fileName = `plant_${plantName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        return this.uploadFile(
            APPWRITE_CONFIG.buckets.plantImages,
            fileUri,
            fileName,
            ['read("any")'] // Public read access
        );
    }

    /**
     * Helper method to upload task icon
     */
    async uploadTaskIcon(
        fileUri: string,
        taskName: string
    ): Promise<UploadResponse> {
        const fileName = `task_${taskName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`;
        return this.uploadFile(
            APPWRITE_CONFIG.buckets.taskImages,
            fileUri,
            fileName,
            ['read("any")']
        );
    }

    /**
     * Helper method to upload nutrient image
     */
    async uploadNutrientImage(
        fileUri: string,
        nutrientName: string
    ): Promise<UploadResponse> {
        const fileName = `nutrient_${nutrientName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        return this.uploadFile(
            APPWRITE_CONFIG.buckets.nutrientImages,
            fileUri,
            fileName,
            ['read("any")']
        );
    }

    /**
     * Helper method to upload background image
     */
    async uploadBackgroundImage(
        fileUri: string,
        backgroundName: string
    ): Promise<UploadResponse> {
        const fileName = `background_${backgroundName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        return this.uploadFile(
            APPWRITE_CONFIG.buckets.backgrounds,
            fileUri,
            fileName,
            ['read("any")']
        );
    }

    /**
     * Get plant image URL
     */
    getPlantImageUrl(fileId: string, preview: boolean = false): string {
        if (preview) {
            return this.getFilePreview(APPWRITE_CONFIG.buckets.plantImages, fileId, {
                width: 300,
                height: 300,
                quality: 80,
            });
        }
        return this.getFileView(APPWRITE_CONFIG.buckets.plantImages, fileId);
    }

    /**
     * Get task icon URL
     */
    getTaskIconUrl(fileId: string): string {
        return this.getFileView(APPWRITE_CONFIG.buckets.taskImages, fileId);
    }

    /**
     * Get nutrient image URL
     */
    getNutrientImageUrl(fileId: string, preview: boolean = false): string {
        if (preview) {
            return this.getFilePreview(APPWRITE_CONFIG.buckets.nutrientImages, fileId, {
                width: 200,
                height: 200,
                quality: 80,
            });
        }
        return this.getFileView(APPWRITE_CONFIG.buckets.nutrientImages, fileId);
    }

    /**
     * Get background image URL
     */
    getBackgroundImageUrl(fileId: string): string {
        return this.getFileView(APPWRITE_CONFIG.buckets.backgrounds, fileId);
    }

    /**
     * Get pre-login asset URL
     */
    getPreLoginAssetUrl(fileId: string): string {
        return this.getFileView(APPWRITE_CONFIG.buckets.preLoginAssets, fileId);
    }

    /**
     * Get dashboard asset URL
     */
    getDashboardAssetUrl(fileId: string): string {
        return this.getFileView(APPWRITE_CONFIG.buckets.dashboardAssets, fileId);
    }

    /**
     * Generic method to get file URL for any bucket
     */
    getFileUrl(bucketId: string, fileId: string): string {
        return this.getFileView(bucketId, fileId);
    }
}

// Create and export singleton instance
export const storageService = new StorageService();
export default storageService;