// src/lib/appwrite/storage.ts

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { ID, ImageFormat, ImageGravity } from 'react-native-appwrite';
import type { ApiResponse } from '../../types/api';
import { APPWRITE_CONFIG, appwriteService } from './config';

export interface FileData {
    $id: string;
    bucketId: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    signature: string;
    mimeType: string;
    sizeOriginal: number;
    chunksTotal: number;
    chunksUploaded: number;
}

export interface UploadResponse extends ApiResponse {
    fileId?: string;
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
     * Create file object from URI for React Native
     * This properly handles file uploads in React Native
     */
    private async createFileFromUri(uri: string, fileName?: string): Promise<any> {
        try {
            // Generate filename if not provided
            const finalFileName = fileName || `upload_${Date.now()}.jpg`;

            // For React Native with Expo, we need to handle the file differently
            // The Appwrite SDK expects a specific format for file uploads

            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Create blob from base64
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // Determine MIME type
            const mimeType = this.getMimeTypeFromUri(uri, finalFileName);

            // Create blob
            const blob = new Blob([byteArray], { type: mimeType });

            // Return file object that Appwrite SDK expects
            return {
                name: finalFileName,
                type: mimeType,
                size: byteArray.length,
                uri: uri,
                // For React Native, we pass the actual file data
                // The SDK will handle the upload properly
                _parts: [[finalFileName, blob]],
            };
        } catch (error) {
            console.error('Error creating file from URI:', error);
            throw error;
        }
    }

    /**
     * Helper to determine MIME type from URI
     */
    private getMimeTypeFromUri(uri: string, fileName: string): string {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        const mimeTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
        };

        return mimeTypes[extension] || 'application/octet-stream';
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

            // For React Native, we need to handle the file upload differently
            // The Appwrite React Native SDK expects the file URI directly
            const fileId = ID.unique();
            const finalFileName = fileName || `upload_${Date.now()}.jpg`;

            // The React Native SDK handles file uploads from URIs directly
            const response = await this.storage.createFile(
                bucketId,
                fileId,
                {
                    name: finalFileName,
                    type: this.getMimeTypeFromUri(fileUri, finalFileName),
                    size: 0, // Size will be determined by the SDK
                    uri: fileUri,
                } as any,
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
     * Upload image from image picker result
     */
    async uploadImageFromPicker(
        bucketId: string,
        pickerResult: ImagePicker.ImagePickerResult,
        fileName?: string,
        permissions?: string[]
    ): Promise<UploadResponse> {
        if (pickerResult.canceled || !pickerResult.assets?.[0]) {
            return {
                success: false,
                message: 'No image selected',
            };
        }

        const asset = pickerResult.assets[0];
        return this.uploadFile(bucketId, asset.uri, fileName, permissions);
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
     * Delete file
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
    ): Promise<ApiResponse<FileData[]>> {
        try {
            const response = await this.storage.listFiles(
                bucketId,
                queries,
                search
            );

            return {
                success: true,
                message: 'Files retrieved successfully',
                data: response.files as FileData[],
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
     * Helper method to upload plant image
     */
    async uploadPlantImage(
        fileUri: string,
        plantName: string,
        userId?: string
    ): Promise<UploadResponse> {
        const fileName = `plant_${plantName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        const permissions = userId
            ? [`read("user:${userId}")`, `write("user:${userId}")`]
            : ['read("any")'];

        return this.uploadFile(
            APPWRITE_CONFIG.buckets.plantImages,
            fileUri,
            fileName,
            permissions
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
     * Get nutrient image URL
     */
    getNutrientImageUrl(fileId: string): string {
        return this.getFileView(APPWRITE_CONFIG.buckets.nutrientImages, fileId);
    }

    /**
     * Get task icon URL
     */
    getTaskIconUrl(fileId: string): string {
        return this.getFileView(APPWRITE_CONFIG.buckets.taskImages, fileId);
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
}

// Export service instance
export const storageService = new StorageService();

// Default export
export default storageService;