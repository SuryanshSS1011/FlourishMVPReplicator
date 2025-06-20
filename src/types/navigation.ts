// src/types/navigation.ts
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Nutrient } from './plants';

export type RootStackParamList = {
    // Auth screens
    SplashScreen: undefined;
    OnboardingScreen: undefined;
    RegisterScreen: undefined;
    LoginScreen: undefined;
    SignupScreen: undefined;
    ForgotPasswordScreen: undefined;
    ResetPasswordScreen: { userId?: string; secret?: string; code?: string };
    VerifyScreen: undefined;

    // Main app screens
    DashboardScreen: undefined;
    TaskListScreen: { userId: string };
    TaskFormScreen: { userId: string };
    GreenHouseScreen: {
        progressPercentage?: number;
        plantId?: string;
        userId?: string;
    };
    NutrientCard: {
        nutrient: Nutrient;
        color?: string;
        plantId?: string;
        userId?: string;
    };
    PremiumBackgroundScreen: undefined;

    // Tab screens
    '(tabs)': undefined;
    'index': undefined;
    'dashboard': undefined;
    'tasks': undefined;
    'tasks/form': { userId?: string };
    'greenhouse': undefined;
    'garden': undefined;
    'shop': undefined;
    'encyclopedia': undefined;

    // Nested screens
    '/(app)/(tabs)/tasks': undefined;
    '/(app)/tasks/form': { userId?: string };
    '/(app)/greenhouse/nutrient': {
        nutrientId: string;
        color?: string;
        plantId?: string;
        userId?: string;
    };
    '/(app)/greenhouse/backgrounds': undefined;
    '/(app)/greenhouse/vases': undefined;
    '/(app)/premium': undefined;
};

// Navigation prop type for screens
export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// Screen props for specific screens
export type TaskFormScreenProps = {
    navigation: NavigationProps;
    route: {
        params?: {
            userId?: string;
        };
    };
};

export type TaskListScreenProps = {
    navigation: NavigationProps;
    route: {
        params: {
            userId: string;
        };
    };
};