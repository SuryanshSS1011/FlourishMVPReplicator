// src/lib/appwrite/config.ts

import { Client, Account, Databases, Storage, ID, Query } from 'react-native-appwrite';

// Environment configuration - Uses environment variables with fallbacks
export const APPWRITE_CONFIG = {
    // Core Appwrite settings
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '',
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || 'com.flourish.flourish-app',

    // Database configuration
    databaseId: process.env.EXPO_PUBLIC_DATABASE_ID || '',

    // Collection IDs - All should come from environment variables
    collections: {
        users: process.env.EXPO_PUBLIC_USERS_COLLECTION_ID || '',
        plants: process.env.EXPO_PUBLIC_PLANTS_COLLECTION_ID || '',
        userPlants: process.env.EXPO_PUBLIC_USER_PLANTS_COLLECTION_ID || '',
        nutrients: process.env.EXPO_PUBLIC_NUTRIENTS_COLLECTION_ID || '',
        tasks: process.env.EXPO_PUBLIC_TASKS_COLLECTION_ID || '',
        taskDetails: process.env.EXPO_PUBLIC_TASK_DETAILS_COLLECTION_ID || '',
    },

    // Storage buckets - Environment variables for all buckets
    buckets: {
        // Main image storage
        plantImages: process.env.EXPO_PUBLIC_PLANT_IMAGES_BUCKET_ID || '',
        nutrientImages: process.env.EXPO_PUBLIC_NUTRIENT_IMAGES_BUCKET_ID || '',
        taskImages: process.env.EXPO_PUBLIC_TASK_IMAGES_BUCKET_ID || '',
        userAvatars: process.env.EXPO_PUBLIC_USER_AVATARS_BUCKET_ID || '',
        
        // App interface images
        backgrounds: process.env.EXPO_PUBLIC_BACKGROUNDS_BUCKET_ID || '',
        preLoginAssets: process.env.EXPO_PUBLIC_PRE_LOGIN_BUCKET_ID || '',
        dashboardAssets: process.env.EXPO_PUBLIC_DASHBOARD_BUCKET_ID || '',
        
        // Documents (if needed)
        documents: process.env.EXPO_PUBLIC_DOCUMENTS_BUCKET_ID || '',
    },

    // API Keys for additional services (if needed)
    apiKeys: {
        weather: process.env.EXPO_PUBLIC_WEATHER_API_KEY || '',
        plantIdentification: process.env.EXPO_PUBLIC_PLANT_ID_API_KEY || '',
    },

    // App-specific settings
    settings: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        defaultPlantImage: 'default-plant.png',
        defaultNutrientImage: 'default-nutrient.png',
    },
} as const;

// Validation function to ensure all required environment variables are set
export const validateAppwriteConfig = (): { isValid: boolean; missingVars: string[]; warnings: string[] } => {
    const criticalVars = [
        'EXPO_PUBLIC_APPWRITE_PROJECT_ID',
        'EXPO_PUBLIC_DATABASE_ID',
    ];

    const requiredVars = [
        'EXPO_PUBLIC_USERS_COLLECTION_ID',
        'EXPO_PUBLIC_PLANTS_COLLECTION_ID', 
        'EXPO_PUBLIC_USER_PLANTS_COLLECTION_ID',
        'EXPO_PUBLIC_NUTRIENTS_COLLECTION_ID',
        'EXPO_PUBLIC_TASKS_COLLECTION_ID',
        'EXPO_PUBLIC_TASK_DETAILS_COLLECTION_ID',
    ];

    const bucketVars = [
        'EXPO_PUBLIC_PLANT_IMAGES_BUCKET_ID',
        'EXPO_PUBLIC_NUTRIENT_IMAGES_BUCKET_ID',
        'EXPO_PUBLIC_TASK_IMAGES_BUCKET_ID',
        'EXPO_PUBLIC_USER_AVATARS_BUCKET_ID',
    ];

    const missingCritical = criticalVars.filter(varName => !process.env[varName]);
    const missingRequired = requiredVars.filter(varName => !process.env[varName]);
    const missingBuckets = bucketVars.filter(varName => !process.env[varName]);
    
    const missingVars = [...missingCritical, ...missingRequired];
    const warnings = missingBuckets.length > 0 ? [`Missing bucket IDs: ${missingBuckets.join(', ')}`] : [];
    
    return {
        isValid: missingCritical.length === 0 && missingRequired.length === 0,
        missingVars,
        warnings,
    };
};

// Appwrite service class
class AppwriteService {
    private client: Client;
    private account: Account;
    private databases: Databases;
    private storage: Storage;

    constructor() {
        // Validate configuration on initialization
        const validation = validateAppwriteConfig();
        if (!validation.isValid) {
            console.error('Missing critical Appwrite environment variables:', validation.missingVars);
            console.error('Please check your .env file and ensure all required variables are set.');
        }
        if (validation.warnings.length > 0) {
            console.warn('Appwrite configuration warnings:', validation.warnings);
        }

        // Initialize client even if some vars are missing for development
        this.client = new Client()
            .setEndpoint(APPWRITE_CONFIG.endpoint)
            .setProject(APPWRITE_CONFIG.projectId)
            .setPlatform(APPWRITE_CONFIG.platform);

        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
    }

    // Service getters
    get accountService() { return this.account; }
    get databaseService() { return this.databases; }
    get storageService() { return this.storage; }
    get clientService() { return this.client; }

    // Session management - improved with better error handling
    async initializeSession(): Promise<{ success: boolean; session?: any; error?: string }> {
        try {
            const session = await this.account.getSession('current');
            console.log('Existing session found:', session.$id);
            return { success: true, session };
        } catch (error: any) {
            if (error.code === 401 || error.code === 404) {
                console.log('No valid session found. User needs to authenticate.');
                return { success: false, error: 'No active session' };
            }
            console.error('Session initialization error:', error);
            return { success: false, error: error.message };
        }
    }

    // Check session without creating anonymous session
    async checkExistingSession(): Promise<{ success: boolean; session?: any; error?: string }> {
        try {
            const session = await this.account.getSession('current');
            return { success: true, session };
        } catch (error: any) {
            return { success: false, error: 'No active session' };
        }
    }

    // Health check
    async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
        try {
            // Test database connection
            await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                [Query.limit(1)]
            );

            return {
                status: 'healthy',
                details: {
                    database: 'connected',
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

    // File upload helper with validation
    async uploadFile(
        bucketId: string,
        file: any,
        fileName?: string
    ): Promise<{ success: boolean; fileId?: string; url?: string; error?: string }> {
        try {
            // Validate file size
            if (file.size > APPWRITE_CONFIG.settings.maxFileSize) {
                return {
                    success: false,
                    error: 'File size exceeds maximum allowed size'
                };
            }

            // Validate file type for images
            if (bucketId.includes('Images') && !APPWRITE_CONFIG.settings.allowedImageTypes.includes(file.type)) {
                return {
                    success: false,
                    error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed'
                };
            }

            const fileId = fileName || ID.unique();
            const uploadedFile = await this.storage.createFile(bucketId, fileId, file);
            
            // Get file preview URL for images
            let url: string | undefined;
            if (bucketId.includes('Images')) {
                url = this.storage.getFilePreview(bucketId, uploadedFile.$id).toString();
            } else {
                url = this.storage.getFileView(bucketId, uploadedFile.$id).toString();
            }

            return {
                success: true,
                fileId: uploadedFile.$id,
                url,
            };
        } catch (error: any) {
            console.error('File upload error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Batch operations helper
    async batchCreateDocuments(
        collectionId: string,
        documents: any[]
    ): Promise<{ success: boolean; created: number; errors: any[] }> {
        const results = {
            success: true,
            created: 0,
            errors: [] as any[],
        };

        for (const doc of documents) {
            try {
                await this.databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    collectionId,
                    ID.unique(),
                    doc
                );
                results.created++;
            } catch (error) {
                results.success = false;
                results.errors.push({ document: doc, error });
            }
        }

        return results;
    }
}

// Export singleton instance
export const appwriteService = new AppwriteService();

// Export utilities
export { ID, Query } from 'react-native-appwrite';

// Legacy support - for backward compatibility with existing code
export const client = appwriteService.clientService;
export const account = appwriteService.accountService;
export const databases = appwriteService.databaseService;
export const storage = appwriteService.storageService;