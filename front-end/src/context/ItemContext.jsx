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
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { useOffers } from './OfferContext';

const ItemContext = createContext();

export function ItemProvider({ children }) {
  const { user } = useAuth();
  const { myOffers, refreshOffers } = useOffers();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get('/api/me/items');
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load items', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const listedItems = useMemo(
    () => items.filter((i) => i.status === 'public' && i.available),
    [items]
  );

  const isItemOffered = useCallback((title, offersList = []) => {
    if (!title) return false;
    const normalized = title.toLowerCase();
    return offersList.some(
      (offer) =>
        offer.listingTitle?.toLowerCase() === normalized &&
        ['Pending'].includes(offer.status)
    );
  }, []);

  const isItemOfferedByMe = useCallback(
    (itemId) => {
      return myOffers?.some(
        (offer) =>
          offer.myItemId === itemId &&
          ['Pending'].includes(offer.status)
      );
    },
    [myOffers]
  );

  const upsertItem = (updated) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === updated.id);
      return exists
        ? prev.map((item) => (item.id === updated.id ? updated : item))
        : [updated, ...prev];
    });
  };

  const addItem = async (payload) => {
    const data = await api.post('/api/me/items', payload);
    upsertItem(data.item);
    return data.item.id;
  };

  const editItem = async (id, updates) => {
    const data = await api.put(`/api/me/items/${id}`, updates);
    upsertItem(data.item);
    return data.item;
  };

  const deleteItem = async (id) => {
    await api.delete(`/api/me/items/${id}`);
    setItems((prev) => prev.filter((item) => item.id !== id));
    await refreshOffers?.();
  };

  const addToListing = async (id, sellerOfferType) => {
    const data = await api.post(`/api/me/items/${id}/listing`, {
      offerType: sellerOfferType,
    });
    upsertItem(data.item);
    return data.item;
  };

  const removeFromListing = async (id) => {
    const data = await api.post(`/api/me/items/${id}/unlist`);
    upsertItem(data.item);
    await refreshOffers?.();
    return data.item;
  };

  const markUnavailable = async (id, reason = 'sold') => {
    const data = await api.post(`/api/me/items/${id}/availability`, {
      available: false,
      reason,
    });
    upsertItem(data.item);
    await refreshOffers?.();
    return data.item;
  };

  const revertOfferStatus = async (id) => {
    const data = await api.post(`/api/me/items/${id}/availability`, {
      available: true,
    });
    upsertItem(data.item);
    await refreshOffers?.();
    return data.item;
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        listedItems,
        loading,
        addItem,
        editItem,
        deleteItem,
        addToListing,
        removeFromListing,
        markUnavailable,
        revertOfferStatus,
        isItemOffered,
        isItemOfferedByMe,
        refreshItems: fetchItems,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  return useContext(ItemContext);
}
