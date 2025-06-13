// app/(app)/(tabs)/dashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    ImageBackground,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    Animated,
    PanResponder,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { useTasksStore } from '../../../src/store/tasksStore';
import { theme } from '../../../src/styles';
import { LoadingSpinner } from '../../../src/components/ui';
import type { Task } from '../../../src/types';

// Separate TaskItem component for dashboard quick tasks
const DashboardTaskItem = ({
    item,
    activeTab,
    onSwipeComplete,
    onSwipeSkip
}: {
    item: Task;
    activeTab: 'daily' | 'personal';
    onSwipeComplete: (taskId: string) => void;
    onSwipeSkip: (taskId: string) => void;
}) => {
    const swipeAnim = useRef(new Animated.Value(0)).current;
    const [isOpen, setIsOpen] = useState(false);

    const SWIPE_THRESHOLD = 20;
    const SWIPE_ACTION_WIDTH = 120;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dx > 0) {
                swipeAnim.setValue(Math.min(gestureState.dx, SWIPE_ACTION_WIDTH));
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx > SWIPE_THRESHOLD) {
                Animated.spring(swipeAnim, {
                    toValue: SWIPE_ACTION_WIDTH,
                    useNativeDriver: true,
                }).start();
                setIsOpen(true);
            } else {
                Animated.spring(swipeAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
                setIsOpen(false);
            }
        },
    });

    const closeSwipe = () => {
        Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
        }).start(() => setIsOpen(false));
    };

    const handleSkip = () => {
        onSwipeSkip(item.$id);
        closeSwipe();
    };

    const handleComplete = () => {
        onSwipeComplete(item.$id);
        closeSwipe();
    };

    const taskBackgroundColor = activeTab === 'daily'
        ? theme.colors.secondary[500]
        : theme.colors.primary[500];

    const iconBackgroundColor = activeTab === 'daily'
        ? theme.colors.primary[500]
        : theme.colors.secondary[500];

    const getTaskIconUrl = (fileId: string | null) => {
        if (!fileId || fileId.trim() === "") {
            return require("../../../assets/images/Waterdrop.png");
        }
        return { uri: `https://cloud.appwrite.io/v1/storage/buckets/67e227bf00075deadffc/files/${fileId}/view?project=67cfa24f0031e006fba3` };
    };

    return (
        <View style={styles.dashboardTaskItem}>
            {/* Swipe actions backdrop */}
            <View style={[
                styles.swipeActionsBackdrop,
                { backgroundColor: taskBackgroundColor }
            ]}>
                <View style={styles.dashboardSwipeActions}>
                    <TouchableOpacity
                        style={[styles.dashboardActionButton, styles.skipActionButton]}
                        onPress={handleSkip}
                    >
                        <Text style={styles.actionButtonText}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.dashboardActionButton, styles.completeActionButton]}
                        onPress={handleComplete}
                    >
                        <Text style={styles.actionButtonText}>✓</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Task content */}
            <Animated.View
                style={[
                    styles.taskContent,
                    { transform: [{ translateX: swipeAnim }] },
                    { backgroundColor: taskBackgroundColor }
                ]}
                {...panResponder.panHandlers}
            >
                {/* Task icon */}
                <View style={[
                    styles.taskIconContainer,
                    { backgroundColor: iconBackgroundColor }
                ]}>
                    <Image
                        source={getTaskIconUrl(item.icon)}
                        style={styles.taskIcon}
                        resizeMode="contain"
                    />
                </View>

                {/* Task info */}
                <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                        {item.Title}
                    </Text>
                    <Text style={styles.taskCategory}>
                        {item.category_type} • Today
                    </Text>
                </View>

                {/* Points */}
                <View style={styles.taskPoints}>
                    <Text style={styles.pointsText}>{item.points || 5}</Text>
                    <Image
                        source={require('../../../assets/images/Waterdrop.png')}
                        style={styles.pointsIcon}
                    />
                </View>

                {/* Favorite star */}
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => console.log('Toggle favorite')}
                >
                    <Text style={styles.favoriteIcon}>
                        {item.isFavorite ? "★" : "☆"}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default function Dashboard() {
    const { user } = useAuthStore();
    const { tasks, loading, error, fetchTasks, markCompleted, updateTask } = useTasksStore();

    const [activeTab, setActiveTab] = useState<'daily' | 'personal'>('daily');
    const [waterPercentage] = useState(50); // This would come from user progress

    const toggleAnim = useRef(new Animated.Value(0)).current;
    const taskListAnim = useRef(new Animated.Value(0)).current;

    // Fetch tasks on component mount
    useEffect(() => {
        if (user?.$id) {
            fetchTasks(user.$id);
        }
    }, [user?.$id, fetchTasks]);

    // Filter tasks for quick view (active tasks only)
    const quickTasks = tasks.filter((task: Task) => {
        const status = task.status || "active";
        const categoryType = task.category_type.toLowerCase();
        return status !== "completed" && status !== "skipped" && categoryType === activeTab;
    }).slice(0, 3); // Show only first 3 tasks

    // Toggle between daily and personal tasks
    const toggleTaskType = () => {
        // Start with toggle animation
        Animated.timing(toggleAnim, {
            toValue: activeTab === 'daily' ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();

        // Then animate the task list
        Animated.timing(taskListAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setActiveTab(activeTab === 'daily' ? 'personal' : 'daily');
            taskListAnim.setValue(0);
        });
    };

    // Handle task completion
    const handleTaskComplete = async (taskId: string) => {
        try {
            await markCompleted(taskId);
            // Refresh tasks after completion
            if (user?.$id) {
                await fetchTasks(user.$id);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to complete task');
        }
    };

    // Handle task skipping
    const handleTaskSkip = async (taskId: string) => {
        try {
            await updateTask(taskId, { status: 'skipped' });
            // Refresh tasks after skipping
            if (user?.$id) {
                await fetchTasks(user.$id);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to skip task');
        }
    };

    // Handle navigation to greenhouse
    const handleGreenhousePress = () => {
        router.push('/(app)/(tabs)/greenhouse');
    };

    // Handle navigation to premium
    const handlePremiumPress = () => {
        router.push('/(app)/premium');
    };

    // Handle navigation to task creation
    const handleCreateTaskPress = () => {
        if (user?.$id) {
            router.push({
                pathname: '/(app)/tasks/form',
                params: { userId: user.$id }
            });
        }
    };

    // Handle navigation to all tasks
    const handleViewAllTasksPress = () => {
        router.push('/(app)/(tabs)/tasks');
    };

    // Interpolate the toggle button position
    const togglePosition = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%'],
    });

    // Render quick tasks section
    const renderQuickTasks = () => {
        if (loading && tasks.length === 0) {
            return (
                <View style={styles.quickTasksContainer}>
                    <LoadingSpinner message="Loading tasks..." />
                </View>
            );
        }

        if (quickTasks.length === 0) {
            return (
                <View style={styles.quickTasksContainer}>
                    <View style={styles.quickTasksHeader}>
                        <Text style={styles.quickTasksTitle}>Today&apos;s Tasks</Text>
                        <TouchableOpacity onPress={handleViewAllTasksPress}>
                            <Text style={styles.viewAllTasksText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.emptyTasksContainer}>
                        <Text style={styles.emptyTasksText}>No {activeTab} tasks for today</Text>
                        <TouchableOpacity
                            style={styles.createTaskButton}
                            onPress={handleCreateTaskPress}
                        >
                            <Text style={styles.createTaskButtonText}>Create Task</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.quickTasksContainer}>
                {/* Header */}
                <View style={styles.quickTasksHeader}>
                    <Text style={styles.quickTasksTitle}>Today&apos;s Tasks</Text>
                    <TouchableOpacity onPress={handleViewAllTasksPress}>
                        <Text style={styles.viewAllTasksText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Task Toggle */}
                <View style={styles.dashboardTaskToggle}>
                    <Animated.View
                        style={[
                            styles.dashboardToggleHighlight,
                            {
                                left: togglePosition,
                                backgroundColor: theme.colors.secondary[500],
                            },
                        ]}
                    />
                    <TouchableOpacity
                        style={styles.dashboardToggleButton}
                        onPress={() => activeTab === 'personal' && toggleTaskType()}
                    >
                        <Text style={[
                            styles.dashboardToggleText,
                            activeTab === 'daily' && styles.activeToggleText
                        ]}>
                            Daily
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.dashboardToggleButton}
                        onPress={() => activeTab === 'daily' && toggleTaskType()}
                    >
                        <Text style={[
                            styles.dashboardToggleText,
                            activeTab === 'personal' && styles.activeToggleText
                        ]}>
                            Personal
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tasks List */}
                <Animated.View
                    style={[
                        styles.dashboardTasksList,
                        {
                            opacity: taskListAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 0, 1],
                            }),
                            transform: [
                                {
                                    translateX: taskListAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0, -20, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {quickTasks.map((task) => (
                        <DashboardTaskItem
                            key={task.$id}
                            item={task}
                            activeTab={activeTab}
                            onSwipeComplete={handleTaskComplete}
                            onSwipeSkip={handleTaskSkip}
                        />
                    ))}
                </Animated.View>

                {/* Create Task Button */}
                <TouchableOpacity
                    style={styles.addTaskButton}
                    onPress={handleCreateTaskPress}
                >
                    <Text style={styles.addTaskButtonText}>+ Add Task</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && tasks.length === 0) {
        return <LoadingSpinner message="Loading your dashboard..." />;
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => user?.$id && fetchTasks(user.$id)}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Background Images */}
            <ImageBackground
                source={require('../../../assets/images/sunshine.png')}
                style={styles.background}
            />
            <ImageBackground
                source={require('../../../assets/images/base.png')}
                style={styles.table}
            />
            <ImageBackground
                source={require('../../../assets/images/flower.png')}
                style={styles.plant}
            />

            {/* Header with Profile, Gift and Bell icons */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.profileButton}>
                    <Image
                        source={require('../../../assets/images/profile-picture.png')}
                        style={styles.profileIcon}
                    />
                </TouchableOpacity>
                <View style={styles.rightIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Image
                            source={require('../../../assets/images/gift.png')}
                            style={styles.headerIcon}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('/(app)/notifications')}
                    >
                        <Image
                            source={require('../../../assets/images/bell.png')}
                            style={styles.headerIcon}
                        />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationText}></Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Water Level Stats */}
            <View style={styles.waterLevelBarContainer}>
                <View style={styles.levelContainer}>
                    <Text style={styles.levelText}>Lv: 10</Text>
                </View>
                <View style={styles.waterBarWrapper}>
                    <View style={styles.waterBar}>
                        <View style={[styles.waterFill, { width: `${waterPercentage}%` }]} />
                        <View style={styles.waterBarContent}>
                            <Image
                                source={require('../../../assets/images/Waterdrop.png')}
                                style={styles.waterBarIcon}
                            />
                            <View style={styles.waterPercentageContainer}>
                                <Text style={styles.waterPercentageText}>{waterPercentage}%</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.pointsContainer}>
                    <Text style={styles.pointsText}>50</Text>
                    <Image
                        source={require('../../../assets/images/Waterdrop.png')}
                        style={styles.dropletIcon}
                    />
                </View>
            </View>

            {/* Greenhouse & Premium Buttons */}
            <View style={styles.specialButtonsContainer}>
                <TouchableOpacity style={styles.specialButton} onPress={handleGreenhousePress}>
                    <Image
                        source={require('../../../assets/images/home2.png')}
                        style={styles.specialButtonIcon}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.specialButton} onPress={handlePremiumPress}>
                    <Image
                        source={require('../../../assets/images/premium.png')}
                        style={styles.specialButtonIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* Backdrop Panel */}
            <View style={styles.backdropPanel} />

            {/* Quick Tasks Section */}
            {renderQuickTasks()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DEDED0",
    },
    background: {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: "0%",
        resizeMode: "cover",
    },
    table: {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: "-5%",
        resizeMode: "cover",
    },
    plant: {
        position: "absolute",
        width: "90%",
        height: "90%",
        top: "4%",
        left: "9%",
        resizeMode: "cover",
    },
    backdropPanel: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "43%",
        backgroundColor: "#DEDED0",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 4,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        top: 55,
        left: 15,
        right: 15,
        zIndex: 10,
    },
    profileButton: {},
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    rightIcons: {
        flexDirection: "row",
    },
    iconButton: {
        marginLeft: 15,
        position: "relative",
    },
    headerIcon: {
        width: 27,
        height: 27,
    },
    notificationBadge: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#68A1A1",
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    notificationText: {
        fontSize: 10,
        color: "white",
        fontWeight: "bold",
    },
    waterLevelBarContainer: {
        position: "absolute",
        top: "58.5%",
        width: "90%",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
    },
    levelContainer: {
        backgroundColor: "#68A1A1",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    levelText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    waterBarWrapper: {
        flex: 1,
        paddingHorizontal: 10,
    },
    waterBar: {
        height: 18,
        backgroundColor: "#68A1A1",
        borderRadius: 4,
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
    },
    waterFill: {
        position: "absolute",
        left: 0,
        height: "100%",
        backgroundColor: "#468080",
        borderRadius: 4,
    },
    waterBarContent: {
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 2,
        paddingHorizontal: 6,
    },
    waterBarIcon: {
        width: 14,
        height: 14,
        resizeMode: "contain",
    },
    waterPercentageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        left: "-2%",
    },
    waterPercentageText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    pointsContainer: {
        flexDirection: "row",
        backgroundColor: "#68A1A1",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: "center",
    },
    pointsText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginRight: 2,
    },
    dropletIcon: {
        width: 14,
        height: 14,
        resizeMode: "contain",
    },
    specialButtonsContainer: {
        position: "absolute",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        top: "51%",
        zIndex: 10,
    },
    specialButton: {
        width: 45,
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 7,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    specialButtonIcon: {
        width: 35,
        height: 35,
    },

    // Quick Tasks Section Styles
    quickTasksContainer: {
        position: "absolute",
        top: "62%",
        width: "90%",
        alignSelf: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 20,
        padding: 16,
        zIndex: 15,
        maxHeight: "30%",
        ...theme.shadows.lg,
    },
    quickTasksHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    quickTasksTitle: {
        fontSize: 18,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary[900],
        fontFamily: theme.typography.fonts.primary,
    },
    viewAllTasksText: {
        fontSize: 14,
        color: theme.colors.secondary[500],
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
    },
    dashboardTaskToggle: {
        flexDirection: "row",
        backgroundColor: "#E8E8E8",
        borderRadius: 15,
        padding: 2,
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
    },
    dashboardToggleHighlight: {
        position: "absolute",
        top: 2,
        width: "50%",
        height: "90%",
        borderRadius: 13,
        zIndex: 1,
    },
    dashboardToggleButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        zIndex: 2,
    },
    dashboardToggleText: {
        fontSize: 12,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.text.muted,
        fontFamily: theme.typography.fonts.primary,
    },
    activeToggleText: {
        color: "#FFFFFF",
        fontWeight: theme.typography.weights.bold,
    },
    dashboardTasksList: {
        maxHeight: 180,
    },
    dashboardTaskItem: {
        position: "relative",
        marginBottom: 10,
        height: 50,
        borderRadius: 12,
        overflow: "hidden",
    },
    swipeActionsBackdrop: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 15,
    },
    dashboardSwipeActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dashboardActionButton: {
        width: 35,
        height: 35,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    skipActionButton: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    completeActionButton: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary[900],
    },
    taskContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        backgroundColor: theme.colors.secondary[500],
        height: "100%",
        ...theme.shadows.sm,
    },
    taskIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    taskIcon: {
        width: 20,
        height: 20,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: theme.typography.weights.bold,
        color: "#FFFFFF",
        fontFamily: theme.typography.fonts.primary,
        marginBottom: 2,
    },
    taskCategory: {
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.8)",
        fontFamily: theme.typography.fonts.primary,
    },
    taskPoints: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
    },
    pointsIcon: {
        width: 12,
        height: 12,
        marginLeft: 2,
    },
    favoriteButton: {
        padding: 4,
    },
    favoriteIcon: {
        fontSize: 16,
        color: "#FFD700",
    },
    addTaskButton: {
        backgroundColor: theme.colors.primary[500],
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: "center",
        alignSelf: "center",
        marginTop: 8,
    },
    addTaskButtonText: {
        fontSize: 12,
        fontWeight: theme.typography.weights.medium,
        color: "#FFFFFF",
        fontFamily: theme.typography.fonts.primary,
    },
    emptyTasksContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    emptyTasksText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.primary,
        marginBottom: 12,
    },
    createTaskButton: {
        backgroundColor: theme.colors.secondary[500],
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 16,
    },
    createTaskButtonText: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: theme.typography.weights.medium,
        fontFamily: theme.typography.fonts.primary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DEDED0",
    },
    errorText: {
        fontSize: 16,
        color: theme.colors.error,
        textAlign: "center",
        marginBottom: 20,
        fontFamily: theme.typography.fonts.primary,
    },
    retryButton: {
        backgroundColor: theme.colors.secondary[500],
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: theme.typography.weights.medium,
        fontFamily: theme.typography.fonts.primary,
    },
});