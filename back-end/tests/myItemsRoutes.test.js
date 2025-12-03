import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

async function registerUser(overrides = {}) {
  const unique = Date.now();
  const payload = {
    name: 'Item Owner',
    username: `owner${unique}`,
    email: `owner${unique}@example.com`,
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload).expect(201);
  return { token: res.body.token, user: res.body.user };
}

describe('My items routes', () => {
  it('creates, lists, and deletes items for the authenticated user', async () => {
    const { token } = await registerUser();

    const createRes = await request(app)
      .post('/api/me/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Vintage Camera',
        category: 'Electronics',
        condition: 'Good',
        description: 'Works well',
        image: 'https://picsum.photos/seed/camera/200/200',
      })
      .expect(201);

    expect(createRes.body.item).to.include({ title: 'Vintage Camera', status: 'private' });

    const itemId = createRes.body.item.id;

    const listRes = await request(app)
      .get('/api/me/items')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listRes.body.items).to.have.length(1);

    await request(app)
      .post(`/api/me/items/${itemId}/listing`)
      .set('Authorization', `Bearer ${token}`)
      .send({ offerType: 'money' })
      .expect(200);

    await request(app)
      .post(`/api/me/items/${itemId}/unlist`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app)
      .delete(`/api/me/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
