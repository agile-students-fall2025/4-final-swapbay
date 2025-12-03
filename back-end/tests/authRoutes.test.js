import { expect } from 'chai';
import app from '../src/app.js';
import { store } from '../src/data/mockStore.js';
import { mockUsers } from '../src/data/mockUsers.js';
import { mockItems } from '../src/data/mockItems.js';
import { mockOffers } from '../src/data/mockOffers.js';
import { mockChats } from '../src/data/mockChats.js';

const clone = (data) => JSON.parse(JSON.stringify(data));
const resetStore = () => {
  store.users = clone(mockUsers);
  store.items = clone(mockItems);
  store.offers = clone(mockOffers);
  store.chats = clone(mockChats);
  store.currentUser = null;
};

const jsonRequest = (url, method, payload) => fetch(url, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: payload ? JSON.stringify(payload) : undefined,
});

describe('Auth routes', () => {
  let server;
  let baseURL;

  before((done) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseURL = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after(() => server.close());

  beforeEach(() => resetStore());

  // Happy path sign-in verifies the API returns sanitized user info
  it('lets me sign in with the right email and password', async () => {
    const response = await jsonRequest(`${baseURL}/api/auth/login`, 'POST', {
      email: 'demo@swapbay.com',
      password: 'password123',
    });
    const body = await response.json();
    expect(response.status).to.equal(200);
    expect(body.user.email).to.equal('demo@swapbay.com');
    expect(body.user).to.not.have.property('password');
  });

  // Invalid credentials give a clear friendly error
  it('tells me when the password is wrong', async () => {
    const response = await jsonRequest(`${baseURL}/api/auth/login`, 'POST', {
      email: 'demo@swapbay.com',
      password: 'not-correct',
    });
    const body = await response.json();
    expect(response.status).to.equal(401);
    expect(body.message).to.equal('Invalid email or password.');
  });

  // Checks the register endpoint allows a new profile and blocks duplicates
  it('lets me create a new account and blocks repeats', async () => {
    const registerResponse = await jsonRequest(`${baseURL}/api/auth/register`, 'POST', {
      name: 'Test User',
      username: 'freshuser',
      email: 'fresh@swapbay.com',
      password: 'secret',
    });
    const registerBody = await registerResponse.json();
    expect(registerResponse.status).to.equal(201);
    expect(registerBody.user.username).to.equal('freshuser');

    const duplicateResponse = await jsonRequest(`${baseURL}/api/auth/register`, 'POST', {
      name: 'Another',
      username: 'freshuser',
      email: 'fresh@swapbay.com',
      password: 'secret',
    });
    const duplicateBody = await duplicateResponse.json();
    expect(duplicateResponse.status).to.equal(409);
    expect(duplicateBody.message).to.equal('Username or email already exists.');
  });

  // Confirms /me reflects login state and protects when logged out
  it('shows my profile after login and blocks when logged out', async () => {
    await jsonRequest(`${baseURL}/api/auth/login`, 'POST', {
      email: 'demo@swapbay.com',
      password: 'password123',
    });
    const meResponse = await fetch(`${baseURL}/api/auth/me`);
    const meBody = await meResponse.json();
    expect(meResponse.status).to.equal(200);
    expect(meBody.user.email).to.equal('demo@swapbay.com');

    store.currentUser = null;
    const loggedOutResponse = await fetch(`${baseURL}/api/auth/me`);
    const loggedOutBody = await loggedOutResponse.json();
    expect(loggedOutResponse.status).to.equal(401);
    expect(loggedOutBody.message).to.equal('Not authenticated');
  });
  // Lets me tweak my profile and immediately see the updated info
  it('updates my profile details when I save changes', async () => {
    await jsonRequest(`${baseURL}/api/auth/login`, 'POST', {
      email: 'demo@swapbay.com',
      password: 'password123',
    });

    const updateResponse = await jsonRequest(`${baseURL}/api/auth/me`, 'PUT', {
      name: 'Swap Demo Updated',
      username: 'swapdemo',
      email: 'demo@swapbay.com',
      photo: 'https://picsum.photos/seed/updated/200/200',
    });
    const body = await updateResponse.json();
    expect(updateResponse.status).to.equal(200);
    expect(body.user.name).to.equal('Swap Demo Updated');
    expect(body.user.photo).to.include('updated');
  });

  // Allows me to delete my account and confirms the cleanup message
  it('removes my account when I confirm deletion', async () => {
    await jsonRequest(`${baseURL}/api/auth/login`, 'POST', {
      email: 'demo@swapbay.com',
      password: 'password123',
    });

    const deleteResponse = await fetch(`${baseURL}/api/auth/me`, { method: 'DELETE' });
    const body = await deleteResponse.json();
    expect(deleteResponse.status).to.equal(200);
    expect(body.message).to.equal('Account deleted');
    expect(store.users.some((user) => user.username === 'swapdemo')).to.equal(false);
  });
});