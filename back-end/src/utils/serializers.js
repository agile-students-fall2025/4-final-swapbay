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

export { toPublicUser, toListing, toSwapItem, toId };