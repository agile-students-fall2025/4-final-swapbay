import { mockUsers } from './mockUsers.js';
import { mockItems } from './mockItems.js';
import { mockOffers } from './mockOffers.js';
import { mockChats } from './mockChats.js';

const store = {
  users: [...mockUsers],
  items: [...mockItems],
  offers: [...mockOffers],
  chats: [...mockChats],
  currentUser: null,
};

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...publicProfile } = user;
  return publicProfile;
}

function getCurrentUser() {
  return store.users.find((user) => user.username === store.currentUser) || null;
}

function setCurrentUser(username) {
  if (store.users.some((user) => user.username === username)) {
    store.currentUser = username;
  }
}

function nextId(collectionName) {
  const collection = store[collectionName];
  if (!Array.isArray(collection)) return Date.now();
  const max = collection.reduce((acc, entry) => (entry.id > acc ? entry.id : acc), 0);
  return max + 1;
}

function findItemById(id) {
  return store.items.find((item) => item.id === Number(id));
}

function findOfferById(id) {
  return store.offers.find((offer) => offer.id === Number(id));
}

export {
  store,
  sanitizeUser,
  getCurrentUser,
  setCurrentUser,
  nextId,
  findItemById,
  findOfferById,
};
