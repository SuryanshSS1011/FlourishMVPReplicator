// src/lib/appwrite/config.ts

import { Client, Account, Databases, Storage, ID, Query } from 'react-native-appwrite';

// Environment configuration
export const APPWRITE_CONFIG = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '67cfa24f0031e006fba3',
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || 'com.flourish.flourish-app',

    // Database configuration
    databaseId: '67d10458003794e7043a',

    // Collection IDs
    collections: {
        users: '67d3122600380f456efc',
        tasks: '67d1046e0034562efa94',
        taskDetails: '67f7dffc0009786770b0',
        suggestions: '67fa90f6002696ea6221',
        nutrients: '67ddb48d002837798265',
        plants: '681679410027bad8bad5',
        userPlants: '67e1b2da0031720d3cac',
    },

    // Storage buckets
    buckets: {
        preLogin: '68427a71002966c8331c',
        dashboard: '67d10458003794e7043a',
        tasks: '67d1046e0034562efa94',
        plants: '67e227bf00075deadffc',
        backgrounds: '67e1b2da0031720d3cac',
        nutrients: '67ddb9b20009978262ae',
    },
} as const;

// Initialize Appwrite client
class AppwriteService {
    private client: Client;
    private account: Account;
    private databases: Databases;
    private storage: Storage;

    constructor() {
        this.client = new Client()
            .setEndpoint(APPWRITE_CONFIG.endpoint)
            .setProject(APPWRITE_CONFIG.projectId)
            .setPlatform(APPWRITE_CONFIG.platform);

        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
    }

    // Getters for services
    get accountService() { return this.account; }
    get databaseService() { return this.databases; }
    get storageService() { return this.storage; }
    get clientService() { return this.client; }

    // Initialize session
    async initializeSession(): Promise<{ success: boolean; session?: any; error?: string }> {
        try {
            const session = await this.account.getSession('current');
            console.log('Existing session found:', session.$id);
            return { success: true, session };
        } catch (error: any) {
            if (error.code === 401) {
                try {
                    console.log('Creating anonymous session...');
                    const newSession = await this.account.createAnonymousSession();
                    console.log('Anonymous session created:', newSession.$id);
                    return { success: true, session: newSession };
                } catch (anonymousError: any) {
                    console.error('Failed to create anonymous session:', anonymousError);
                    return { success: false, error: anonymousError.message };
                }
            }
            console.error('Session initialization error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get file URL helper
    getFileUrl(bucketId: string, fileId: string): string {
        if (!fileId) {
            return 'https://via.placeholder.com/150';
        }
        return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`;
    }
}

// Create singleton instance
export const appwriteService = new AppwriteService();

// Export utilities
export { ID, Query };
export default appwriteService;