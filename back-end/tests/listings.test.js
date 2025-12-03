import { expect } from 'chai';
import { listPublicListings, serializeListing } from '../src/services/app-service.js';
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
  store.currentUser = store.users[0]?.username || null;
};

describe('Listings service', () => {
  beforeEach(() => resetStore());

  // Makes sure I never see my own gear when filtering swap-ready used items
  it('keeps my items out when I browse used swap deals', () => {
    const viewer = store.users[1];
    const listings = listPublicListings({ condition: 'used', offerType: 'swap' }, viewer.username);
    expect(listings.every((item) => item.ownerUsername !== viewer.username)).to.equal(true);
    expect(listings.every((item) => item.condition.toLowerCase() === 'used')).to.equal(true);
    expect(listings.every((item) => item.offerType === 'swap')).to.equal(true);
  });

  // Confirms the serialized card includes the seller info and ownership flag
  it('shows seller details when I open a listing', () => {
    const sample = store.items.find((item) => item.status === 'public');
    const serialized = serializeListing(sample, sample.ownerUsername);
    expect(serialized).to.include.keys('ownerName', 'ownerPhoto');
    expect(serialized.isMine).to.equal(true);
  });
});
