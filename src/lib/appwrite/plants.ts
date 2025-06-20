// src/lib/appwrite/plants.ts
import { ID, Query } from 'react-native-appwrite';
import { appwriteService, APPWRITE_CONFIG } from './config';
import type { Plant, UserPlant, Nutrient, ActiveNutrient, ApiResponse } from '../../types';

class PlantService {
    private databases = appwriteService.databaseService;
    private storage = appwriteService.storageService;

    /**
     * Get all plants
     */
    async getAllPlants(): Promise<ApiResponse<Plant[]>> {
        try {
            const response = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.plants
            );

            return {
                success: true,
                message: 'Plants fetched successfully',
                data: response.documents as Plant[],
            };
        } catch (error: any) {
            console.error('Get all plants error:', error);
            return {
                success: false,
                message: 'Failed to fetch plants',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Get user plants
     */
    async getUserPlants(userId: string): Promise<ApiResponse<UserPlant[]>> {
        try {
            const response = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.userPlants,
                [Query.equal('userId', userId)]
            );

            return {
                success: true,
                message: 'User plants fetched successfully',
                data: response.documents as UserPlant[],
            };
        } catch (error: any) {
            console.error('Get user plants error:', error);
            return {
                success: false,
                message: 'Failed to fetch user plants',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Get all nutrients
     */
    async getAllNutrients(): Promise<ApiResponse<Nutrient[]>> {
        try {
            const response = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.nutrients
            );

            return {
                success: true,
                message: 'Nutrients fetched successfully',
                data: response.documents as Nutrient[],
            };
        } catch (error: any) {
            console.error('Get all nutrients error:', error);
            return {
                success: false,
                message: 'Failed to fetch nutrients',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Create plant
     */
    async createPlant(plantData: {
        PlantName: string;
        Image?: string;
        plant_catergory: string;
        Plant_family: string;
        isFavourite: boolean;
        userId: string;
        waterlevel: string;
        carelevel: string;
        plantedat: number;
        nutrients: string;
        nutrientsid: string;
        activeNutrients: string;
    }): Promise<ApiResponse<{ plant: Plant; userPlant: UserPlant }>> {
        try {
            // Create plant document
            const plantResponse = await this.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.plants,
                ID.unique(),
                {
                    PlantName: plantData.PlantName,
                    Image: plantData.Image,
                    plant_catergory: plantData.plant_catergory,
                    Plant_family: plantData.Plant_family,
                    isFavourite: plantData.isFavourite,
                    timestamp: new Date().toISOString(),
                }
            );

            // Parse nutrients arrays
            let nutrientsArray: string[] = [];
            let nutrientsIdArray: string[] = [];
            try {
                nutrientsArray = plantData.nutrients ? JSON.parse(plantData.nutrients) : [];
                nutrientsIdArray = plantData.nutrientsid ? JSON.parse(plantData.nutrientsid) : [];
            } catch (error) {
                console.error('Error parsing nutrients:', error);
            }

            // Create user plant document
            const userPlantResponse = await this.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.userPlants,
                plantResponse.$id, // Use same ID for linking
                {
                    plant_id: plantResponse.$id,
                    waterlevel: plantData.waterlevel,
                    carelevel: plantData.carelevel,
                    plantedat: plantData.plantedat,
                    nutrients: nutrientsArray,
                    nutrientsid: nutrientsIdArray,
                    activeNutrients: plantData.activeNutrients || JSON.stringify([]),
                    userId: plantData.userId,
                    timestamp: new Date().toISOString(),
                }
            );

            return {
                success: true,
                message: 'Plant created successfully',
                data: {
                    plant: plantResponse as Plant,
                    userPlant: userPlantResponse as UserPlant,
                },
            };
        } catch (error: any) {
            console.error('Create plant error:', error);
            return {
                success: false,
                message: 'Failed to create plant',
                error: error.message,
            };
        }
    }

    /**
     * Update user plant
     */
    async updateUserPlant(plantId: string, updates: Partial<UserPlant>): Promise<ApiResponse<UserPlant>> {
        try {
            const response = await this.databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.userPlants,
                plantId,
                updates
            );

            return {
                success: true,
                message: 'User plant updated successfully',
                data: response as UserPlant,
            };
        } catch (error: any) {
            console.error('Update user plant error:', error);
            return {
                success: false,
                message: 'Failed to update user plant',
                error: error.message,
            };
        }
    }

    /**
     * Apply nutrient to plant
     */
    async applyNutrientToPlant(
        plantId: string,
        userId: string,
        nutrient: Nutrient
    ): Promise<ApiResponse<UserPlant>> {
        try {
            // Get current user plant
            const userPlantsResponse = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.userPlants,
                [Query.equal('plant_id', plantId), Query.equal('userId', userId)]
            );

            let userPlantId: string;
            let currentUserPlant: any;

            if (userPlantsResponse.documents.length === 0) {
                // Create new user plant if doesn't exist
                const newUserPlant = await this.databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.userPlants,
                    ID.unique(),
                    {
                        plant_id: plantId,
                        userId: userId,
                        waterlevel: '0',
                        carelevel: '0',
                        plantedat: '0',
                        nutrients: [],
                        nutrientsid: [],
                        activeNutrients: JSON.stringify([]),
                        timestamp: new Date().toISOString(),
                    }
                );
                userPlantId = newUserPlant.$id;
                currentUserPlant = newUserPlant;
            } else {
                const userPlantDoc = userPlantsResponse.documents[0];
                userPlantId = userPlantDoc.$id;
                currentUserPlant = userPlantDoc;
            }

            // Update plant levels
            const currentWaterLevel = parseInt(currentUserPlant.waterlevel || '0', 10);
            const currentCareLevel = parseInt(currentUserPlant.carelevel || '0', 10);
            const updatedWaterLevel = Math.min(currentWaterLevel + 10, 100);
            const updatedCareLevel = Math.min(currentCareLevel + 10, 100);

            // Update active nutrients
            const currentActiveNutrients: ActiveNutrient[] = currentUserPlant.activeNutrients
                ? JSON.parse(currentUserPlant.activeNutrients)
                : [];

            const nutrientTimer = parseInt(nutrient.timer || '300', 10);
            const newActiveNutrient: ActiveNutrient = {
                nutrientId: nutrient.$id,
                nutrientName: nutrient.name,
                timer: nutrientTimer,
            };

            const updatedActiveNutrients = [...currentActiveNutrients, newActiveNutrient];

            // Update nutrient lists
            const currentNutrientIds: string[] = Array.isArray(currentUserPlant.nutrientsid)
                ? currentUserPlant.nutrientsid
                : [];
            const currentNutrients: string[] = Array.isArray(currentUserPlant.nutrients)
                ? currentUserPlant.nutrients
                : [];

            const updatedNutrientIds = [...currentNutrientIds, nutrient.$id];
            const updatedNutrients = [...currentNutrients, nutrient.name];

            // Update the user plant
            const response = await this.databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.userPlants,
                userPlantId,
                {
                    waterlevel: updatedWaterLevel.toString(),
                    carelevel: updatedCareLevel.toString(),
                    activeNutrients: JSON.stringify(updatedActiveNutrients),
                    nutrientsid: updatedNutrientIds,
                    nutrients: updatedNutrients,
                }
            );

            return {
                success: true,
                message: 'Nutrient applied successfully',
                data: response as UserPlant,
            };
        } catch (error: any) {
            console.error('Apply nutrient error:', error);
            return {
                success: false,
                message: 'Failed to apply nutrient',
                error: error.message,
            };
        }
    }

    /**
     * Delete plant
     */
    async deletePlant(plantId: string): Promise<ApiResponse> {
        try {
            // Delete from Plants collection
            await this.databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.plants,
                plantId
            );

            // Delete from UserPlants collection
            await this.databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.userPlants,
                plantId
            );

            return {
                success: true,
                message: 'Plant deleted successfully',
            };
        } catch (error: any) {
            console.error('Delete plant error:', error);
            return {
                success: false,
                message: 'Failed to delete plant',
                error: error.message,
            };
        }
    }

    /**
     * Get plant image URL
     */
    getPlantImageUrl(fileId: string): string {
        return appwriteService.getFileUrl(APPWRITE_CONFIG.buckets.images, fileId);
    }

    /**
     * Get nutrient image URL
     */
    getNutrientImageUrl(fileId: string): string {
        return appwriteService.getFileUrl(APPWRITE_CONFIG.buckets.nutrients, fileId);
    }
}

// Create and export singleton instance
export const plantService = new PlantService();

