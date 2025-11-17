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

describe('Chats routes', () => {
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

  const jsonRequest = async (path, method, payload) => fetch(`${baseURL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const loginAs = (email, password = 'secret') => jsonRequest('/api/auth/login', 'POST', { email, password });

  // Lets me read my inbox with sender names and snippets
  it('lists all of my active chat threads', async () => {
    await loginAs('demo@swapbay.com', 'password123');
    const response = await fetch(`${baseURL}/api/chats`);
    const body = await response.json();
    expect(response.status).to.equal(200);
    expect(body.chats.length).to.be.greaterThan(0);
    expect(body.chats[0]).to.include.keys('username', 'lastMessage', 'totalMessages');
  });

  // Automatically creates a thread when I open a conversation
  it('opens or creates a conversation when I click a user', async () => {
    await loginAs('demo@swapbay.com', 'password123');
    const response = await fetch(`${baseURL}/api/chats/krishiv`);
    const body = await response.json();
    expect(response.status).to.equal(200);
    expect(body.chat.username).to.equal('krishiv');
    expect(body.chat.ownerUsername).to.equal('swapdemo');
  });

  // Sends a message and mirrors it for the recipient
  it('sends a message and mirrors it in both inboxes', async () => {
    await loginAs('demo@swapbay.com', 'password123');
    const sendResponse = await jsonRequest('/api/chats/hailemariam/messages', 'POST', { text: 'Hey there!' });
    const sendBody = await sendResponse.json();
    expect(sendResponse.status).to.equal(201);
    expect(sendBody.message.text).to.equal('Hey there!');

    const ownerThread = store.chats.find(
      (chat) => chat.ownerUsername === 'swapdemo' && chat.username === 'hailemariam',
    );
    const contactThread = store.chats.find(
      (chat) => chat.ownerUsername === 'hailemariam' && chat.username === 'swapdemo',
    );
    expect(ownerThread.messages.at(-1).sender).to.equal('me');
    expect(contactThread.messages.at(-1).sender).to.equal('them');
  });
});
