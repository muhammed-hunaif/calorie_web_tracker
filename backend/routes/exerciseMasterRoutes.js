import express from 'express';
import { addExercise, deleteExercise, getExercises, updateExercise } from '../controllers/exerciseMasterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, validateParams, validateQuery } from '../middleware/validationMiddleware.js';
import { exerciseSchema } from '../schema/exerciseMasterSchema.js';
import { idParamSchema, paginationSchema } from '../schema/commonSchema.js';

const router = express.Router();

// Every route below is user-owned data: protect runs first, then validation.
router.get('/', protect, validateQuery(paginationSchema), getExercises);
router.post('/add', protect, validate(exerciseSchema), addExercise);
router.put('/update/:id', protect, validateParams(idParamSchema), validate(exerciseSchema), updateExercise);
router.delete('/delete/:id', protect, validateParams(idParamSchema), deleteExercise);

export default router;
