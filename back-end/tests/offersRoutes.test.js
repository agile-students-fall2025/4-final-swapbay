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

describe('Offers routes', () => {
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

  // Ensures I can review people bidding on my stuff and see my own offers
  it('shows my incoming and outgoing offers after I sign in', async () => {
    await loginAs('demo@swapbay.com', 'password123');

    const incoming = await fetch(`${baseURL}/api/offers/incoming`);
    const incomingBody = await incoming.json();
    expect(incoming.status).to.equal(200);
    expect(incomingBody.offers.length).to.be.greaterThan(0);

    const outgoing = await fetch(`${baseURL}/api/offers/outgoing`);
    const outgoingBody = await outgoing.json();
    expect(outgoingBody.offers.some((offer) => offer.buyerUsername === 'swapdemo')).to.equal(true);
  });

  // Walks through making an offer then cancelling it from the offers screen
  it('lets me place a new offer and cancel it if I change my mind', async () => {
    await loginAs('hailemariam@swapbay.com');
    const createResponse = await jsonRequest('/api/offers', 'POST', {
      listingId: 104,
      offerType: 'money',
      amount: 275,
    });
    const createBody = await createResponse.json();
    expect(createResponse.status).to.equal(201);
    const offerId = createBody.offer.id;

    const cancelResponse = await jsonRequest(`/api/offers/${offerId}/cancel`, 'POST');
    const cancelBody = await cancelResponse.json();
    expect(cancelResponse.status).to.equal(200);
    expect(cancelBody.offer.status).to.equal('Canceled');
  });

  // Confirms sellers can accept offers and the listing updates accordingly
  it('lets me accept an offer and retires the listing afterwards', async () => {
    await loginAs('demo@swapbay.com', 'password123');
    const acceptResponse = await jsonRequest('/api/offers/301/accept', 'POST', { reason: 'sold on campus' });
    const acceptBody = await acceptResponse.json();
    expect(acceptResponse.status).to.equal(200);
    expect(acceptBody.offer.status).to.equal('Accepted');
    expect(acceptBody.listing.status).to.equal('private');
  });

  // Allows me to delete a completed offer from my own history
  it('lets me delete my own offer history entry', async () => {
    await loginAs('demo@swapbay.com', 'password123');
    const deleteResponse = await fetch(`${baseURL}/api/offers/8002`, { method: 'DELETE' });
    const deleteBody = await deleteResponse.json();
    expect(deleteResponse.status).to.equal(200);
    expect(deleteBody.message).to.equal('Offer removed');
    expect(store.offers.some((offer) => offer.id === 8002)).to.equal(false);
  });
});
