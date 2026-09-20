// Must be first: loads .env and hard-fails on missing secrets before db.js
// (imported transitively by the route modules below) opens a connection pool.
import './config/validateEnv.js';

import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import foodMasterRoutes from './routes/foodMasterRoutes.js';
import exerciseMasterRoutes from './routes/exerciseMasterRoutes.js';
import foodEntryRoutes from './routes/foodEntryRoutes.js';
import exerciseEntryRoutes from './routes/exerciseEntryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware:
// CORS goes first so that responses produced before the routes are reached -
// a body-parser 413, say - still carry the CORS headers. Otherwise the browser
// reports those as opaque CORS failures instead of the real status.
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());

// Small global JSON limit for every endpoint except the image upload router,
// which mounts its own larger limit sized to a base64-encoded image. Without
// the skip this parser would reject the upload before that router is reached.
const globalJson = express.json({ limit: '100kb' });
app.use((req, res, next) => {
    if (req.path.startsWith('/api/upload')) {
        return next();
    }
    return globalJson(req, res, next);
});


// Routes:
// /api/auth exposes the public signup/login/logout endpoints.
// Every other router applies `protect` to all of its routes.
app.use('/api/auth', authRoutes);
app.use('/api/foodmaster', foodMasterRoutes);
app.use('/api/exercisemaster', exerciseMasterRoutes);
app.use('/api/foodentry', foodEntryRoutes);
app.use('/api/exerciseentry', exerciseEntryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// Unknown API paths get a plain 404 instead of an HTML stack page.
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'Not found' });
});

// Last-resort error handler: log the detail server-side, return nothing that
// describes the internals (SQL text, file paths, stack traces) to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (res.headersSent) {
        return;
    }
    // Malformed JSON bodies are the caller's fault, not a server fault.
    if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
        return res.status(400).json({ message: 'Invalid JSON body' });
    }
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Payload too large' });
    }
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
