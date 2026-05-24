import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Load env configuration before any local module imports
dotenv.config();

import { connectDB } from './config/db';
import { logger } from './config/logger';
import { initSocketServer } from './websocket/socketServer';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error';
import { apiLimiter } from './middlewares/rateLimit';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Robust Security & Optimization Headers
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express API Rate Limiter
app.use('/api/', apiLimiter);

// Versioned API Routes
app.use('/api/v1', apiRoutes);

// Base route for health checks
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'ai-interview-fraud-detection-backend',
  });
});

// Centralized Error Boundary Middleware
app.use(errorHandler);

// Initialize Socket.IO Server
initSocketServer(server);

// Boot server
server.listen(PORT, () => {
  logger.info(`Enterprise AI Fraud Detection Backend Server listening on port ${PORT}`);
  logger.info(`Running in environment: ${process.env.NODE_ENV}`);
});

// Graceful Shutdown routines
const gracefulShutdown = () => {
  logger.info('Received shutdown signal. Commencing clean service termination...');
  server.close(() => {
    logger.info('HTTP & Socket.IO server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
