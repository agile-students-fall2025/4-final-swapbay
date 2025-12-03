import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

function unique() {
  return Date.now().toString();
}

describe('Auth routes', () => {
  it('registers a new user and returns token', async () => {
    const email = `user${unique()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        username: `tester${unique()}`,
        email,
        password: 'password123',
      })
      .expect(201);

    expect(res.body).to.have.property('token');
    expect(res.body.user).to.include.keys(['id', 'username', 'email']);
  });

  it('logs in and returns the current user profile', async () => {
    const email = `login${unique()}@example.com`;
    const password = 'password123';
    const username = `login${unique()}`;

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        username,
        email,
        password,
      })
      .expect(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginRes.body).to.have.property('token');

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .expect(200);

    expect(meRes.body.user).to.include({ email: email.toLowerCase() });
  });
});
