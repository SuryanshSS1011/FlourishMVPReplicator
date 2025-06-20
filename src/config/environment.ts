// src/config/environment.ts
export const ENV = {
    isDevelopment: __DEV__,
    isProduction: !__DEV__,

    appwrite: {
        endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
        projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
        platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
    },

    app: {
        version: require('../../package.json').version,
        buildNumber: process.env.EXPO_PUBLIC_BUILD_NUMBER || '1',
    },
} as const;