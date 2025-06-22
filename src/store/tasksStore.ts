// src/store/tasksStore.ts

import { create } from 'zustand';
import { APPWRITE_CONFIG } from '../lib/appwrite/config';
import { databaseService } from '../lib/appwrite/database';
import { Query } from 'react-native-appwrite';
import type { TaskDocument, SuggestionDocument } from '../lib/appwrite/database';

export interface TasksStore {
    // State
    tasks: TaskDocument[];
    suggestions: SuggestionDocument[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchTasks: (userId: string) => Promise<void>;
    fetchUpcomingTasks: (userId: string, days?: number) => Promise<void>;
    fetchSuggestions: (userId: string, unreadOnly?: boolean) => Promise<void>;
    createTask: (userId: string, taskData: Partial<TaskDocument>) => Promise<boolean>;
    updateTask: (taskId: string, userId: string, updates: Partial<TaskDocument>) => Promise<void>;
    deleteTask: (taskId: string, userId: string) => Promise<void>;
    completeTask: (taskId: string, userId: string) => Promise<void>;
    markSuggestionAsRead: (suggestionId: string, userId: string) => Promise<void>;
    dismissSuggestion: (suggestionId: string, userId: string) => Promise<void>;
    clearError: () => void;

    // Getters
    getTaskById: (id: string) => TaskDocument | undefined;
    getTasksByPlant: (userPlantId: string) => TaskDocument[];
    getCompletedTasks: () => TaskDocument[];
    getPendingTasks: () => TaskDocument[];
    getOverdueTasks: () => TaskDocument[];
    getUnreadSuggestions: () => SuggestionDocument[];
}

export const useTasksStore = create<TasksStore>((set, get) => ({
    // Initial state
    tasks: [],
    suggestions: [],
    loading: false,
    error: null,

    // Fetch all tasks
    fetchTasks: async (userId: string) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.getUserTasks(userId);

            if (result.success && result.data) {
                set({
                    tasks: result.data.documents,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to fetch tasks',
            });
        }
    },

    // Fetch upcoming tasks
    fetchUpcomingTasks: async (userId: string, days: number = 7) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.getUpcomingTasks(userId, days);

            if (result.success && result.data) {
                set({
                    tasks: result.data.documents,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to fetch upcoming tasks',
            });
        }
    },

    // Fetch suggestions
    fetchSuggestions: async (userId: string, unreadOnly: boolean = false) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.getUserSuggestions(userId, unreadOnly);

            if (result.success && result.data) {
                set({
                    suggestions: result.data.documents,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to fetch suggestions',
            });
        }
    },

    // Create task
    createTask: async (userId: string, taskData: Partial<TaskDocument>) => {
        set({ loading: true, error: null });

        try {
            const newTask = {
                type: taskData.type || 'custom',
                title: taskData.title || 'New Task',
                description: taskData.description,
                dueDate: taskData.dueDate || new Date().toISOString(),
                isCompleted: false,
                isRecurring: taskData.isRecurring || false,
                recurringInterval: taskData.recurringInterval,
                priority: taskData.priority || 'medium',
                reminderEnabled: taskData.reminderEnabled || false,
                reminderTime: taskData.reminderTime,
                points: taskData.points || 10,
                userPlantId: taskData.userPlantId,
            };

            const result = await databaseService.createTask(userId, newTask);

            if (result.success && result.data) {
                const currentTasks = get().tasks;
                set({
                    tasks: [...currentTasks, result.data],
                    loading: false,
                });
                return true;
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
                return false;
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to create task',
            });
            return false;
        }
    },

    // Update task
    updateTask: async (taskId: string, userId: string, updates: Partial<TaskDocument>) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.updateDocument<TaskDocument>(
                APPWRITE_CONFIG.collections.tasks,
                taskId,
                updates,
                [`read("user:${userId}")`, `write("user:${userId}")`]
            );

            if (result.success && result.data) {
                const { tasks } = get();
                const updatedTasks = tasks.map(task =>
                    task.$id === taskId ? result.data! : task
                );

                set({
                    tasks: updatedTasks,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to update task',
            });
        }
    },

    // Delete task
    deleteTask: async (taskId: string, userId: string) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.deleteDocument(
                APPWRITE_CONFIG.collections.tasks,
                taskId
            );

            if (result.success) {
                const { tasks } = get();
                const updatedTasks = tasks.filter(task => task.$id !== taskId);

                set({
                    tasks: updatedTasks,
                    loading: false,
                });
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to delete task',
            });
        }
    },

    // Complete task
    completeTask: async (taskId: string, userId: string) => {
        set({ loading: true, error: null });

        try {
            const result = await databaseService.completeTask(taskId, userId);

            if (result.success && result.data) {
                const { tasks } = get();
                const updatedTasks = tasks.map(task =>
                    task.$id === taskId ? result.data! : task
                );

                set({
                    tasks: updatedTasks,
                    loading: false,
                });

                // Handle recurring tasks
                const completedTask = result.data;
                if (completedTask.isRecurring && completedTask.recurringInterval) {
                    const nextDueDate = new Date(completedTask.dueDate);
                    nextDueDate.setDate(nextDueDate.getDate() + completedTask.recurringInterval);

                    // Create new recurring task
                    await get().createTask(userId, {
                        ...completedTask,
                        dueDate: nextDueDate.toISOString(),
                        isCompleted: false,
                        completedDate: undefined,
                    });
                }
            } else {
                set({
                    loading: false,
                    error: result.message,
                });
            }
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to complete task',
            });
        }
    },

    // Mark suggestion as read
    markSuggestionAsRead: async (suggestionId: string, userId: string) => {
        try {
            const result = await databaseService.markSuggestionAsRead(suggestionId, userId);

            if (result.success && result.data) {
                const { suggestions } = get();
                const updatedSuggestions = suggestions.map(sug =>
                    sug.$id === suggestionId ? result.data! : sug
                );

                set({ suggestions: updatedSuggestions });
            }
        } catch (error: any) {
            set({ error: error.message || 'Failed to mark suggestion as read' });
        }
    },

    // Dismiss suggestion
    dismissSuggestion: async (suggestionId: string, userId: string) => {
        try {
            const result = await databaseService.updateDocument<SuggestionDocument>(
                APPWRITE_CONFIG.collections.suggestions,
                suggestionId,
                { isDismissed: true },
                [`read("user:${userId}")`, `write("user:${userId}")`]
            );

            if (result.success) {
                const { suggestions } = get();
                const updatedSuggestions = suggestions.filter(sug => sug.$id !== suggestionId);

                set({ suggestions: updatedSuggestions });
            }
        } catch (error: any) {
            set({ error: error.message || 'Failed to dismiss suggestion' });
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Getters
    getTaskById: (id: string) => {
        return get().tasks.find(task => task.$id === id);
    },

    getTasksByPlant: (userPlantId: string) => {
        return get().tasks.filter(task => task.userPlantId === userPlantId);
    },

    getCompletedTasks: () => {
        return get().tasks.filter(task => task.isCompleted);
    },

    getPendingTasks: () => {
        return get().tasks.filter(task => !task.isCompleted);
    },

    getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(task =>
            !task.isCompleted && new Date(task.dueDate) < now
        );
    },

    getUnreadSuggestions: () => {
        return get().suggestions.filter(sug => !sug.isRead);
    },
}));
