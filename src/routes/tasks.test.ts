import request from 'supertest';
import { app } from '../server';

describe('Task Management API', () => {
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=todo')
        .expect(200);

      expect(response.body.data.every((task: { status: string }) => task.status === 'todo')).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .expect(200);

      expect(response.body.data.every((task: { priority: string }) => task.priority === 'high')).toBe(true);
    });

    it('should search tasks by title or description', async () => {
      const response = await request(app)
        .get('/api/tasks?search=monitoring')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some((task: { title: string; description: string }) => 
          task.title.toLowerCase().includes('monitoring') || 
          task.description.toLowerCase().includes('monitoring')
        )
      ).toBe(true);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a specific task', async () => {
      const response = await request(app)
        .get('/api/tasks/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Task not found');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with all fields', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo',
        priority: 'high',
        assignee: 'Test User',
        tags: ['test', 'demo']
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Task created successfully');
      expect(response.body.data.title).toBe(newTask.title);
      expect(response.body.data.status).toBe(newTask.status);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should create a task with minimal required fields', async () => {
      const newTask = {
        title: 'Minimal Task',
        description: 'Task with only required fields'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.data.status).toBe('todo'); // default
      expect(response.body.data.priority).toBe('medium'); // default
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body.error.message).toBe('Title and description are required');
    });

    it('should return 400 if description is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'No description' })
        .expect(400);

      expect(response.body.error.message).toBe('Title and description are required');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test',
          description: 'Test',
          status: 'invalid-status'
        })
        .expect(400);

      expect(response.body.error.message).toContain('Invalid status');
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test',
          description: 'Test',
          priority: 'invalid-priority'
        })
        .expect(400);

      expect(response.body.error.message).toContain('Invalid priority');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const updates = {
        title: 'Updated Task Title',
        status: 'in-progress',
        priority: 'high'
      };

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task updated successfully');
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .send({ title: 'Update' })
        .expect(404);

      expect(response.body.error.message).toBe('Task not found');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/tasks/1')
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.error.message).toContain('Invalid status');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      // First create a task to delete
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task to delete',
          description: 'This task will be deleted'
        });

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task deleted successfully');
      expect(response.body.data.id).toBe(taskId);
    });

    it('should return 404 when deleting non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .expect(404);

      expect(response.body.error.message).toBe('Task not found');
    });
  });

  describe('GET /api/tasks/stats/summary', () => {
    it('should return task statistics', async () => {
      const response = await request(app)
        .get('/api/tasks/stats/summary')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('byPriority');
      expect(response.body.data.byStatus).toHaveProperty('todo');
      expect(response.body.data.byStatus).toHaveProperty('inProgress');
      expect(response.body.data.byStatus).toHaveProperty('done');
      expect(response.body.data.byPriority).toHaveProperty('low');
      expect(response.body.data.byPriority).toHaveProperty('medium');
      expect(response.body.data.byPriority).toHaveProperty('high');
    });
  });
});
