import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Demo data for API endpoints
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() }
];

// GET /api/users - List all users
router.get('/users', (req: Request, res: Response) => {
  logger.info('Users list requested');
  res.json({
    data: users,
    total: users.length,
    timestamp: new Date().toISOString()
  });
});

// GET /api/users/:id - Get user by ID
router.get('/users/:id', (req: Request, res: Response, next) => {
  const userId = parseInt(req.params.id || '0');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return next(createError('User not found', 404));
  }
  
  logger.info(`User ${userId} requested`);
  res.json({ data: user, timestamp: new Date().toISOString() });
});

// POST /api/users - Create new user
router.post('/users', (req: Request, res: Response, next) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return next(createError('Name and email are required', 400));
  }
  
  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  logger.info(`New user created: ${newUser.id}`);
  
  res.status(201).json({
    data: newUser,
    message: 'User created successfully',
    timestamp: new Date().toISOString()
  });
});

// GET /api/status - API status information
router.get('/status', (req: Request, res: Response) => {
  res.json({
    api: 'SDLC Automation Demo API',
    version: '1.0.0',
    status: 'operational',
    features: [
      'User management',
      'Task management',
      'API analytics & monitoring',
      'Rate limiting',
      'Health monitoring',
      'Metrics collection',
      'Error handling',
      'Security headers',
      'Request logging',
      'Search and filtering'
    ],
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
      analytics: '/api/analytics',
      health: '/health',
      metrics: '/metrics'
    },
    timestamp: new Date().toISOString()
  });
});

// Error simulation endpoint for testing
router.get('/error', (req: Request, res: Response, next) => {
  logger.warn('Error endpoint called - simulating error');
  next(createError('This is a simulated error for testing purposes', 500));
});

export { router as apiRouter };