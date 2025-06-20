// src/lib/services/taskService.ts

import { databaseService, TaskDocument, TaskDetailDocument } from '../appwrite/database';
import { Models } from 'react-native-appwrite';
import { storageService } from '../appwrite/storage';
import { useAuthStore } from '../../store/authStore';
import { Query, APPWRITE_CONFIG } from '../appwrite/config';
import type { ApiResponse } from '../../types/api';

export interface TaskWithDetails extends TaskDocument {
    taskDetail?: TaskDetailDocument;
    iconUrl?: string;
    completionRate?: number;
}

export interface TaskStats {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    streak: number;
    totalPoints: number;
}

export interface DailyTaskSummary {
    date: Date;
    tasks: TaskWithDetails[];
    completed: number;
    pending: number;
    overdue: number;
}

class TaskService {
    /**
     * Get all available task templates
     */
    async getTaskTemplates(category?: string): Promise<ApiResponse<TaskDocument[]>> {
        try {
            const result = await databaseService.listTasks(category);

            if (result.success && result.data) {
                // Add icon URLs to tasks
                const tasksWithIcons = result.data.map(task => ({
                    ...task,
                    iconUrl: task.iconId
                        ? storageService.getTaskIconUrl(task.iconId)
                        : undefined
                }));

                return {
                    success: true,
                    message: 'Task templates retrieved successfully',
                    data: tasksWithIcons,
                };
            }

            return result;
        } catch (error: any) {
            console.error('Error getting task templates:', error);
            return {
                success: false,
                message: 'Failed to get task templates',
                error: error.message,
            };
        }
    }

    /**
     * Create a custom task for the user
     */
    async createCustomTask(
        taskData: {
            name: string;
            category: TaskDocument['category'];
            description: string;
            frequency?: number;
            duration?: number;
            points?: number;
            scheduledDate: Date;
            reminderEnabled?: boolean;
            userPlantId?: string;
        }
    ): Promise<ApiResponse<TaskDetailDocument>> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                };
            }

            // First, create the task template if it's custom
            const taskResult = await databaseService.createTask({
                name: taskData.name,
                category: taskData.category,
                description: taskData.description,
                defaultFrequency: taskData.frequency,
                defaultDuration: taskData.duration,
                points: taskData.points || 10,
            });

            if (!taskResult.success || !taskResult.data) {
                return {
                    success: false,
                    message: 'Failed to create task template',
                };
            }

            // Create the task detail (instance)
            const taskDetailData: Omit<TaskDetailDocument, keyof Models.Document> = {
                userId: user.$id,
                taskId: taskResult.data.$id,
                userPlantId: taskData.userPlantId,
                scheduledDate: taskData.scheduledDate.toISOString(),
                status: 'pending',
                reminderEnabled: taskData.reminderEnabled ?? true,
            };

            return await databaseService.createTaskDetail(taskDetailData);
        } catch (error: any) {
            console.error('Error creating custom task:', error);
            return {
                success: false,
                message: 'Failed to create task',
                error: error.message,
            };
        }
    }

    /**
     * Schedule a task from template
     */
    async scheduleTask(
        taskId: string,
        scheduledDate: Date,
        userPlantId?: string,
        reminderEnabled: boolean = true
    ): Promise<ApiResponse<TaskDetailDocument>> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                };
            }

            const taskDetailData: Omit<TaskDetailDocument, keyof Models.Document> = {
                userId: user.$id,
                taskId,
                userPlantId,
                scheduledDate: scheduledDate.toISOString(),
                status: 'pending',
                reminderEnabled,
            };

            return await databaseService.createTaskDetail(taskDetailData);
        } catch (error: any) {
            console.error('Error scheduling task:', error);
            return {
                success: false,
                message: 'Failed to schedule task',
                error: error.message,
            };
        }
    }

    /**
     * Get user's tasks for today
     */
    async getTodayTasks(): Promise<ApiResponse<TaskWithDetails[]>> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                    data: [],
                };
            }

            const result = await databaseService.getTodayTasks(user.$id);

            if (result.success && result.data) {
                // Enrich with task template data
                const enrichedTasks = await this.enrichTaskDetails(result.data);

                return {
                    success: true,
                    message: 'Today tasks retrieved successfully',
                    data: enrichedTasks,
                };
            }

            return {
                ...result,
                data: [],
            };
        } catch (error: any) {
            console.error('Error getting today tasks:', error);
            return {
                success: false,
                message: 'Failed to get today tasks',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Get user's upcoming tasks
     */
    async getUpcomingTasks(days: number = 7): Promise<ApiResponse<DailyTaskSummary[]>> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                    data: [],
                };
            }

            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);
            endDate.setHours(23, 59, 59, 999);

            const result = await databaseService.listDocuments<TaskDetailDocument>(
                APPWRITE_CONFIG.collections.taskDetails,
                [
                    Query.equal('userId', user.$id),
                    Query.greaterThanEqual('scheduledDate', startDate.toISOString()),
                    Query.lessThanEqual('scheduledDate', endDate.toISOString()),
                    Query.orderAsc('scheduledDate'),
                ]
            );

            if (!result.success || !result.data) {
                return {
                    success: false,
                    message: 'Failed to get upcoming tasks',
                    data: [],
                };
            }

            // Group tasks by date
            const tasksByDate = new Map<string, TaskDetailDocument[]>();

            result.data.forEach(task => {
                const date = new Date(task.scheduledDate);
                const dateKey = date.toDateString();

                if (!tasksByDate.has(dateKey)) {
                    tasksByDate.set(dateKey, []);
                }
                tasksByDate.get(dateKey)!.push(task);
            });

            // Create daily summaries
            const summaries: DailyTaskSummary[] = [];

            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                date.setHours(0, 0, 0, 0);

                const dateKey = date.toDateString();
                const dayTasks = tasksByDate.get(dateKey) || [];

                const enrichedTasks = await this.enrichTaskDetails(dayTasks);

                const completed = enrichedTasks.filter(t => t.taskDetail?.status === 'completed').length;
                const overdue = enrichedTasks.filter(t =>
                    t.taskDetail?.status === 'pending' &&
                    new Date(t.taskDetail.scheduledDate) < new Date()
                ).length;

                summaries.push({
                    date,
                    tasks: enrichedTasks,
                    completed,
                    pending: enrichedTasks.length - completed - overdue,
                    overdue,
                });
            }

            return {
                success: true,
                message: 'Upcoming tasks retrieved successfully',
                data: summaries,
            };
        } catch (error: any) {
            console.error('Error getting upcoming tasks:', error);
            return {
                success: false,
                message: 'Failed to get upcoming tasks',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Complete a task
     */
    async completeTask(
        taskDetailId: string,
        notes?: string
    ): Promise<ApiResponse<{ points: number }>> {
        try {
            // Get task detail
            const detailResult = await databaseService.getDocument<TaskDetailDocument>(
                APPWRITE_CONFIG.collections.taskDetails,
                taskDetailId
            );

            if (!detailResult.success || !detailResult.data) {
                return {
                    success: false,
                    message: 'Task not found',
                };
            }

            // Get task template for points
            const taskResult = await databaseService.getTask(detailResult.data.taskId);
            if (!taskResult.success || !taskResult.data) {
                return {
                    success: false,
                    message: 'Task template not found',
                };
            }

            // Complete the task
            const updateResult = await databaseService.completeTask(taskDetailId);

            if (updateResult.success) {
                // If it's a plant care task, update the plant's last care date
                if (detailResult.data.userPlantId) {
                    await this.updatePlantCareFromTask(
                        detailResult.data.userPlantId,
                        taskResult.data.category
                    );
                }

                // Schedule next occurrence if it's a recurring task
                if (taskResult.data.defaultFrequency) {
                    const nextDate = new Date();
                    nextDate.setDate(nextDate.getDate() + taskResult.data.defaultFrequency);

                    await this.scheduleTask(
                        taskResult.data.$id,
                        nextDate,
                        detailResult.data.userPlantId,
                        detailResult.data.reminderEnabled
                    );
                }

                return {
                    success: true,
                    message: 'Task completed successfully',
                    data: { points: taskResult.data.points },
                };
            }

            return {
                success: false,
                message: 'Failed to complete task',
            };
        } catch (error: any) {
            console.error('Error completing task:', error);
            return {
                success: false,
                message: 'Failed to complete task',
                error: error.message,
            };
        }
    }

    /**
     * Skip a task
     */
    async skipTask(taskDetailId: string, reason?: string): Promise<ApiResponse> {
        try {
            const updateData: Partial<TaskDetailDocument> = {
                status: 'skipped',
                notes: reason,
            };

            const result = await databaseService.updateDocument<TaskDetailDocument>(
                APPWRITE_CONFIG.collections.taskDetails,
                taskDetailId,
                updateData
            );

            return result;
        } catch (error: any) {
            console.error('Error skipping task:', error);
            return {
                success: false,
                message: 'Failed to skip task',
                error: error.message,
            };
        }
    }

    /**
     * Get user's task statistics
     */
    async getUserTaskStats(): Promise<ApiResponse<TaskStats>> {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated',
                };
            }

            // Get all user tasks
            const result = await databaseService.getUserTasks(user.$id);

            if (!result.success || !result.data) {
                return {
                    success: false,
                    message: 'Failed to get task statistics',
                };
            }

            const tasks = result.data;
            const now = new Date();

            const stats: TaskStats = {
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                pendingTasks: tasks.filter(t => t.status === 'pending').length,
                overdueTasks: tasks.filter(t =>
                    t.status === 'pending' &&
                    new Date(t.scheduledDate) < now
                ).length,
                completionRate: 0,
                streak: 0,
                totalPoints: 0,
            };

            // Calculate completion rate
            if (stats.totalTasks > 0) {
                stats.completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
            }

            // Calculate streak (consecutive days with completed tasks)
            stats.streak = await this.calculateStreak(tasks);

            // Calculate total points from completed tasks
            const completedTasks = tasks.filter(t => t.status === 'completed');
            for (const task of completedTasks) {
                const taskTemplate = await databaseService.getTask(task.taskId);
                if (taskTemplate.success && taskTemplate.data) {
                    stats.totalPoints += taskTemplate.data.points;
                }
            }

            return {
                success: true,
                message: 'Task statistics calculated',
                data: stats,
            };
        } catch (error: any) {
            console.error('Error getting task stats:', error);
            return {
                success: false,
                message: 'Failed to get task statistics',
                error: error.message,
            };
        }
    }

    /**
     * Enrich task details with template data
     */
    private async enrichTaskDetails(
        taskDetails: TaskDetailDocument[]
    ): Promise<TaskWithDetails[]> {
        const enrichedTasks = await Promise.all(
            taskDetails.map(async (detail) => {
                const taskResult = await databaseService.getTask(detail.taskId);

                if (taskResult.success && taskResult.data) {
                    const task = taskResult.data;

                    return {
                        ...task,
                        taskDetail: detail,
                        iconUrl: task.iconId
                            ? storageService.getTaskIconUrl(task.iconId)
                            : undefined,
                    } as TaskWithDetails;
                }

                return null;
            })
        );

        return enrichedTasks.filter(task => task !== null) as TaskWithDetails[];
    }

    /**
     * Update plant care date from completed task
     */
    private async updatePlantCareFromTask(
        userPlantId: string,
        taskCategory: string
    ): Promise<void> {
        try {
            const plantService = await import('./plantService');

            switch (taskCategory) {
                case 'watering':
                    await plantService.default.updatePlantCare(userPlantId, 'water');
                    break;
                case 'fertilizing':
                    await plantService.default.updatePlantCare(userPlantId, 'fertilize');
                    break;
                case 'repotting':
                    await plantService.default.updatePlantCare(userPlantId, 'repot');
                    break;
            }
        } catch (error) {
            console.error('Error updating plant care:', error);
        }
    }

    /**
     * Calculate task completion streak
     */
    private async calculateStreak(tasks: TaskDetailDocument[]): Promise<number> {
        const completedTasks = tasks
            .filter(t => t.status === 'completed' && t.completedDate)
            .sort((a, b) =>
                new Date(b.completedDate!).getTime() -
                new Date(a.completedDate!).getTime()
            );

        if (completedTasks.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const dateStr = currentDate.toDateString();
            const hasTaskOnDate = completedTasks.some(task =>
                new Date(task.completedDate!).toDateString() === dateStr
            );

            if (hasTaskOnDate) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (i === 0) {
                // If no task completed today, check yesterday
                currentDate.setDate(currentDate.getDate() - 1);
                continue;
            } else {
                // Streak broken
                break;
            }
        }

        return streak;
    }
}

// Create and export singleton instance
export const taskService = new TaskService();
export default taskService;