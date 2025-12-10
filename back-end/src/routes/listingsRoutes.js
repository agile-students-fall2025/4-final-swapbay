import express from 'express';
import { Item, Offer } from '../models/index.js';
import { toListing, toOffer } from '../utils/serializers.js';
import { authRequired, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  const { search, category, offerType, condition } = req.query;
  const filters = { status: 'public', available: true };

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) filters.category = category;
  if (condition) filters.condition = condition;
  if (offerType && offerType !== 'all') filters.offerType = offerType;
  if (req.user) filters.owner = { $ne: req.user._id };

  const items = await Item.find(filters)
    .populate('owner', 'username name photo')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    items: items.map((item) => toListing(item, req.user?.username)),
  });
});

router.get('/:id', optionalAuth, async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('owner', 'username name photo')
    .lean();
  if (!item) return res.status(404).json({ message: 'Listing not found' });

  const isOwner = req.user && req.user._id.equals(item.owner._id);
  if (item.status !== 'public' && !isOwner) {
    return res.status(403).json({ message: 'You do not have access to this item.' });
  }

  res.json({ item: toListing(item, req.user?.username) });
});

router.get('/:id/offers', authRequired, async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('owner', 'username name photo')
    .lean();
  if (!item) return res.status(404).json({ message: 'Listing not found' });

  if (!item.owner?._id?.equals(req.user._id)) {
    return res.status(403).json({ message: 'You do not have access to this item.' });
  }

  const offers = await Offer.find({ listing: item._id })
    .populate('listing')
    .populate('seller', 'username name photo')
    .populate('buyer', 'username name photo')
    .populate('myItem')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    item: toListing(item, req.user?.username),
    offers: offers.map((offer) => toOffer(offer, req.user?.username)),
  });
});

export default router;
