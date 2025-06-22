// src/lib/appwrite/config.ts

import { Account, Avatars, Client, Databases, Functions, ID, Query, Storage } from 'react-native-appwrite';

// Environment configuration with validation
export const APPWRITE_CONFIG = {
    // Core Appwrite settings
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '',
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || '',

    // Database configuration
    databaseId: process.env.EXPO_PUBLIC_DATABASE_ID || '',

    // Collection IDs
    collections: {
        plants: process.env.EXPO_PUBLIC_PLANTS_COLLECTION_ID || '',
        userPlants: process.env.EXPO_PUBLIC_USER_PLANTS_COLLECTION_ID || '',
        nutrients: process.env.EXPO_PUBLIC_NUTRIENTS_COLLECTION_ID || '',
        tasks: process.env.EXPO_PUBLIC_TASKS_COLLECTION_ID || '',
        taskDetails: process.env.EXPO_PUBLIC_TASK_DETAILS_COLLECTION_ID || '',
        suggestions: process.env.EXPO_PUBLIC_SUGGESTIONS_COLLECTION_ID || '',
    },

    // Storage buckets
    buckets: {
        plantImages: process.env.EXPO_PUBLIC_PLANT_IMAGES_BUCKET_ID || '',
        nutrientImages: process.env.EXPO_PUBLIC_NUTRIENT_IMAGES_BUCKET_ID || '',
        taskImages: process.env.EXPO_PUBLIC_TASK_IMAGES_BUCKET_ID || '',
        backgrounds: process.env.EXPO_PUBLIC_BACKGROUNDS_BUCKET_ID || '',
        preLoginAssets: process.env.EXPO_PUBLIC_PRE_LOGIN_BUCKET_ID || '',
        dashboardAssets: process.env.EXPO_PUBLIC_DASHBOARD_BUCKET_ID || '',
    },

    // App settings
    settings: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        defaultPlantImage: 'default-plant',
        defaultNutrientImage: 'default-nutrient',
        sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
} as const;

// Validation function
export const validateAppwriteConfig = (): { isValid: boolean; missingVars: string[]; warnings: string[] } => {
    const requiredVars = [
        'endpoint',
        'projectId',
        'databaseId',
    ];

    const missingVars: string[] = [];

    // Check required configuration
    if (!APPWRITE_CONFIG.projectId) missingVars.push('EXPO_PUBLIC_APPWRITE_PROJECT_ID');
    if (!APPWRITE_CONFIG.databaseId) missingVars.push('EXPO_PUBLIC_DATABASE_ID');

    const warnings: string[] = [];

    // Check collections
    Object.entries(APPWRITE_CONFIG.collections).forEach(([key, value]) => {
        if (!value) {
            warnings.push(`Missing collection ID for: ${key}`);
        }
    });

    // Check buckets
    Object.entries(APPWRITE_CONFIG.buckets).forEach(([key, value]) => {
        if (!value) {
            warnings.push(`Missing bucket ID for: ${key}`);
        }
    });

    return {
        isValid: missingVars.length === 0,
        missingVars,
        warnings,
    };
};

// Appwrite service singleton
class AppwriteService {
    private static instance: AppwriteService;
    private client: Client;
    private account: Account;
    private databases: Databases;
    private storage: Storage;
    private functions: Functions;
    private avatars: Avatars;
    private initialized = false;

    private constructor() {
        this.client = new Client()
            .setEndpoint(APPWRITE_CONFIG.endpoint)
            .setProject(APPWRITE_CONFIG.projectId)
            .setPlatform(APPWRITE_CONFIG.platform);

        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
        this.functions = new Functions(this.client);
        this.avatars = new Avatars(this.client);
    }

    static getInstance(): AppwriteService {
        if (!AppwriteService.instance) {
            AppwriteService.instance = new AppwriteService();
        }
        return AppwriteService.instance;
    }

    // Service getters
    get accountService() { return this.account; }
    get databaseService() { return this.databases; }
    get storageService() { return this.storage; }
    get functionsService() { return this.functions; }
    get avatarsService() { return this.avatars; }
    get clientService() { return this.client; }

    // Initialize app
    async initialize(): Promise<{ success: boolean; user?: any; error?: string }> {
        if (this.initialized) {
            return { success: true };
        }

        try {
            // Validate configuration
            const validation = validateAppwriteConfig();
            if (!validation.isValid) {
                console.error('Invalid Appwrite configuration:', validation.missingVars);
                return {
                    success: false,
                    error: 'Missing required configuration: ' + validation.missingVars.join(', '),
                };
            }

            if (validation.warnings.length > 0) {
                console.warn('Appwrite configuration warnings:', validation.warnings);
            }

            // Try to get current session
            try {
                const session = await this.account.getSession('current');
                if (session) {
                    const user = await this.account.get();
                    this.initialized = true;

                    return {
                        success: true,
                        user: {
                            ...user,
                            prefs: {
                                ...user.prefs,
                                // Ensure default preferences
                                onboardingCompleted: user.prefs?.onboardingCompleted ?? false,
                                totalPoints: user.prefs?.totalPoints ?? 0,
                                currentStreak: user.prefs?.currentStreak ?? 0,
                                notificationsEnabled: user.prefs?.notificationsEnabled ?? true,
                            }
                        }
                    };
                }
            } catch (sessionError) {
                // No active session - this is fine for initial app load
                console.log('No active session found');
            }

            this.initialized = true;
            return { success: true };

        } catch (error: any) {
            console.error('Appwrite initialization error:', error);
            this.initialized = false;
            return {
                success: false,
                error: error.message || 'Failed to initialize Appwrite',
            };
        }
    }

    // Health check
    async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
        try {
            // Test account service - don't throw on failure
            let accountStatus = 'unavailable';
            try {
                await this.account.get();
                accountStatus = 'authenticated';
            } catch {
                accountStatus = 'not authenticated';
            }

            // Test database connection if we have the IDs
            let databaseStatus = 'unavailable';
            if (APPWRITE_CONFIG.databaseId && APPWRITE_CONFIG.collections.plants) {
                try {
                    await this.databases.listDocuments(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.plants,
                        [Query.limit(1)]
                    );
                    databaseStatus = 'connected';
                } catch {
                    databaseStatus = 'error';
                }
            }

            return {
                status: 'healthy',
                details: {
                    endpoint: APPWRITE_CONFIG.endpoint,
                    projectId: APPWRITE_CONFIG.projectId,
                    accountStatus,
                    databaseStatus,
                    timestamp: new Date().toISOString(),
                }
            };
        } catch (error: any) {
            return {
                status: 'unhealthy',
                details: {
                    error: error.message,
                    code: error.code,
                    timestamp: new Date().toISOString(),
                }
            };
        }
    }

    // Reset client (for logout)
    reset() {
        this.initialized = false;
    }
}

// Export singleton instance
export const appwriteService = AppwriteService.getInstance();

// Export utilities
export { ID, Query };

// Export types
    export type { Models } from 'react-native-appwrite';

// Default export
export default appwriteService;