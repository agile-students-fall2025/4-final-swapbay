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

describe('Listings routes', () => {
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

  const getJson = async (path) => {
    const response = await fetch(`${baseURL}${path}`);
    const body = await response.json();
    return { response, body };
  };

  // Confirms browsing listings hides my own gear while respecting filters
  it('lets me explore swap-ready deals without showing my items', async () => {
    await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@swapbay.com', password: 'password123' }),
    });
    const { response, body } = await getJson('/api/listings?offerType=swap');
    expect(response.status).to.equal(200);
    expect(body.items.every((item) => item.ownerUsername !== 'swapdemo')).to.equal(true);
    expect(body.items.every((item) => item.offerType === 'swap')).to.equal(true);
  });

  // Makes sure I can open public listings but get blocked from hidden drafts
  it('shows me public listing details and protects private drafts', async () => {
    await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hailemariam@swapbay.com', password: 'secret' }),
    });

    const publicView = await getJson('/api/listings/103');
    expect(publicView.response.status).to.equal(200);
    expect(publicView.body.item.title).to.equal('Gaming Laptop');

    const privateView = await getJson('/api/listings/101');
    expect(privateView.response.status).to.equal(403);
    expect(privateView.body.message).to.equal('You do not have access to this item.');
  });

  // Shows the offers and listing info when I peek at interested buyers
  it('lists interested buyers when I view offers for my listing', async () => {
    await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@swapbay.com', password: 'password123' }),
    });
    const { response, body } = await getJson('/api/listings/102/offers');
    expect(response.status).to.equal(200);
    expect(body.item.id).to.equal(102);
    expect(body.offers).to.be.an('array').that.is.not.empty;
  });
});
