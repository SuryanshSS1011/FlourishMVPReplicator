// src/lib/appwrite/storage.ts

import { ID } from 'react-native-appwrite';
import { appwriteService, APPWRITE_CONFIG } from './config';
import type { ApiResponse } from '../../types';

class StorageService {
    private storage = appwriteService.storageService;

    /**
     * Upload file to storage
     */
    async uploadFile(
        bucketId: string,
        file: {
            uri: string;
            name: string;
            type: string;
        }
    ): Promise<ApiResponse<string>> {
        try {
            const fileId = ID.unique();

            const response = await this.storage.createFile(
                bucketId,
                fileId,
                {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                } as any
            );

            return {
                success: true,
                message: 'File uploaded successfully',
                data: response.$id,
            };
        } catch (error: any) {
            console.error('Upload file error:', error);
            return {
                success: false,
                message: 'Failed to upload file',
                error: error.message,
            };
        }
    }

    /**
     * Delete file from storage
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
                message: 'Failed to delete file',
                error: error.message,
            };
        }
    }

    /**
     * Get file URL for viewing
     */
    getFileUrl(bucketId: string, fileId: string): string {
        try {
            const url = this.storage.getFileView(bucketId, fileId);
            return url instanceof URL ? url.toString() : String(url);
        } catch (error) {
            console.warn(`Failed to get file URL for ${bucketId}/${fileId}:`, error);
            return 'https://via.placeholder.com/150';
        }
    }

    /**
     * Get file preview URL with optional dimensions
     */
    getFilePreview(
        bucketId: string,
        fileId: string,
        width?: number,
        height?: number
    ): string {
        try {
            let url;
            if (width || height) {
                url = this.storage.getFilePreview(bucketId, fileId, width, height);
            } else {
                url = this.storage.getFilePreview(bucketId, fileId);
            }
            return url instanceof URL ? url.toString() : String(url);
        } catch (error) {
            console.warn(`Failed to get file preview for ${bucketId}/${fileId}:`, error);
            return 'https://via.placeholder.com/150';
        }
    }
}

// Create and export singleton instance
export const storageService = new StorageService();

