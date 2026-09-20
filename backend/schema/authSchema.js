import { z } from 'zod';

export const signupSchema = z.object({
    username: z
        .string('Username must be a string')
        .trim()
        .min(3, 'Username must be at least 3 characters long')
        .max(50, 'Username must not exceed 50 characters'),
    email: z
        .email('Invalid email address')
        .trim()
        .toLowerCase()
        .max(255, 'Email must not exceed 255 characters'),
    password: z
        .string('Password must be a string')
        .min(6, 'Password must be at least 6 characters long')
        // Upper bound guards against hashing-cost abuse. bcrypt only uses the
        // first 72 bytes anyway.
        .max(128, 'Password must not exceed 128 characters'),
});

export const loginSchema = z.object({
    email: z.email('Invalid email address').trim().toLowerCase().max(255, 'Invalid email address'),
    // Deliberately no min/max mirroring signup: login must not reveal the
    // password policy, and older accounts must stay able to sign in.
    password: z.string('Password must be a string').min(1, 'Password is required').max(1024),
});
