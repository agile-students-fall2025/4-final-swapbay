import { expect } from 'chai';
import { addItemForUser, listPublicListings } from '../src/services/app-service.js';
import { store, setCurrentUser, getCurrentUser } from '../src/data/mockStore.js';
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

describe('Item creation', () => {
  beforeEach(() => resetStore());

 // Validates that I can’t save an item without a title
  it('reminds me to name my item before saving', () => {
    const user = getCurrentUser();
    expect(() => addItemForUser(user, { title: '' })).to.throw('Title is required');
  });


  // Confirms that when I add a new item, it starts as private
  it('adds my private item without showing it to everyone yet', () => {
    const user = getCurrentUser();
    const added = addItemForUser(user, { title: 'Gaming Chair', category: 'Furniture' });
    expect(added.ownerUsername).to.equal(user.username);
    expect(added.status).to.equal('private');

    const publicListings = listPublicListings({}, user.username);
    expect(publicListings.some((item) => item.id === added.id)).to.equal(false);
  });


  // Ensures I don’t see my own listings while browsing the public feed
  it('respects whichever account is currently active', () => {
    const other = store.users[2];
    setCurrentUser(other.username);
    const listings = listPublicListings({}, other.username);
    expect(listings.every((item) => item.ownerUsername !== other.username)).to.equal(true);
  });
});
