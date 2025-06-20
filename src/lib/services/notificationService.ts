// src/lib/services/notificationService.ts

import { Messaging, ID } from 'react-native-appwrite';
import { appwriteService } from '../appwrite/config';
import { databaseService } from '../appwrite/database';
import { useAuthStore } from '../../store/authStore';
import type { ApiResponse } from '../../types/api';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { router } from 'expo-router';

export interface NotificationData {
    $id: string;
    title: string;
    message: string;
    type: 'task_reminder' | 'plant_care' | 'achievement' | 'promotion' | 'news';
    data?: Record<string, any>;
    createdAt: string;
    isRead: boolean;
}

export interface NewsItem {
    $id: string;
    title: string;
    content: string;
    imageUrl?: string;
    category: 'tips' | 'updates' | 'community' | 'seasonal';
    publishedAt: string;
    readTime?: number;
}

class NotificationService {
    private messaging: Messaging;
    private notificationToken: string | null = null;

    constructor() {
        this.messaging = new Messaging(appwriteService.clientService);
        this.initializeNotifications();
    }

    /**
     * Initialize notification settings
     */
    private async initializeNotifications() {
        // Configure notification behavior
        await Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    }

    /**
     * Request notification permissions and get token
     */
    async requestPermissions(): Promise<ApiResponse<string>> {
        try {
            if (!Device.isDevice) {
                return {
                    success: false,
                    message: 'Notifications only work on physical devices',
                };
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                return {
                    success: false,
                    message: 'Notification permissions not granted',
                };
            }

            // Get Expo push token
            const token = await Notifications.getExpoPushTokenAsync();
            this.notificationToken = token.data;

            // Register token with Appwrite
            await this.registerDevice(token.data);

            return {
                success: true,
                message: 'Notifications enabled',
                data: token.data,
            };
        } catch (error: any) {
            console.error('Error requesting permissions:', error);
            return {
                success: false,
                message: 'Failed to enable notifications',
                error: error.message,
            };
        }
    }

    /**
     * Register device for push notifications
     */
    private async registerDevice(token: string): Promise<void> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) return;

            // Create push target in Appwrite
            await appwriteService.accountService.createPushTarget(
                ID.unique(),
                token,
                'expo' // Provider ID - you'll need to set this up in Appwrite console
            );

            // Subscribe to default topics
            await this.subscribeToTopic('general');
            await this.subscribeToTopic(`user_${user.$id}`);
        } catch (error) {
            console.error('Error registering device:', error);
        }
    }

    /**
     * Subscribe to a topic for targeted notifications
     */
    async subscribeToTopic(topic: string): Promise<ApiResponse> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                };
            }

            // Create subscriber
            await this.messaging.createSubscriber(
                topic,
                ID.unique(),
                user.$id
            );

            return {
                success: true,
                message: `Subscribed to ${topic}`,
            };
        } catch (error: any) {
            console.error('Error subscribing to topic:', error);
            return {
                success: false,
                message: 'Failed to subscribe to topic',
                error: error.message,
            };
        }
    }

    /**
     * Unsubscribe from a topic
     */
    async unsubscribeFromTopic(topic: string, subscriberId: string): Promise<ApiResponse> {
        try {
            await this.messaging.deleteSubscriber(topic, subscriberId);

            return {
                success: true,
                message: `Unsubscribed from ${topic}`,
            };
        } catch (error: any) {
            console.error('Error unsubscribing from topic:', error);
            return {
                success: false,
                message: 'Failed to unsubscribe from topic',
                error: error.message,
            };
        }
    }

    /**
     * Schedule a local notification
     */
    async scheduleNotification(
        title: string,
        body: string,
        trigger: Date | { seconds: number },
        data?: Record<string, any>
    ): Promise<string> {
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
                badge: 1,
            },
            trigger: trigger instanceof Date
                ? { date: trigger, type: 'date' as const }
                : { seconds: trigger.seconds, type: 'timeInterval' as const },
        });

        return notificationId;
    }

    /**
     * Cancel a scheduled notification
     */
    async cancelNotification(notificationId: string): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    /**
     * Schedule task reminders
     */
    async scheduleTaskReminder(
        taskName: string,
        taskId: string,
        reminderTime: Date
    ): Promise<ApiResponse<string>> {
        try {
            const notificationId = await this.scheduleNotification(
                'Task Reminder',
                `Don't forget to: ${taskName}`,
                reminderTime,
                { taskId, type: 'task_reminder' }
            );

            return {
                success: true,
                message: 'Reminder scheduled',
                data: notificationId,
            };
        } catch (error: any) {
            console.error('Error scheduling reminder:', error);
            return {
                success: false,
                message: 'Failed to schedule reminder',
                error: error.message,
            };
        }
    }

    /**
     * Schedule plant care reminders
     */
    async schedulePlantCareReminder(
        plantName: string,
        careType: 'water' | 'fertilize' | 'repot',
        userPlantId: string,
        reminderTime: Date
    ): Promise<ApiResponse<string>> {
        try {
            const messages = {
                water: `Time to water your ${plantName}! 💧`,
                fertilize: `${plantName} needs nutrients! 🌱`,
                repot: `Consider repotting ${plantName} 🪴`,
            };

            const notificationId = await this.scheduleNotification(
                'Plant Care Reminder',
                messages[careType],
                reminderTime,
                { userPlantId, careType, type: 'plant_care' }
            );

            return {
                success: true,
                message: 'Plant care reminder scheduled',
                data: notificationId,
            };
        } catch (error: any) {
            console.error('Error scheduling plant care reminder:', error);
            return {
                success: false,
                message: 'Failed to schedule reminder',
                error: error.message,
            };
        }
    }

    /**
     * Get user's notifications
     */
    async getUserNotifications(
        unreadOnly: boolean = false
    ): Promise<ApiResponse<NotificationData[]>> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                    data: [],
                };
            }

            // This would typically fetch from a notifications collection
            // For now, we'll use suggestions as a proxy
            const result = await databaseService.getUserSuggestions(user.$id, unreadOnly);

            if (result.success && result.data) {
                const notifications: NotificationData[] = result.data.map(suggestion => ({
                    $id: suggestion.$id,
                    title: suggestion.title,
                    message: suggestion.message,
                    type: suggestion.type === 'care' ? 'plant_care' : 'news',
                    data: suggestion.actionData,
                    createdAt: suggestion.$createdAt,
                    isRead: suggestion.isRead,
                }));

                return {
                    success: true,
                    message: 'Notifications retrieved',
                    data: notifications,
                };
            }

            return {
                success: false,
                message: 'Failed to get notifications',
                data: [],
            };
        } catch (error: any) {
            console.error('Error getting notifications:', error);
            return {
                success: false,
                message: 'Failed to get notifications',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
        try {
            // This would typically update a notifications collection
            // For now, we'll use the suggestion marking
            return await databaseService.markSuggestionAsRead(notificationId);
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
            return {
                success: false,
                message: 'Failed to mark notification as read',
                error: error.message,
            };
        }
    }

    /**
     * Get news and updates
     */
    async getNews(category?: string): Promise<ApiResponse<NewsItem[]>> {
        try {
            // This would typically fetch from a news collection
            // For demonstration, we'll return mock news items
            const mockNews: NewsItem[] = [
                {
                    $id: '1',
                    title: 'Spring Planting Guide',
                    content: 'Get ready for spring with our comprehensive planting guide...',
                    category: 'seasonal',
                    publishedAt: new Date().toISOString(),
                    readTime: 5,
                },
                {
                    $id: '2',
                    title: 'New Features in Flourish 2.0',
                    content: 'Discover the latest features to help you care for your plants...',
                    category: 'updates',
                    publishedAt: new Date().toISOString(),
                    readTime: 3,
                },
                {
                    $id: '3',
                    title: '5 Tips for Healthy Indoor Plants',
                    content: 'Learn how to keep your indoor plants thriving...',
                    category: 'tips',
                    publishedAt: new Date().toISOString(),
                    readTime: 4,
                },
            ];

            const filteredNews = category
                ? mockNews.filter(item => item.category === category)
                : mockNews;

            return {
                success: true,
                message: 'News retrieved',
                data: filteredNews,
            };
        } catch (error: any) {
            console.error('Error getting news:', error);
            return {
                success: false,
                message: 'Failed to get news',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Send test notification
     */
    async sendTestNotification(): Promise<ApiResponse> {
        try {
            await this.scheduleNotification(
                'Test Notification',
                'This is a test notification from Flourish! 🌱',
                { seconds: 1 }
            );

            return {
                success: true,
                message: 'Test notification sent',
            };
        } catch (error: any) {
            console.error('Error sending test notification:', error);
            return {
                success: false,
                message: 'Failed to send test notification',
                error: error.message,
            };
        }
    }

    /**
     * Handle notification response
     */
    setupNotificationHandlers() {
        // Handle notification received while app is foregrounded
        Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
        });

        // Handle notification response (when user taps notification)
        Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;

            if (data?.type === 'task_reminder' && data.taskId) {
                // Navigate to task
                router.push({
                    pathname: '/(app)/tasks',
                    params: { taskId: data.taskId }
                });
            } else if (data?.type === 'plant_care' && data.userPlantId) {
                // Navigate to plant
                router.push({
                    pathname: '/(app)/plants/[id]',
                    params: { id: data.userPlantId }
                });
            }
        });
    }
}

// Create and export singleton instance
export const notificationService = new NotificationService();
export default notificationService;