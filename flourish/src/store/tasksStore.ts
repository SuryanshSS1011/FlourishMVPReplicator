// src/store/tasksStore.ts
import { create } from 'zustand';
import { taskService } from '../lib/appwrite/tasks';
import type { TasksStore, Task, Suggestion } from '../types';

export const useTasksStore = create<TasksStore>((set, get) => ({
    tasks: [],
    suggestions: [],
    loading: false,
    error: null,

    // Actions
    fetchTasks: async (userId: string) => {
        set({ loading: true, error: null });

        try {
            const result = await taskService.fetchTasksWithDetails(userId);

            if (result.success) {
                set({
                    tasks: result.data || [],
                    loading: false,
                    error: null,
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

    fetchSuggestions: async (userId: string) => {
        try {
            const result = await taskService.fetchSuggestions(userId);

            if (result.success) {
                set({
                    suggestions: result.data || [],
                    error: null,
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch suggestions:', error);
        }
    },

    createTask: async (taskData: Partial<Task>) => {
        set({ loading: true, error: null });

        try {
            const result = await taskService.createTask(taskData);

            if (result.success && result.data) {
                const { tasks } = get();
                set({
                    tasks: [...tasks, result.data],
                    loading: false,
                    error: null,
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
                error: error.message || 'Failed to create task',
            });
        }
    },

    updateTask: async (taskId: string, updates: Partial<Task>) => {
        try {
            const result = await taskService.updateTask(taskId, updates);

            if (result.success) {
                const { tasks } = get();
                set({
                    tasks: tasks.map(task =>
                        task.$id === taskId ? { ...task, ...updates } : task
                    ),
                    error: null,
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update task',
            });
        }
    },

    deleteTask: async (taskId: string) => {
        try {
            const result = await taskService.deleteTask(taskId);

            if (result.success) {
                const { tasks } = get();
                set({
                    tasks: tasks.filter(task => task.$id !== taskId),
                    error: null,
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to delete task',
            });
        }
    },

    toggleFavorite: async (taskId: string) => {
        const { tasks, updateTask } = get();
        const task = tasks.find(t => t.$id === taskId);

        if (task) {
            await updateTask(taskId, { isFavorite: !task.isFavorite });
        }
    },

    markCompleted: async (taskId: string) => {
        await get().updateTask(taskId, { status: 'completed' });
    },

    clearError: () => {
        set({ error: null });
    },
}));

