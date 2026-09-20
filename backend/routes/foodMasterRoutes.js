import express from 'express';
import { addFood, deleteFood, getFoods, updateFood } from '../controllers/foodMasterControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, validateParams, validateQuery } from '../middleware/validationMiddleware.js';
import { foodSchema } from '../schema/foodMasterSchema.js';
import { idParamSchema, paginationSchema } from '../schema/commonSchema.js';

const router = express.Router();

// Every route below is user-owned data: protect runs first, then validation.
router.get('/', protect, validateQuery(paginationSchema), getFoods);
router.post('/add', protect, validate(foodSchema), addFood);
router.put('/update/:id', protect, validateParams(idParamSchema), validate(foodSchema), updateFood);
router.delete('/delete/:id', protect, validateParams(idParamSchema), deleteFood);

export default router;
