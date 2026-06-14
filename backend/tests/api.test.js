const request = require('supertest');
const app = require('../app');

describe('API Endpoints', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/summary returns required fields', async () => {
    const res = await request(app).get('/api/summary');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total_net_revenue');
    expect(res.body.data).toHaveProperty('gross_profit_margin_pct');
    expect(res.body.data).toHaveProperty('top_region');
  });

  test('GET /api/products returns array', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/trends returns monthly data', async () => {
    const res = await request(app).get('/api/trends');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('month');
    expect(res.body.data[0]).toHaveProperty('net_revenue');
  });

  test('POST /api/chat requires question field', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({});
    expect(res.statusCode).toBe(400);
  });
});