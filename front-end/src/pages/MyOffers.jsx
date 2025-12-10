import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOffers } from '../context/OfferContext';
import { useItems } from '../context/ItemContext';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
  switch (status) {
    case 'Accepted':
      return 'bg-green-100 text-green-700';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-red-100 text-red-700';
  }
};

export default function MyOffers() {
  const { myOffers, cancelMyOffer, loading } = useOffers();
  const { items } = useItems();
  const [open, setOpen] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const getMyItem = (myItemId) => items.find((i) => i.id === myItemId);
  const sortedOffers = useMemo(
    () =>
      [...myOffers].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [myOffers]
  );
  const filteredOffers = useMemo(
    () =>
      sortedOffers.filter((offer) =>
        statusFilter === 'All' ? true : offer.status === statusFilter
      ),
    [sortedOffers, statusFilter]
  );

  const renderDetails = (offer) => (
    <div className="mt-3 border rounded-lg p-3 bg-gray-50 space-y-3">
      <p className="text-sm text-gray-700">
        <span className="font-semibold">Listing Type:</span>{' '}
        {offer.target?.offerType === 'money'
          ? 'Money'
          : offer.target?.offerType === 'swap'
          ? 'Swap'
          : 'Money + Swap'}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Listing Details:</span>{' '}
        {offer.target?.category} • {offer.target?.condition}
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">Offer Type:</span>{' '}
        {offer.offerType === 'money'
          ? 'Money'
          : offer.offerType === 'swap'
          ? 'Swap'
          : 'Money + Swap'}
      </p>
      {offer.offerType !== 'swap' && (
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Cash:</span> ${offer.amount}
        </p>
      )}
      {(offer.offerType === 'swap' || offer.offerType === 'both') && offer.myItem && (
        <div className="flex items-start gap-3">
          <img
            src={offer.myItem.image}
            alt={offer.myItem.title}
            className="w-28 h-24 object-cover rounded-md border"
          />
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{offer.myItem.title}</p>
            <p className="text-gray-500">
              {offer.myItem.category} • {offer.myItem.condition}
            </p>
            {offer.myItem.description && (
              <p className="text-gray-500 text-xs">{offer.myItem.description}</p>
            )}
          </div>
        </div>
      )}
      {offer.createdAt && (
        <p className="text-xs text-gray-400">
          Updated: {new Date(offer.createdAt).toLocaleString()}
        </p>
      )}
      {offer.myItemId && getMyItem(offer.myItemId) && (
        <p className="text-xs text-gray-400">
          Current state in My Items: {getMyItem(offer.myItemId).status}
        </p>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Offers</h1>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">Filter by status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Accepted</option>
          <option>Rejected</option>
        </select>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading your offers...</p>
      ) : filteredOffers.length === 0 ? (
        <p className="text-gray-500">No offers made yet.</p>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {offer.target ? (
                  <img
                    src={offer.target.image}
                    alt={offer.target.title}
                    className="w-full sm:w-48 h-40 object-cover"
                  />
                ) : (
                  <div className="w-full sm:w-48 h-40 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                    Listing unavailable
                  </div>
                )}
                <div className="flex-1 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-semibold text-base">
                          {offer.target?.title || 'Listing unavailable'}
                        </h3>
                      <p className="text-xs text-gray-500">
                        Seller: <span className="font-medium">@{offer.target?.sellerUsername}</span>
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-[11px] rounded-md ${statusBadge(offer.status)}`}>
                      {offer.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOpen(open === offer.id ? null : offer.id)}
                      className="px-3 py-1 text-[11px] rounded-md border hover:bg-gray-50"
                    >
                      {open === offer.id ? 'Hide Details' : 'View Details'}
                    </button>
                      <p className="text-sm text-blue-600 font-medium flex-1">
                      {offer.offerType === 'money'
                        ? `Your offer: $${offer.amount}`
                        : offer.offerType === 'swap'
                        ? `Your offer: ${offer.myItem?.title ?? '—'}`
                        : `Your offer: ${offer.myItem?.title ?? '—'} + $${offer.amount}`}
                    </p>
                  </div>

                    {offer.target ? (
                      <>
                        <p className="text-xs text-gray-500">
                          {offer.target.category} • {offer.target.condition}
                        </p>
                        {offer.target.description && (
                          <p className="text-xs text-gray-400 overflow-hidden text-ellipsis">
                            {offer.target.description}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">This listing was removed.</p>
                    )}

                  <div className="flex gap-2">
                    <Link
                      to={offer.target ? `/messages/${offer.target.sellerUsername}` : '#'}
                      className={`flex-1 px-3 py-2 text-xs rounded-md border border-blue-200 text-blue-600 text-center ${
                        offer.target ? 'hover:bg-blue-50' : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Message Seller
                    </Link>
                    {offer.status === 'Pending' && (
                      <button
                        onClick={async () => {
                          try {
                            await cancelMyOffer(offer.id);
                            toast('Offer canceled.');
                          } catch (error) {
                            toast.error(error.message || 'Failed to cancel offer');
                          }
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                        disabled={!offer.target}
                      >
                        Cancel Offer
                      </button>
                    )}
                  </div>

                  {open === offer.id && renderDetails(offer)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
