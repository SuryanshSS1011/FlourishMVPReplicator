import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './SplashScreen';
import Onboarding from './Onboarding';

// Define the types for our navigation
export type RootStackParamList = {
  SplashScreen: undefined;
  OnboardingScreen: undefined;
  // Add other screens as needed
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Layout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize any required resources here
    async function prepare() {
      try {
        // Preload splash screen images
        const images = [
          require('@/assets/images/splash1.png'),
          require('@/assets/images/splash2.png'),
          require('@/assets/images/splash3.png'),
          require('@/assets/images/splash4.png'),
          require('@/assets/images/splash5.png'),
          require('@/assets/images/splash6.png'),
          // Preload onboarding images
          require('@/assets/images/onboarding1.png'),
          require('@/assets/images/onboarding2.png'),
          require('@/assets/images/onboarding3.png'),
          require('@/assets/images/arrow-right.png'),
          require('@/assets/images/arrow-left.png'),
          require('@/assets/images/Flourish-logo.png'),
        ];
        // You can add other initialization here if needed
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OnboardingScreen"
        component={Onboarding}
        options={{
          headerShown: false,
        }}
      />
      {/* Add other screens here as needed */}
      {/* <Stack.Screen name="RegisterScreen" component={RegisterScreen} /> */}
      {/* <Stack.Screen name="LoginScreen" component={LoginScreen} /> */}
      {/* <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} /> */}
      {/* <Stack.Screen name="DashboardScreen" component={DashboardScreen} /> */}
    </Stack.Navigator>
  );
}