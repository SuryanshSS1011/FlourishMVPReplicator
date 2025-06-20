// app/(app)/tasks/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Modal,
    ViewStyle,
    TextStyle,
    ImageStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/styles';
import { taskService } from '../../../src/lib/services/taskService';
import { avatarService } from '../../../src/lib/appwrite/avatars';
import type { TaskWithDetails } from '../../../src/lib/services/taskService';

type TabType = 'active' | 'completed' | 'favorites';

export default function TasksScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            
            let result;
            switch (activeTab) {
                case 'active':
                    result = await taskService.getTodayTasks();
                    break;
                case 'completed':
                    result = await taskService.getTodayTasks();
                    break;
                case 'favorites':
                    // For now, show all tasks marked as favorites
                    result = await taskService.getTodayTasks();
                    break;
            }

            if (result.success && result.data) {
                setTasks(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            Alert.alert('Error', 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadTasks();
    }, [activeTab, loadTasks]);

    const handleTaskComplete = async (task: TaskWithDetails) => {
        if (!task.taskDetail) {
            return;
        }

        try {
            const result = await taskService.completeTask(task.taskDetail.$id);
            
            if (result.success) {
                Alert.alert(
                    'Task Completed!',
                    `You earned ${result.data?.points || 0} points!`,
                    [{ text: 'OK', onPress: loadTasks }]
                );
            }
        } catch (error) {
            console.error('Error completing task:', error);
            Alert.alert('Error', 'Failed to complete task');
        }
    };

    const handleTaskDelete = async () => {
        if (!selectedTask?.taskDetail) {
            return;
        }

        try {
            const result = await taskService.skipTask(
                selectedTask.taskDetail.$id,
                'Manually deleted'
            );
            
            if (result.success) {
                setShowDeleteModal(false);
                setSelectedTask(null);
                loadTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            Alert.alert('Error', 'Failed to delete task');
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            'watering': 'water',
            'fertilizing': 'nutrition',
            'pruning': 'cut',
            'repotting': 'flower',
            'cleaning': 'brush',
            'other': 'ellipsis-horizontal',
        };
        return icons[category] || 'leaf';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'watering': '#64B5F6',
            'fertilizing': '#81C784',
            'pruning': '#FFB74D',
            'repotting': '#A1887F',
            'cleaning': '#4DB6AC',
            'other': '#9E9E9E',
        };
        return colors[category] || theme.colors.primary[700];
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Tasks</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => router.push('/(app)/(tabs)/tasks')}
                    >
                        <Ionicons name="search" size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => router.push('/(app)/tasks/form')}
                    >
                        <Ionicons name="add" size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Ionicons 
                        name="time-outline" 
                        size={20} 
                        color={activeTab === 'active' ? theme.colors.primary[700] : theme.colors.text.secondary} 
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'active' && styles.activeTabText
                    ]}>
                        Active Task
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                    onPress={() => setActiveTab('completed')}
                >
                    <Ionicons 
                        name="checkmark-circle-outline" 
                        size={20} 
                        color={activeTab === 'completed' ? theme.colors.primary[700] : theme.colors.text.secondary} 
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'completed' && styles.activeTabText
                    ]}>
                        Completion
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
                    onPress={() => setActiveTab('favorites')}
                >
                    <Ionicons 
                        name="star-outline" 
                        size={20} 
                        color={activeTab === 'favorites' ? theme.colors.primary[700] : theme.colors.text.secondary} 
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'favorites' && styles.activeTabText
                    ]}>
                        Favorite
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTaskGroup = (title: string, groupTasks: TaskWithDetails[]) => {
        if (groupTasks.length === 0) {
            return null;
        }

        return (
            <View style={styles.taskGroup} key={title}>
                <Text style={styles.groupTitle}>{title}</Text>
                {groupTasks.map(renderTaskItem)}
            </View>
        );
    };

    const renderTaskItem = (task: TaskWithDetails) => {
        const isCompleted = task.taskDetail?.status === 'completed';
        const categoryColor = getCategoryColor(task.category);

        return (
            <TouchableOpacity
                key={task.taskDetail?.$id || task.$id}
                style={[
                    styles.taskItem,
                    { backgroundColor: categoryColor + '20' }
                ]}
                onPress={() => {
                    if (!isCompleted && activeTab === 'active') {
                        handleTaskComplete(task);
                    }
                }}
                onLongPress={() => {
                    setSelectedTask(task);
                    setShowDeleteModal(true);
                }}
                activeOpacity={0.8}
            >
                <View style={[styles.taskIcon, { backgroundColor: categoryColor }]}>
                    <Ionicons 
                        name={getCategoryIcon(task.category) as any} 
                        size={24} 
                        color="#FFF" 
                    />
                </View>

                <Text style={[
                    styles.taskName,
                    isCompleted && styles.completedTaskName
                ]}>
                    {task.name}
                </Text>

                <View style={styles.taskPoints}>
                    <Text style={styles.pointsText}>{task.points}</Text>
                    <Ionicons name="star" size={16} color="#FFD700" />
                </View>

                {isCompleted && (
                    <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={categoryColor} 
                        style={styles.completedIcon}
                    />
                )}
            </TouchableOpacity>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[700]} />
                    <Text style={styles.loadingText}>Loading tasks...</Text>
                </View>
            );
        }

        if (tasks.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Image
                        source={{ uri: avatarService.getTaskCategoryIcon('other', 80) }}
                        style={styles.emptyIcon}
                    />
                    <Text style={styles.emptyText}>
                        {activeTab === 'active' 
                            ? 'No active tasks for today'
                            : activeTab === 'completed'
                            ? 'No completed tasks yet'
                            : 'No favorite tasks'}
                    </Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push('/(app)/tasks/form')}
                    >
                        <Text style={styles.createButtonText}>Create New Task</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Group tasks by category
        const dailyTasks = tasks.filter(t => 
            ['watering', 'fertilizing'].includes(t.category)
        );
        const personalTasks = tasks.filter(t => 
            !['watering', 'fertilizing'].includes(t.category)
        );

        return (
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {renderTaskGroup('Daily task', dailyTasks)}
                {renderTaskGroup('Personal task', personalTasks)}
                <View style={{ height: 100 }} />
            </ScrollView>
        );
    };

    const renderDeleteModal = () => (
        <Modal
            visible={showDeleteModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDeleteModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Delete Task</Text>
                    <Text style={styles.modalMessage}>
                        Are you sure you want to delete &quot;{selectedTask?.name}&quot;?
                    </Text>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowDeleteModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.deleteButton]}
                            onPress={handleTaskDelete}
                        >
                            <Ionicons name="trash-outline" size={20} color="#FFF" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderContent()}
            {renderDeleteModal()}
        </View>
    );
}

interface Styles {
    container: ViewStyle;
    header: ViewStyle;
    headerTop: ViewStyle;
    backButton: ViewStyle;
    headerTitle: TextStyle;
    headerActions: ViewStyle;
    headerButton: ViewStyle;
    tabs: ViewStyle;
    tab: ViewStyle;
    activeTab: ViewStyle;
    tabText: TextStyle;
    activeTabText: TextStyle;
    content: ViewStyle;
    loadingContainer: ViewStyle;
    loadingText: TextStyle;
    emptyContainer: ViewStyle;
    emptyIcon: ImageStyle;
    emptyText: TextStyle;
    createButton: ViewStyle;
    createButtonText: TextStyle;
    taskGroup: ViewStyle;
    groupTitle: TextStyle;
    taskItem: ViewStyle;
    taskIcon: ViewStyle;
    taskName: TextStyle;
    completedTaskName: TextStyle;
    taskPoints: ViewStyle;
    pointsText: TextStyle;
    completedIcon: TextStyle;
    modalOverlay: ViewStyle;
    modalContent: ViewStyle;
    modalTitle: TextStyle;
    modalMessage: TextStyle;
    modalActions: ViewStyle;
    modalButton: ViewStyle;
    cancelButton: ViewStyle;
    cancelButtonText: TextStyle;
    deleteButton: ViewStyle;
    deleteButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        backgroundColor: '#FFF',
        paddingTop: 60,
        paddingBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fonts.primary,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: theme.colors.primary[700],
    },
    tabText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginLeft: 6,
        fontFamily: theme.typography.fonts.primary,
    },
    activeTabText: {
        color: theme.colors.primary[700],
    },
    content: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: theme.typography.fonts.primary,
    },
    createButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: theme.colors.primary[700],
        borderRadius: 25,
    },
    createButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontFamily: theme.typography.fonts.primary,
    },
    taskGroup: {
        marginBottom: 24,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 12,
        fontFamily: theme.typography.fonts.primary,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    taskIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    taskName: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fonts.primary,
    },
    completedTaskName: {
        textDecorationLine: 'line-through',
        color: theme.colors.text.secondary,
    },
    taskPoints: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginRight: 4,
        fontFamily: theme.typography.fonts.primary,
    },
    completedIcon: {
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 12,
        fontFamily: theme.typography.fonts.primary,
    },
    modalMessage: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: theme.typography.fonts.primary,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 25,
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontFamily: theme.typography.fonts.primary,
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#FFF',
        marginLeft: 6,
        fontFamily: theme.typography.fonts.primary,
    },
});