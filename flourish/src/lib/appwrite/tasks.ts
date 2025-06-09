// src/lib/appwrite/tasks.ts
import { ID, Query } from 'react-native-appwrite';
import { appwriteService, APPWRITE_CONFIG } from './config';
import type { Task, TaskDetail, Suggestion, ApiResponse, TaskFormData } from '../../types';

class TaskService {
    private databases = appwriteService.databaseService;
    private storage = appwriteService.storageService;

    /**
     * Fetch all tasks with their details for a specific user
     */
    async fetchTasksWithDetails(userId: string): Promise<ApiResponse<(Task & { details: TaskDetail[] | null })[]>> {
        try {
            console.log(`Fetching tasks for user ${userId}`);

            // Fetch user's tasks
            const tasksResponse = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.tasks,
                [Query.equal('userId', userId)]
            );

            // Fetch task details
            const taskDetailsResponse = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.taskDetails,
                [Query.equal('userId', userId)]
            );

            // Combine tasks with their details
            const tasksWithDetails = (tasksResponse.documents || []).map(task => {
                const taskDetails = (taskDetailsResponse.documents || [])
                    .filter(detail => detail.task_id === task.$id && detail.userId === userId)
                    .map(detail => ({
                        $id: detail.$id,
                        task_id: detail.task_id,
                        Date: detail.Date,
                        All_day: detail.All_day,
                        Recurrence_type: detail.Recurrence_type,
                        userId: detail.userId,
                    } as TaskDetail));

                return {
                    $id: task.$id,
                    id: task.$id, // Legacy support
                    category_type: task.category_type,
                    Title: task.Title,
                    text: task.Title, // Legacy support
                    Created_at: task.Created_at,
                    icon: task.icon || null,
                    isFavorite: task.isFavorite || false,
                    status: task.status ? task.status.toLowerCase() : 'active',
                    points: 5, // Default points
                    userId: task.userId,
                    details: taskDetails.length > 0 ? taskDetails : null,
                } as Task & { details: TaskDetail[] | null };
            });

            return {
                success: true,
                message: 'Tasks fetched successfully',
                data: tasksWithDetails,
            };
        } catch (error: any) {
            console.error('Fetch tasks error:', error);
            return {
                success: false,
                message: 'Failed to fetch tasks',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Create a new task
     */
    async createTask(taskData: Partial<Task>): Promise<ApiResponse<Task>> {
        try {
            console.log('Creating task:', taskData);

            const response = await this.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.tasks,
                ID.unique(),
                {
                    ...taskData,
                    Created_at: new Date().toISOString(),
                    isFavorite: taskData.isFavorite || false,
                    status: taskData.status || 'active',
                    icon: taskData.icon || null,
                }
            );

            return {
                success: true,
                message: 'Task created successfully',
                data: response as Task,
            };
        } catch (error: any) {
            console.error('Create task error:', error);
            return {
                success: false,
                message: 'Failed to create task',
                error: error.message,
            };
        }
    }

    /**
     * Create task detail
     */
    async createTaskDetail(taskDetailData: {
        task_id: string;
        Date: string;
        All_day: boolean;
        Recurrence_type: string;
        userId: string;
    }): Promise<ApiResponse<TaskDetail>> {
        try {
            console.log('Creating task detail:', taskDetailData);

            const response = await this.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.taskDetails,
                ID.unique(),
                taskDetailData
            );

            return {
                success: true,
                message: 'Task detail created successfully',
                data: response as TaskDetail,
            };
        } catch (error: any) {
            console.error('Create task detail error:', error);
            return {
                success: false,
                message: 'Failed to create task detail',
                error: error.message,
            };
        }
    }

    /**
     * Update task
     */
    async updateTask(taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
        try {
            const response = await this.databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.tasks,
                taskId,
                updates
            );

            return {
                success: true,
                message: 'Task updated successfully',
                data: response as Task,
            };
        } catch (error: any) {
            console.error('Update task error:', error);
            return {
                success: false,
                message: 'Failed to update task',
                error: error.message,
            };
        }
    }

    /**
     * Delete task
     */
    async deleteTask(taskId: string): Promise<ApiResponse> {
        try {
            console.log(`Deleting task: ${taskId}`);

            // Delete task details first
            await this.deleteTaskDetails(taskId);

            // Delete the task
            await this.databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.tasks,
                taskId
            );

            return {
                success: true,
                message: 'Task deleted successfully',
            };
        } catch (error: any) {
            console.error('Delete task error:', error);
            return {
                success: false,
                message: 'Failed to delete task',
                error: error.message,
            };
        }
    }

    /**
     * Delete task details
     */
    async deleteTaskDetails(taskId: string): Promise<ApiResponse> {
        try {
            const response = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.taskDetails,
                [Query.equal('task_id', taskId)]
            );

            const deletePromises = (response.documents || []).map(doc =>
                this.databases.deleteDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.taskDetails,
                    doc.$id
                )
            );

            await Promise.all(deletePromises);

            return {
                success: true,
                message: 'Task details deleted successfully',
            };
        } catch (error: any) {
            console.error('Delete task details error:', error);
            return {
                success: false,
                message: 'Failed to delete task details',
                error: error.message,
            };
        }
    }

    /**
     * Fetch suggestions
     */
    async fetchSuggestions(userId: string): Promise<ApiResponse<Suggestion[]>> {
        try {
            console.log(`Fetching suggestions for user ${userId}`);

            const response = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.suggestions
            );

            return {
                success: true,
                message: 'Suggestions fetched successfully',
                data: response.documents as Suggestion[],
            };
        } catch (error: any) {
            console.error('Fetch suggestions error:', error);
            return {
                success: false,
                message: 'Failed to fetch suggestions',
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Upload task icon
     */
    async uploadTaskIcon(file: {
        uri: string;
        name: string;
        type: string;
    }): Promise<ApiResponse<string>> {
        try {
            const fileId = ID.unique();

            // Create file from URI
            const response = await this.storage.createFile(
                APPWRITE_CONFIG.buckets.images,
                fileId,
                {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                } as any
            );

            return {
                success: true,
                message: 'Icon uploaded successfully',
                data: response.$id,
            };
        } catch (error: any) {
            console.error('Upload icon error:', error);
            return {
                success: false,
                message: 'Failed to upload icon',
                error: error.message,
            };
        }
    }

    /**
     * Get task icon URL
     */
    getTaskIconUrl(fileId: string): string {
        return appwriteService.getFileUrl(APPWRITE_CONFIG.buckets.images, fileId);
    }
}

// Create and export singleton instance
export const taskService = new TaskService();

