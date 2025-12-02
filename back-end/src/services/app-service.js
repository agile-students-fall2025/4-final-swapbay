import { store, nextId, findItemById, findOfferById } from '../data/mockStore.js';

function resolveUserMeta(username) {
  const profile = store.users.find((user) => user.username === username);
  return {
    username,
    name: profile?.name || null,
    photo: profile?.photo || null,
  };
}

function serializeListing(item, viewerUsername = store.currentUser) {
  if (!item) return null;
  const ownerMeta = resolveUserMeta(item.ownerUsername);
  return {
    ...item,
    owner: ownerMeta.username,
    ownerUsername: ownerMeta.username,
    ownerName: ownerMeta.name,
    ownerPhoto: ownerMeta.photo,
    isMine: Boolean(viewerUsername && item.ownerUsername === viewerUsername),
  };
}

function serializeSwapItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    condition: item.condition,
    description: item.description,
    image: item.image,
  };
}

function serializeOffer(offer, viewerUsername = store.currentUser) {
  if (!offer) return null;
  const listing = findItemById(offer.listingId);
  const sellerMeta = resolveUserMeta(offer.sellerUsername);
  const buyerMeta = resolveUserMeta(offer.buyerUsername);
  const swapSource = offer.swapItem || (offer.myItemId ? findItemById(offer.myItemId) : null);
  const normalizedSwap = serializeSwapItem(swapSource);

  return {
    ...offer,
    target: listing
      ? {
        id: listing.id,
        title: listing.title,
        image: listing.image,
        sellerUsername: listing.ownerUsername,
        sellerName: sellerMeta.name,
        description: listing.description,
        offerType: listing.offerType,
        category: listing.category,
        condition: listing.condition,
        status: listing.status,
        isMine: Boolean(viewerUsername && listing.ownerUsername === viewerUsername),
      }
      : {
        id: offer.listingId,
        title: offer.listingTitle,
        sellerUsername: offer.sellerUsername,
        sellerName: sellerMeta.name,
      },
    offeredItem: normalizedSwap,
    myItem: normalizedSwap,
    buyerName: buyerMeta.name,
    buyerPhoto: buyerMeta.photo,
    sellerName: sellerMeta.name,
    sellerPhoto: sellerMeta.photo,
  };
}

function listPublicListings({ search = '', category, offerType, condition } = {}, viewerUsername = null) {
  const term = search.toLowerCase();
  return store.items
    .filter((item) => {
      if (item.status !== 'public' || !item.available) return false;
      if (viewerUsername && item.ownerUsername === viewerUsername) return false;
      const matchesSearch = !term || item.title.toLowerCase().includes(term);
      const matchesCategory = !category || item.category.toLowerCase() === category.toLowerCase();
      const matchesCondition = !condition || item.condition.toLowerCase() === condition.toLowerCase();
      const matchesOfferType = !offerType
        || offerType === 'all'
        || item.offerType.toLowerCase() === offerType.toLowerCase();
      return matchesSearch && matchesCategory && matchesCondition && matchesOfferType;
    })
    .map((item) => serializeListing(item, viewerUsername));
}

function getListingOffers(listingId) {
  return store.offers
    .filter((offer) => offer.listingId === Number(listingId))
    .map((offer) => serializeOffer(offer));
}

function addItemForUser(user, payload) {
  if (!payload.title) throw new Error('Title is required');
  const item = {
    id: nextId('items'),
    ownerUsername: user.username,
    title: payload.title,
    category: payload.category || 'Misc',
    condition: payload.condition || 'Good',
    description: payload.description || '',
    image: payload.image || `https://picsum.photos/seed/${Date.now()}/600/400`,
    status: 'private',
    offerType: 'both',
    available: true,
    unavailableReason: null,
  };
  store.items.push(item);
  return item;
}

function createOfferForListing(user, payload) {
  const listing = findItemById(payload.listingId);
  if (!listing || !listing.available || listing.status !== 'public') {
    throw new Error('Listing not available');
  }
  if (listing.ownerUsername === user.username) {
    throw new Error('Cannot make an offer on your own listing.');
  }

  const swapItem = payload.myItemId ? findItemById(payload.myItemId) : null;
  if (swapItem && swapItem.ownerUsername !== user.username) {
    throw new Error('You do not own the swap item.');
  }

  // Replace any existing offer for this listing by the same buyer
  store.offers = store.offers.filter((existing) => {
    if (existing.listingId === listing.id && existing.buyerUsername === user.username) {
      return false;
    }
    return true;
  });

  const offer = {
    id: nextId('offers'),
    listingId: listing.id,
    listingTitle: listing.title,
    sellerUsername: listing.ownerUsername,
    buyerUsername: user.username,
    offerType: payload.offerType || 'money',
    amount: Number(payload.amount) || 0,
    myItemId: swapItem ? swapItem.id : null,
    swapItem: swapItem
      ? {
        id: swapItem.id,
        title: swapItem.title,
        category: swapItem.category,
        condition: swapItem.condition,
        description: swapItem.description,
        image: swapItem.image,
      }
      : null,
    offeredFor: null,
    status: 'Pending',
    note: payload.note || '',
    createdAt: new Date().toISOString(),
  };

  if (payload.offerType === 'swap') {
    offer.offeredFor = swapItem?.title || 'Swap Item';
  } else if (payload.offerType === 'both') {
    offer.offeredFor = `${swapItem?.title || 'Swap Item'} + $${Number(payload.amount) || 0}`;
  } else {
    offer.offeredFor = `$${Number(payload.amount) || 0}`;
  }

  store.offers = [offer, ...store.offers];
  return offer;
}

function cancelOfferForUser(user, offerId) {
  const offer = findOfferById(offerId);
  if (!offer) throw new Error('Offer not found');
  if (offer.buyerUsername !== user.username) {
    throw new Error('Cannot cancel this offer.');
  }
  offer.status = 'Canceled';
  return offer;
}

function getChatsSummary(ownerUsername) {
  return store.chats
    .filter((chat) => chat.ownerUsername === ownerUsername)
    .map((chat) => {
      const last = chat.messages[chat.messages.length - 1];
      return {
        username: chat.username,
        lastMessage: last ? last.text : null,
        lastTimestamp: last ? last.timestamp : null,
        totalMessages: chat.messages.length,
      };
    });
}

export {
  listPublicListings,
  getListingOffers,
  addItemForUser,
  createOfferForListing,
  cancelOfferForUser,
  getChatsSummary,
  serializeListing,
  serializeOffer,
};
