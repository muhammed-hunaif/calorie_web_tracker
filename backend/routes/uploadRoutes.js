import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { uploadImageSchema, MAX_IMAGE_BYTES } from '../schema/uploadSchema.js';

const router = express.Router();

// Base64 inflates the payload by ~4/3; allow that plus a little JSON overhead.
// This larger limit is scoped to this router only - the global limit in
// server.js stays small for every other endpoint.
const jsonLimit = express.json({ limit: Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 1024 });

router.post('/image', protect, jsonLimit, validate(uploadImageSchema), uploadImage);

export default router;
