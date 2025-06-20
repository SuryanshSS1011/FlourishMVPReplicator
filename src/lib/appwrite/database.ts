// src/lib/appwrite/database.ts

import { ID, Query, Models } from 'react-native-appwrite';
import { appwriteService, APPWRITE_CONFIG } from './config';
import type { ApiResponse, PaginatedResponse } from '../../types/api';

// Database document interfaces
export interface PlantDocument extends Models.Document {
    name: string;
    scientificName?: string;
    category: string;
    description: string;
    imageId?: string;
    careLevel: 'easy' | 'medium' | 'hard';
    wateringFrequency: number; // days
    lightRequirement: 'low' | 'medium' | 'high';
    temperature: {
        min: number;
        max: number;
    };
    humidity: {
        min: number;
        max: number;
    };
    growthRate: 'slow' | 'moderate' | 'fast';
    matureHeight: number; // cm
    toxicity: boolean;
    tags: string[];
}

export interface UserPlantDocument extends Models.Document {
    userId: string; // Appwrite User ID
    plantId: string;
    nickname?: string;
    acquiredDate: string;
    location?: string;
    potSize?: number; // cm
    soilType?: string;
    lastWatered?: string;
    lastFertilized?: string;
    lastRepotted?: string;
    notes?: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    growthStage: 'seedling' | 'young' | 'mature';
    imageIds: string[];
}

export interface TaskDocument extends Models.Document {
    name: string;
    category: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'cleaning' | 'other';
    description: string;
    iconId?: string;
    defaultFrequency?: number; // days
    defaultDuration?: number; // minutes
    points: number;
}

export interface TaskDetailDocument extends Models.Document {
    userId: string; // Appwrite User ID
    userPlantId?: string;
    taskId: string;
    scheduledDate: string;
    completedDate?: string;
    status: 'pending' | 'completed' | 'skipped' | 'overdue';
    notes?: string;
    reminderEnabled: boolean;
    reminderTime?: string;
}

export interface NutrientDocument extends Models.Document {
    name: string;
    type: 'fertilizer' | 'supplement' | 'pesticide' | 'fungicide';
    brand?: string;
    composition: string;
    npkRatio?: string; // e.g., "10-10-10"
    applicationMethod: 'soil' | 'foliar' | 'water';
    dosage: string;
    frequency: string;
    imageId?: string;
    description: string;
    precautions?: string;
    tags: string[];
}

export interface SuggestionDocument extends Models.Document {
    userId: string; // Appwrite User ID
    userPlantId?: string;
    type: 'care' | 'health' | 'growth' | 'seasonal';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    actionType?: string;
    actionData?: Record<string, any>;
    isRead: boolean;
    isDismissed: boolean;
    expiresAt?: string;
}

class DatabaseService {
    private databases;

    constructor() {
        this.databases = appwriteService.databaseService;
    }

    /**
     * Generic CRUD operations with better error handling
     */
    private async createDocument<T extends Models.Document>(
        collectionId: string,
        data: Omit<T, keyof Models.Document>,
        permissions?: string[]
    ): Promise<ApiResponse<T>> {
        try {
            const documentId = ID.unique();
            const response = await this.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                documentId,
                data,
                permissions
            );

            return {
                success: true,
                message: 'Document created successfully',
                data: response as T,
            };
        } catch (error: any) {
            console.error('Create document error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    async getDocument<T extends Models.Document>(
        collectionId: string,
        documentId: string,
        queries?: string[]
    ): Promise<ApiResponse<T>> {
        try {
            const response = await this.databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                documentId,
                queries
            );

            return {
                success: true,
                message: 'Document retrieved successfully',
                data: response as T,
            };
        } catch (error: any) {
            console.error('Get document error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    async listDocuments<T extends Models.Document>(
        collectionId: string,
        queries?: string[]
    ): Promise<PaginatedResponse<T>> {
        try {
            const response = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                queries || []
            );

            return {
                success: true,
                message: 'Documents listed successfully',
                data: response.documents as T[],
                total: response.total,
                limit: queries?.find(q => q.includes('limit')) 
                    ? parseInt(queries.find(q => q.includes('limit'))!.split('(')[1].split(')')[0]) 
                    : 25,
                offset: queries?.find(q => q.includes('offset')) 
                    ? parseInt(queries.find(q => q.includes('offset'))!.split('(')[1].split(')')[0]) 
                    : 0,
            };
        } catch (error: any) {
            console.error('List documents error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
                data: [],
                total: 0,
                limit: 25,
                offset: 0,
            };
        }
    }

    async updateDocument<T extends Models.Document>(
        collectionId: string,
        documentId: string,
        data: Partial<Omit<T, keyof Models.Document>>,
        permissions?: string[]
    ): Promise<ApiResponse<T>> {
        try {
            const response = await this.databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                documentId,
                data,
                permissions
            );

            return {
                success: true,
                message: 'Document updated successfully',
                data: response as T,
            };
        } catch (error: any) {
            console.error('Update document error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    private async deleteDocument(
        collectionId: string,
        documentId: string
    ): Promise<ApiResponse> {
        try {
            await this.databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                documentId
            );

            return {
                success: true,
                message: 'Document deleted successfully',
            };
        } catch (error: any) {
            console.error('Delete document error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Plant operations
     */
    async createPlant(plantData: Omit<PlantDocument, keyof Models.Document>) {
        return this.createDocument<PlantDocument>(
            APPWRITE_CONFIG.collections.plants,
            plantData,
            ['read("any")'] // Public read access
        );
    }

    async getPlant(plantId: string) {
        return this.getDocument<PlantDocument>(
            APPWRITE_CONFIG.collections.plants,
            plantId
        );
    }

    async listPlants(queries?: string[]) {
        return this.listDocuments<PlantDocument>(
            APPWRITE_CONFIG.collections.plants,
            queries
        );
    }

    async searchPlants(searchTerm: string, category?: string) {
        const queries = [
            Query.search('name', searchTerm),
            Query.limit(20),
        ];

        if (category) {
            queries.push(Query.equal('category', category));
        }

        return this.listDocuments<PlantDocument>(
            APPWRITE_CONFIG.collections.plants,
            queries
        );
    }

    async getPlantsByCategory(category: string) {
        return this.listDocuments<PlantDocument>(
            APPWRITE_CONFIG.collections.plants,
            [
                Query.equal('category', category),
                Query.orderAsc('name'),
                Query.limit(50)
            ]
        );
    }

    /**
     * User Plant operations
     */
    async createUserPlant(userPlantData: Omit<UserPlantDocument, keyof Models.Document> & { userId: string }) {
        // Ensure we have proper permissions for the user
        const permissions = [
            `read("user:${userPlantData.userId}")`,
            `write("user:${userPlantData.userId}")`,
            `delete("user:${userPlantData.userId}")`
        ];

        return this.createDocument<UserPlantDocument>(
            APPWRITE_CONFIG.collections.userPlants,
            userPlantData,
            permissions
        );
    }

    async getUserPlant(userPlantId: string) {
        return this.getDocument<UserPlantDocument>(
            APPWRITE_CONFIG.collections.userPlants,
            userPlantId
        );
    }

    async listUserPlants(userId: string) {
        return this.listDocuments<UserPlantDocument>(
            APPWRITE_CONFIG.collections.userPlants,
            [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt')
            ]
        );
    }

    async getUserPlantsByLocation(userId: string, location: string) {
        return this.listDocuments<UserPlantDocument>(
            APPWRITE_CONFIG.collections.userPlants,
            [
                Query.equal('userId', userId),
                Query.equal('location', location),
                Query.orderAsc('nickname')
            ]
        );
    }

    async updateUserPlant(
        userPlantId: string,
        data: Partial<Omit<UserPlantDocument, keyof Models.Document>>
    ) {
        return this.updateDocument<UserPlantDocument>(
            APPWRITE_CONFIG.collections.userPlants,
            userPlantId,
            data
        );
    }

    async deleteUserPlant(userPlantId: string) {
        return this.deleteDocument(
            APPWRITE_CONFIG.collections.userPlants,
            userPlantId
        );
    }

    /**
     * Task operations
     */
    async createTask(taskData: Omit<TaskDocument, keyof Models.Document>) {
        return this.createDocument<TaskDocument>(
            APPWRITE_CONFIG.collections.tasks,
            taskData,
            ['read("any")'] // Public templates
        );
    }

    async getTask(taskId: string) {
        return this.getDocument<TaskDocument>(
            APPWRITE_CONFIG.collections.tasks,
            taskId
        );
    }

    async listTasks(category?: string) {
        const queries = category
            ? [Query.equal('category', category), Query.orderAsc('name')]
            : [Query.orderAsc('name')];

        return this.listDocuments<TaskDocument>(
            APPWRITE_CONFIG.collections.tasks,
            queries
        );
    }

    async getDefaultTasks() {
        return this.listDocuments<TaskDocument>(
            APPWRITE_CONFIG.collections.tasks,
            [
                Query.notEqual('category', 'other'),
                Query.orderAsc('category'),
                Query.limit(10)
            ]
        );
    }

    /**
     * Task Detail operations
     */
    async createTaskDetail(taskDetailData: Omit<TaskDetailDocument, keyof Models.Document> & { userId: string }) {
        const permissions = [
            `read("user:${taskDetailData.userId}")`,
            `write("user:${taskDetailData.userId}")`,
            `delete("user:${taskDetailData.userId}")`
        ];

        return this.createDocument<TaskDetailDocument>(
            APPWRITE_CONFIG.collections.taskDetails,
            taskDetailData,
            permissions
        );
    }

    async getTaskDetail(taskDetailId: string) {
        return this.getDocument<TaskDetailDocument>(
            APPWRITE_CONFIG.collections.taskDetails,
            taskDetailId
        );
    }

    async getUserTasks(userId: string, status?: string) {
        const queries = [
            Query.equal('userId', userId),
            Query.orderDesc('scheduledDate'),
        ];

        if (status) {
            queries.push(Query.equal('status', status));
        }

        return this.listDocuments<TaskDetailDocument>(
            APPWRITE_CONFIG.collections.taskDetails,
            queries
        );
    }

    async getTodayTasks(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.listDocuments<TaskDetailDocument>(
            APPWRITE_CONFIG.collections.taskDetails,
            [
                Query.equal('userId', userId),
                Query.greaterThanEqual('scheduledDate', today.toISOString()),
                Query.lessThan('scheduledDate', tomorrow.toISOString()),
                Query.orderAsc('scheduledDate')
            ]
        );
    }

    async getUpcomingTasks(userId: string, days: number = 7) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        return this.listDocuments<TaskDetailDocument>(
            APPWRITE_CONFIG.collections.taskDetails,
            [
                Query.equal('userId', userId),
                Query.greaterThanEqual('scheduledDate', startDate.toISOString()),
                Query.lessThanEqual('scheduledDate', endDate.toISOString()),
                Query.equal('status', 'pending'),
                Query.orderAsc('scheduledDate')
            ]
        );
    }

    async completeTask(taskDetailId: string) {
        return this.updateDocument<TaskDetailDocument>(
            APPWRITE_CONFIG.collections.taskDetails,
            taskDetailId,
            {
                status: 'completed',
                completedDate: new Date().toISOString(),
            }
        );
    }

    async updateTaskDetail(
        taskDetailId: string,
        data: Partial<Omit<TaskDetailDocument, keyof Models.Document>>
    ) {
        return this.updateDocument<TaskDetailDocument>(
            APPWRITE_CONFIG.collections.taskDetails,
            taskDetailId,
            data
        );
    }

    async deleteTaskDetail(taskDetailId: string) {
        return this.deleteDocument(
            APPWRITE_CONFIG.collections.taskDetails,
            taskDetailId
        );
    }

    /**
     * Nutrient operations
     */
    async createNutrient(nutrientData: Omit<NutrientDocument, keyof Models.Document>) {
        return this.createDocument<NutrientDocument>(
            APPWRITE_CONFIG.collections.nutrients,
            nutrientData,
            ['read("any")'] // Public catalog
        );
    }

    async getNutrient(nutrientId: string) {
        return this.getDocument<NutrientDocument>(
            APPWRITE_CONFIG.collections.nutrients,
            nutrientId
        );
    }

    async listNutrients(type?: string) {
        const queries = type
            ? [Query.equal('type', type), Query.orderAsc('name')]
            : [Query.orderAsc('name')];

        return this.listDocuments<NutrientDocument>(
            APPWRITE_CONFIG.collections.nutrients,
            queries
        );
    }

    async searchNutrients(searchTerm: string) {
        return this.listDocuments<NutrientDocument>(
            APPWRITE_CONFIG.collections.nutrients,
            [
                Query.search('name', searchTerm),
                Query.limit(20)
            ]
        );
    }

    /**
     * Suggestion operations
     */
    async createSuggestion(suggestionData: Omit<SuggestionDocument, keyof Models.Document> & { userId: string }) {
        const permissions = [
            `read("user:${suggestionData.userId}")`,
            `write("user:${suggestionData.userId}")`,
            `delete("user:${suggestionData.userId}")`
        ];

        return this.createDocument<SuggestionDocument>(
            APPWRITE_CONFIG.collections.suggestions,
            suggestionData,
            permissions
        );
    }

    async getUserSuggestions(userId: string, unreadOnly: boolean = false) {
        const queries = [
            Query.equal('userId', userId),
            Query.equal('isDismissed', false),
            Query.orderDesc('$createdAt'),
        ];

        if (unreadOnly) {
            queries.push(Query.equal('isRead', false));
        }

        // Filter out expired suggestions
        const now = new Date().toISOString();
        queries.push(Query.greaterThan('expiresAt', now));

        return this.listDocuments<SuggestionDocument>(
            APPWRITE_CONFIG.collections.suggestions,
            queries
        );
    }

    async markSuggestionAsRead(suggestionId: string) {
        return this.updateDocument<SuggestionDocument>(
            APPWRITE_CONFIG.collections.suggestions,
            suggestionId,
            { isRead: true }
        );
    }

    async dismissSuggestion(suggestionId: string) {
        return this.updateDocument<SuggestionDocument>(
            APPWRITE_CONFIG.collections.suggestions,
            suggestionId,
            { isDismissed: true }
        );
    }

    async deleteSuggestion(suggestionId: string) {
        return this.deleteDocument(
            APPWRITE_CONFIG.collections.suggestions,
            suggestionId
        );
    }

    /**
     * Utility methods
     */
    async checkUserOwnership(collectionId: string, documentId: string, userId: string): Promise<boolean> {
        try {
            const result = await this.databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                documentId
            );

            return result.userId === userId;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get error message
     */
    private getErrorMessage(error: any): string {
        if (error.code === 404) {
            return 'Document not found';
        }
        if (error.code === 401) {
            return 'Unauthorized access';
        }
        if (error.code === 400) {
            return 'Invalid request';
        }
        return error.message || 'Database operation failed';
    }
}

// Create and export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;