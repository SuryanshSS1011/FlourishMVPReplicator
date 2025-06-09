// lib/appwrite.ts

import { Client, Account, ID, OAuthProvider, Storage, Models } from 'react-native-appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67cfa24f0031e006fba3')
    .setPlatform('com.flourish.flourish-app');

const account = new Account(client);
const storage = new Storage(client);

export { client, account, storage, ID, OAuthProvider, Models };

/*

// lib/appwrite.ts - Centralized Appwrite configuration

import { Client, Databases, OAuthProvider, Models, ID, Query, Storage, Account } from 'react-native-appwrite';

// Appwrite configuration
export const APPWRITE_CONFIG = {
    endpoint: 'https://fra.cloud.appwrite.io/v1', // Appwrite API Endpoint
    projectId: '684266aa001f04ae4cbd', // Appwrite Project ID
    platform: 'com.flourish.flourish-app', // Your package name / bundle identifier
    buckets: {
        pre_login: '68427a71002966c8331c',
        greenhouse_nutrients: '67ddb9b20009978262ae',
    },
} as const;

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Initialize anonymous session if needed
export const initializeAppwriteClient = async (skipAnonymousSession = false) => {
    try {
        const session = await account.getSession('current');
        console.log('Existing session found:', session.$id);
        return { success: true, session };
    } catch (error: any) {
        if (error.code === 401 && !skipAnonymousSession) {
            console.log('No session found, creating anonymous session...');
            try {
                const newSession = await account.createAnonymousSession();
                console.log('Anonymous session created:', newSession.$id);
                return { success: true, session: newSession };
            } catch (anonymousError: any) {
                console.error('Failed to create anonymous session:', anonymousError);
                return { success: false, error: anonymousError.message };
            }
        } else if (error.code === 401) {
            console.log('No session found, skipping anonymous session creation.');
            return { success: true, session: null };
        } else {
            console.error('Error checking session:', error);
            throw error;
        }
    }
};

// Export utilities
export { ID, Query };
export default client;

*/