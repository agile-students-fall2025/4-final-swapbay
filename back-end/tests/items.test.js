import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

async function registerUser() {
  const unique = Date.now();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Item Owner',
      username: `owner${unique}`,
      email: `owner${unique}@example.com`,
      password: 'password123',
    })
    .expect(201);
  return res.body.token;
}

describe('Item creation', () => {
  it('validates required title', async () => {
    const token = await registerUser();
    const res = await request(app)
      .post('/api/me/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' })
      .expect(400);
    expect(res.body.message).to.match(/Title is required/i);
  });

  it('creates a private item owned by the user', async () => {
    const token = await registerUser();
    const res = await request(app)
      .post('/api/me/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Gaming Chair', category: 'Furniture' })
      .expect(201);

    expect(res.body.item.status).to.equal('private');
  });
});
