import { z } from 'zod';

export const foodEntrySchema = z.object({
  foodId: z.number({
    required_error: 'Food ID is required',
    invalid_type_error: 'Food ID must be a number',
  })
    .int()
    .positive('Food ID must be a positive integer'),
  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  })
    .positive('Quantity must be greater than 0'),
});

export const updateFoodEntrySchema = z.object({
  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  })
    .positive('Quantity must be greater than 0'),
});
