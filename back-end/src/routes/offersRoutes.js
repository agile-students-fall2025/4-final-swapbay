import express from 'express';
import { body, validationResult } from 'express-validator';
import { Item, Offer, Chat } from '../models/index.js';
import { authRequired } from '../middleware/auth.js';
import { toOffer } from '../utils/serializers.js';

const router = express.Router();

router.use(authRequired);

function sortByNewest(a, b) {
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

const listingPopulate = { path: 'listing', populate: { path: 'owner', select: 'username name photo' } };

function formatOfferDescription(offer) {
  if (!offer) return 'your offer';
  if (offer.offerType === 'money') {
    return `$${offer.amount || 0}`;
  }
  if (offer.offerType === 'swap') {
    return offer.swapItemSnapshot?.title || 'swap item';
  }
  if (offer.offerType === 'both') {
    const swapTitle = offer.swapItemSnapshot?.title || 'swap item';
    const cash = `$${offer.amount || 0}`;
    return `${swapTitle} + ${cash}`;
  }
  return 'your offer';
}

async function getOrCreateChat(userIdA, userIdB) {
  const sorted = [userIdA?.toString(), userIdB?.toString()].sort();
  let chat = await Chat.findOne({ participants: sorted });
  if (!chat) {
    chat = await Chat.create({ participants: sorted, messages: [] });
  }
  return chat;
}

async function sendSystemMessage(fromUser, toUserId, text) {
  if (!fromUser?._id || !toUserId) return;
  const chat = await getOrCreateChat(fromUser._id, toUserId);
  const timestamp = new Date();
  chat.messages.push({
    sender: fromUser._id,
    text,
    sentAt: timestamp,
    readBy: [fromUser._id],
  });
  chat.lastMessageAt = timestamp;
  await chat.save();
}

router.get('/incoming', async (req, res) => {
  const offers = await Offer.find({ seller: req.user._id })
    .populate(listingPopulate)
    .populate('seller', 'username name photo')
    .populate('buyer', 'username name photo')
    .populate('myItem')
    .lean();
  res.json({ offers: offers.map((offer) => toOffer(offer, req.user.username)).sort(sortByNewest) });
});

router.get('/outgoing', async (req, res) => {
  const offers = await Offer.find({ buyer: req.user._id })
    .populate(listingPopulate)
    .populate('seller', 'username name photo')
    .populate('buyer', 'username name photo')
    .populate('myItem')
    .lean();
  res.json({ offers: offers.map((offer) => toOffer(offer, req.user.username)).sort(sortByNewest) });
});

router.get('/:id', async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate(listingPopulate)
    .populate('seller', 'username name photo')
    .populate('buyer', 'username name photo')
    .populate('myItem')
    .lean();
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  const isAuthorized =
    offer.seller?.toString?.() === req.user._id.toString() ||
    offer.buyer?.toString?.() === req.user._id.toString() ||
    offer.seller?._id?.equals?.(req.user._id) ||
    offer.buyer?._id?.equals?.(req.user._id);
  if (!isAuthorized) return res.status(403).json({ message: 'Forbidden' });
  res.json({ offer: toOffer(offer, req.user.username) });
});

const createRules = [
  body('listingId').notEmpty().withMessage('listingId is required'),
  body('offerType').optional().isIn(['money', 'swap', 'both']),
  body('amount').optional().isNumeric(),
];

router.post('/', createRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const listing = await Item.findById(req.body.listingId).populate('owner', 'username name');
  if (!listing || !listing.available || listing.status !== 'public') {
    return res.status(404).json({ message: 'Listing not available' });
  }
  if (listing.owner.equals(req.user._id)) {
    return res.status(400).json({ message: 'Cannot make an offer on your own listing.' });
  }

  let swapItem = null;
  if (req.body.myItemId) {
    swapItem = await Item.findById(req.body.myItemId);
    if (!swapItem || !swapItem.owner.equals(req.user._id)) {
      return res.status(400).json({ message: 'You do not own the swap item.' });
    }
  }

  await Offer.deleteMany({ listing: listing._id, buyer: req.user._id });

  const offer = await Offer.create({
    listing: listing._id,
    listingTitleSnapshot: listing.title,
    listingOwnerUsernameSnapshot: listing.owner?.username,
    seller: listing.owner?._id || listing.owner,
    buyer: req.user._id,
    offerType: req.body.offerType || 'money',
    amount: Number(req.body.amount) || 0,
    myItem: swapItem?._id || null,
    swapItemSnapshot: swapItem
      ? {
          title: swapItem.title,
          category: swapItem.category,
          condition: swapItem.condition,
          description: swapItem.description,
          image: swapItem.image,
        }
      : null,
    note: req.body.note || '',
  });

  // notify seller about the new offer
  const offerDetails = formatOfferDescription(offer);
  await sendSystemMessage(
    req.user,
    listing.owner?._id || listing.owner,
    `${req.user.name} made an offer (${offerDetails}) for your item "${listing.title}".`,
  );

  const populated = await Offer.findById(offer._id)
    .populate(listingPopulate)
    .populate('seller', 'username name photo')
    .populate('buyer', 'username name photo')
    .populate('myItem')
    .lean();

  res.status(201).json({ offer: toOffer(populated, req.user.username) });
});

router.post('/:id/cancel', async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (!offer.buyer.equals(req.user._id)) {
    return res.status(403).json({ message: 'Cannot cancel this offer.' });
  }
  offer.status = 'Canceled';
  await offer.save();
  const populated = await Offer.findById(offer._id)
    .populate(listingPopulate)
    .populate('seller', 'username name photo')
    .populate('buyer', 'username name photo')
    .populate('myItem')
    .lean();
  res.json({ offer: toOffer(populated, req.user.username) });
});

router.post('/:id/reject', async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (!offer.seller.equals(req.user._id)) {
    return res.status(403).json({ message: 'Cannot reject this offer.' });
  }
  if (offer.status !== 'Pending') {
    return res.status(400).json({ message: 'Only pending offers can be rejected.' });
  }
  offer.status = 'Rejected';
  await offer.save();

  const listing = await Item.findById(offer.listing);
  const offerDetails = formatOfferDescription(offer);
  if (listing) {
    await sendSystemMessage(
      req.user,
      offer.buyer,
      `${req.user.name} rejected your offer (${offerDetails}) for item "${listing.title}".`,
    );
  }

  const populated = await Offer.findById(offer._id)
    .populate('listing')
    .populate('seller', 'username name photo')
    .populate('buyer', 'username name photo')
    .populate('myItem')
    .lean();
  res.json({ offer: toOffer(populated, req.user.username) });
});

router.post('/:id/accept', async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('listing').populate('myItem');
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (!offer.seller.equals(req.user._id)) {
    return res.status(403).json({ message: 'Cannot accept this offer.' });
  }
  if (offer.status !== 'Pending') {
    return res.status(400).json({ message: 'Only pending offers can be accepted.' });
  }

  const listing = await Item.findById(offer.listing);
  if (listing) {
    listing.available = false;
    listing.status = 'private';
    listing.unavailableReason = req.body?.reason || 'sold';
    await listing.save();
  }

  offer.status = 'Accepted';
  await offer.save();
  await Offer.updateMany(
    { listing: offer.listing, _id: { $ne: offer._id } },
    { status: 'Rejected' },
  );
  if (listing) {
    await Offer.deleteMany({ myItem: listing._id, _id: { $ne: offer._id } });
  }

  if (offer.myItem) {
    const swapItem = await Item.findById(offer.myItem);
    if (swapItem) {
      swapItem.available = false;
      swapItem.status = 'private';
      swapItem.unavailableReason = 'swapped';
      await swapItem.save();
    }
    await Offer.deleteMany({ myItem: offer.myItem, _id: { $ne: offer._id } });
  }

  const offerDetails = formatOfferDescription(offer);
  const listingTitle = listing?.title || 'the item';
  await sendSystemMessage(
    req.user,
    offer.buyer,
    `${req.user.name} accepted your offer (${offerDetails}) for item "${listingTitle}".`,
  );

  // notify all other buyers their offers were rejected
  const rejectedOffers = await Offer.find({ listing: offer.listing, status: 'Rejected' }).lean();
  for (const rejected of rejectedOffers) {
    await sendSystemMessage(
      req.user,
      rejected.buyer,
      `${req.user.name} rejected your offer (${formatOfferDescription(rejected)}) for item "${listingTitle}".`,
    );
  }

  const populated = await Offer.findById(offer._id)
    .populate(listingPopulate)
    .populate('seller', 'username name photo')
    .populate('buyer', 'username name photo')
    .populate('myItem')
    .lean();

  res.json({ offer: toOffer(populated, req.user.username), listing });
});

router.delete('/:id', async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (!offer.buyer.equals(req.user._id)) {
    return res.status(403).json({ message: 'Cannot delete this offer.' });
  }
  await Offer.findByIdAndDelete(offer._id);
  res.json({ message: 'Offer removed' });
});

export default router;
