import express from 'express';
import { addFood, deleteFood, getFoods, updateFood } from '../controllers/foodMasterControllers.js';
import { protect } from '../middleware/authmiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { foodSchema } from '../schema/foodMasterSchema.js';

const router = express.Router();

router.get('/', protect, getFoods);
router.post('/add', protect, validate(foodSchema), addFood);
router.put('/update/:id', protect, validate(foodSchema), updateFood);
router.delete('/delete/:id', protect, deleteFood);

export default router;
