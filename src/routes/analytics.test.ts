import request from 'supertest';
import { app } from '../server';
import { resetAnalytics } from '../middleware/rateLimiter';

describe('Analytics API', () => {
  beforeEach(() => {
    // Reset analytics before each test
    resetAnalytics();
  });

  describe('GET /api/analytics', () => {
    it('should return analytics data', async () => {
      // Make some requests to generate analytics data
      await request(app).get('/api/status');
      await request(app).get('/api/users');
      await request(app).get('/api/tasks');
      
      const response = await request(app)
        .get('/api/analytics')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('lastHour');
      expect(response.body.data).toHaveProperty('lastDay');
      expect(response.body.data).toHaveProperty('all');
      expect(response.body.data).toHaveProperty('rateLimitStatus');
    });

    it('should track request metrics', async () => {
      // Make a few requests
      await request(app).get('/api/status');
      await request(app).get('/api/users');
      
      const response = await request(app)
        .get('/api/analytics')
        .expect(200);

      expect(response.body.data.all.totalRequests).toBeGreaterThan(0);
      expect(response.body.data.all).toHaveProperty('avgResponseTime');
      expect(response.body.data.all).toHaveProperty('successRate');
      expect(response.body.data.all).toHaveProperty('errorRate');
    });
  });

  describe('GET /api/analytics/summary', () => {
    it('should return summarized analytics', async () => {
      // Make some requests
      await request(app).get('/api/status');
      
      const response = await request(app)
        .get('/api/analytics/summary')
        .expect(200);

      expect(response.body.data).toHaveProperty('currentMetrics');
      expect(response.body.data).toHaveProperty('lastHour');
      expect(response.body.data).toHaveProperty('rateLimiting');
      expect(response.body.data).toHaveProperty('popularEndpoints');
      expect(response.body.data.currentMetrics).toHaveProperty('totalRequests');
      expect(response.body.data.currentMetrics).toHaveProperty('avgResponseTime');
    });
  });

  describe('GET /api/analytics/methods', () => {
    it('should return statistics by HTTP method', async () => {
      // Make requests with different methods
      await request(app).get('/api/users');
      await request(app).post('/api/users').send({ name: 'Test', email: 'test@test.com' });
      
      const response = await request(app)
        .get('/api/analytics/methods')
        .expect(200);

      expect(response.body.data).toHaveProperty('byMethod');
      expect(response.body.data).toHaveProperty('lastHour');
      expect(response.body.data.byMethod).toHaveProperty('GET');
    });
  });

  describe('GET /api/analytics/status-codes', () => {
    it('should return statistics by status code', async () => {
      // Make requests with different status codes
      await request(app).get('/api/users');
      await request(app).get('/api/users/99999'); // 404
      
      const response = await request(app)
        .get('/api/analytics/status-codes')
        .expect(200);

      expect(response.body.data).toHaveProperty('all');
      expect(response.body.data).toHaveProperty('lastHour');
      expect(response.body.data).toHaveProperty('successRate');
      expect(response.body.data).toHaveProperty('errorRate');
    });
  });

  describe('GET /api/analytics/performance', () => {
    it('should return performance metrics', async () => {
      // Make some requests
      await request(app).get('/api/status');
      
      const response = await request(app)
        .get('/api/analytics/performance')
        .expect(200);

      expect(response.body.data).toHaveProperty('all');
      expect(response.body.data).toHaveProperty('lastHour');
      expect(response.body.data).toHaveProperty('lastDay');
      expect(response.body.data.all).toHaveProperty('avgResponseTime');
      expect(response.body.data.all).toHaveProperty('minResponseTime');
      expect(response.body.data.all).toHaveProperty('maxResponseTime');
      expect(response.body.unit).toBe('milliseconds');
    });
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    resetAnalytics();
  });

  it('should include rate limit headers in response', async () => {
    const response = await request(app)
      .get('/api/status')
      .expect(200);

    expect(response.headers).toHaveProperty('x-ratelimit-limit');
    expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    expect(response.headers).toHaveProperty('x-ratelimit-reset');
  });

  it('should decrement remaining count with each request', async () => {
    const response1 = await request(app).get('/api/status');
    const remaining1 = parseInt(response1.headers['x-ratelimit-remaining'] || '0');
    
    const response2 = await request(app).get('/api/status');
    const remaining2 = parseInt(response2.headers['x-ratelimit-remaining'] || '0');
    
    expect(remaining2).toBe(remaining1 - 1);
  });

  // Note: Testing actual rate limit enforcement is complex in unit tests
  // as it requires making many rapid requests from the same IP
  // This would be better tested in integration tests
});
