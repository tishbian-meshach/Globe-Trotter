import { z } from 'zod';

// Auth Validators
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Trip Validators
export const createTripSchema = z.object({
    name: z.string().min(1, 'Trip name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    startDate: z.date({
        required_error: 'Start date is required',
    }),
    endDate: z.date({
        required_error: 'End date is required',
    }),
}).refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
});

// Stop Validators
export const createStopSchema = z.object({
    tripId: z.string(),
    cityId: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    order: z.number().int().positive(),
    notes: z.string().max(500).optional(),
}).refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
});

// Activity Validators
export const createActivitySchema = z.object({
    stopId: z.string(),
    name: z.string().min(1, 'Activity name is required'),
    description: z.string().max(500).optional(),
    type: z.enum(['sightseeing', 'dining', 'adventure', 'relaxation', 'shopping', 'other']),
    cost: z.number().min(0).default(0),
    duration: z.number().int().positive().optional(),
    date: z.date().optional(),
    time: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    location: z.string().optional(),
    notes: z.string().max(500).optional(),
});

// Expense Validators
export const createExpenseSchema = z.object({
    tripId: z.string(),
    category: z.enum(['transport', 'accommodation', 'activities', 'meals', 'other']),
    amount: z.number().positive('Amount must be greater than 0'),
    currency: z.string().length(3).default('USD'),
    description: z.string().max(200).optional(),
    date: z.date(),
});

// User Preferences Validators
export const updatePreferencesSchema = z.object({
    language: z.string().optional(),
    currency: z.string().length(3).optional(),
    timezone: z.string().optional(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CreateStopInput = z.infer<typeof createStopSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
