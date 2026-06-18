import express from 'express';
import { addFood, deleteFood, getFoods, updateFood } from '../controllers/foodMasterControllers.js';

const router = express.Router();

router.get('/', getFoods);
router.post('/add', addFood);
router.put('/update/:id', updateFood);
router.delete('/delete/:id', deleteFood);

export default router;
