import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  checks: {
    database: 'healthy' | 'unhealthy';
    external_services: 'healthy' | 'unhealthy';
  };
}

// Basic health check
router.get('/', (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal + memUsage.external;
  const usedMemory = memUsage.heapUsed;
  
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: usedMemory,
      total: totalMemory,
      percentage: Math.round((usedMemory / totalMemory) * 100)
    },
    checks: {
      database: 'healthy', // Placeholder - would check actual DB connection
      external_services: 'healthy' // Placeholder - would check external APIs
    }
  };
  
  logger.info('Health check requested', { 
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(200).json(healthStatus);
});

// Liveness probe (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Readiness probe (for Kubernetes)
router.get('/ready', (req: Request, res: Response) => {
  // Add checks for dependencies here (database, external services, etc.)
  const isReady = true; // Placeholder logic
  
  if (isReady) {
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: 'not ready', timestamp: new Date().toISOString() });
  }
});

export { router as healthRouter };