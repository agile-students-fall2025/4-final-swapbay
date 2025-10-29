import { createContext, useContext, useState } from 'react';
import { mockOffers as initialIncoming } from '../utils/mockOffers';
import { mockMyOffers as initialOutgoing } from '../utils/mockMyOffers';
import { useItems } from './ItemContext';

const OfferContext = createContext();

export function OfferProvider({ children }) {
  const [offers, setOffers] = useState(initialIncoming); // Offers received
  const [myOffers, setMyOffers] = useState(initialOutgoing); // Offers you made

  let itemTools;
  try {
    itemTools = useItems();
  } catch {
    itemTools = null;
  }

  // --- Incoming (ListingOffers) ---
  const rejectOffer = (offerId) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  const acceptOffer = (offerId, itemId) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'Accepted' } : o))
    );
    itemTools?.markUnavailable?.(itemId, 'sold');
  };

  // --- Outgoing (MyOffers) ---
  const addOffer = (newOffer) => {
    setMyOffers((prev) => [newOffer, ...prev]);
  };

  const cancelMyOffer = (offerId, myItemId) => {
    setMyOffers((prev) => prev.filter((o) => o.id !== offerId));
    itemTools?.revertOfferStatus?.(myItemId);
  };

  const removeMyOffersByItemId = (myItemId) => {
    setMyOffers((prev) => prev.filter((o) => o.myItemId !== myItemId));
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
        removeMyOffersByItemId,
      }}
    >
      {children}
    </OfferContext.Provider>
  );
}

export function useOffers() {
  return useContext(OfferContext);
}
