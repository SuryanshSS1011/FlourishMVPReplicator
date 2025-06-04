/**
 * Navigation types for the Flourish app
 * Defines all screen routes and their parameters
 */

export type RootStackParamList = {
    // Onboarding flow
    SplashScreen: undefined;
    OnboardingScreen: undefined;

    // Authentication flow
    LoginScreen: {
        skipSessionCheck?: boolean;
    };
    SignupScreen: undefined;
    ForgotPasswordScreen: undefined;
    ResetPasswordScreen: {
        expire: string;
        secret: string;
        userId: string;
    };
    RegisterScreen: undefined;

    // Main app flow
    GreenHouseScreen: {
        userId?: string;
        progressPercentage?: number;
        plantId?: string;
    };

    // Task management
    TaskListScreen: {
        userId: string;
    };
    TaskFormScreen: {
        userId: string;
    };

    // Plant and nutrient management
    NutrientCard: {
        nutrient: Nutrient;
        color?: string;
        plantId?: string;
        userId?: string;
    };

    // Premium features
    PremiumBackgroundScreen: undefined;

    // Additional screens
    FeelingsScreen: {
        userId?: string;
    };
    CheckInScreen: {
        userId?: string;
    };
};

// Screen component navigation prop types
export type ScreenNavigationProp<T extends keyof RootStackParamList> =
    import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList, T>;

export type ScreenRouteProp<T extends keyof RootStackParamList> =
    import('@react-navigation/native').RouteProp<RootStackParamList, T>;

// Entity types used across the app
export interface User {
    $id: string;
    email: string;
    created_at: string;
}

export interface Task {
    $id: string;
    id: string;
    category_type: string;
    Title: string;
    text: string;
    Created_at: string;
    icon: string | null;
    isFavorite: boolean;
    status: string;
    points: number;
    userId: string;
}

export interface TaskDetail {
    $id: string;
    task_id: string;
    Date: string;
    All_day: boolean;
    Recurrence_type: string;
    userId: string;
}

export interface Suggestion {
    $id: string;
    title: string;
    category_type: string;
    icon: string;
    points: number;
}

export interface Plant {
    $id: string;
    PlantName: string;
    Image: string;
    plant_catergory: string;
    Plant_family: string;
    isFavourite: boolean;
    timestamp: string;
}

export interface UserPlant {
    $id: string;
    plant_id: string;
    waterlevel: string;
    carelevel: string;
    plantedat: string;
    nutrients: string[];
    nutrientsid: string[];
    activeNutrients: string;
    userId: string;
    timestamp: string;
}

export interface Nutrient {
    $id: string;
    name: string;
    desc: string;
    ima: string;
    isPremium: boolean;
    timer: string;
    timestamp: string;
}

export interface ActiveNutrient {
    nutrientId: string;
    nutrientName: string;
    timer: number;
}

// API response types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

// Common component prop types
export interface BaseComponentProps {
    children?: React.ReactNode;
    style?: any;
    testID?: string;
}

// Form types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignupFormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface TaskFormData {
    title: string;
    selectedDate: Date;
    isAllDay: boolean;
    repeatOption: string;
    category_type: 'Daily' | 'Personal';
    icon?: string;
}