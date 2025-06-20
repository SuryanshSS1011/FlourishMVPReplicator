// app/(app)/_layout.tsx
import { useEffect } from 'react';
import { Redirect, Slot } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { LoadingSpinner } from '../../src/components/ui';

export default function AppLayout() {
    const { user, session, loading, checkSession } = useAuthStore();

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    if (loading) {
        return <LoadingSpinner message="Loading..." />;
    }

    // Redirect to auth if not authenticated
    if (!user || !session) {
        return <Redirect href="/(auth)/register" />;
    }

    return <Slot />;
}
