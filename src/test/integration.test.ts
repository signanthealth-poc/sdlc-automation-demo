import request from 'supertest';
import { app } from '../server';

describe('Integration Tests', () => {
  describe('Application Flow', () => {
    it('should handle complete user creation flow', async () => {
      // 1. Check initial user count
      const initialResponse = await request(app)
        .get('/api/users')
        .expect(200);
      
      const initialCount = initialResponse.body.total;

      // 2. Create new user
      const newUser = {
        name: 'Integration Test User',
        email: 'integration@test.com'
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      const createdUserId = createResponse.body.data.id;

      // 3. Verify user was created
      const updatedResponse = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(updatedResponse.body.total).toBe(initialCount + 1);

      // 4. Fetch the created user
      const userResponse = await request(app)
        .get(`/api/users/${createdUserId}`)
        .expect(200);

      expect(userResponse.body.data.name).toBe(newUser.name);
      expect(userResponse.body.data.email).toBe(newUser.email);
    });

    it('should handle error scenarios gracefully', async () => {
      // Test error handling
      await request(app)
        .get('/api/users/invalid')
        .expect(404);

      await request(app)
        .post('/api/users')
        .send({})
        .expect(400);

      await request(app)
        .get('/api/error')
        .expect(500);
    });
  });

  describe('Health Check Integration', () => {
    it('should verify all health endpoints are working', async () => {
      const endpoints = ['/health', '/health/live', '/health/ready'];
      
      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('timestamp');
      }
    });
  });

  describe('Metrics Integration', () => {
    it('should expose metrics endpoint', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
    });
  });

  describe('API Documentation Integration', () => {
    it('should provide API status and documentation', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('users');
      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('metrics');
    });
  });
});