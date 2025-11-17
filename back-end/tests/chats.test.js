import { expect } from 'chai';
import { getChatsSummary } from '../src/services/app-service.js';
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

describe('Chats summary', () => {
  beforeEach(() => resetStore());

  // Confirms each conversation shows who it is with and the latest message
  it('summarizes my inbox with the latest snippets', () => {
    const owner = store.users[0].username;
    const summary = getChatsSummary(owner);
    expect(summary).to.be.an('array').that.is.not.empty;
    expect(summary[0]).to.include.keys('username', 'lastMessage', 'totalMessages');
  });

  // Shows blank chats with “no messages yet” so the UI can display placeholders
  it('shows empty threads with a clear zero-message state', () => {
    store.chats.push({
      ownerUsername: store.users[1].username,
      username: 'newbuyer',
      messages: [],
    });
    const summary = getChatsSummary(store.users[1].username);
    const entry = summary.find((chat) => chat.username === 'newbuyer');
    expect(entry.lastMessage).to.equal(null);
    expect(entry.totalMessages).to.equal(0);
  });
});
