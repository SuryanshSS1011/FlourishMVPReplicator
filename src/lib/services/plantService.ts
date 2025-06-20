// src/lib/services/plantService.ts

import { databaseService, PlantDocument, UserPlantDocument } from '../appwrite/database';
import { Models } from 'react-native-appwrite';
import { storageService } from '../appwrite/storage';
import { Query } from '../appwrite/config';
import { useAuthStore } from '../../store/authStore';
import type { ApiResponse } from '../../types/api';

export interface PlantWithUserData extends PlantDocument {
    userPlant?: UserPlantDocument;
    imageUrl?: string;
}

export interface PlantCareSchedule {
    nextWatering: Date;
    nextFertilizing: Date;
    nextRepotting: Date;
    tasks: Array<{
        type: string;
        dueDate: Date;
        overdue: boolean;
    }>;
}

class PlantService {
    /**
     * Get all plants available in the catalog
     */
    async getCatalogPlants(
        category?: string,
        searchTerm?: string
    ): Promise<ApiResponse<PlantDocument[]>> {
        try {
            let result;

            if (searchTerm) {
                result = await databaseService.searchPlants(searchTerm, category);
            } else {
                result = await databaseService.listPlants(
                    category ? [Query.equal('category', category)] : undefined
                );
            }

            if (result.success && result.data) {
                // Add image URLs to plant data
                const plantsWithImages = result.data.map(plant => ({
                    ...plant,
                    imageUrl: plant.imageId
                        ? storageService.getPlantImageUrl(plant.imageId)
                        : undefined
                }));

                return {
                    success: true,
                    message: 'Plants retrieved successfully',
                    data: plantsWithImages,
                };
            }

            return result;
        } catch (error: any) {
            console.error('Error getting catalog plants:', error);
            return {
                success: false,
                message: 'Failed to get plants',
                error: error.message,
            };
        }
    }

    /**
     * Get user's plants with their care data
     */
    async getUserPlants(): Promise<ApiResponse<PlantWithUserData[]>> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                };
            }

            // Get user's plants
            const userPlantsResult = await databaseService.listUserPlants(user.$id);

            if (!userPlantsResult.success || !userPlantsResult.data) {
                return {
                    success: false,
                    message: 'Failed to get user plants',
                    data: [],
                };
            }

            // Get plant details for each user plant
            const plantsWithData = await Promise.all(
                userPlantsResult.data.map(async (userPlant) => {
                    const plantResult = await databaseService.getPlant(userPlant.plantId);

                    if (plantResult.success && plantResult.data) {
                        const plant = plantResult.data;

                        return {
                            ...plant,
                            userPlant,
                            imageUrl: userPlant.imageIds?.[0]
                                ? storageService.getPlantImageUrl(userPlant.imageIds[0])
                                : plant.imageId
                                    ? storageService.getPlantImageUrl(plant.imageId)
                                    : undefined
                        } as PlantWithUserData;
                    }

                    return null;
                })
            );

            // Filter out any failed loads
            const validPlants = plantsWithData.filter(plant => plant !== null) as PlantWithUserData[];

            return {
                success: true,
                message: 'User plants retrieved successfully',
                data: validPlants,
            };
        } catch (error: any) {
            console.error('Error getting user plants:', error);
            return {
                success: false,
                message: 'Failed to get user plants',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Add a plant to user's collection
     */
    async addPlantToCollection(
        plantId: string,
        customData?: {
            nickname?: string;
            location?: string;
            potSize?: number;
            soilType?: string;
            notes?: string;
        }
    ): Promise<ApiResponse<UserPlantDocument>> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                };
            }

            const userPlantData: Omit<UserPlantDocument, keyof Models.Document> = {
                userId: user.$id,
                plantId,
                nickname: customData?.nickname,
                location: customData?.location,
                potSize: customData?.potSize,
                soilType: customData?.soilType,
                notes: customData?.notes,
                acquiredDate: new Date().toISOString(),
                healthStatus: 'good',
                growthStage: 'young',
                imageIds: [],
            };

            const result = await databaseService.createUserPlant(userPlantData);

            if (result.success) {
                // Create default care tasks for the plant
                await this.createDefaultCareTasks(result.data!.$id, plantId);
            }

            return result;
        } catch (error: any) {
            console.error('Error adding plant to collection:', error);
            return {
                success: false,
                message: 'Failed to add plant',
                error: error.message,
            };
        }
    }

    /**
     * Update user plant care information
     */
    async updatePlantCare(
        userPlantId: string,
        careType: 'water' | 'fertilize' | 'repot',
        notes?: string
    ): Promise<ApiResponse<UserPlantDocument>> {
        try {
            const updateData: any = {
                [`last${careType.charAt(0).toUpperCase() + careType.slice(1)}ed`]: new Date().toISOString(),
            };

            if (notes) {
                const existingPlant = await databaseService.getUserPlant(userPlantId);
                if (existingPlant.success && existingPlant.data) {
                    updateData.notes = `${existingPlant.data.notes || ''}\n\n[${new Date().toLocaleDateString()}] ${careType}: ${notes}`.trim();
                }
            }

            return await databaseService.updateUserPlant(userPlantId, updateData);
        } catch (error: any) {
            console.error('Error updating plant care:', error);
            return {
                success: false,
                message: 'Failed to update plant care',
                error: error.message,
            };
        }
    }

    /**
     * Upload a photo for a user's plant
     */
    async uploadPlantPhoto(
        userPlantId: string,
        photoUri: string
    ): Promise<ApiResponse<string>> {
        try {
            // Get the user plant
            const plantResult = await databaseService.getUserPlant(userPlantId);
            if (!plantResult.success || !plantResult.data) {
                return {
                    success: false,
                    message: 'Plant not found',
                };
            }

            // Upload the photo
            const uploadResult = await storageService.uploadPlantImage(
                photoUri,
                plantResult.data.nickname || `plant_${userPlantId}`
            );

            if (!uploadResult.success || !uploadResult.fileId) {
                return {
                    success: false,
                    message: 'Failed to upload photo',
                };
            }

            // Update the plant with the new image
            const imageIds = [...(plantResult.data.imageIds || []), uploadResult.fileId];
            await databaseService.updateUserPlant(userPlantId, { imageIds });

            return {
                success: true,
                message: 'Photo uploaded successfully',
                data: uploadResult.fileId,
            };
        } catch (error: any) {
            console.error('Error uploading plant photo:', error);
            return {
                success: false,
                message: 'Failed to upload photo',
                error: error.message,
            };
        }
    }

    /**
     * Get care schedule for a plant
     */
    async getPlantCareSchedule(userPlantId: string): Promise<ApiResponse<PlantCareSchedule>> {
        try {
            // Get user plant data
            const userPlantResult = await databaseService.getUserPlant(userPlantId);
            if (!userPlantResult.success || !userPlantResult.data) {
                return {
                    success: false,
                    message: 'Plant not found',
                };
            }

            const userPlant = userPlantResult.data;

            // Get plant species data
            const plantResult = await databaseService.getPlant(userPlant.plantId);
            if (!plantResult.success || !plantResult.data) {
                return {
                    success: false,
                    message: 'Plant species not found',
                };
            }

            const plant = plantResult.data;

            // Calculate next care dates
            const lastWatered = userPlant.lastWatered ? new Date(userPlant.lastWatered) : new Date(userPlant.acquiredDate);
            const lastFertilized = userPlant.lastFertilized ? new Date(userPlant.lastFertilized) : new Date(userPlant.acquiredDate);
            const lastRepotted = userPlant.lastRepotted ? new Date(userPlant.lastRepotted) : new Date(userPlant.acquiredDate);

            const nextWatering = new Date(lastWatered);
            nextWatering.setDate(nextWatering.getDate() + (plant.wateringFrequency || 7));

            const nextFertilizing = new Date(lastFertilized);
            nextFertilizing.setDate(nextFertilizing.getDate() + 30); // Default monthly

            const nextRepotting = new Date(lastRepotted);
            nextRepotting.setDate(nextRepotting.getDate() + 365); // Default yearly

            const now = new Date();

            const schedule: PlantCareSchedule = {
                nextWatering,
                nextFertilizing,
                nextRepotting,
                tasks: [
                    {
                        type: 'watering',
                        dueDate: nextWatering,
                        overdue: nextWatering < now,
                    },
                    {
                        type: 'fertilizing',
                        dueDate: nextFertilizing,
                        overdue: nextFertilizing < now,
                    },
                    {
                        type: 'repotting',
                        dueDate: nextRepotting,
                        overdue: nextRepotting < now,
                    },
                ],
            };

            return {
                success: true,
                message: 'Care schedule retrieved',
                data: schedule,
            };
        } catch (error: any) {
            console.error('Error getting care schedule:', error);
            return {
                success: false,
                message: 'Failed to get care schedule',
                error: error.message,
            };
        }
    }

    /**
     * Create default care tasks for a new plant
     */
    private async createDefaultCareTasks(userPlantId: string, plantId: string): Promise<void> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) return;

            // Get plant data to determine care frequency
            const plantResult = await databaseService.getPlant(plantId);
            if (!plantResult.success || !plantResult.data) return;

            const plant = plantResult.data;

            // Get default tasks
            const tasksResult = await databaseService.listTasks();
            if (!tasksResult.success || !tasksResult.data) return;

            const wateringTask = tasksResult.data.find(t => t.category === 'watering');
            const fertilizingTask = tasksResult.data.find(t => t.category === 'fertilizing');

            // Create watering task
            if (wateringTask) {
                await databaseService.createTaskDetail({
                    userId: user.$id,
                    userPlantId,
                    taskId: wateringTask.$id,
                    scheduledDate: new Date(Date.now() + plant.wateringFrequency * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending',
                    reminderEnabled: true,
                });
            }

            // Create fertilizing task (monthly)
            if (fertilizingTask) {
                await databaseService.createTaskDetail({
                    userId: user.$id,
                    userPlantId,
                    taskId: fertilizingTask.$id,
                    scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending',
                    reminderEnabled: true,
                });
            }
        } catch (error) {
            console.error('Error creating default tasks:', error);
        }
    }

    /**
     * Get plant health recommendations
     */
    async getPlantHealthRecommendations(userPlantId: string): Promise<ApiResponse<string[]>> {
        try {
            const scheduleResult = await this.getPlantCareSchedule(userPlantId);
            if (!scheduleResult.success || !scheduleResult.data) {
                return {
                    success: false,
                    message: 'Failed to get care schedule',
                    data: [],
                };
            }

            const recommendations: string[] = [];
            const schedule = scheduleResult.data;

            // Check overdue tasks
            schedule.tasks.forEach(task => {
                if (task.overdue) {
                    switch (task.type) {
                        case 'watering':
                            recommendations.push('Your plant needs water! Check the soil moisture.');
                            break;
                        case 'fertilizing':
                            recommendations.push('Time to fertilize for healthy growth.');
                            break;
                        case 'repotting':
                            recommendations.push('Consider repotting if roots are crowded.');
                            break;
                    }
                }
            });

            // Get user plant for health status
            const plantResult = await databaseService.getUserPlant(userPlantId);
            if (plantResult.success && plantResult.data) {
                const health = plantResult.data.healthStatus;

                if (health === 'poor') {
                    recommendations.push('Check for pests or diseases.');
                    recommendations.push('Ensure proper lighting conditions.');
                    recommendations.push('Review watering schedule.');
                } else if (health === 'fair') {
                    recommendations.push('Monitor for signs of stress.');
                    recommendations.push('Check if nutrients are needed.');
                }
            }

            return {
                success: true,
                message: 'Recommendations generated',
                data: recommendations,
            };
        } catch (error: any) {
            console.error('Error getting recommendations:', error);
            return {
                success: false,
                message: 'Failed to get recommendations',
                error: error.message,
                data: [],
            };
        }
    }
}

// Create and export singleton instance
export const plantService = new PlantService();
export default plantService;