// src/store/plantsStore.ts
import { create } from 'zustand';
import { plantService } from '../lib/appwrite';
import type { PlantsStore, Plant, UserPlant, Nutrient } from '../types';

export const usePlantsStore = create<PlantsStore>((set, get) => ({
    plants: [],
    userPlants: [],
    nutrients: [],
    selectedPlant: null,
    selectedUserPlant: null,
    loading: false,
    error: null,

    // Actions
    fetchPlants: async () => {
        set({ loading: true, error: null });

        try {
            const result = await plantService.getAllPlants();

            if (result.success) {
                set({
                    plants: result.data || [],
                    loading: false,
                    error: null,
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

    fetchUserPlants: async (userId: string) => {
        try {
            const result = await plantService.getUserPlants(userId);

            if (result.success) {
                set({
                    userPlants: result.data || [],
                    error: null,
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch user plants',
            });
        }
    },

    fetchNutrients: async () => {
        try {
            const result = await plantService.getAllNutrients();

            if (result.success) {
                set({
                    nutrients: result.data || [],
                    error: null,
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch nutrients',
            });
        }
    },

    selectPlant: (plant: Plant) => {
        const { userPlants } = get();
        const userPlant = userPlants.find(up => up.plant_id === plant.$id);

        set({
            selectedPlant: plant,
            selectedUserPlant: userPlant || null,
        });
    },

    updateUserPlant: async (plantId: string, updates: Partial<UserPlant>) => {
        try {
            const result = await plantService.updateUserPlant(plantId, updates);

            if (result.success) {
                const { userPlants, selectedUserPlant } = get();
                const updatedUserPlants = userPlants.map(up =>
                    up.plant_id === plantId ? { ...up, ...updates } : up
                );

                set({
                    userPlants: updatedUserPlants,
                    selectedUserPlant: selectedUserPlant?.plant_id === plantId
                        ? { ...selectedUserPlant, ...updates }
                        : selectedUserPlant,
                    error: null,
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update plant',
            });
        }
    },

    applyNutrient: async (plantId: string, nutrientId: string) => {
        // Implementation for applying nutrient to plant
        // This would involve updating the activeNutrients field
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
                    timer: parseInt(nutrient.timer) || 300,
                };

                const updatedActiveNutrients = [...activeNutrients, newActiveNutrient];

                await get().updateUserPlant(plantId, {
                    activeNutrients: JSON.stringify(updatedActiveNutrients),
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to apply nutrient',
            });
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));

