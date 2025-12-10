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

describe('Chats routes', () => {
  it('sends and reads messages between users', async () => {
    const alice = await registerUser('alice');
    const bob = await registerUser('bob');

    const sendRes = await request(app)
      .post(`/api/chats/${bob.user.username}/messages`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ text: 'Hello Bob!' })
      .expect(201);

    expect(sendRes.body.message.text).to.equal('Hello Bob!');

    const listRes = await request(app)
      .get('/api/chats')
      .set('Authorization', `Bearer ${bob.token}`)
      .expect(200);
    expect(listRes.body.chats[0].username).to.equal(alice.user.username);

    const threadRes = await request(app)
      .get(`/api/chats/${alice.user.username}`)
      .set('Authorization', `Bearer ${bob.token}`)
      .expect(200);
    expect(threadRes.body.chat.messages).to.have.length(1);
  });
});
