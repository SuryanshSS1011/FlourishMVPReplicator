// app/(app)/tasks/_layout.tsx
import { Stack } from 'expo-router';
import { theme } from '../../../src/styles';

export default function TasksLayout() {
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
            <Stack.Screen name="form" />
        </Stack>
    );
}