// src/store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../lib/appwrite/auth';
import type { AuthStore, User, Session } from '../types';

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            loading: false,
            error: null,

            // Actions
            login: async (email: string, password: string) => {
                set({ loading: true, error: null });

                try {
                    const result = await authService.login({ email, password });

                    if (result.success && result.data) {
                        // Get session info
                        const sessionResult = await authService.getCurrentSession();

                        set({
                            user: result.data,
                            session: sessionResult.data || null,
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
                        error: error.message || 'Login failed',
                    });
                }
            },

            register: async (name: string, email: string, password: string) => {
                set({ loading: true, error: null });

                try {
                    const result = await authService.register({ name, email, password });

                    if (result.success && result.data) {
                        // Get session info
                        const sessionResult = await authService.getCurrentSession();

                        set({
                            user: result.data,
                            session: sessionResult.data || null,
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
                        error: error.message || 'Registration failed',
                    });
                }
            },

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

            checkSession: async () => {
                set({ loading: true });

                try {
                    const result = await authService.checkSession();

                    if (result.success && result.data) {
                        set({
                            user: result.data.user,
                            session: result.data.session,
                            loading: false,
                            error: null,
                        });
                    } else {
                        // Try to create anonymous session for guest access
                        const anonymousResult = await authService.createAnonymousSession();

                        set({
                            user: null,
                            session: anonymousResult.data || null,
                            loading: false,
                            error: null,
                        });
                    }
                } catch (error: any) {
                    set({
                        user: null,
                        session: null,
                        loading: false,
                        error: null, // Don't show error for session check
                    });
                }
            },

            clearError: () => {
                set({ error: null });
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

