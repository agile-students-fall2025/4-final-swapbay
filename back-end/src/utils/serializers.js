function toId(value) {
  return value?.toString?.() || value || null;
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: toId(user._id || user.id),
    name: user.name,
    username: user.username,
    email: user.email,
    photo: user.photo || '',
  };
}

function toListing(item, viewerUsername) {
  if (!item) return null;
  const owner = item.owner || item.ownerUsername;
  const ownerUsername = owner?.username || owner;
  return {
    id: toId(item._id || item.id),
    owner: ownerUsername,
    ownerUsername,
    ownerName: owner?.name || item.ownerName || null,
    ownerPhoto: owner?.photo || item.ownerPhoto || null,
    title: item.title,
    category: item.category,
    condition: item.condition,
    description: item.description,
    image: item.image,
    status: item.status,
    offerType: item.offerType,
    available: item.available,
    unavailableReason: item.unavailableReason || null,
    isMine: Boolean(viewerUsername && ownerUsername === viewerUsername),
  };
}

function toSwapItem(item) {
  if (!item) return null;
  return {
    id: toId(item._id || item.id),
    title: item.title,
    category: item.category,
    condition: item.condition,
    description: item.description,
    image: item.image,
  };
}

function toOffer(offer, viewerUsername) {
  if (!offer) return null;
  const listing = offer.listing;
  const seller = offer.seller;
  const buyer = offer.buyer;
  const swap = offer.myItem || offer.swapItemSnapshot;

  const offerType = offer.offerType || 'money';
  const amount = Number(offer.amount || 0);
  let offeredFor = offer.offeredFor;
  if (!offeredFor) {
    if (offerType === 'swap') {
      offeredFor = swap?.title || 'Swap Item';
    } else if (offerType === 'both') {
      offeredFor = `${swap?.title || 'Swap Item'} + $${amount}`;
    } else {
      offeredFor = `$${amount}`;
    }
  }

  return {
    id: toId(offer._id || offer.id),
    listingId: toId(listing?._id || offer.listing || offer.listingId),
    listingTitle: listing?.title || offer.listingTitleSnapshot || offer.listingTitle || '',
    sellerUsername: seller?.username || offer.listingOwnerUsernameSnapshot || offer.sellerUsername,
    buyerUsername: buyer?.username || offer.buyerUsername,
    offerType,
    amount,
    myItemId: toId(offer.myItem?._id || offer.myItem),
    swapItem: toSwapItem(offer.swapItemSnapshot || swap),
    offeredFor,
    status: offer.status || 'Pending',
    note: offer.note || '',
    createdAt: offer.createdAt,
    target: listing
      ? {
          id: toId(listing._id || listing.id),
          title: listing.title,
          image: listing.image,
          sellerUsername: listing.owner?.username || listing.ownerUsername,
          sellerName: listing.owner?.name || null,
          description: listing.description,
          offerType: listing.offerType,
          category: listing.category,
          condition: listing.condition,
          status: listing.status,
          isMine: Boolean(
            viewerUsername && (listing.owner?.username || listing.ownerUsername) === viewerUsername,
          ),
        }
      : {
          id: toId(offer.listing || offer.listingId),
          title: offer.listingTitleSnapshot || offer.listingTitle || '',
          sellerUsername: offer.listingOwnerUsernameSnapshot || offer.sellerUsername,
        },
    offeredItem: toSwapItem(offer.swapItemSnapshot || swap),
    myItem: toSwapItem(offer.swapItemSnapshot || swap),
    buyerName: buyer?.name || null,
    buyerPhoto: buyer?.photo || null,
    sellerName: seller?.name || null,
    sellerPhoto: seller?.photo || null,
  };
}

function toChatMessage(msg, currentUserId) {
  const isRead =
    Array.isArray(msg.readBy) &&
    msg.readBy.some((id) => id?.toString?.() === currentUserId);
  return {
    sender: msg.sender?.toString?.() === currentUserId ? 'me' : 'them',
    text: msg.text,
    timestamp: msg.sentAt || msg.createdAt || msg.timestamp,
    read: isRead,
  };
}

export { toPublicUser, toListing, toOffer, toChatMessage, toId };
