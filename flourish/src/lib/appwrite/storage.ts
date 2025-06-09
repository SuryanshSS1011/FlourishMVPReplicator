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
     * Get file URL
     */
    getFileUrl(bucketId: string, fileId: string): string {
        return appwriteService.getFileUrl(bucketId, fileId);
    }

    /**
     * Get file preview URL
     */
    getFilePreview(
        bucketId: string,
        fileId: string,
        width?: number,
        height?: number
    ): string {
        const baseUrl = appwriteService.getFileUrl(bucketId, fileId);
        const params = new URLSearchParams();

        if (width) params.append('width', width.toString());
        if (height) params.append('height', height.toString());

        return params.toString() ? `${baseUrl}&${params.toString()}` : baseUrl;
    }
}

// Create and export singleton instance
export const storageService = new StorageService();

