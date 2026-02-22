import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.js';

import complaintRoutes from './routes/complaints.js';
import evidenceRoutes from './routes/evidence.js';
import iccRoutes from './routes/icc.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000, // Increased for development/polling
    message: 'Too many requests from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/icc', iccRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🛡️ SafeVoice Backend running on port ${PORT}`);
});
