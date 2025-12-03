import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

describe('Health check', () => {
  it('returns service status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).to.include({ status: 'ok', service: 'swapbay-backend' });
  });
});
