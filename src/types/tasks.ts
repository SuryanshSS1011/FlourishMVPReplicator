// src/types/tasks.ts

export interface Task {
    $id: string;
    id?: string; // Legacy support
    category_type: 'daily' | 'personal' | 'Daily' | 'Personal';
    Title: string;
    text?: string; // Legacy support
    Created_at: string;
    icon: string | null;
    isFavorite: boolean;
    status: 'active' | 'completed' | 'skipped';
    points: number;
    userId: string;
}

export interface TaskDetail {
    $id: string;
    task_id: string;
    Date: string;
    All_day: boolean;
    Recurrence_type: string;
    userId: string;
}

export interface Suggestion {
    $id: string;
    title: string;
    category_type: string;
    icon: string | null;
    points: number;
}

export interface TaskFormData {
    title: string;
    selectedDate: Date;
    isAllDay: boolean;
    repeatOption: string;
    category: 'daily' | 'personal';
    icon: string | null;
}

