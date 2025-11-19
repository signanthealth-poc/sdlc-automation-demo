import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { createError } from './errorHandler';

// Store for rate limiting (in production, use Redis or similar)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Store for analytics
interface RequestRecord {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent: string | undefined;
}

const requestRecords: RequestRecord[] = [];
const MAX_RECORDS = 1000; // Keep last 1000 requests

// Rate limiting configuration
interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

/**
 * Rate limiting middleware
 * Limits the number of requests from a single IP within a time window
 */
export const rateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs = 60000, // Default: 1 minute
    maxRequests = 100, // Default: 100 requests per minute
    message = 'Too many requests, please try again later'
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(rateLimitStore).forEach(ip => {
      const record = rateLimitStore[ip];
      if (record && record.resetTime < now) {
        delete rateLimitStore[ip];
      }
    });
    
    // Initialize or get client record
    if (!rateLimitStore[clientIp]) {
      rateLimitStore[clientIp] = {
        count: 1,
        resetTime: now + windowMs
      };
      
      // Set rate limit headers for first request
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', String(maxRequests - 1));
      res.set('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));
    } else {
      const clientRecord = rateLimitStore[clientIp];
      if (clientRecord) {
        clientRecord.count += 1;
        
        // Check if limit exceeded
        if (clientRecord.count > maxRequests) {
          const retryAfter = Math.ceil((clientRecord.resetTime - now) / 1000);
          res.set('Retry-After', String(retryAfter));
          res.set('X-RateLimit-Limit', String(maxRequests));
          res.set('X-RateLimit-Remaining', '0');
          res.set('X-RateLimit-Reset', String(Math.ceil(clientRecord.resetTime / 1000)));
          
          logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
          return next(createError(message, 429));
        }
        
        // Set rate limit headers
        res.set('X-RateLimit-Limit', String(maxRequests));
        res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - clientRecord.count)));
        res.set('X-RateLimit-Reset', String(Math.ceil(clientRecord.resetTime / 1000)));
      }
    }
    
    next();
  };
};

/**
 * Analytics middleware
 * Tracks request metrics for analysis
 */
export const analyticsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data): Response {
    const responseTime = Date.now() - startTime;
    
    // Record request data
    const record: RequestRecord = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent')
    };
    
    // Add to records (maintain size limit)
    requestRecords.push(record);
    if (requestRecords.length > MAX_RECORDS) {
      requestRecords.shift(); // Remove oldest record
    }
    
    // Log slow requests
    if (responseTime > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Get analytics data
 */
export const getAnalytics = () => {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const oneDayAgo = now - 86400000;
  
  // Filter records for time periods
  const lastHourRecords = requestRecords.filter(r => 
    new Date(r.timestamp).getTime() > oneHourAgo
  );
  const lastDayRecords = requestRecords.filter(r => 
    new Date(r.timestamp).getTime() > oneDayAgo
  );
  
  // Calculate statistics
  const calculateStats = (records: RequestRecord[]) => {
    if (records.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        byMethod: {},
        byPath: {},
        byStatusCode: {},
        topPaths: []
      };
    }
    
    const responseTimes = records.map(r => r.responseTime);
    const successCount = records.filter(r => r.statusCode < 400).length;
    const errorCount = records.filter(r => r.statusCode >= 400).length;
    
    // Group by method
    const byMethod: { [key: string]: number } = {};
    records.forEach(r => {
      byMethod[r.method] = (byMethod[r.method] || 0) + 1;
    });
    
    // Group by path
    const byPath: { [key: string]: number } = {};
    records.forEach(r => {
      byPath[r.path] = (byPath[r.path] || 0) + 1;
    });
    
    // Group by status code
    const byStatusCode: { [key: number]: number } = {};
    records.forEach(r => {
      byStatusCode[r.statusCode] = (byStatusCode[r.statusCode] || 0) + 1;
    });
    
    // Get top paths
    const topPaths = Object.entries(byPath)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));
    
    return {
      totalRequests: records.length,
      avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / records.length),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      successRate: ((successCount / records.length) * 100).toFixed(2),
      errorRate: ((errorCount / records.length) * 100).toFixed(2),
      byMethod,
      byPath,
      byStatusCode,
      topPaths
    };
  };
  
  return {
    lastHour: calculateStats(lastHourRecords),
    lastDay: calculateStats(lastDayRecords),
    all: calculateStats(requestRecords),
    recordsCount: requestRecords.length,
    rateLimitStatus: {
      activeClients: Object.keys(rateLimitStore).length,
      totalRecords: Object.keys(rateLimitStore).length
    }
  };
};

/**
 * Reset analytics data (for testing)
 */
export const resetAnalytics = () => {
  requestRecords.length = 0;
  Object.keys(rateLimitStore).forEach(key => {
    delete rateLimitStore[key];
  });
};
