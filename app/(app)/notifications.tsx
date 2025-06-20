// app/(app)/notifications.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles';
import { getDashboardImageSource } from '../../src/lib/utils/imageManager';

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    type: 'achievement' | 'tip' | 'reminder' | 'milestone';
    isRead: boolean;
}

// Mock notifications data
const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'Congratulations!',
        message: 'You have completed 20 workouts this week!',
        timestamp: '2 hours ago',
        type: 'achievement',
        isRead: false,
    },
    {
        id: '2',
        title: 'Nutrition Tip',
        message: 'Your nutrition is very low. Here is a tip to improve it.',
        timestamp: '5 hours ago',
        type: 'tip',
        isRead: false,
    },
    {
        id: '3',
        title: 'Goal Progress',
        message: "You're just closer to achieve your goals!",
        timestamp: '1 day ago',
        type: 'milestone',
        isRead: false,
    },
    {
        id: '4',
        title: 'Daily Reminder',
        message: "Don't forget to water your plants today!",
        timestamp: '2 days ago',
        type: 'reminder',
        isRead: true,
    },
    {
        id: '5',
        title: 'Weekly Summary',
        message: 'Your weekly progress report is ready to view.',
        timestamp: '3 days ago',
        type: 'achievement',
        isRead: true,
    },
];

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

    const handleBackPress = () => {
        router.back();
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const handleNotificationPress = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, isRead: true }
                    : notif
            )
        );
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'achievement':
                return '🏆';
            case 'tip':
                return '💡';
            case 'reminder':
                return '⏰';
            case 'milestone':
                return '🎯';
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'achievement':
                return '#2BE4FF';
            case 'tip':
                return '#E26310';
            case 'reminder':
                return '#78A88A';
            case 'milestone':
                return '#68A1A1';
            default:
                return theme.colors.primary[500];
        }
    };

    const renderNotification = (notification: Notification) => (
        <TouchableOpacity
            key={notification.id}
            style={[
                styles.notificationItem,
                !notification.isRead && styles.unreadNotification
            ]}
            onPress={() => handleNotificationPress(notification.id)}
        >
            <View style={[
                styles.notificationIcon,
                { backgroundColor: getNotificationColor(notification.type) }
            ]}>
                <Text style={styles.notificationEmoji}>
                    {getNotificationIcon(notification.type)}
                </Text>
            </View>

            <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                    {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                    {notification.message}
                </Text>
                <Text style={styles.notificationTimestamp}>
                    {notification.timestamp}
                </Text>
            </View>

            {!notification.isRead && (
                <View style={styles.unreadDot} />
            )}
        </TouchableOpacity>
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {notifications.length > 0 ? (
                    <>
                        {/* Clear All Button */}
                        <View style={styles.actionContainer}>
                            <Text style={styles.notificationCount}>
                                {unreadCount > 0 ? `${unreadCount} new notifications` : 'All caught up!'}
                            </Text>
                            <TouchableOpacity
                                style={styles.clearAllButton}
                                onPress={handleClearAll}
                            >
                                <Text style={styles.clearAllText}>Clear all</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Notifications List */}
                        <ScrollView
                            style={styles.notificationsList}
                            showsVerticalScrollIndicator={false}
                        >
                            {notifications.map(renderNotification)}
                        </ScrollView>
                    </>
                ) : (
                    /* Empty State */
                    <View style={styles.emptyState}>
                        <Image
                            source={getDashboardImageSource('bell')}
                            style={styles.emptyStateIcon}
                        />
                        <Text style={styles.emptyStateTitle}>No Notifications!</Text>
                        <Text style={styles.emptyStateMessage}>
                            You&apos;re all caught up. New notifications will appear here.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary[100],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: theme.colors.primary[100],
        ...theme.shadows.sm,
    },
    backButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary[900],
    },
    placeholder: {
        width: 44,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    notificationCount: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.primary,
    },
    clearAllButton: {
        backgroundColor: theme.colors.secondary[500],
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    clearAllText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
    },
    notificationsList: {
        flex: 1,
        marginTop: 10,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 10,
        ...theme.shadows.sm,
    },
    unreadNotification: {
        backgroundColor: '#F8F9FA',
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.secondary[500],
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationEmoji: {
        fontSize: 20,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary[900],
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        fontFamily: theme.typography.fonts.primary,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTimestamp: {
        fontSize: 12,
        fontFamily: theme.typography.fonts.primary,
        color: theme.colors.text.muted,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.secondary[500],
        marginTop: 5,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        opacity: 0.3,
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary[900],
        marginBottom: 10,
    },
    emptyStateMessage: {
        fontSize: 16,
        fontFamily: theme.typography.fonts.primary,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});