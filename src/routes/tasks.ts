import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Task interface
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
}

// In-memory task storage (demo purposes)
const tasks: Task[] = [
  {
    id: 1,
    title: 'Setup CI/CD Pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'done',
    priority: 'high',
    assignee: 'John Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['devops', 'automation']
  },
  {
    id: 2,
    title: 'Add monitoring endpoints',
    description: 'Implement health checks and metrics collection',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Jane Smith',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['monitoring', 'observability']
  },
  {
    id: 3,
    title: 'Write API documentation',
    description: 'Create comprehensive API documentation with examples',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['documentation']
  }
];

// GET /api/tasks - List all tasks with optional filtering
router.get('/', (req: Request, res: Response) => {
  const { status, priority, assignee, search } = req.query;
  
  let filteredTasks = [...tasks];
  
  // Filter by status
  if (status && typeof status === 'string') {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  // Filter by priority
  if (priority && typeof priority === 'string') {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }
  
  // Filter by assignee
  if (assignee && typeof assignee === 'string') {
    filteredTasks = filteredTasks.filter(task => 
      task.assignee?.toLowerCase().includes(assignee.toLowerCase())
    );
  }
  
  // Search in title and description
  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    filteredTasks = filteredTasks.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower)
    );
  }
  
  logger.info('Tasks list requested', { filters: { status, priority, assignee, search } });
  
  res.json({
    data: filteredTasks,
    total: filteredTasks.length,
    filters: { status, priority, assignee, search },
    timestamp: new Date().toISOString()
  });
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  const taskId = parseInt(req.params.id || '0');
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return next(createError('Task not found', 404));
  }
  
  logger.info(`Task ${taskId} requested`);
  res.json({ data: task, timestamp: new Date().toISOString() });
});

// POST /api/tasks - Create new task
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  const { title, description, status, priority, assignee, dueDate, tags } = req.body;
  
  // Validation
  if (!title || !description) {
    return next(createError('Title and description are required', 400));
  }
  
  if (status && !['todo', 'in-progress', 'done'].includes(status)) {
    return next(createError('Invalid status. Must be: todo, in-progress, or done', 400));
  }
  
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return next(createError('Invalid priority. Must be: low, medium, or high', 400));
  }
  
  const newTask: Task = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    assignee,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate,
    tags: tags || []
  };
  
  tasks.push(newTask);
  logger.info(`New task created: ${newTask.id}`, { task: newTask });
  
  res.status(201).json({
    data: newTask,
    message: 'Task created successfully',
    timestamp: new Date().toISOString()
  });
});

// PUT /api/tasks/:id - Update task
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  const taskId = parseInt(req.params.id || '0');
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return next(createError('Task not found', 404));
  }
  
  const { title, description, status, priority, assignee, dueDate, tags } = req.body;
  
  // Validation
  if (status && !['todo', 'in-progress', 'done'].includes(status)) {
    return next(createError('Invalid status. Must be: todo, in-progress, or done', 400));
  }
  
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return next(createError('Invalid priority. Must be: low, medium, or high', 400));
  }
  
  const existingTask = tasks[taskIndex];
  if (!existingTask) {
    return next(createError('Task not found', 404));
  }
  
  // Update task
  const updatedTask: Task = {
    id: existingTask.id,
    title: title || existingTask.title,
    description: description || existingTask.description,
    status: status || existingTask.status,
    priority: priority || existingTask.priority,
    assignee: assignee !== undefined ? assignee : existingTask.assignee,
    createdAt: existingTask.createdAt,
    dueDate: dueDate !== undefined ? dueDate : existingTask.dueDate,
    tags: tags !== undefined ? tags : existingTask.tags,
    updatedAt: new Date().toISOString()
  };
  
  tasks[taskIndex] = updatedTask;
  logger.info(`Task ${taskId} updated`, { task: updatedTask });
  
  res.json({
    data: updatedTask,
    message: 'Task updated successfully',
    timestamp: new Date().toISOString()
  });
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  const taskId = parseInt(req.params.id || '0');
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return next(createError('Task not found', 404));
  }
  
  const deletedTask = tasks[taskIndex];
  tasks.splice(taskIndex, 1);
  logger.info(`Task ${taskId} deleted`, { task: deletedTask });
  
  res.json({
    data: deletedTask,
    message: 'Task deleted successfully',
    timestamp: new Date().toISOString()
  });
});

// GET /api/tasks/stats/summary - Get task statistics
router.get('/stats/summary', (req: Request, res: Response) => {
  const stats = {
    total: tasks.length,
    byStatus: {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length
    },
    byPriority: {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length
    },
    assigned: tasks.filter(t => t.assignee).length,
    unassigned: tasks.filter(t => !t.assignee).length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length
  };
  
  logger.info('Task statistics requested');
  
  res.json({
    data: stats,
    timestamp: new Date().toISOString()
  });
});

export { router as taskRouter, tasks };
