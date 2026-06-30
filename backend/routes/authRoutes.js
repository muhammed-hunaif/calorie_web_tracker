import express from 'express';
import { signup, login, logout, verifyAuth } from '../controllers/authControllers.js';
import { protect } from '../middleware/authmiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { signupSchema, loginSchema } from '../schema/authSchema.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/verify', protect, verifyAuth);

export default router;
