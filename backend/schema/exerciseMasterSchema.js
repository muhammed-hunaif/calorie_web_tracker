import { z } from 'zod';
import { MAX_CALORIES } from './commonSchema.js';
import { optionalImageUrl } from './uploadSchema.js';

export const exerciseSchema = z.object({
    exerciseName: z
        .string('Exercise name must be a string')
        .trim()
        .min(1, 'Exercise name is required')
        .max(255, 'Exercise name must not exceed 255 characters'),
    unit: z
        .string('Unit must be a string')
        .trim()
        .min(1, 'Unit is required')
        .max(50, 'Unit must not exceed 50 characters'),
    caloriesBurned: z
        .number('Calories burned must be a number')
        .positive('Calories burned must be greater than 0')
        .max(MAX_CALORIES, `Calories burned must not exceed ${MAX_CALORIES}`),
    // Set from the URL returned by POST /api/upload/image. Optional, and the
    // controller rejects any URL that is not on our own ImageKit endpoint.
    imageUrl: optionalImageUrl,
});
