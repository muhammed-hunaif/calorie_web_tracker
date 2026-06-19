import express from 'express';
import { addExerciseEntry, getExerciseEntries, updateExerciseEntry, deleteExerciseEntry } from '../controllers/exerciseEntryController.js';

const router = express.Router();

router.get('/', getExerciseEntries);
router.post('/add', addExerciseEntry);
router.put('/update/:id', updateExerciseEntry);
router.delete('/delete/:id', deleteExerciseEntry);

export default router;
