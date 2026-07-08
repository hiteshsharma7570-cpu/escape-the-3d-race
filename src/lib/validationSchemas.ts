import { z } from 'zod';

export const sessionSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Session name is required')
    .max(50, 'Session name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens, and underscores allowed')
});

export const playerSchema = z.object({
  playerName: z.string()
    .trim()
    .min(1, 'Player name is required')
    .max(30, 'Player name must be less than 30 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens, and underscores allowed'),
  profession: z.enum(['Teacher', 'Engineer', 'Doctor', 'Pilot'], {
    errorMap: () => ({ message: 'Please select a valid profession' })
  })
});

export const authSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be less than 72 characters')
});

export type SessionFormData = z.infer<typeof sessionSchema>;
export type PlayerFormData = z.infer<typeof playerSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
