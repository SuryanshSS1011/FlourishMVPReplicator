// app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { theme } from '../../../src/styles';
import { getUIImageSource } from '../../../src/lib/utils/imageManager';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[900],
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.primary[100],
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.xs,
          fontFamily: theme.typography.fonts.primary,
          fontWeight: theme.typography.weights.bold,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={getUIImageSource('home-icon')}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? theme.colors.primary[900] : theme.colors.text.muted,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="greenhouse"
        options={{
          title: 'Greenhouse',
          tabBarIcon: ({ focused }) => (
            <Image
              source={getUIImageSource('home2')}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? theme.colors.primary[900] : theme.colors.text.muted,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: 'Garden',
          tabBarIcon: ({ focused }) => (
            <Image
              source={getUIImageSource('garden')}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? theme.colors.primary[900] : theme.colors.text.muted,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => (
            <Image
              source={getUIImageSource('shop')}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? theme.colors.primary[900] : theme.colors.text.muted,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="encyclopedia"
        options={{
          title: 'Encyclopedia',
          tabBarIcon: ({ focused }) => (
            <Image
              source={getUIImageSource('encyclopedia')}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? theme.colors.primary[900] : theme.colors.text.muted,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}