import express from 'express';
import { addExercise, deleteExercise, getExercises, updateExercise } from '../controllers/exerciseMasterController.js';
import { protect } from '../middleware/authmiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { exerciseSchema } from '../schema/exerciseMasterSchema.js';

const router = express.Router();

router.get('/', protect, getExercises);
router.post('/add', protect, validate(exerciseSchema), addExercise);
router.put('/update/:id', protect, validate(exerciseSchema), updateExercise);
router.delete('/delete/:id', protect, deleteExercise);

export default router;
