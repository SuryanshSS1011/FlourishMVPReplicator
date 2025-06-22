// src/lib/appwrite/database.ts

import { ID, Models, Query } from 'react-native-appwrite';
import type { ApiResponse } from '../../types/api';
import { APPWRITE_CONFIG, appwriteService } from './config';

// Document interfaces that extend Appwrite Models.Document
export interface PlantDocument extends Models.Document {
    name: string;
    scientificName?: string;
    category: string;
    description: string;
    careLevel: 'easy' | 'medium' | 'hard';
    waterFrequency: number; // days
    sunlightRequirement: 'low' | 'medium' | 'high';
    temperature: {
        min: number;
        max: number;
    };
    humidity: {
        min: number;
        max: number;
    };
    growthRate: 'slow' | 'medium' | 'fast';
    maxHeight: number; // cm
    toxicity: string;
    imageId?: string;
    isPremium: boolean;
    tags: string[];
}

export interface UserPlantDocument extends Models.Document {
    userId: string; // Appwrite User ID
    plantId: string; // Reference to PlantDocument
    plantName?: string; // Custom name
    nickName?: string;
    dateAdded: string;
    lastWatered?: string;
    lastFertilized?: string;
    location?: string;
    pot?: string;
    notes?: string;
    imageId?: string;
    health: 'excellent' | 'good' | 'fair' | 'poor';
    growthStage: 'seedling' | 'young' | 'mature';
    notificationsEnabled: boolean;
    activeNutrients?: string; // JSON string of active nutrients
}

export interface NutrientDocument extends Models.Document {
    name: string;
    type: 'fertilizer' | 'supplement' | 'treatment';
    description: string;
    benefits: string[];
    applicationMethod: string;
    frequency: string;
    dosage: string;
    imageId?: string;
    isPremium: boolean;
    plantTypes: string[];
    timer?: string; // Duration in seconds
}

export interface TaskDocument extends Models.Document {
    userId: string; // Appwrite User ID
    userPlantId?: string;
    type: 'water' | 'fertilize' | 'prune' | 'repot' | 'custom';
    title: string;
    description?: string;
    dueDate: string;
    completedDate?: string;
    isCompleted: boolean;
    isRecurring: boolean;
    recurringInterval?: number; // days
    priority: 'low' | 'medium' | 'high';
    reminderEnabled: boolean;
    reminderTime?: string;
    points: number;
}

export interface TaskDetailDocument extends Models.Document {
    taskId: string; // Reference to TaskDocument
    notes?: string;
    imageIds?: string[];
    completionTime?: string;
    nutrientsApplied?: string[]; // Nutrient IDs
    weatherConditions?: string;
    plantHealthBefore?: string;
    plantHealthAfter?: string;
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

// Generic list response
export interface ListResponse<T> {
    documents: T[];
    total: number;
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
            if (!APPWRITE_CONFIG.databaseId || !collectionId) {
                throw new Error('Database ID or Collection ID not configured');
            }

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
            if (!APPWRITE_CONFIG.databaseId || !collectionId) {
                throw new Error('Database ID or Collection ID not configured');
            }

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
    ): Promise<ApiResponse<ListResponse<T>>> {
        try {
            if (!APPWRITE_CONFIG.databaseId || !collectionId) {
                throw new Error('Database ID or Collection ID not configured');
            }

            const response = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                queries
            );

            return {
                success: true,
                message: 'Documents retrieved successfully',
                data: {
                    documents: response.documents as T[],
                    total: response.total,
                },
            };
        } catch (error: any) {
            console.error('List documents error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
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
            if (!APPWRITE_CONFIG.databaseId || !collectionId) {
                throw new Error('Database ID or Collection ID not configured');
            }

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

    async deleteDocument(
        collectionId: string,
        documentId: string
    ): Promise<ApiResponse> {
        try {
            if (!APPWRITE_CONFIG.databaseId || !collectionId) {
                throw new Error('Database ID or Collection ID not configured');
            }

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
     * Plant-specific operations
     */
    async createPlant(
        data: Omit<PlantDocument, keyof Models.Document>
    ): Promise<ApiResponse<PlantDocument>> {
        return this.createDocument<PlantDocument>(
            APPWRITE_CONFIG.collections.plants,
            data,
            ['read("any")'] // Plants are public
        );
    }

    async getPlant(plantId: string): Promise<ApiResponse<PlantDocument>> {
        return this.getDocument<PlantDocument>(
            APPWRITE_CONFIG.collections.plants,
            plantId
        );
    }

    async listPlants(queries?: string[]): Promise<ApiResponse<ListResponse<PlantDocument>>> {
        return this.listDocuments<PlantDocument>(
            APPWRITE_CONFIG.collections.plants,
            queries
        );
    }

    /**
     * User Plant operations
     */
    async createUserPlant(
        userId: string,
        data: Omit<UserPlantDocument, keyof Models.Document | 'userId'>
    ): Promise<ApiResponse<UserPlantDocument>> {
        return this.createDocument<UserPlantDocument>(
            APPWRITE_CONFIG.collections.userPlants,
            { ...data, userId },
            [`read("user:${userId}")`, `write("user:${userId}")`]
        );
    }

    async getUserPlants(
        userId: string,
        queries?: string[]
    ): Promise<ApiResponse<ListResponse<UserPlantDocument>>> {
        const defaultQueries = [
            Query.equal('userId', userId),
            Query.orderDesc('$createdAt'),
        ];

        return this.listDocuments<UserPlantDocument>(
            APPWRITE_CONFIG.collections.userPlants,
            [...defaultQueries, ...(queries || [])]
        );
    }

    async updateUserPlant(
        plantId: string,
        userId: string,
        data: Partial<Omit<UserPlantDocument, keyof Models.Document>>
    ): Promise<ApiResponse<UserPlantDocument>> {
        return this.updateDocument<UserPlantDocument>(
            APPWRITE_CONFIG.collections.userPlants,
            plantId,
            data,
            [`read("user:${userId}")`, `write("user:${userId}")`]
        );
    }

    /**
     * Task operations
     */
    async createTask(
        userId: string,
        data: Omit<TaskDocument, keyof Models.Document | 'userId'>
    ): Promise<ApiResponse<TaskDocument>> {
        return this.createDocument<TaskDocument>(
            APPWRITE_CONFIG.collections.tasks,
            { ...data, userId },
            [`read("user:${userId}")`, `write("user:${userId}")`]
        );
    }

    async getUserTasks(
        userId: string,
        queries?: string[]
    ): Promise<ApiResponse<ListResponse<TaskDocument>>> {
        const defaultQueries = [
            Query.equal('userId', userId),
            Query.orderAsc('dueDate'),
        ];

        return this.listDocuments<TaskDocument>(
            APPWRITE_CONFIG.collections.tasks,
            [...defaultQueries, ...(queries || [])]
        );
    }

    async getUpcomingTasks(
        userId: string,
        days: number = 7
    ): Promise<ApiResponse<ListResponse<TaskDocument>>> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const queries = [
            Query.equal('userId', userId),
            Query.equal('isCompleted', false),
            Query.lessThanEqual('dueDate', futureDate.toISOString()),
            Query.orderAsc('dueDate'),
        ];

        return this.listDocuments<TaskDocument>(
            APPWRITE_CONFIG.collections.tasks,
            queries
        );
    }

    async completeTask(
        taskId: string,
        userId: string
    ): Promise<ApiResponse<TaskDocument>> {
        return this.updateDocument<TaskDocument>(
            APPWRITE_CONFIG.collections.tasks,
            taskId,
            {
                isCompleted: true,
                completedDate: new Date().toISOString(),
            },
            [`read("user:${userId}")`, `write("user:${userId}")`]
        );
    }

    /**
     * Nutrient operations
     */
    async listNutrients(queries?: string[]): Promise<ApiResponse<ListResponse<NutrientDocument>>> {
        return this.listDocuments<NutrientDocument>(
            APPWRITE_CONFIG.collections.nutrients,
            queries
        );
    }

    async getNutrient(nutrientId: string): Promise<ApiResponse<NutrientDocument>> {
        return this.getDocument<NutrientDocument>(
            APPWRITE_CONFIG.collections.nutrients,
            nutrientId
        );
    }

    /**
     * Suggestion operations
     */
    async createSuggestion(
        userId: string,
        data: Omit<SuggestionDocument, keyof Models.Document | 'userId'>
    ): Promise<ApiResponse<SuggestionDocument>> {
        return this.createDocument<SuggestionDocument>(
            APPWRITE_CONFIG.collections.suggestions,
            { ...data, userId },
            [`read("user:${userId}")`, `write("user:${userId}")`]
        );
    }

    async getUserSuggestions(
        userId: string,
        unreadOnly: boolean = false
    ): Promise<ApiResponse<ListResponse<SuggestionDocument>>> {
        const queries = [
            Query.equal('userId', userId),
            Query.equal('isDismissed', false),
        ];

        if (unreadOnly) {
            queries.push(Query.equal('isRead', false));
        }

        queries.push(Query.orderDesc('$createdAt'));

        return this.listDocuments<SuggestionDocument>(
            APPWRITE_CONFIG.collections.suggestions,
            queries
        );
    }

    async markSuggestionAsRead(
        suggestionId: string,
        userId: string
    ): Promise<ApiResponse<SuggestionDocument>> {
        return this.updateDocument<SuggestionDocument>(
            APPWRITE_CONFIG.collections.suggestions,
            suggestionId,
            { isRead: true },
            [`read("user:${userId}")`, `write("user:${userId}")`]
        );
    }

    /**
     * Helper method to get user-friendly error messages
     */
    private getErrorMessage(error: any): string {
        if (error.code === 404) {
            return 'Document not found';
        }
        
        if (error.code === 401) {
            return 'Unauthorized access';
        }
        
        if (error.code === 400) {
            return 'Invalid request data';
        }

        return error.message || 'An unexpected error occurred';
    }
}

// Export service instance
export const databaseService = new DatabaseService();

// Default export
export default databaseService;