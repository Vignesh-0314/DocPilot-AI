import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'DocPilot AI Backend API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/document', documentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred on the server.'
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 DocPilot AI Server running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
}

export default app;
