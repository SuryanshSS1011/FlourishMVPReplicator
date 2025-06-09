// src/types/forms.ts
export interface LoginFormData {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface SignupFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    agreeToTerms?: boolean;
    subscribeToNewsletter?: boolean;
}

export interface ForgotPasswordFormData {
    email: string;
}

export interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
    userId?: string;
    secret?: string;
}

export interface VerificationFormData {
    code: string[];
    email?: string;
    phone?: string;
    type: 'email' | 'phone';
}

export interface ChangePasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface UpdateProfileFormData {
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    profileImage?: string;
}

export interface TaskFormData {
    title: string;
    description?: string;
    category: 'daily' | 'personal';
    selectedDate: Date;
    isAllDay: boolean;
    repeatOption: 'Does not repeat' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    icon?: string | null;
    priority?: 'low' | 'medium' | 'high';
    estimatedDuration?: number; // in minutes
    tags?: string[];
}

export interface PlantFormData {
    name: string;
    category: string;
    family: string;
    image?: string;
    description?: string;
    careInstructions?: string;
    wateringFrequency?: number; // in days
    lightRequirement?: 'low' | 'medium' | 'high';
    isFavorite?: boolean;
}

export interface NutrientFormData {
    name: string;
    description: string;
    type: 'fertilizer' | 'supplement' | 'organic';
    image?: string;
    timer: number; // in seconds
    isPremium: boolean;
    benefits?: string[];
    instructions?: string;
}

export interface FeedbackFormData {
    type: 'bug_report' | 'feature_request' | 'general_feedback';
    subject: string;
    message: string;
    email?: string;
    attachments?: string[];
    rating?: number; // 1-5 scale
}

export interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    category: 'support' | 'business' | 'partnership' | 'other';
}

// Validation schemas for forms
export interface FormValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
}

export interface FormValidationSchema {
    [fieldName: string]: FormValidationRule;
}

// Common validation schemas
export const loginValidationSchema: FormValidationSchema = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
        required: true,
        minLength: 1,
    },
};

export const signupValidationSchema: FormValidationSchema = {
    name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
        required: true,
        minLength: 8,
        custom: (value: string) => {
            const requirements = [
                { test: /(?=.*[a-z])/, message: 'one lowercase letter' },
                { test: /(?=.*[A-Z])/, message: 'one uppercase letter' },
                { test: /(?=.*\d)/, message: 'one number' },
                { test: /(?=.*[^A-Za-z0-9])/, message: 'one special character' },
            ];

            const missing = requirements.filter(req => !req.test.test(value));
            if (missing.length > 0) {
                return `Password must contain ${missing.map(m => m.message).join(', ')}`;
            }
            return undefined;
        },
    },
    confirmPassword: {
        required: true,
        custom: (value: string, formData: SignupFormData) => {
            if (value !== formData.password) {
                return 'Passwords do not match';
            }
            return undefined;
        },
    },
};

export const forgotPasswordValidationSchema: FormValidationSchema = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
};

export const resetPasswordValidationSchema: FormValidationSchema = {
    password: {
        required: true,
        minLength: 8,
        custom: (value: string) => {
            const requirements = [
                { test: /(?=.*[a-z])/, message: 'one lowercase letter' },
                { test: /(?=.*[A-Z])/, message: 'one uppercase letter' },
                { test: /(?=.*\d)/, message: 'one number' },
                { test: /(?=.*[^A-Za-z0-9])/, message: 'one special character' },
            ];

            const missing = requirements.filter(req => !req.test.test(value));
            if (missing.length > 0) {
                return `Password must contain ${missing.map(m => m.message).join(', ')}`;
            }
            return undefined;
        },
    },
    confirmPassword: {
        required: true,
        custom: (value: string, formData: ResetPasswordFormData) => {
            if (value !== formData.password) {
                return 'Passwords do not match';
            }
            return undefined;
        },
    },
};

export const taskFormValidationSchema: FormValidationSchema = {
    title: {
        required: true,
        minLength: 1,
        maxLength: 100,
    },
    description: {
        maxLength: 500,
    },
    category: {
        required: true,
    },
};

// Form state types
export interface FormState<T> {
    data: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
    isSubmitting: boolean;
}

export interface FormAction<T> {
    type: 'SET_FIELD' | 'SET_ERROR' | 'SET_TOUCHED' | 'SET_SUBMITTING' | 'RESET';
    field?: keyof T;
    value?: any;
    errors?: Partial<Record<keyof T, string>>;
}

// Form hook types
export interface UseFormOptions<T> {
    initialValues: T;
    validationSchema?: FormValidationSchema;
    onSubmit?: (values: T) => Promise<void> | void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
    isSubmitting: boolean;
    handleChange: (field: keyof T) => (value: any) => void;
    handleBlur: (field: keyof T) => () => void;
    handleSubmit: () => Promise<void>;
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    setFieldTouched: (field: keyof T, touched: boolean) => void;
    reset: () => void;
    validateForm: () => boolean;
}