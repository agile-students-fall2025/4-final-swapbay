import { expect } from 'chai';
import {
  store,
  sanitizeUser,
  getCurrentUser,
  setCurrentUser,
  nextId,
  findItemById,
  findOfferById,
} from '../src/data/mockStore.js';
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
  store.currentUser = store.users[0]?.username || null;
};

describe('mockStore utilities', () => {
  beforeEach(() => resetStore());

  // Shows that user profiles returned to the app never include passwords
  it('removes passwords when sharing user info', () => {
    const rawUser = store.users[0];
    const sanitized = sanitizeUser(rawUser);
    expect(sanitized).to.not.have.property('password');
    expect(sanitized.username).to.equal(rawUser.username);
  });

  // Keeps the most recent successful login active even if a fake name is provided later
  it('keeps the latest valid person logged in', () => {
    const validUser = store.users[1].username;
    setCurrentUser(validUser);
    expect(getCurrentUser().username).to.equal(validUser);
    setCurrentUser('unknown-user');
    expect(getCurrentUser().username).to.equal(validUser);
  });

  // Generates straightforward incrementing ids for the main collections
  it('hands out the next number for saved collections', () => {
    const previousMax = Math.max(...store.items.map((item) => item.id));
    expect(nextId('items')).to.equal(previousMax + 1);
  });

  // Falls back to timestamps for ad-hoc collections
  it('creates a timestamp-based id when the list is unknown', () => {
    const generated = nextId('nonexistent');
    expect(generated).to.be.a('number');
  });

  // Lets us find saved items/offers no matter if we pass numbers or strings
  it('looks up items and offers regardless of id type', () => {
    const item = store.items[0];
    expect(findItemById(String(item.id))).to.include({ id: item.id });
    const offer = store.offers[0];
    expect(findOfferById(offer.id)).to.include({ id: offer.id });
    expect(findOfferById(-1)).to.equal(undefined);
  });
});
