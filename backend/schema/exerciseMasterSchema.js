import { z } from 'zod';

export const exerciseSchema = z.object({
  exerciseName: z.string()
    .min(1, 'Exercise name is required')
    .max(255, 'Exercise name must not exceed 255 characters')
    .trim(),
  unit: z.string()
    .min(1, 'Unit is required')
    .max(50, 'Unit must not exceed 50 characters')
    .trim(),
  caloriesBurned: z.number({
    required_error: 'Calories burned is required',
    invalid_type_error: 'Calories burned must be a number',
  })
    .positive('Calories burned must be greater than 0'),
});
