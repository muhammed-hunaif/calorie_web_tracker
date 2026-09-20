import { z } from 'zod';
import { idSchema, MAX_QUANTITY } from './commonSchema.js';

// z.number() in Zod 4 already rejects strings, NaN and Infinity, so
// "abc" / -500 / 999999999 are all rejected with 400 before any SQL runs.
const quantitySchema = z
    .number('Quantity must be a number')
    .positive('Quantity must be greater than 0')
    .max(MAX_QUANTITY, `Quantity must not exceed ${MAX_QUANTITY}`);

export const foodEntrySchema = z.object({
    foodId: idSchema('Food ID'),
    quantity: quantitySchema,
});

export const updateFoodEntrySchema = z.object({
    quantity: quantitySchema,
});
