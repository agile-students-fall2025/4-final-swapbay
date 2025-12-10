import express from 'express';
import { body, validationResult } from 'express-validator';
import { Item, Offer } from '../models/index.js';
import { authRequired } from '../middleware/auth.js';
import { toListing } from '../utils/serializers.js';

const router = express.Router();

const itemRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').optional().isString(),
  body('condition').optional().isString(),
  body('description').optional().isString(),
  body('image').optional().isString(),
];

router.use(authRequired);

function isValidImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (value.startsWith('data:')) return false;
  if (value.length > 500) return false;
  return /^https?:\/\/.+/.test(value) || /^\/uploads\/.+/.test(value);
}

router.get('/', async (req, res) => {
  const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ items: items.map((item) => toListing({ ...item, owner: req.user }, req.user.username)) });
});

router.post('/', itemRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  if (req.body.image && !isValidImageUrl(req.body.image)) {
    return res.status(400).json({ message: 'Image must be a URL (http/https or /uploads/...) and under 500 chars.' });
  }
  const item = await Item.create({
    owner: req.user._id,
    title: req.body.title,
    category: req.body.category || 'Misc',
    condition: req.body.condition || 'Good',
    description: req.body.description || '',
    image: req.body.image || `https://picsum.photos/seed/${Date.now()}/600/400`,
    status: 'private',
    offerType: 'both',
    available: true,
  });
  const populated = { ...item.toObject(), owner: req.user };
  res.status(201).json({ item: toListing(populated, req.user.username) });
});

router.put('/:id', itemRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const item = await Item.findById(req.params.id);
  if (!item || !item.owner.equals(req.user._id)) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const isListed = item.status === 'public';
  const isOffered = await Offer.exists({
    myItem: item._id,
    status: { $in: ['Pending', 'Accepted'] },
  });

  if (isListed || isOffered) {
    return res.status(409).json({ message: 'Cannot edit an item that is listed or included in active offers.' });
  }

  const updates = {};
  ['title', 'category', 'condition', 'description', 'image'].forEach((field) => {
    if (typeof req.body[field] === 'string' && req.body[field].length > 0) {
      if (field === 'image' && !isValidImageUrl(req.body[field])) {
        return;
      }
      updates[field] = req.body[field];
    }
  });
  if (req.body.image && !isValidImageUrl(req.body.image)) {
    return res.status(400).json({ message: 'Image must be a URL (http/https or /uploads/...) and under 500 chars.' });
  }

  const updated = await Item.findByIdAndUpdate(item._id, updates, { new: true });
  const populated = { ...updated.toObject(), owner: req.user };
  res.json({ item: toListing(populated, req.user.username) });
});

router.delete('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item || !item.owner.equals(req.user._id)) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.status === 'public') {
    return res.status(400).json({ message: 'Listed items cannot be deleted. Unlist first.' });
  }
  if (!item.available || item.unavailableReason) {
    return res.status(400).json({ message: 'Sold or swapped items cannot be deleted.' });
  }

  await Offer.deleteMany({ $or: [{ listing: item._id }, { myItem: item._id }] });
  await Item.findByIdAndDelete(item._id);
  res.json({ message: 'Item deleted' });
});

router.post('/:id/listing', async (req, res) => {
  const { offerType = 'both' } = req.body;
  const item = await Item.findById(req.params.id);
  if (!item || !item.owner.equals(req.user._id)) {
    return res.status(404).json({ message: 'Item not found' });
  }
  if (!item.available) {
    return res.status(400).json({ message: 'Unavailable items cannot be listed.' });
  }
  item.status = 'public';
  item.offerType = offerType;
  await item.save();
  const populated = { ...item.toObject(), owner: req.user };
  res.json({ item: toListing(populated, req.user.username) });
});

router.post('/:id/unlist', async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item || !item.owner.equals(req.user._id)) {
    return res.status(404).json({ message: 'Item not found' });
  }
  item.status = 'private';
  item.offerType = 'both';
  item.unavailableReason = null;
  await Offer.updateMany({ listing: item._id }, { status: 'Rejected' });
  await Offer.updateMany({ myItem: item._id }, { status: 'Rejected' });
  await item.save();
  const populated = { ...item.toObject(), owner: req.user };
  res.json({ item: toListing(populated, req.user.username) });
});

router.post('/:id/availability', async (req, res) => {
  const { available, reason = null } = req.body;
  const item = await Item.findById(req.params.id);
  if (!item || !item.owner.equals(req.user._id)) {
    return res.status(404).json({ message: 'Item not found' });
  }
  if (typeof available !== 'boolean') {
    return res.status(400).json({ message: 'available must be boolean' });
  }

  item.available = available;
  if (!available) {
    item.status = 'private';
    item.unavailableReason = reason || 'sold';
    await Offer.deleteMany({ listing: item._id });
    await Offer.deleteMany({ myItem: item._id });
  } else {
    item.status = 'private';
    item.unavailableReason = null;
    await Offer.deleteMany({ listing: item._id });
    await Offer.deleteMany({ myItem: item._id });
  }
  await item.save();
  const populated = { ...item.toObject(), owner: req.user };
  res.json({ item: toListing(populated, req.user.username) });
});

export default router;
