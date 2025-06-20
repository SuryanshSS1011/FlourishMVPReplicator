// src/hooks/useTasks.ts
import { useTasksStore } from '../store/tasksStore';
import { useAuthStore } from '../store/authStore';
import { useCallback, useEffect } from 'react';

export const useTasks = () => {
    const tasksStore = useTasksStore();
    const { user } = useAuthStore();

    const refreshTasks = useCallback(async () => {
        if (user?.$id) {
            await tasksStore.fetchTasks(user.$id);
        }
    }, [user?.$id, tasksStore.fetchTasks]);

    useEffect(() => {
        refreshTasks();
    }, [refreshTasks]);

    return {
        tasks: tasksStore.tasks,
        suggestions: tasksStore.suggestions,
        loading: tasksStore.loading,
        error: tasksStore.error,
        refreshTasks,
        createTask: tasksStore.createTask,
        updateTask: tasksStore.updateTask,
        deleteTask: tasksStore.deleteTask,
        toggleFavorite: tasksStore.toggleFavorite,
        markCompleted: tasksStore.markCompleted,
    };
};