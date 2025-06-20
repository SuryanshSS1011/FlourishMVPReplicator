// src/types/store.ts

import type { User, Session } from '../lib/appwrite/auth';
import type { Task, Suggestion, Plant, UserPlant, Nutrient } from './index';

export interface AuthStore {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    clearError: () => void;
}

export interface TasksStore {
    tasks: Task[];
    suggestions: Suggestion[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchTasks: (userId: string) => Promise<void>;
    fetchSuggestions: (userId: string) => Promise<void>;
    createTask: (taskData: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    toggleFavorite: (taskId: string) => Promise<void>;
    markCompleted: (taskId: string) => Promise<void>;
    clearError: () => void;
}

export interface PlantsStore {
    plants: Plant[];
    userPlants: UserPlant[];
    nutrients: Nutrient[];
    selectedPlant: Plant | null;
    selectedUserPlant: UserPlant | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchPlants: () => Promise<void>;
    fetchUserPlants: (userId: string) => Promise<void>;
    fetchNutrients: () => Promise<void>;
    selectPlant: (plant: Plant) => void;
    updateUserPlant: (plantId: string, updates: Partial<UserPlant>) => Promise<void>;
    applyNutrient: (plantId: string, nutrientId: string) => Promise<void>;
    clearError: () => void;
}

