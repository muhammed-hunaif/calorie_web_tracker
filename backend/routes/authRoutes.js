import express from 'express';
import { signup, login, logout, verifyAuth } from '../controllers/authControllers.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', protect, verifyAuth);

export default router;
