import { createContext, useContext, useMemo, useState } from 'react';
import { mockUserItems as initialItems } from '../utils/mockUserItems';
import { useOffers } from './OfferContext';

const ItemContext = createContext();

export function ItemProvider({ children }) {

  const { myOffers, removeMyOffersByItemId } = useOffers();

  const [items, setItems] = useState(
    initialItems.map((i) => ({
      ...i,
      offerType: i.offerType || 'both',
      available: i.available ?? true,
      unavailableReason: i.unavailableReason || null,
    }))
  );


  const listedItems = useMemo(
    () => items.filter((i) => i.status === 'public' && i.available),
    [items]
  );


  const isItemOffered = (_title, _offersList) => {

    return false;
  };

  const isItemOfferedByMe = (itemId) => {
    return myOffers?.some(
      (o) => o.myItemId === itemId && o.status !== 'Canceled'
    );
  };

  // -------- CRUD & Transitions --------

  const addItem = (payload) => {
    const id = Date.now();
    const newItem = {
      id,
      title: payload.title,
      category: payload.category || 'Misc',
      condition: payload.condition || 'Good',
      description: payload.description || '',
      status: 'private',
      image: payload.image || `https://picsum.photos/seed/${id}/400/300`,
      offerType: 'both',
      available: true,
      unavailableReason: null,
    };
    setItems((prev) => [newItem, ...prev]);
    return id;
  };

  const editItem = (id, updates) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.available ? { ...i, ...updates } : i))
    );

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    removeMyOffersByItemId(id);
  };

  const addToListing = (id, sellerOfferType) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'public', offerType: sellerOfferType }
          : i
      )
    );

  const removeFromListing = (id) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'private' } : i))
    );

  const markUnavailable = (id, reason = 'sold') => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              available: false,
              unavailableReason: reason,
              status: 'private',
            }
          : i
      )
    );

    removeMyOffersByItemId(id);
  };

  const revertOfferStatus = (id) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const keepListed = i.status === 'public'; 
        return {
          ...i,
          status: keepListed ? 'public' : 'private',
          available: true,
          unavailableReason: null,
        };
      })
    );
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        listedItems,
        addItem,
        editItem,
        deleteItem,
        addToListing,
        removeFromListing,
        markUnavailable,
        revertOfferStatus,
        isItemOffered,
        isItemOfferedByMe,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  return useContext(ItemContext);
}
