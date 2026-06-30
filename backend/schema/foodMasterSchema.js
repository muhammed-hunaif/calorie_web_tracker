import { z } from 'zod';

export const foodSchema = z.object({
  foodName: z.string()
    .min(1, 'Food name is required')
    .max(255, 'Food name must not exceed 255 characters')
    .trim(),
  caloriesPerUnit: z.number({
    required_error: 'Calories per unit is required',
    invalid_type_error: 'Calories per unit must be a number',
  })
    .positive('Calories per unit must be greater than 0'),
  foodState: z.enum(['Solid', 'Liquid', 'Piece', 'piece'], {
    errorMap: () => ({ message: 'Food state must be Solid, Liquid, or Piece' }),
  }),
});
