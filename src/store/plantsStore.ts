// src/store/plantsStore.ts

import { Query } from 'react-native-appwrite';
import { create } from 'zustand';
import { APPWRITE_CONFIG } from '../lib/appwrite/config';
import type {
    NutrientDocument,
    PlantDocument,
    UserPlantDocument
} from '../lib/appwrite/database';
import { databaseService } from '../lib/appwrite/database';

export interface PlantsStore {
    // State
    plants: PlantDocument[];
    userPlants: UserPlantDocument[];
    nutrients: NutrientDocument[];
    selectedPlant: PlantDocument | null;
    selectedUserPlant: UserPlantDocument | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchPlants: () => Promise<void>;
    fetchUserPlants: (userId: string) => Promise<void>;
    fetchNutrients: () => Promise<void>;
    selectPlant: (plant: PlantDocument | null) => void;
    selectUserPlant: (userPlant: UserPlantDocument | null) => void;
    addUserPlant: (userId: string, plantId: string, customData?: Partial<UserPlantDocument>) => Promise<boolean>;
    updateUserPlant: (plantId: string, userId: string, updates: Partial<UserPlantDocument>) => Promise<void>;
    deleteUserPlant: (plantId: string, userId: string) => Promise<void>;
    applyNutrient: (plantId: string, userId: string, nutrientId: string) => Promise<void>;
    waterPlant: (plantId: string, userId: string) => Promise<void>;
    clearError: () => void;

    // Getters
    getUserPlantById: (id: string) => UserPlantDocument | undefined;
    getPlantById: (id: string) => PlantDocument | undefined;
    getNutrientById: (id: string) => NutrientDocument | undefined;
    getActiveNutrients: (userPlantId: string) => any[];
}

export const usePlantsStore = create<PlantsStore>((set, get) => ({
    // Initial state
    plants: [],
    userPlants: [],
    nutrients: [],
    selectedPlant: null,
    selectedUserPlant: null,
    loading: false,
    error: null,

    // Fetch all plants
    fetchPlants: async () => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.listPlants([
                Query.orderAsc('name'),
                Query.limit(100)
            ]);

            if (result.success && result.data) {
                set({
                    plants: result.data.documents,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to fetch plants',
            });
        }
    },

    // Fetch user's plants
    fetchUserPlants: async (userId: string) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.getUserPlants(userId);

            if (result.success && result.data) {
                set({
                    userPlants: result.data.documents,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to fetch user plants',
            });
        }
    },

    // Fetch nutrients
    fetchNutrients: async () => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.listNutrients([
                Query.orderAsc('name'),
                Query.limit(50)
            ]);

            if (result.success && result.data) {
                set({
                    nutrients: result.data.documents,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to fetch nutrients',
            });
        }
    },

    // Select plant
    selectPlant: (plant: PlantDocument | null) => {
        set({ selectedPlant: plant });
    },

    // Select user plant
    selectUserPlant: (userPlant: UserPlantDocument | null) => {
        set({ selectedUserPlant: userPlant });
    },

    // Add user plant
    addUserPlant: async (userId: string, plantId: string, customData?: Partial<UserPlantDocument>) => {
        set({ loading: true, error: null });

        try {
            const plant = get().plants.find(p => p.$id === plantId);
            if (!plant) {
                throw new Error('Plant not found');
            }

            const newUserPlant = {
                plantId,
                plantName: plant.name,
                dateAdded: new Date().toISOString(),
                health: 'good' as const,
                growthStage: 'young' as const,
                notificationsEnabled: true,
                ...customData,
            };

            const result = await databaseService.createUserPlant(userId, newUserPlant);

            if (result.success && result.data) {
                const currentUserPlants = get().userPlants;
                set({
                    userPlants: [...currentUserPlants, result.data],
                    selectedUserPlant: result.data,
                    loading: false,
                });
                return true;
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
                return false;
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to add plant',
            });
            return false;
        }
    },

    // Update user plant
    updateUserPlant: async (plantId: string, userId: string, updates: Partial<UserPlantDocument>) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.updateUserPlant(plantId, userId, updates);

            if (result.success && result.data) {
                const { userPlants, selectedUserPlant } = get();

                // Update in list
                const updatedUserPlants = userPlants.map(up =>
                    up.$id === plantId ? result.data! : up
                );

                // Update selected if it's the same plant
                const newSelectedUserPlant = selectedUserPlant?.$id === plantId
                    ? result.data
                    : selectedUserPlant;

                set({
                    userPlants: updatedUserPlants,
                    selectedUserPlant: newSelectedUserPlant,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to update plant',
            });
        }
    },

    // Delete user plant
    deleteUserPlant: async (plantId: string, userId: string) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.deleteDocument(
                APPWRITE_CONFIG.collections.userPlants,
                plantId
            );

            if (result.success) {
                const { userPlants, selectedUserPlant } = get();

                // Remove from list
                const updatedUserPlants = userPlants.filter(up => up.$id !== plantId);

                // Clear selected if it's the deleted plant
                const newSelectedUserPlant = selectedUserPlant?.$id === plantId
                    ? null
                    : selectedUserPlant;

                set({
                    userPlants: updatedUserPlants,
                    selectedUserPlant: newSelectedUserPlant,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to delete plant',
            });
        }
    },

    // Apply nutrient
    applyNutrient: async (plantId: string, userId: string, nutrientId: string) => {
        try {
            const { selectedUserPlant, nutrients } = get();
            const nutrient = nutrients.find(n => n.$id === nutrientId);

            if (selectedUserPlant && nutrient) {
                const activeNutrients = selectedUserPlant.activeNutrients
                    ? JSON.parse(selectedUserPlant.activeNutrients)
                    : [];

                const newActiveNutrient = {
                    nutrientId: nutrient.$id,
                    nutrientName: nutrient.name,
                    appliedAt: new Date().toISOString(),
                    timer: parseInt(nutrient.timer || '300'),
                };

                const updatedActiveNutrients = [...activeNutrients, newActiveNutrient];

                await get().updateUserPlant(plantId, userId, {
                    activeNutrients: JSON.stringify(updatedActiveNutrients),
                    lastFertilized: new Date().toISOString(),
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to apply nutrient',
            });
        }
    },

    // Water plant
    waterPlant: async (plantId: string, userId: string) => {
        await get().updateUserPlant(plantId, userId, {
            lastWatered: new Date().toISOString(),
        });
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Getters
    getUserPlantById: (id: string) => {
        return get().userPlants.find(up => up.$id === id);
    },

    getPlantById: (id: string) => {
        return get().plants.find(p => p.$id === id);
    },

    getNutrientById: (id: string) => {
        return get().nutrients.find(n => n.$id === id);
    },

    getActiveNutrients: (userPlantId: string) => {
        const userPlant = get().getUserPlantById(userPlantId);
        if (!userPlant?.activeNutrients) {
            return [];
        }

        try {
            return JSON.parse(userPlant.activeNutrients);
        } catch {
            return [];
        }
    },
}));

