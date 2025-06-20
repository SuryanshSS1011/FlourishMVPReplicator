// app/(app)/greenhouse/_layout.tsx
import { Stack } from 'expo-router';
import { theme } from '../../../src/styles';

export default function GreenhouseLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                    backgroundColor: theme.colors.primary[100],
                },
            }}
        >
            <Stack.Screen
                name="nutrient"
                options={{
                    presentation: 'modal',
                    animation: 'fade_from_bottom',
                }}
            />
            <Stack.Screen
                name="backgrounds"
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="vases"
                options={{
                    animation: 'slide_from_right',
                }}
            />
        </Stack>
    );
}