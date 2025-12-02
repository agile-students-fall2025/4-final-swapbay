import { expect } from 'chai';
import {
  createOfferForListing,
  cancelOfferForUser,
  getListingOffers,
  serializeOffer,
  addItemForUser,
} from '../src/services/app-service.js';
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

describe('Offers service', () => {
  beforeEach(() => resetStore());

  // Makes sure I can’t bid on hidden listings or on my own posts
  it('stops me from making offers on blocked or personal listings', () => {
    const buyer = store.users[0];
    const unavailable = store.items.find((item) => item.status !== 'public');
    expect(() => createOfferForListing(buyer, { listingId: unavailable.id, offerType: 'money', amount: 10 }))
      .to.throw('Listing not available');

    const ownListing = store.items.find((item) => item.ownerUsername === buyer.username && item.status === 'public');
    expect(() => createOfferForListing(buyer, { listingId: ownListing.id, offerType: 'money', amount: 15 }))
      .to.throw('Cannot make an offer on your own listing.');
  });

  // Prevents me from offering an item that isn’t actually mine
  it('won’t let me swap with someone else’s item', () => {
    const buyer = store.users[1];
    const listing = store.items.find((item) => item.status === 'public' && item.ownerUsername !== buyer.username);
    const otherItem = store.items.find((item) => item.ownerUsername !== buyer.username && item.id !== listing.id);
    expect(() => createOfferForListing(buyer, {
      listingId: listing.id,
      offerType: 'swap',
      myItemId: otherItem.id,
    })).to.throw('You do not own the swap item.');
  });

  // Walks through making a swap + cash offer, seeing it in the listing, then canceling it
  it('records a swap + cash offer and lets me cancel it later', () => {
    const buyer = store.users[2];
    const listing = store.items.find((item) => item.status === 'public' && item.ownerUsername !== buyer.username);
    const swapSource = store.items.find(
      (item) => item.ownerUsername === buyer.username && item.status !== 'public',
    ) || addItemForUser(buyer, { title: 'Laptop', category: 'Electronics' });

    const offer = createOfferForListing(buyer, {
      listingId: listing.id,
      offerType: 'both',
      amount: 120,
      myItemId: swapSource.id,
    });
    expect(offer.offeredFor).to.include(swapSource.title);
    expect(offer.offeredFor).to.include('$120');

    const offers = getListingOffers(listing.id);
    expect(offers.some((entry) => entry.id === offer.id)).to.equal(true);

    const serialized = serializeOffer({ ...offer, listingId: 99999 });
    expect(serialized.target.title).to.equal(offer.listingTitle);

    const canceled = cancelOfferForUser(buyer, offer.id);
    expect(canceled.status).to.equal('Canceled');
  });

  // Keeps only my most recent offer per listing so sellers don’t get duplicates from me
  it('keeps just the newest offer from each buyer on a listing', () => {
    const buyer = store.users[3];
    const listing = store.items.find((item) => item.status === 'public' && item.ownerUsername !== buyer.username);
    const first = createOfferForListing(buyer, { listingId: listing.id, offerType: 'money', amount: 50 });
    const second = createOfferForListing(buyer, { listingId: listing.id, offerType: 'money', amount: 80 });
    const listingOffers = store.offers.filter(
      (entry) => entry.listingId === listing.id && entry.buyerUsername === buyer.username,
    );
    expect(listingOffers).to.have.lengthOf(1);
    expect(listingOffers[0].amount).to.equal(80);
  });
});
