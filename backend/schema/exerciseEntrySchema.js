import { z } from 'zod';

export const exerciseEntrySchema = z.object({
  exerciseId: z.number({
    required_error: 'Exercise ID is required',
    invalid_type_error: 'Exercise ID must be a number',
  })
    .int()
    .positive('Exercise ID must be a positive integer'),
  duration: z.number({
    required_error: 'Duration is required',
    invalid_type_error: 'Duration must be a number',
  })
    .positive('Duration must be greater than 0'),
});

export const updateExerciseEntrySchema = z.object({
  duration: z.number({
    required_error: 'Duration is required',
    invalid_type_error: 'Duration must be a number',
  })
    .positive('Duration must be greater than 0'),
});
