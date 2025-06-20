// app/(app)/(tabs)/dashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/styles';
import { useAuthStore } from '../../../src/store/authStore';
import { plantService } from '../../../src/lib/services/plantService';
import { taskService } from '../../../src/lib/services/taskService';
import { avatarService } from '../../../src/lib/appwrite/avatars';
import type { PlantWithUserData } from '../../../src/lib/services/plantService';
import type { TaskWithDetails, TaskStats } from '../../../src/lib/services/taskService';

interface DashboardData {
    mainPlant: PlantWithUserData | null;
    todayTasks: TaskWithDetails[];
    taskStats: TaskStats;
    plantHealth: number;
    nextWatering: Date | null;
}

export default function DashboardScreen() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        mainPlant: null,
        todayTasks: [],
        taskStats: {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            completionRate: 0,
            streak: 0,
            totalPoints: 0,
        },
        plantHealth: 0,
        nextWatering: null,
    });

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Load user's main plant
            const plantsResult = await plantService.getUserPlants();
            const mainPlant = plantsResult.success && plantsResult.data?.length > 0 
                ? plantsResult.data[0] 
                : null;

            // Load today's tasks
            const tasksResult = await taskService.getTodayTasks();
            const todayTasks = tasksResult.success ? tasksResult.data || [] : [];

            // Load task statistics
            const statsResult = await taskService.getUserTaskStats();
            const taskStats = statsResult.success && statsResult.data 
                ? statsResult.data 
                : dashboardData.taskStats;

            // Calculate plant health based on care
            let plantHealth = 0;
            let nextWatering = null;

            if (mainPlant) {
                const scheduleResult = await plantService.getPlantCareSchedule(
                    mainPlant.userPlant!.$id
                );
                
                if (scheduleResult.success && scheduleResult.data) {
                    const overdueTasks = scheduleResult.data.tasks.filter(t => t.overdue).length;
                    plantHealth = Math.max(0, 100 - (overdueTasks * 25));
                    nextWatering = scheduleResult.data.nextWatering;
                }
            }

            setDashboardData({
                mainPlant,
                todayTasks,
                taskStats,
                plantHealth,
                nextWatering,
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
    };

    const handleTaskComplete = async (taskDetailId: string) => {
        try {
            const result = await taskService.completeTask(taskDetailId);
            
            if (result.success) {
                Alert.alert(
                    'Task Completed!',
                    `You earned ${result.data?.points || 0} points!`,
                    [{ text: 'OK', onPress: () => loadDashboardData() }]
                );
            }
        } catch (error) {
            console.error('Error completing task:', error);
            Alert.alert('Error', 'Failed to complete task');
        }
    };

    const getPlantImage = () => {
        if (dashboardData.mainPlant?.imageUrl) {
            return { uri: dashboardData.mainPlant.imageUrl };
        }
        // Return default plant image
        return require('../../../../assets/images/default-plant.png');
    };

    const getPlantSizeStyle = () => {
        const health = dashboardData.plantHealth;
        const scale = 0.6 + (health / 100) * 0.4; // Scale from 0.6 to 1.0
        return {
            transform: [{ scale }],
        };
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity 
                    style={styles.notificationButton}
                    onPress={() => router.push('/(app)/notifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                    {dashboardData.taskStats.overdueTasks > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.badgeText}>
                                {dashboardData.taskStats.overdueTasks}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => router.push('/(app)/profile')}
                >
                    <Image
                        source={{ 
                            uri: avatarService.getUserAvatar(user?.name, 40) 
                        }}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
            </View>

            <Text style={styles.greeting}>
                Hello, {user?.name || 'Plant Parent'}! 👋
            </Text>
            
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dashboardData.taskStats.streak}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dashboardData.taskStats.totalPoints}</Text>
                    <Text style={styles.statLabel}>Total Points</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dashboardData.taskStats.completionRate}%</Text>
                    <Text style={styles.statLabel}>Completion</Text>
                </View>
            </View>
        </View>
    );

    const renderPlantSection = () => (
        <View style={styles.plantSection}>
            <LinearGradient
                colors={['#E8F5E9', '#C8E6C9']}
                style={styles.plantBackground}
            >
                {/* Sun icon */}
                <Image
                    source={{ uri: avatarService.getWeatherIcon('sunny', 60) }}
                    style={styles.sunIcon}
                />

                {/* Plant container */}
                <View style={styles.plantContainer}>
                    {dashboardData.mainPlant ? (
                        <View style={[styles.plant, getPlantSizeStyle()]}>
                            <Image
                                source={getPlantImage()}
                                style={styles.plantImage}
                                resizeMode="contain"
                            />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addPlantButton}
                            onPress={() => router.push('/(app)/plants/add')}
                        >
                            <Ionicons name="add-circle-outline" size={48} color={theme.colors.primary} />
                            <Text style={styles.addPlantText}>Add Your First Plant</Text>
                        </TouchableOpacity>
                    )}

                    {/* Pot */}
                    <Image
                        source={require('../../../../assets/images/pot.png')}
                        style={styles.pot}
                        resizeMode="contain"
                    />
                </View>

                {/* Plant info */}
                {dashboardData.mainPlant && (
                    <View style={styles.plantInfo}>
                        <Text style={styles.plantName}>
                            {dashboardData.mainPlant.userPlant?.nickname || dashboardData.mainPlant.name}
                        </Text>
                        <View style={styles.healthBar}>
                            <View 
                                style={[
                                    styles.healthFill, 
                                    { 
                                        width: `${dashboardData.plantHealth}%`,
                                        backgroundColor: dashboardData.plantHealth > 70 
                                            ? '#4CAF50' 
                                            : dashboardData.plantHealth > 40 
                                                ? '#FFC107' 
                                                : '#F44336'
                                    }
                                ]} 
                            />
                        </View>
                        {dashboardData.nextWatering && (
                            <Text style={styles.wateringText}>
                                Next watering: {dashboardData.nextWatering.toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                )}
            </LinearGradient>
        </View>
    );

    const renderTaskItem = (task: TaskWithDetails) => {
        const isOverdue = task.taskDetail && 
            task.taskDetail.status === 'pending' && 
            new Date(task.taskDetail.scheduledDate) < new Date();

        return (
            <TouchableOpacity
                key={task.taskDetail?.$id}
                style={[
                    styles.taskItem,
                    task.taskDetail?.status === 'completed' && styles.completedTask,
                    isOverdue && styles.overdueTask,
                ]}
                onPress={() => {
                    if (task.taskDetail?.status === 'pending') {
                        handleTaskComplete(task.taskDetail.$id);
                    }
                }}
                disabled={task.taskDetail?.status === 'completed'}
            >
                <View style={styles.taskIcon}>
                    {task.iconUrl ? (
                        <Image 
                            source={{ uri: task.iconUrl }} 
                            style={styles.taskIconImage}
                        />
                    ) : (
                        <Ionicons 
                            name={task.category === 'watering' ? 'water' : 'leaf'} 
                            size={24} 
                            color={theme.colors.primary} 
                        />
                    )}
                </View>

                <View style={styles.taskContent}>
                    <Text style={styles.taskName}>{task.name}</Text>
                    <Text style={styles.taskPoints}>{task.points} points</Text>
                </View>

                {task.taskDetail?.status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                ) : (
                    <View style={styles.taskAction}>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderTasksSection = () => (
        <View style={styles.tasksSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/tasks')}>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>

            {dashboardData.todayTasks.length > 0 ? (
                dashboardData.todayTasks.map(renderTaskItem)
            ) : (
                <View style={styles.emptyTasks}>
                    <Ionicons name="checkmark-done-circle" size={48} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyTasksText}>All tasks completed!</Text>
                    <TouchableOpacity
                        style={styles.addTaskButton}
                        onPress={() => router.push('/(app)/tasks/create')}
                    >
                        <Text style={styles.addTaskButtonText}>Add New Task</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderQuickActions = () => (
        <View style={styles.quickActions}>
            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/(app)/greenhouse')}
            >
                <LinearGradient
                    colors={['#81C784', '#66BB6A']}
                    style={styles.actionGradient}
                >
                    <Ionicons name="leaf" size={24} color="#FFF" />
                    <Text style={styles.actionText}>Greenhouse</Text>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/(app)/shop')}
            >
                <LinearGradient
                    colors={['#64B5F6', '#42A5F5']}
                    style={styles.actionGradient}
                >
                    <Ionicons name="cart" size={24} color="#FFF" />
                    <Text style={styles.actionText}>Shop</Text>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/(app)/achievements')}
            >
                <LinearGradient
                    colors={['#FFB74D', '#FFA726']}
                    style={styles.actionGradient}
                >
                    <Ionicons name="trophy" size={24} color="#FFF" />
                    <Text style={styles.actionText}>Achievements</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading your garden...</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[theme.colors.primary]}
                />
            }
        >
            {renderHeader()}
            {renderPlantSection()}
            {renderTasksSection()}
            {renderQuickActions()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.regular,
    },
    header: {
        padding: 20,
        paddingTop: 60,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    notificationButton: {
        position: 'relative',
        padding: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#F44336',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        color: '#FFF',
        fontFamily: theme.fonts.bold,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 16,
        fontFamily: theme.fonts.bold,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.fonts.bold,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
        fontFamily: theme.fonts.regular,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E0E0E0',
    },
    plantSection: {
        marginHorizontal: 20,
        marginVertical: 24,
    },
    plantBackground: {
        borderRadius: 20,
        padding: 20,
        height: 320,
        position: 'relative',
        overflow: 'hidden',
    },
    sunIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 60,
        height: 60,
    },
    plantContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    plant: {
        position: 'absolute',
        bottom: 80,
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plantImage: {
        width: '100%',
        height: '100%',
    },
    addPlantButton: {
        alignItems: 'center',
        marginBottom: 40,
    },
    addPlantText: {
        marginTop: 8,
        fontSize: 16,
        color: theme.colors.primary,
        fontFamily: theme.fonts.medium,
    },
    pot: {
        position: 'absolute',
        bottom: 0,
        width: 140,
        height: 100,
    },
    plantInfo: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    plantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 8,
        fontFamily: theme.fonts.bold,
    },
    healthBar: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    healthFill: {
        height: '100%',
        borderRadius: 3,
    },
    wateringText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.regular,
    },
    tasksSection: {
        marginHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        fontFamily: theme.fonts.bold,
    },
    seeAllText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontFamily: theme.fonts.medium,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    completedTask: {
        opacity: 0.6,
    },
    overdueTask: {
        borderColor: '#F44336',
        borderWidth: 1,
    },
    taskIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taskIconImage: {
        width: 24,
        height: 24,
    },
    taskContent: {
        flex: 1,
    },
    taskName: {
        fontSize: 16,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
    },
    taskPoints: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
        fontFamily: theme.fonts.regular,
    },
    taskAction: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTasks: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#FFF',
        borderRadius: 12,
    },
    emptyTasksText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 12,
        fontFamily: theme.fonts.regular,
    },
    addTaskButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
    },
    addTaskButtonText: {
        fontSize: 14,
        color: '#FFF',
        fontFamily: theme.fonts.medium,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 24,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 6,
    },
    actionGradient: {
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 14,
        color: '#FFF',
        marginTop: 8,
        fontFamily: theme.fonts.medium,
    },
});