import { z } from 'zod';
import { MAX_CALORIES } from './commonSchema.js';
import { optionalImageUrl } from './uploadSchema.js';

export const foodSchema = z.object({
    foodName: z
        .string('Food name must be a string')
        .trim()
        .min(1, 'Food name is required')
        .max(255, 'Food name must not exceed 255 characters'),
    caloriesPerUnit: z
        .number('Calories per unit must be a number')
        .positive('Calories per unit must be greater than 0')
        .max(MAX_CALORIES, `Calories per unit must not exceed ${MAX_CALORIES}`),
    // 'piece' (lowercase) is kept so records saved before this change stay editable.
    foodState: z.enum(['Solid', 'Liquid', 'Piece', 'piece'], {
        error: 'Food state must be Solid, Liquid or Piece',
    }),
    // Set from the URL returned by POST /api/upload/image. Optional, and the
    // controller rejects any URL that is not on our own ImageKit endpoint.
    imageUrl: optionalImageUrl,
});
