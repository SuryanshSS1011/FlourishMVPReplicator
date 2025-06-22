// src/store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../lib/appwrite/auth';
import type { User, Session, UserPreferences } from '../lib/appwrite/auth';
import type { ApiResponse } from '../types/api';

export interface AuthStore {
    // State
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<ApiResponse<User>>;
    register: (name: string, email: string, password: string) => Promise<ApiResponse<User>>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    updateProfile: (data: { name?: string; email?: string; password?: string; oldPassword?: string }) => Promise<ApiResponse<User>>;
    updatePreferences: (preferences: Partial<UserPreferences>) => Promise<ApiResponse<User>>;
    completeOnboarding: () => Promise<void>;
    addPoints: (points: number) => Promise<void>;
    addAchievement: (achievementId: string) => Promise<void>;
    clearError: () => void;

    // Getters
    isAuthenticated: () => boolean;
    getPreference: <K extends keyof UserPreferences>(key: K) => UserPreferences[K] | undefined;
    getUserStats: () => {
        totalPoints: number;
        currentStreak: number;
        totalTasksCompleted: number;
        achievements: string[];
    };
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            session: null,
            loading: false,
            error: null,
            initialized: false,

            // Initialize app
            initialize: async () => {
                if (get().initialized) {
                    return;
                }

                set({ loading: true });
                try {
                    const result = await authService.getCurrentUser();

                    if (result.success && result.data) {
                        const sessionResult = await authService.getCurrentSession();

                        set({
                            user: result.data,
                            session: sessionResult.data || null,
                            initialized: true,
                            loading: false,
                        });

                        // Update activity
                        await authService.updateUserActivity();
                    } else {
                        // No user session - this is fine
                        set({
                            user: null,
                            session: null,
                            initialized: true,
                            loading: false,
                        });
                    }
                } catch (error: any) {
                    console.error('Initialize error:', error);
                    set({
                        user: null,
                        session: null,
                        initialized: true,
                        loading: false,
                        error: error.message,
                    });
                }
            },

            // Login
            login: async (email: string, password: string) => {
                set({ loading: true, error: null });

                try {
                    const result = await authService.login({ email, password });

                    if (result.success && result.data) {
                        const sessionResult = await authService.getCurrentSession();

                        set({
                            user: result.data,
                            session: sessionResult.data || null,
                            loading: false,
                            error: null,
                        });

                        return result;
                    } else {
                        set({
                            loading: false,
                            error: result.message,
                        });
                        return result;
                    }
                } catch (error: any) {
                    const errorMessage = error.message || 'Login failed';
                    set({
                        loading: false,
                        error: errorMessage,
                    });
                    return {
                        success: false,
                        message: errorMessage,
                        error: errorMessage,
                    };
                }
            },

            // Register
            register: async (name: string, email: string, password: string) => {
                set({ loading: true, error: null });

                try {
                    const result = await authService.register({ name, email, password });

                    if (result.success && result.data) {
                        const sessionResult = await authService.getCurrentSession();

                        set({
                            user: result.data,
                            session: sessionResult.data || null,
                            loading: false,
                            error: null,
                        });

                        return result;
                    } else {
                        set({
                            loading: false,
                            error: result.message,
                        });
                        return result;
                    }
                } catch (error: any) {
                    const errorMessage = error.message || 'Registration failed';
                    set({
                        loading: false,
                        error: errorMessage,
                    });
                    return {
                        success: false,
                        message: errorMessage,
                        error: errorMessage,
                    };
                }
            },

            // Logout
            logout: async () => {
                set({ loading: true });

                try {
                    await authService.logout();
                    set({
                        user: null,
                        session: null,
                        loading: false,
                        error: null,
                    });
                } catch (error: any) {
                    set({
                        loading: false,
                        error: error.message || 'Logout failed',
                    });
                }
            },

            // Check session
            checkSession: async () => {
                set({ loading: true });

                try {
                    const userResult = await authService.getCurrentUser();

                    if (userResult.success && userResult.data) {
                        const sessionResult = await authService.getCurrentSession();

                        set({
                            user: userResult.data,
                            session: sessionResult.data || null,
                            loading: false,
                            error: null,
                        });

                        // Update activity
                        await authService.updateUserActivity();
                    } else {
                        set({
                            user: null,
                            session: null,
                            loading: false,
                        });
                    }
                } catch (error: any) {
                    set({
                        user: null,
                        session: null,
                        loading: false,
                        error: error.message,
                    });
                }
            },

            // Update profile
            updateProfile: async (data) => {
                set({ loading: true, error: null });

                try {
                    const result = await authService.updateProfile(data);

                    if (result.success && result.data) {
                        set({
                            user: result.data,
                            loading: false,
                            error: null,
                        });
                        return result;
                    } else {
                        set({
                            loading: false,
                            error: result.message,
                        });
                        return result;
                    }
                } catch (error: any) {
                    const errorMessage = error.message || 'Update failed';
                    set({
                        loading: false,
                        error: errorMessage,
                    });
                    return {
                        success: false,
                        message: errorMessage,
                        error: errorMessage,
                    };
                }
            },

            // Update preferences
            updatePreferences: async (preferences: Partial<UserPreferences>) => {
                set({ loading: true, error: null });

                try {
                    const result = await authService.updatePreferences(preferences);

                    if (result.success && result.data) {
                        set({
                            user: result.data,
                            loading: false,
                            error: null,
                        });
                        return result;
                    } else {
                        set({
                            loading: false,
                            error: result.message,
                        });
                        return result;
                    }
                } catch (error: any) {
                    const errorMessage = error.message || 'Update failed';
                    set({
                        loading: false,
                        error: errorMessage,
                    });
                    return {
                        success: false,
                        message: errorMessage,
                        error: errorMessage,
                    };
                }
            },

            // Complete onboarding
            completeOnboarding: async () => {
                const { user } = get();
                if (!user) {
                    return;
                }

                await get().updatePreferences({
                    onboardingCompleted: true,
                });
            },

            // Add points
            addPoints: async (points: number) => {
                const { user } = get();
                if (!user) {
                    return;
                }

                const currentPoints = user.prefs?.totalPoints || 0;
                await get().updatePreferences({
                    totalPoints: currentPoints + points,
                });
            },

            // Add achievement
            addAchievement: async (achievementId: string) => {
                const { user } = get();
                if (!user) {
                    return;
                }

                const achievements = user.prefs?.achievements || [];
                if (!achievements.includes(achievementId)) {
                    await get().updatePreferences({
                        achievements: [...achievements, achievementId],
                        lastAchievement: achievementId,
                    });
                }
            },

            // Clear error
            clearError: () => {
                set({ error: null });
            },

            // Getters
            isAuthenticated: () => {
                return !!get().user && !!get().session;
            },

            getPreference: <K extends keyof UserPreferences>(key: K) => {
                return get().user?.prefs?.[key];
            },

            getUserStats: () => {
                const { user } = get();
                return {
                    totalPoints: user?.prefs?.totalPoints || 0,
                    currentStreak: user?.prefs?.currentStreak || 0,
                    totalTasksCompleted: user?.prefs?.totalTasksCompleted || 0,
                    achievements: user?.prefs?.achievements || [],
                };
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                session: state.session,
                initialized: state.initialized,
            }),
        }
    )
);