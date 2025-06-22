// src/lib/appwrite/auth.ts

import { ID, Models, OAuthProvider } from 'react-native-appwrite';
import { appwriteService } from './config';
import type { ApiResponse } from '../../types/api';

// User type extends Appwrite Models.User
export interface User extends Models.User<UserPreferences> {
    // User properties from Appwrite
}

// User preferences interface
export interface UserPreferences extends Models.Preferences {
    // Onboarding & Setup
    onboardingCompleted?: boolean;
    setupDate?: string;
    selectedTheme?: 'light' | 'dark';

    // Stats & Gamification
    totalPoints?: number;
    currentStreak?: number;
    longestStreak?: number;
    totalTasksCompleted?: number;
    lastActiveDate?: string;

    // Settings
    notificationsEnabled?: boolean;
    reminderTime?: string;
    timezone?: string;
    language?: string;

    // Premium Status
    isPremium?: boolean;
    premiumExpiry?: string;

    // Achievements
    achievements?: string[];
    lastAchievement?: string;

    // App-specific
    favoriteTools?: string[];
    plantGoal?: number;
    selectedPlantId?: string;
}

export interface Session extends Models.Session {
    // Session properties from Appwrite
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

class AuthService {
    private account;

    constructor() {
        this.account = appwriteService.accountService;
    }

    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<ApiResponse<User>> {
        try {
            // Create the account
            const response = await this.account.create(
                ID.unique(),
                data.email,
                data.password,
                data.name
            );

            // Create email session automatically
            await this.account.createEmailPasswordSession(
                data.email,
                data.password
            );

            // Get the full user object
            const user = await this.account.get();

            // Initialize user preferences
            const initialPrefs: Partial<UserPreferences> = {
                onboardingCompleted: false,
                setupDate: new Date().toISOString(),
                totalPoints: 0,
                currentStreak: 0,
                totalTasksCompleted: 0,
                notificationsEnabled: true,
                selectedTheme: 'light',
                achievements: [],
            };

            // Update preferences
            await this.account.updatePrefs(initialPrefs as any);

            return {
                success: true,
                message: 'Account created successfully',
                data: { ...user, prefs: { ...user.prefs, ...initialPrefs } } as User,
            };
        } catch (error: any) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Login with email and password
     */
    async login(data: LoginData): Promise<ApiResponse<User>> {
        try {
            // Create session
            await this.account.createEmailPasswordSession(
                data.email,
                data.password
            );

            // Get user data
            const user = await this.account.get();

            // Update last active date
            await this.updateUserActivity();

            return {
                success: true,
                message: 'Logged in successfully',
                data: user as User,
            };
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Create OAuth2 session
     */
    async createOAuth2Session(
        provider: OAuthProvider,
        success?: string,
        failure?: string,
        scopes?: string[]
    ): Promise<ApiResponse> {
        try {
            // The Appwrite SDK handles the OAuth flow automatically
            await this.account.createOAuth2Session(
                provider,
                success,
                failure,
                scopes
            );

            return {
                success: true,
                message: 'OAuth session initiated',
            };
        } catch (error: any) {
            console.error('OAuth error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Logout current session
     */
    async logout(): Promise<ApiResponse> {
        try {
            await this.account.deleteSession('current');
            appwriteService.reset();

            return {
                success: true,
                message: 'Logged out successfully',
            };
        } catch (error: any) {
            console.error('Logout error:', error);
            return {
                success: false,
                message: 'Failed to logout',
                error: error.message,
            };
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser(): Promise<ApiResponse<User>> {
        try {
            const user = await this.account.get();

            // Ensure user has proper preferences structure
            const prefs = this.ensureDefaultPreferences(user.prefs);

            return {
                success: true,
                message: 'User retrieved successfully',
                data: { ...user, prefs } as User,
            };
        } catch (error: any) {
            // No active session is not an error for this method
            if (error.code === 401 || error.message?.includes('missing scope')) {
                return {
                    success: false,
                    message: 'No active session',
                };
            }

            console.error('Get current user error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Get current session
     */
    async getCurrentSession(): Promise<ApiResponse<Session>> {
        try {
            const session = await this.account.getSession('current');

            return {
                success: true,
                message: 'Session retrieved successfully',
                data: session as Session,
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'No active session',
            };
        }
    }

    /**
     * Update user preferences
     */
    async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<User>> {
        try {
            const currentUser = await this.account.get();
            const updatedPrefs = {
                ...currentUser.prefs,
                ...preferences,
            };

            await this.account.updatePrefs(updatedPrefs as any);
            const updatedUser = await this.account.get();

            return {
                success: true,
                message: 'Preferences updated successfully',
                data: updatedUser as User,
            };
        } catch (error: any) {
            console.error('Update preferences error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(data: {
        name?: string;
        email?: string;
        password?: string;
        oldPassword?: string;
    }): Promise<ApiResponse<User>> {
        try {
            // Update name if provided
            if (data.name) {
                await this.account.updateName(data.name);
            }

            // Update email if provided
            if (data.email && data.password) {
                await this.account.updateEmail(data.email, data.password);
            }

            // Update password if provided
            if (data.password && data.oldPassword) {
                await this.account.updatePassword(data.password, data.oldPassword);
            }

            const updatedUser = await this.account.get();

            return {
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser as User,
            };
        } catch (error: any) {
            console.error('Update profile error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Update user activity
     */
    async updateUserActivity(): Promise<void> {
        try {
            const currentUser = await this.account.get();
            const today = new Date().toISOString().split('T')[0];

            await this.account.updatePrefs({
                ...currentUser.prefs,
                lastActiveDate: today,
            } as any);
        } catch (error) {
            console.error('Update activity error:', error);
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string): Promise<ApiResponse> {
        try {
            const url = `${process.env.EXPO_PUBLIC_APP_URL || 'https://flourish.app'}/reset-password`;
            await this.account.createRecovery(email, url);

            return {
                success: true,
                message: 'Password reset email sent',
            };
        } catch (error: any) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Complete password reset
     */
    async completePasswordReset(
        userId: string,
        secret: string,
        password: string
    ): Promise<ApiResponse> {
        try {
            await this.account.updateRecovery(userId, secret, password);

            return {
                success: true,
                message: 'Password reset successfully',
            };
        } catch (error: any) {
            console.error('Password reset completion error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error.message,
            };
        }
    }

    /**
     * Helper method to ensure default preferences
     */
    private ensureDefaultPreferences(prefs: any): UserPreferences {
        return {
            onboardingCompleted: false,
            setupDate: new Date().toISOString(),
            totalPoints: 0,
            currentStreak: 0,
            totalTasksCompleted: 0,
            notificationsEnabled: true,
            selectedTheme: 'light',
            achievements: [],
            ...prefs,
        };
    }

    /**
     * Helper method to get user-friendly error messages
     */
    private getErrorMessage(error: any): string {
        if (error.code === 401) {
            return 'Invalid credentials';
        }

        if (error.code === 409) {
            return 'User already exists';
        }

        if (error.code === 429) {
            return 'Too many attempts. Please try again later';
        }

        if (error.message?.includes('Invalid email')) {
            return 'Please enter a valid email address';
        }

        if (error.message?.includes('Password')) {
            return 'Password must be at least 8 characters';
        }

        return error.message || 'An unexpected error occurred';
    }
}

// Export service instance
export const authService = new AuthService();

// Default export
export default authService;