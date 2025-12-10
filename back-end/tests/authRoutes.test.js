import request from 'supertest';
import { expect } from 'chai';
import crypto from 'crypto';
import app from '../src/app.js';
import { User } from '../src/models/index.js';

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

  it('issues a reset token on forgot-password and stores expiry', async () => {
    const email = `forgot${unique()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Forgot User',
        username: `forgot${unique()}`,
        email,
        password: 'password123',
      })
      .expect(201);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email })
      .expect(200);

    expect(res.body.message).to.match(/reset link sent/i);

    const user = await User.findOne({ email: email.toLowerCase() });
    expect(user.resetPasswordToken).to.be.a('string');
    expect(user.resetPasswordExpires).to.be.instanceOf(Date);
    expect(user.resetPasswordExpires.getTime()).to.be.greaterThan(Date.now());
  });

  it('rejects forgot-password when email is not found', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: `missing${unique()}@example.com` })
      .expect(404);

    expect(res.body.message).to.match(/email not found/i);
  });

  it('resets password with valid token and clears the token', async () => {
    const email = `reset${unique()}@example.com`;
    const username = `reset${unique()}`;
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Reset User',
        username,
        email,
        password: 'oldpassword',
      })
      .expect(201);

    const rawToken = 'resettoken123';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await User.findOne({ email: email.toLowerCase() });
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'newpassword123' })
      .expect(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'newpassword123' })
      .expect(200);

    expect(loginRes.body).to.have.property('token');

    const updatedUser = await User.findOne({ email: email.toLowerCase() });
    expect(updatedUser.resetPasswordToken).to.be.null;
    expect(updatedUser.resetPasswordExpires).to.be.null;
  });
});
