import { expect } from 'chai';
import app from '../src/app.js';
import { store } from '../src/data/mockStore.js';
import { mockUsers } from '../src/data/mockUsers.js';
import { mockItems } from '../src/data/mockItems.js';
import { mockOffers } from '../src/data/mockOffers.js';
import { mockChats } from '../src/data/mockChats.js';
// for testing purposes
const clone = (data) => JSON.parse(JSON.stringify(data));
const resetStore = () => {
  store.users = clone(mockUsers);
  store.items = clone(mockItems);
  store.offers = clone(mockOffers);
  store.chats = clone(mockChats);
  store.currentUser = null;
};

describe('My items routes', () => {
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

  // make sure the dashboard only lists the things that belong to me
  // Ensures the dashboard only lists the things that belong to me
  it('shows only my inventory on the “My Items” page', async () => {
    await loginAs('demo@swapbay.com', 'password123');
    const response = await fetch(`${baseURL}/api/me/items`);
    const body = await response.json();
    expect(response.status).to.equal(200);
    expect(body.items.every((item) => item.ownerUsername === 'swapdemo')).to.equal(true);
  });

  // Adds a new item to my private inventory, then publishes and unlists it
  // Walks through adding a new item, listing it, and unlisting back to draft
  it('lets me add gear, publish it, and pull it back down', async () => {
    await loginAs('demo@swapbay.com', 'password123');
    const createRes = await jsonRequest('/api/me/items', 'POST', {
      title: 'Desk Lamp',
      category: 'Home',
      condition: 'Like New',
    });
    const createBody = await createRes.json();
    expect(createRes.status).to.equal(201);
    const itemId = createBody.item.id;

    const listRes = await jsonRequest(`/api/me/items/${itemId}/listing`, 'POST', { offerType: 'money' });
    const listBody = await listRes.json();
    expect(listRes.status).to.equal(200);
    expect(listBody.item.status).to.equal('public');

    const unlistRes = await jsonRequest(`/api/me/items/${itemId}/unlist`, 'POST');
    const unlistBody = await unlistRes.json();
    expect(unlistRes.status).to.equal(200);
    expect(unlistBody.item.status).to.equal('private');
  });





  // add to private inventory   
  // Protects me from editing items that are already live in the marketplace
  it('prevents editing when an item is already listed', async () => {
    await loginAs('demo@swapbay.com', 'password123');
    const editRes = await jsonRequest('/api/me/items/102', 'PUT', { title: 'Updated Title' });
    const editBody = await editRes.json();
    expect(editRes.status).to.equal(409);
    expect(editBody.message).to.equal('Cannot edit an item that is listed or included in active offers.');
  });
});
// this is 