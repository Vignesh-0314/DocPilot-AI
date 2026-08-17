import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://doc-pilot-ai-frontend.vercel.app',
  'https://docpilot-ai.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
