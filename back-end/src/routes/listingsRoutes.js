import express from 'express';
import { getCurrentUser, findItemById } from '../data/mockStore.js';
import { listPublicListings, getListingOffers, serializeListing } from '../services/app-service.js';

const router = express.Router();

router.get('/', (req, res) => {
  const currentUser = getCurrentUser();
  const items = listPublicListings(req.query, currentUser?.username);
  res.json({ items });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = findItemById(id);
  const currentUser = getCurrentUser();

  if (!item) return res.status(404).json({ message: 'Listing not found' });
  const isOwner = currentUser && currentUser.username === item.ownerUsername;
  if (item.status !== 'public' && !isOwner) {
    return res.status(403).json({ message: 'You do not have access to this item.' });
  }

  res.json({ item: serializeListing(item, currentUser?.username) });
});

router.get('/:id/offers', (req, res) => {
  const { id } = req.params;
  const item = findItemById(id);
  if (!item) return res.status(404).json({ message: 'Listing not found' });

  const offers = getListingOffers(id);
  const currentUser = getCurrentUser();
  res.json({ item: serializeListing(item, currentUser?.username), offers });
});

export default router;
