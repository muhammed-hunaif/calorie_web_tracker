import { z } from 'zod';
import { idSchema, MAX_DURATION } from './commonSchema.js';

const durationSchema = z
    .number('Duration must be a number')
    .positive('Duration must be greater than 0')
    .max(MAX_DURATION, `Duration must not exceed ${MAX_DURATION}`);

export const exerciseEntrySchema = z.object({
    exerciseId: idSchema('Exercise ID'),
    duration: durationSchema,
});

export const updateExerciseEntrySchema = z.object({
    duration: durationSchema,
});
