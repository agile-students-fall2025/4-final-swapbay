import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useItems } from '../context/ItemContext';
import { useOffers } from '../context/OfferContext';
import toast from 'react-hot-toast';

export default function ListingOffers() {
  const { id } = useParams();
  const itemId = parseInt(id);
  const navigate = useNavigate();
  const { items, markUnavailable } = useItems();
  const { offers, rejectOffer } = useOffers();

  const item = items.find((i) => i.id === itemId);
  const itemOffers = offers.filter(
    (o) => o.item?.toLowerCase() === item?.title?.toLowerCase()
  );

  const [expanded, setExpanded] = useState(null);

  if (!item)
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold text-gray-700">
          Listing not found
        </h2>
        <button
          onClick={() => navigate('/my-listings')}
          className="text-blue-600 hover:underline mt-2"
        >
          ← Back to Listings
        </button>
      </div>
    );

  const handleReject = (offerId) => {
    rejectOffer(offerId);
    toast('Offer rejected');
  };

  const handleAccept = (offerId) => {
    markUnavailable(item.id, 'sold');
    rejectOffer(offerId); // remove offer after accepting
    toast.success('Offer accepted! Item marked as sold.');
    navigate('/my-items');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
      {/* Listing header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-700 mb-1">
          Offers for: {item.title}
        </h1>
        <p className="text-gray-600 text-sm">
          Category: {item.category} • Condition: {item.condition}
        </p>
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-64 object-cover rounded-lg mt-4"
        />
      </div>

      {/* Offers section */}
      <div className="p-6">
        {itemOffers.length === 0 ? (
          <p className="text-gray-500 text-center">
            No offers have been made for this item yet.
          </p>
        ) : (
          <div className="space-y-4">
            {itemOffers.map((offer) => (
              <div
                key={offer.id}
                className="border rounded-lg p-4 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Offer Type:{' '}
                      {offer.offerType === 'money'
                        ? 'Money'
                        : offer.offerType === 'swap'
                        ? 'Swap'
                        : 'Money + Swap'}
                    </p>
                    <p className="text-sm text-gray-600">{offer.offeredFor}</p>
                  </div>
                  <button
                    onClick={() =>
                      setExpanded(expanded === offer.id ? null : offer.id)
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {expanded === offer.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Expanded offer detail */}
                {expanded === offer.id && (
                  <div className="mt-3 border-t pt-3 space-y-3">
                    {/* 💰 Money-only offers */}
                    {offer.offerType === 'money' && (
                      <p className="text-gray-700 text-sm">
                        Buyer is offering <b>{offer.offeredFor}</b> for your item.
                      </p>
                    )}

                    {/* 🔁 Swap or 💸 both */}
                    {(offer.offerType === 'swap' || offer.offerType === 'both') &&
                      offer.offeredItem && (
                        <div className="flex items-start gap-4">
                          <img
                            src={offer.offeredItem.image}
                            alt={offer.offeredItem.title}
                            className="rounded-md border w-32 h-24 object-cover"
                          />
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold">
                              {offer.offeredItem.title}
                            </p>
                            <p className="text-gray-600">
                              {offer.offeredItem.category} •{' '}
                              {offer.offeredItem.condition}
                            </p>
                            {offer.offeredItem.description && (
                              <p className="text-gray-500 text-xs">
                                {offer.offeredItem.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {/* 💸 combined offers note */}
                    {offer.offerType === 'both' &&
                      offer.offeredFor.includes('$') && (
                        <p className="text-gray-700 text-sm">
                          Buyer also added <b>{offer.offeredFor.match(/\$\d+/)}</b> to the swap offer.
                        </p>
                      )}

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleAccept(offer.id)}
                        className="flex-1 bg-green-600 text-white py-1 rounded-md hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(offer.id)}
                        className="flex-1 bg-red-600 text-white py-1 rounded-md hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
