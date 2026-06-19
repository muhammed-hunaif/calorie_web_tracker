import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authroutes.js';
import foodMasterRoutes from './routes/foodMasterRoutes.js';
import exerciseMasterRoutes from './routes/exerciseMasterRoutes.js';
import foodEntryRoutes from './routes/foodEntryRoutes.js';
import exerciseEntryRoutes from './routes/exerciseEntryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

import './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware:
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));


// Routes:
app.use('/api/auth', authRoutes);
app.use('/api/foodmaster', foodMasterRoutes);
app.use('/api/exercisemaster', exerciseMasterRoutes);
app.use('/api/foodentry', foodEntryRoutes);
app.use('/api/exerciseentry', exerciseEntryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
