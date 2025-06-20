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
    updateProfile: (data: { name?: string; email?: string; password?: string }) => Promise<ApiResponse<User>>;
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
                if (get().initialized) return;

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
                        set({
                            initialized: true,
                            loading: false,
                        });
                    }
                } catch (error) {
                    set({
                        initialized: true,
                        loading: false,
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

                    // Clear AsyncStorage
                    await AsyncStorage.removeItem('auth-storage');
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
                    });
                }
            },

            // Update profile
            updateProfile: async (data: { name?: string; email?: string; password?: string }) => {
                set({ loading: true, error: null });

                try {
                    const result = await authService.updateProfile(data);

                    if (result.success && result.data) {
                        set({
                            user: result.data,
                            loading: false,
                            error: null,
                        });
                    } else {
                        set({
                            loading: false,
                            error: result.message,
                        });
                    }

                    return result;
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
                    } else {
                        set({
                            loading: false,
                            error: result.message,
                        });
                    }

                    return result;
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
                const result = await authService.completeOnboarding();
                if (result.success) {
                    const user = get().user;
                    if (user) {
                        set({
                            user: {
                                ...user,
                                prefs: {
                                    ...user.prefs,
                                    onboardingCompleted: true,
                                }
                            }
                        });
                    }
                }
            },

            // Add points
            addPoints: async (points: number) => {
                const result = await authService.addPoints(points);
                if (result.success && result.data) {
                    const user = get().user;
                    if (user) {
                        set({
                            user: {
                                ...user,
                                prefs: {
                                    ...user.prefs,
                                    totalPoints: result.data,
                                }
                            }
                        });
                    }
                }
            },

            // Add achievement
            addAchievement: async (achievementId: string) => {
                const result = await authService.addAchievement(achievementId);
                if (result.success) {
                    const user = get().user;
                    if (user) {
                        const achievements = (user.prefs.achievements || []) as string[];
                        if (!achievements.includes(achievementId)) {
                            set({
                                user: {
                                    ...user,
                                    prefs: {
                                        ...user.prefs,
                                        achievements: [...achievements, achievementId],
                                    }
                                }
                            });
                        }
                    }
                }
            },

            // Clear error
            clearError: () => {
                set({ error: null });
            },

            // Check if authenticated
            isAuthenticated: () => {
                return !!get().user && !!get().session;
            },

            // Get preference
            getPreference: <K extends keyof UserPreferences>(key: K) => {
                const user = get().user;
                return user?.prefs?.[key] as UserPreferences[K] | undefined;
            },

            // Get user stats
            getUserStats: () => {
                const user = get().user;
                const prefs = user?.prefs || {};
                
                return {
                    totalPoints: (prefs.totalPoints as number) || 0,
                    currentStreak: (prefs.currentStreak as number) || 0,
                    totalTasksCompleted: (prefs.totalTasksCompleted as number) || 0,
                    achievements: (prefs.achievements as string[]) || [],
                };
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                session: state.session,
            }),
        }
    )
);

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated());
export const useUserPreference = <K extends keyof UserPreferences>(key: K) => 
    useAuthStore((state) => state.getPreference(key));
export const useUserStats = () => useAuthStore((state) => state.getUserStats());