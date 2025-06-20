// src/lib/appwrite/auth.ts

import { ID, Models, OAuthProvider } from 'react-native-appwrite';
import { appwriteService } from './config';
import type { ApiResponse } from '../../types/api';

export interface User extends Models.User<Models.Preferences> {
    // Appwrite user properties are already included
    // We extend with our typed preferences
}

export interface UserPreferences {
    // Onboarding & Setup
    onboardingCompleted?: boolean;
    setupDate?: string;
    
    // Customization
    selectedBackground?: string;
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
            const initialPrefs: UserPreferences = {
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
            await this.account.updatePrefs(initialPrefs);

            return {
                success: true,
                message: 'Account created successfully',
                data: { ...user, prefs: initialPrefs } as User,
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
            const session = await this.account.createEmailPasswordSession(
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
            console.error('Get user error:', error);
            return {
                success: false,
                message: 'Not authenticated',
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
                error: error.message,
            };
        }
    }

    /**
     * Update user preferences
     */
    async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<User>> {
        try {
            // Get current preferences
            const user = await this.account.get();
            const currentPrefs = user.prefs as UserPreferences;

            // Merge with new preferences
            const updatedPrefs = {
                ...currentPrefs,
                ...preferences,
            };

            // Update preferences
            const updatedUser = await this.account.updatePrefs(updatedPrefs);

            return {
                success: true,
                message: 'Preferences updated successfully',
                data: updatedUser as User,
            };
        } catch (error: any) {
            console.error('Update preferences error:', error);
            return {
                success: false,
                message: 'Failed to update preferences',
                error: error.message,
            };
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(data: { name?: string; email?: string; password?: string }): Promise<ApiResponse<User>> {
        try {
            let user = await this.account.get();

            // Update name if provided
            if (data.name && data.name !== user.name) {
                user = await this.account.updateName(data.name);
            }

            // Update email if provided (requires password)
            if (data.email && data.email !== user.email && data.password) {
                user = await this.account.updateEmail(data.email, data.password);
            }

            // Update password if provided
            if (data.password) {
                await this.account.updatePassword(data.password);
            }

            return {
                success: true,
                message: 'Profile updated successfully',
                data: user as User,
            };
        } catch (error: any) {
            console.error('Update profile error:', error);
            return {
                success: false,
                message: 'Failed to update profile',
                error: error.message,
            };
        }
    }

    /**
     * Check if user has completed onboarding
     */
    async checkOnboardingStatus(): Promise<boolean> {
        try {
            const user = await this.account.get();
            return user.prefs.onboardingCompleted === true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Complete onboarding
     */
    async completeOnboarding(): Promise<ApiResponse> {
        try {
            await this.updatePreferences({
                onboardingCompleted: true,
                setupDate: new Date().toISOString(),
            });

            return {
                success: true,
                message: 'Onboarding completed',
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'Failed to complete onboarding',
                error: error.message,
            };
        }
    }

    /**
     * Update user activity and streak
     */
    async updateUserActivity(): Promise<void> {
        try {
            const user = await this.account.get();
            const prefs = user.prefs as UserPreferences;
            
            const today = new Date().toDateString();
            const lastActive = prefs.lastActiveDate ? new Date(prefs.lastActiveDate).toDateString() : null;
            
            // Calculate streak
            let currentStreak = prefs.currentStreak || 0;
            
            if (lastActive !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastActive === yesterday.toDateString()) {
                    // Consecutive day - increase streak
                    currentStreak += 1;
                } else if (lastActive !== today) {
                    // Streak broken - reset to 1
                    currentStreak = 1;
                }
                
                const longestStreak = Math.max(currentStreak, prefs.longestStreak || 0);
                
                await this.updatePreferences({
                    lastActiveDate: new Date().toISOString(),
                    currentStreak,
                    longestStreak,
                });
            }
        } catch (error) {
            console.error('Error updating user activity:', error);
        }
    }

    /**
     * Add points to user
     */
    async addPoints(points: number): Promise<ApiResponse<number>> {
        try {
            const user = await this.account.get();
            const currentPoints = (user.prefs.totalPoints as number) || 0;
            const newPoints = currentPoints + points;

            await this.updatePreferences({
                totalPoints: newPoints,
            });

            return {
                success: true,
                message: `Earned ${points} points!`,
                data: newPoints,
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'Failed to add points',
                error: error.message,
            };
        }
    }

    /**
     * Add achievement
     */
    async addAchievement(achievementId: string): Promise<ApiResponse> {
        try {
            const user = await this.account.get();
            const achievements = (user.prefs.achievements as string[]) || [];

            if (!achievements.includes(achievementId)) {
                achievements.push(achievementId);
                
                await this.updatePreferences({
                    achievements,
                    lastAchievement: new Date().toISOString(),
                });

                return {
                    success: true,
                    message: 'Achievement unlocked!',
                };
            }

            return {
                success: true,
                message: 'Achievement already unlocked',
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'Failed to add achievement',
                error: error.message,
            };
        }
    }

    /**
     * Password recovery
     */
    async recoverPassword(email: string): Promise<ApiResponse> {
        try {
            const redirectUrl = `${process.env.EXPO_PUBLIC_APP_URL || 'https://flourish.app'}/reset-password`;
            
            await this.account.createRecovery(email, redirectUrl);

            return {
                success: true,
                message: 'Password recovery email sent',
            };
        } catch (error: any) {
            console.error('Password recovery error:', error);
            return {
                success: false,
                message: 'Failed to send recovery email',
                error: error.message,
            };
        }
    }

    /**
     * Complete password recovery
     */
    async completePasswordRecovery(userId: string, secret: string, password: string): Promise<ApiResponse> {
        try {
            await this.account.updateRecovery(userId, secret, password);

            return {
                success: true,
                message: 'Password reset successfully',
            };
        } catch (error: any) {
            console.error('Complete password recovery error:', error);
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
    async createOAuth2Session(provider: OAuthProvider): Promise<ApiResponse> {
        try {
            this.account.createOAuth2Session(
                provider,
                `${process.env.EXPO_PUBLIC_APP_URL}/auth/callback`,
                `${process.env.EXPO_PUBLIC_APP_URL}/auth/failure`
            );

            return {
                success: true,
                message: 'OAuth session created',
            };
        } catch (error: any) {
            console.error('OAuth2 error:', error);
            return {
                success: false,
                message: 'Failed to create OAuth session',
                error: error.message,
            };
        }
    }

    /**
     * Create anonymous session
     */
    async createAnonymousSession(): Promise<ApiResponse<Session>> {
        try {
            const session = await this.account.createAnonymousSession();

            return {
                success: true,
                message: 'Anonymous session created',
                data: session as Session,
            };
        } catch (error: any) {
            console.error('Anonymous session error:', error);
            return {
                success: false,
                message: 'Failed to create anonymous session',
                error: error.message,
            };
        }
    }

    /**
     * Ensure default preferences
     */
    private ensureDefaultPreferences(prefs: any): UserPreferences {
        return {
            onboardingCompleted: false,
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
     * Convert error to user-friendly message
     */
    private getErrorMessage(error: any): string {
        const errorMap: Record<number, string> = {
            400: 'Invalid request. Please check your input.',
            401: 'Invalid email or password.',
            404: 'User not found.',
            409: 'An account with this email already exists.',
            429: 'Too many attempts. Please try again later.',
            500: 'Server error. Please try again later.',
        };

        if (error.code && errorMap[error.code]) {
            return errorMap[error.code];
        }

        // Specific error messages
        if (error.message?.includes('Invalid email')) {
            return 'Please enter a valid email address.';
        }
        if (error.message?.includes('Password must be')) {
            return 'Password must be at least 8 characters long.';
        }
        if (error.message?.includes('User (role: guests) missing scope')) {
            return 'Please log in to continue.';
        }

        return error.message || 'An unexpected error occurred';
    }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;