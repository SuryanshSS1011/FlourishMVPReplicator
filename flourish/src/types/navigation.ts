// src/types/navigation.ts
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
    'greenhouse': undefined;
    'garden': undefined;
    'shop': undefined;
    'encyclopedia': undefined;
};

