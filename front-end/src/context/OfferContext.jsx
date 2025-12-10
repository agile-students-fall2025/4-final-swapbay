/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const OfferContext = createContext();

export function OfferProvider({ children }) {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = useCallback(async ({ silent = false } = {}) => {
    if (!user) {
      setOffers([]);
      setMyOffers([]);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const [incoming, outgoing] = await Promise.all([
        api.get('/api/offers/incoming'),
        api.get('/api/offers/outgoing'),
      ]);
      const sortByNewest = (list = []) =>
        [...list].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      setOffers(sortByNewest(incoming.offers));
      setMyOffers(sortByNewest(outgoing.offers));
    } catch (error) {
      console.error('Failed to load offers', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(() => fetchOffers({ silent: true }), 3000);
    return () => clearInterval(interval);
  }, [fetchOffers]);

  const addOffer = async (payload) => {
    const data = await api.post('/api/offers', payload);
    await fetchOffers();
    return data.offer;
  };

  const cancelMyOffer = async (offerId) => {
    await api.post(`/api/offers/${offerId}/cancel`);
    await fetchOffers();
  };

  const rejectOffer = async (offerId) => {
    await api.post(`/api/offers/${offerId}/reject`);
    await fetchOffers();
  };

  const acceptOffer = async (offerId) => {
    const data = await api.post(`/api/offers/${offerId}/accept`);
    await fetchOffers();
    return data.offer;
  };

  return (
    <OfferContext.Provider
      value={{
        offers,
        rejectOffer,
        acceptOffer,
        myOffers,
        addOffer,
        cancelMyOffer,
        refreshOffers: fetchOffers,
        loading,
      }}
    >
      {children}
    </OfferContext.Provider>
  );
}

export function useOffers() {
  return useContext(OfferContext);
}
