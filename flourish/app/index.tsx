// app/index.tsx

import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { SplashScreen } from '../src/components/splash/SplashScreen';

export default function Index() {
  const { user, session, loading } = useAuthStore();

  // Show splash screen while checking authentication
  if (loading) {
    return <SplashScreen />;
  }

  // Redirect based on authentication state
  if (user && session) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  // Show onboarding for new users
  return <Redirect href="/onboarding" />;
}

