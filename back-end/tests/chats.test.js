import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

async function registerUser(label) {
  const unique = `${label}${Date.now()}`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: `${label} user`,
      username: unique,
      email: `${unique}@example.com`,
      password: 'password123',
    })
    .expect(201);
  return { token: res.body.token, user: res.body.user };
}

describe('Chats service', () => {
  it('tracks unread counts when messages are sent', async () => {
    const alice = await registerUser('alice-chat');
    const bob = await registerUser('bob-chat');

    await request(app)
      .post(`/api/chats/${bob.user.username}/messages`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ text: 'Ping' })
      .expect(201);

    const listRes = await request(app)
      .get('/api/chats')
      .set('Authorization', `Bearer ${bob.token}`)
      .expect(200);

    expect(listRes.body.unreadTotal).to.equal(1);
    expect(listRes.body.chats[0].unreadCount).to.equal(1);

    await request(app)
      .get(`/api/chats/${alice.user.username}`)
      .set('Authorization', `Bearer ${bob.token}`)
      .expect(200);

    const afterRes = await request(app)
      .get('/api/chats')
      .set('Authorization', `Bearer ${bob.token}`)
      .expect(200);
    expect(afterRes.body.unreadTotal).to.equal(0);
  });
});
