import express from 'express';
import { addFoodEntry, getFoodEntries, updateFoodEntry, deleteFoodEntry } from '../controllers/foodEntryController.js';

const router = express.Router();

router.get('/', getFoodEntries);
router.post('/add', addFoodEntry);
router.put('/update/:id', updateFoodEntry);
router.delete('/delete/:id', deleteFoodEntry);

export default router;
