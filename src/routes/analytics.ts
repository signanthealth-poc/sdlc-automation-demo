import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { getAnalytics } from '../middleware/rateLimiter';

const router = Router();

// GET /api/analytics - Get API analytics and statistics
router.get('/', (req: Request, res: Response) => {
  const analytics = getAnalytics();
  
  logger.info('Analytics data requested', { 
    ip: req.ip,
    recordsCount: analytics.recordsCount 
  });
  
  res.json({
    data: analytics,
    timestamp: new Date().toISOString(),
    message: 'API analytics and usage statistics'
  });
});

// GET /api/analytics/summary - Get summarized analytics
router.get('/summary', (req: Request, res: Response) => {
  const analytics = getAnalytics();
  
  const summary = {
    currentMetrics: {
      totalRequests: analytics.all.totalRequests,
      avgResponseTime: analytics.all.avgResponseTime,
      successRate: analytics.all.successRate,
      errorRate: analytics.all.errorRate
    },
    lastHour: {
      requests: analytics.lastHour.totalRequests,
      avgResponseTime: analytics.lastHour.avgResponseTime,
      topPaths: analytics.lastHour.topPaths.slice(0, 5)
    },
    rateLimiting: analytics.rateLimitStatus,
    popularEndpoints: analytics.all.topPaths.slice(0, 5)
  };
  
  logger.info('Analytics summary requested');
  
  res.json({
    data: summary,
    timestamp: new Date().toISOString()
  });
});

// GET /api/analytics/methods - Get statistics by HTTP method
router.get('/methods', (req: Request, res: Response) => {
  const analytics = getAnalytics();
  
  res.json({
    data: {
      byMethod: analytics.all.byMethod,
      lastHour: analytics.lastHour.byMethod
    },
    timestamp: new Date().toISOString()
  });
});

// GET /api/analytics/status-codes - Get statistics by status code
router.get('/status-codes', (req: Request, res: Response) => {
  const analytics = getAnalytics();
  
  res.json({
    data: {
      all: analytics.all.byStatusCode,
      lastHour: analytics.lastHour.byStatusCode,
      successRate: analytics.all.successRate,
      errorRate: analytics.all.errorRate
    },
    timestamp: new Date().toISOString()
  });
});

// GET /api/analytics/performance - Get performance metrics
router.get('/performance', (req: Request, res: Response) => {
  const analytics = getAnalytics();
  
  const performance = {
    all: {
      avgResponseTime: analytics.all.avgResponseTime,
      minResponseTime: analytics.all.minResponseTime,
      maxResponseTime: analytics.all.maxResponseTime
    },
    lastHour: {
      avgResponseTime: analytics.lastHour.avgResponseTime,
      minResponseTime: analytics.lastHour.minResponseTime,
      maxResponseTime: analytics.lastHour.maxResponseTime
    },
    lastDay: {
      avgResponseTime: analytics.lastDay.avgResponseTime,
      minResponseTime: analytics.lastDay.minResponseTime,
      maxResponseTime: analytics.lastDay.maxResponseTime
    }
  };
  
  res.json({
    data: performance,
    timestamp: new Date().toISOString(),
    unit: 'milliseconds'
  });
});

export { router as analyticsRouter };
