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

  const fetchItems = useCallback(async ({ silent = false } = {}) => {
    if (!user) {
      setItems([]);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const data = await api.get('/api/me/items');
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load items', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(() => fetchItems({ silent: true }), 3000);
    return () => clearInterval(interval);
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
