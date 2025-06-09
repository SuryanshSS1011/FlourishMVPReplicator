// src/lib/appwrite/auth.ts

import { ID } from 'react-native-appwrite';
import { appwriteService, APPWRITE_CONFIG } from './config';
import type { User, Session, ApiResponse, LoginFormData, SignupFormData } from '../../types';

class AuthService {
    private account = appwriteService.accountService;
    private databases = appwriteService.databaseService;

    /**
     * Create a new user account
     */
    async register({ name, email, password }: SignupFormData): Promise<ApiResponse<User>> {
        try {
            console.log('Creating user account:', { name, email });

            // Create Appwrite account
            const account = await this.account.create(ID.unique(), email, password, name);

            // Create session immediately
            await this.account.createEmailPasswordSession(email, password);

            // Get user data
            const user = await this.account.get();

            console.log('User registration successful:', user.$id);
            return {
                success: true,
                message: 'Account created successfully',
                data: user as User,
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
     * Sign in user with email and password
     */
    async login({ email, password }: LoginFormData): Promise<ApiResponse<User>> {
        try {
            console.log('Attempting login for:', email);

            // Create email session
            await this.account.createEmailPasswordSession(email, password);

            // Get user data
            const user = await this.account.get();

            console.log('Login successful:', user.$id);
            return {
                success: true,
                message: 'Login successful',
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
     * Sign out current user
     */
    async logout(): Promise<ApiResponse> {
        try {
            await this.account.deleteSession('current');
            console.log('Logout successful');
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
            return {
                success: true,
                message: 'User retrieved successfully',
                data: user as User,
            };
        } catch (error: any) {
            console.error('Get current user error:', error);
            return {
                success: false,
                message: 'Failed to get current user',
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
            console.error('Get current session error:', error);
            return {
                success: false,
                message: 'No active session',
                error: error.message,
            };
        }
    }

    /**
     * Send password recovery email
     */
    async sendPasswordRecovery(email: string): Promise<ApiResponse> {
        try {
            console.log('Sending password recovery email to:', email);

            // Create password recovery
            await this.account.createRecovery(
                email,
                `${process.env.EXPO_PUBLIC_APP_URL || 'https://flourish.app'}/reset-password`
            );

            return {
                success: true,
                message: 'Password recovery email sent successfully',
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
    async completePasswordRecovery(
        userId: string,
        secret: string,
        password: string
    ): Promise<ApiResponse> {
        try {
            console.log('Completing password recovery for user:', userId);

            // Update recovery
            await this.account.updateRecovery(userId, secret, password );

            return {
                success: true,
                message: 'Password updated successfully',
            };
        } catch (error: any) {
            console.error('Complete password recovery error:', error);
            return {
                success: false,
                message: 'Failed to update password',
                error: error.message,
            };
        }
    }

    /**
     * Create OAuth2 session
     */
    async createOAuth2Session(provider: string): Promise<ApiResponse<string>> {
        try {
            console.log('Creating OAuth2 session with provider:', provider);

            const redirectUrl = `${process.env.EXPO_PUBLIC_APP_URL || 'https://flourish.app'}/auth/callback`;
            const loginUrl = await this.account.createOAuth2Token(
                provider as any,
                redirectUrl,
                redirectUrl
            );

            if (!loginUrl) {
                throw new Error('Failed to create OAuth2 URL');
            }

            return {
                success: true,
                message: 'OAuth2 URL created successfully',
                data: loginUrl.toString(),
            };
        } catch (error: any) {
            console.error('OAuth2 session error:', error);
            return {
                success: false,
                message: 'Failed to create OAuth2 session',
                error: error.message,
            };
        }
    }

    /**
     * Create OAuth2 session from callback
     */
    async createOAuth2SessionFromCallback(
        userId: string,
        secret: string
    ): Promise<ApiResponse<User>> {
        try {
            console.log('Creating OAuth2 session from callback');

            // Create session from OAuth2 callback
            await this.account.createSession(userId, secret);

            // Get user data
            const user = await this.account.get();

            return {
                success: true,
                message: 'OAuth2 login successful',
                data: user as User,
            };
        } catch (error: any) {
            console.error('OAuth2 callback error:', error);
            return {
                success: false,
                message: 'Failed to complete OAuth2 login',
                error: error.message,
            };
        }
    }

    /**
     * Check if user session is valid
     */
    async checkSession(): Promise<ApiResponse<{ user: User; session: Session }>> {
        try {
            // Try to get current session first
            const sessionResult = await this.getCurrentSession();
            if (!sessionResult.success) {
                throw new Error('No active session');
            }

            // Get current user
            const userResult = await this.getCurrentUser();
            if (!userResult.success) {
                throw new Error('Failed to get user data');
            }

            return {
                success: true,
                message: 'Session is valid',
                data: {
                    user: userResult.data!,
                    session: sessionResult.data!,
                },
            };
        } catch (error: any) {
            console.error('Session check error:', error);
            return {
                success: false,
                message: 'Invalid or expired session',
                error: error.message,
            };
        }
    }

    /**
     * Create anonymous session for guest users
     */
    async createAnonymousSession(): Promise<ApiResponse<Session>> {
        try {
            console.log('Creating anonymous session');

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
     * Update user preferences
     */
    async updatePreferences(prefs: Record<string, any>): Promise<ApiResponse<User>> {
        try {
            console.log('Updating user preferences');

            const user = await this.account.updatePrefs(prefs);

            return {
                success: true,
                message: 'Preferences updated successfully',
                data: user as User,
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
 * Send email verification
 */
    async sendEmailVerification(): Promise<ApiResponse> {
        try {
            await this.account.createVerification(
                `${process.env.EXPO_PUBLIC_APP_URL}/verify`
            );
            return {
                success: true,
                message: 'Verification email sent successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'Failed to send verification email',
                error: error.message,
            };
        }
    }

    /**
     * Confirm email verification
     */
    async confirmEmailVerification(
        userId: string,
        secret: string
    ): Promise<ApiResponse> {
        try {
            await this.account.updateVerification(userId, secret);
            return {
                success: true,
                message: 'Email verified successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'Email verification failed',
                error: error.message,
            };
        }
    }

    /**
     * Convert Appwrite error to user-friendly message
     */
    private getErrorMessage(error: any): string {
        const errorMap: Record<number, string> = {
            400: 'Invalid request. Please check your input.',
            401: 'Invalid credentials. Please try again.',
            404: 'User not found.',
            409: 'User with this email already exists.',
            429: 'Too many requests. Please try again later.',
            500: 'Server error. Please try again later.',
        };

        const statusCode = error.code || error.status;
        return errorMap[statusCode] || error.message || 'An unexpected error occurred';
    }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;