// src/hooks/useAuth.ts
import { useAuthStore } from '../store/authStore';
import { useCallback } from 'react';

export const useAuth = () => {
    const store = useAuthStore();

    const loginWithEmail = useCallback(async (email: string, password: string) => {
        try {
            await store.login(email, password);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [store.login]);

    return {
        user: store.user,
        session: store.session,
        loading: store.loading,
        error: store.error,
        loginWithEmail,
        register: store.register,
        logout: store.logout,
        clearError: store.clearError,
    };
};

