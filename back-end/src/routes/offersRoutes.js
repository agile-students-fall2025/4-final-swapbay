import express from 'express';
import { store, getCurrentUser, findOfferById, findItemById } from '../data/mockStore.js';
import { createOfferForListing, cancelOfferForUser, serializeOffer } from '../services/app-service.js';

const router = express.Router();

router.use((req, res, next) => {
  const user = getCurrentUser();
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  req.currentUser = user;
  next();
});

function sortByNewest(a, b) {
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

function removeOffersUsingItem(itemId) {
  store.offers = store.offers.filter((offer) => offer.myItemId !== Number(itemId));
}

router.get('/incoming', (req, res) => {
  const offers = store.offers
    .filter((offer) => offer.sellerUsername === req.currentUser.username)
    .sort(sortByNewest)
    .map((offer) => serializeOffer(offer, req.currentUser.username));
  res.json({ offers });
});

router.get('/outgoing', (req, res) => {
  const offers = store.offers
    .filter((offer) => offer.buyerUsername === req.currentUser.username)
    .sort(sortByNewest)
    .map((offer) => serializeOffer(offer, req.currentUser.username));
  res.json({ offers });
});

router.get('/:id', (req, res) => {
  const offer = findOfferById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  const isAuthorized = offer.sellerUsername === req.currentUser.username
    || offer.buyerUsername === req.currentUser.username;
  if (!isAuthorized) return res.status(403).json({ message: 'Forbidden' });
  res.json({ offer: serializeOffer(offer, req.currentUser.username) });
});

router.post('/', (req, res) => {
  if (!req.body.listingId) {
    return res.status(400).json({ message: 'listingId is required' });
  }
  try {
    const offer = createOfferForListing(req.currentUser, req.body);
    res.status(201).json({ offer: serializeOffer(offer, req.currentUser.username) });
  } catch (error) {
    const status = error.message.includes('Listing not available') ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
});

function updateStatus(offer, status) {
  offer.status = status;
  return offer;
}

router.post('/:id/cancel', (req, res) => {
  try {
    const offer = cancelOfferForUser(req.currentUser, req.params.id);
    res.json({ offer: serializeOffer(offer, req.currentUser.username) });
  } catch (error) {
    const status = error.message === 'Offer not found' ? 404 : 403;
    res.status(status).json({ message: error.message });
  }
});

router.post('/:id/reject', (req, res) => {
  const offer = findOfferById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (offer.sellerUsername !== req.currentUser.username) {
    return res.status(403).json({ message: 'Cannot reject this offer.' });
  }
  const updated = updateStatus(offer, 'Rejected');
  res.json({ offer: serializeOffer(updated, req.currentUser.username) });
});

router.post('/:id/accept', (req, res) => {
  const offer = findOfferById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (offer.sellerUsername !== req.currentUser.username) {
    return res.status(403).json({ message: 'Cannot accept this offer.' });
  }

  const listing = findItemById(offer.listingId);
  if (listing) {
    listing.available = false;
    listing.status = 'private';
    listing.unavailableReason = req.body?.reason || 'sold';
  }

  updateStatus(offer, 'Accepted');
  store.offers.forEach((candidate) => {
    if (candidate.listingId === offer.listingId && candidate.id !== offer.id) {
      candidate.status = 'Rejected';
    }
  });
  if (listing) {
    removeOffersUsingItem(listing.id);
  }

  if (offer.myItemId) {
    const swapItem = findItemById(offer.myItemId);
    if (swapItem) {
      swapItem.available = false;
      swapItem.status = 'private';
      swapItem.unavailableReason = 'swapped';
    }
    store.offers = store.offers.filter(
      (candidate) => candidate.id === offer.id || candidate.myItemId !== offer.myItemId,
    );
  }

  res.json({ offer: serializeOffer(offer, req.currentUser.username), listing });
});

router.delete('/:id', (req, res) => {
  const offer = findOfferById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (offer.buyerUsername !== req.currentUser.username) {
    return res.status(403).json({ message: 'Cannot delete this offer.' });
  }
  store.offers = store.offers.filter((candidate) => candidate.id !== offer.id);
  res.json({ message: 'Offer removed' });
});

export default router;
