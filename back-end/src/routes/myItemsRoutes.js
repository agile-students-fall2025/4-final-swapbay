import express from 'express';
import { store, getCurrentUser, findItemById } from '../data/mockStore.js';
import { addItemForUser } from '../services/app-service.js';

const router = express.Router();

router.use((req, res, next) => {
  const user = getCurrentUser();
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  req.currentUser = user;
  next();
});

router.get('/', (req, res) => {
  const items = store.items.filter((item) => item.ownerUsername === req.currentUser.username);
  res.json({ items });
});

router.post('/', (req, res) => {
  try {
    const item = addItemForUser(req.currentUser, req.body);
    res.status(201).json({ item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

function ensureOwner(item, username) {
  return item.ownerUsername === username;
}

function removeOutgoingOffersUsing(itemId) {
  store.offers = store.offers.filter((offer) => offer.myItemId !== itemId);
}

function removeListingOffers(itemId) {
  store.offers = store.offers.filter((offer) => offer.listingId !== itemId);
}

function ensureDraftState(item) {
  item.status = 'private';
  item.offerType = 'both';
  item.unavailableReason = null;
}

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const item = findItemById(id);
  if (!item || !ensureOwner(item, req.currentUser.username)) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const isListed = item.status === 'public';
  const isOffered = store.offers.some(
    (offer) => offer.myItemId === item.id && ['Pending', 'Accepted'].includes(offer.status),
  );

  if (isListed || isOffered) {
    return res.status(409).json({ message: 'Cannot edit an item that is listed or included in active offers.' });
  }

  const { title, category, condition, description, image } = req.body;
  if (typeof title === 'string') item.title = title;
  if (typeof category === 'string') item.category = category;
  if (typeof condition === 'string') item.condition = condition;
  if (typeof description === 'string') item.description = description;
  if (typeof image === 'string') item.image = image;

  res.json({ item });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const item = findItemById(id);
  if (!item || !ensureOwner(item, req.currentUser.username)) {
    return res.status(404).json({ message: 'Item not found' });
  }

  store.items = store.items.filter((candidate) => candidate.id !== item.id);
  store.offers = store.offers.filter(
    (offer) => offer.listingId !== item.id && offer.myItemId !== item.id,
  );

  res.json({ message: 'Item deleted' });
});

router.post('/:id/listing', (req, res) => {
  const { id } = req.params;
  const { offerType = 'both' } = req.body;
  const item = findItemById(id);
  if (!item || !ensureOwner(item, req.currentUser.username)) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (!item.available) {
    return res.status(400).json({ message: 'Unavailable items cannot be listed.' });
  }

  item.status = 'public';
  item.offerType = offerType;
  res.json({ item });
});

router.post('/:id/unlist', (req, res) => {
  const { id } = req.params;
  const item = findItemById(id);
  if (!item || !ensureOwner(item, req.currentUser.username)) {
    return res.status(404).json({ message: 'Item not found' });
  }
  ensureDraftState(item);
  removeListingOffers(item.id);
  removeOutgoingOffersUsing(item.id);
  res.json({ item });
});

router.post('/:id/availability', (req, res) => {
  const { id } = req.params;
  const { available, reason = null } = req.body;
  const item = findItemById(id);
  if (!item || !ensureOwner(item, req.currentUser.username)) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (typeof available !== 'boolean') {
    return res.status(400).json({ message: 'available must be boolean' });
  }

  item.available = available;
  if (!available) {
    item.status = 'private';
    item.unavailableReason = reason || 'sold';
    removeListingOffers(item.id);
    removeOutgoingOffersUsing(item.id);
  } else {
    ensureDraftState(item);
    removeListingOffers(item.id);
    removeOutgoingOffersUsing(item.id);
  }

  res.json({ item });
});

export default router;
