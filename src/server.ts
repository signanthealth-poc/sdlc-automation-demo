import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from './utils/logger';
import { metricsMiddleware, register } from './utils/metrics';
import { healthRouter } from './routes/health';
import { apiRouter } from './routes/api';
import { taskRouter } from './routes/tasks';
import { analyticsRouter } from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter, analyticsMiddleware } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting middleware
app.use(rateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute per IP
  message: 'Too many requests from this IP, please try again later'
}));

// Analytics middleware
app.use(analyticsMiddleware);

// Logging middleware
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Metrics middleware
app.use(metricsMiddleware);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/api', apiRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/analytics', analyticsRouter);
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Static files
app.use(express.static('public'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SDLC Automation Demo API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server only if not in test environment
let server: ReturnType<typeof app.listen>;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
    logger.info(`📈 Metrics available at http://localhost:${PORT}/metrics`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
}

export { app, server };