import request from 'supertest';
import { app } from '../server';

describe('API Endpoints', () => {
  describe('GET /api/status', () => {
    it('should return API status information', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('api');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return specific user', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'User not found');
    });
  });

  describe('POST /api/users', () => {
    it('should create new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newUser.name);
      expect(response.body.data).toHaveProperty('email', newUser.email);
      expect(response.body).toHaveProperty('message', 'User created successfully');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUser = {
        name: 'Test User'
        // Missing email
      };

      const response = await request(app)
        .post('/api/users')
        .send(incompleteUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Name and email are required');
    });
  });

  describe('GET /api/error', () => {
    it('should simulate error response', async () => {
      const response = await request(app)
        .get('/api/error')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Internal Server Error');
      expect(response.body.error).toHaveProperty('status', 500);
    });
  });
});