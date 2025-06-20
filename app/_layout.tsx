// app/_layout.tsx

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AppInitializer } from '../src/components/AppInitializer';
import { useAuthStore } from '../src/store/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const inOnboarding = segments[0] === 'onboarding';

    if (user) {
      // User is authenticated
      const onboardingCompleted = user.prefs?.onboardingCompleted;

      if (!onboardingCompleted && !inOnboarding) {
        // Redirect to onboarding
        router.replace('/onboarding');
      } else if (onboardingCompleted && (inAuthGroup || inOnboarding)) {
        // Redirect to main app
        router.replace('/(app)/(tabs)/dashboard');
      }
    } else {
      // User is not authenticated
      if (inAppGroup) {
        // Redirect to login
        router.replace('/(auth)/login');
      }
    }
  }, [user, segments, initialized, router]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppInitializer>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </AppInitializer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}