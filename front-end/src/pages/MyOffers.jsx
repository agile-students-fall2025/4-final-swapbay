import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOffers } from '../context/OfferContext';
import { useItems } from '../context/ItemContext';
import toast from 'react-hot-toast';

export default function MyOffers() {
  const { myOffers, cancelMyOffer } = useOffers();
  const { items } = useItems();
  const [open, setOpen] = useState(null);

  const getMyItem = (myItemId) => items.find((i) => i.id === myItemId);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Offers</h1>

      {myOffers.length === 0 ? (
        <p className="text-gray-500">No offers made yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myOffers.map((o) => (
            <div key={o.id} className="bg-white shadow rounded-xl overflow-hidden">
              {/* Display target listing (what you want to buy) */}
              <img
                src={o.target.image}
                alt={o.target.title}
                className="h-48 w-full object-cover"
              />

              <div className="p-4 space-y-3">
                {/* Header: Listing title & seller */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{o.target.title}</h2>
                    <p className="text-sm text-gray-500">
                      Seller: <span className="font-medium">@{o.target.sellerUsername}</span>
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-md ${
                      o.status === 'Accepted'
                        ? 'bg-green-100 text-green-700'
                        : o.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {o.status}
                  </span>
                </div>

                {/* Summary of YOUR offer */}
                <p className="text-sm text-blue-600 font-medium">
                  {o.offerType === 'money'
                    ? `Your offer: $${o.amount}`
                    : o.offerType === 'swap'
                    ? `Your offer: ${o.myItem?.title ?? '—'}`
                    : `Your offer: ${o.myItem?.title ?? '—'} + $${o.amount}`}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setOpen(open === o.id ? null : o.id)}
                    className="flex-1 text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
                  >
                    {open === o.id ? 'Hide Offer' : 'View Offer'}
                  </button>

                  <Link
                    to={`/messages/${o.target.sellerUsername}`}
                    className="flex-1 text-center text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Message Seller
                  </Link>
                </div>

                {/* Cancel offer (only if pending) */}
                {o.status === 'Pending' && (
                  <button
                    onClick={() => {
                      cancelMyOffer(o.id, o.myItemId);
                      toast('Offer canceled.');
                    }}
                    className="w-full text-sm px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel Offer
                  </button>
                )}

                {/* Dropdown: YOUR OFFER details only (per new rule) */}
                {open === o.id && (
                  <div className="mt-2 rounded-lg border bg-gray-50 p-3 space-y-3">
                    {o.offerType === 'money' && (
                      <p className="text-sm">
                        <span className="font-semibold">Cash:</span> ${o.amount}
                      </p>
                    )}

                    {(o.offerType === 'swap' || o.offerType === 'both') && (
                      <p className="text-sm">
                        <span className="font-semibold">Swap Item:</span>{' '}
                        {o.myItem?.title ?? '—'}
                      </p>
                    )}

                    {/* Optional tiny helper: show current state from My Items (not required) */}
                    {o.myItemId && getMyItem(o.myItemId) && (
                      <p className="text-xs text-gray-400">
                        Current state in My Items: {getMyItem(o.myItemId).status}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
