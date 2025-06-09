// src/types/api.ts
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    limit: number;
    offset: number;
}

export interface UploadResponse {
    success: boolean;
    fileId?: string;
    message: string;
}

// src/types/forms.ts
export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignupFormData {
    name: string;
    email: string;
    password: string;
}

export interface ForgotPasswordFormData {
    email: string;
}

export interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

