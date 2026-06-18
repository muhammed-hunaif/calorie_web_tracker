import express from 'express';
import { addExercise, deleteExercise, getExercises, updateExercise } from '../controllers/exerciseMasterController.js';

const router = express.Router();

router.get('/', getExercises);
router.post('/add', addExercise);
router.put('/update/:id', updateExercise);
router.delete('/delete/:id', deleteExercise);

export default router;
