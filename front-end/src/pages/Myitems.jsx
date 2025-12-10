import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useOffers } from '../context/OfferContext';
import toast from 'react-hot-toast';

export default function MyItems() {
  const navigate = useNavigate();
  const {
    items,
    addToListing,
    removeFromListing,
    deleteItem,
    isItemOfferedByMe,
    loading,
  } = useItems();
  const { offers: incomingOffers } = useOffers();
  const [selectOfferTypeFor, setSelectOfferTypeFor] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  // Compute item labels dynamically
  const itemsWithLabels = useMemo(() => {
    return items.map((i) => {
      const offeredByMe = isItemOfferedByMe(i.id);
      const hasIncoming = incomingOffers.some(
        (offer) => offer.listingId === i.id && ['Pending'].includes(offer.status)
      );
      const offered = offeredByMe;
      const listed = i.status === 'public';
      const available = i.available;
      const badges = [];
      let statusLabel = null;

      if (!available) {
        statusLabel = i.unavailableReason === 'swapped' ? 'Swapped' : 'Sold';
      } else {
        if (listed) badges.push('Listed');
        if (offered) badges.push('Offered');
        if (!listed && !offered) badges.push('Draft');
      }

      return {
        ...i,
        __offered: offered,
        __incoming: hasIncoming,
        __listed: listed,
        __badges: badges,
        __status: statusLabel,
      };
    });
  }, [items, incomingOffers, isItemOfferedByMe]);

  // Handlers
  
  const handleAddToListing = (id) => setSelectOfferTypeFor(id);

  const confirmListing = async (id, sellerOfferType) => {
    try {
      await addToListing(id, sellerOfferType);
      toast.success('Item listed!');
    } catch (error) {
      toast.error(error.message || 'Failed to list item');
    } finally {
      setSelectOfferTypeFor(null);
    }
  };

  const handleRemoveFromListing = async (id) => {
    try {
      await removeFromListing(id);
      toast('Listing removed (now private)');
    } catch (error) {
      toast.error(error.message || 'Failed to update listing');
    }
  };

  const handleDelete = async (id) => {
    const it = items.find((i) => i.id === id);
    if (!it) {
      return;
    }
    if (it.status === 'public') {
      toast.error('Listed items cannot be deleted. Unlist first.');
      return;
    }
    if (!it.available || it.unavailableReason) {
      toast.error('Sold or swapped items cannot be deleted.');
      return;
    }
    try {
      await deleteItem(id);
      if (it) toast.success(`Deleted "${it.title}"`);
    } catch (error) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const canEdit = (i) =>
    i.available &&
    !i.unavailableReason &&
    !i.__listed &&
    !i.__offered &&
    !i.__incoming;

  const handleEdit = (item) => {
    if (!canEdit(item)) {
      toast.error('Cannot edit listed or offered items. Remove them from offers first.');
      return;
    }
    navigate(`/edit-item/${item.id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Items</h1>
        <button
          onClick={() => navigate('/add-item')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Item
        </button>
      </div>

      {/* Items Grid */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option>All</option>
          <option>Listed</option>
          <option>Draft</option>
          <option>Sold/Swapped</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading your items...</p>
      ) : itemsWithLabels.length === 0 ? (
        <p className="text-gray-500">No items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {itemsWithLabels
            .filter((item) => {
              if (statusFilter === 'All') return true;
              if (statusFilter === 'Listed') return item.__listed && item.available;
              if (statusFilter === 'Draft')
                return item.available && !item.__listed && !item.__status;
              if (statusFilter === 'Sold/Swapped') return !item.available || item.__status;
              return true;
            })
            .map((item) => (
            <div
              key={item.id}
              className={`bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition relative ${
                !item.available ? 'opacity-60' : ''
              }`}
            >
              {/* Banner + Overlay */}
              {!item.available && (
                <>
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md z-10">
                    {item.unavailableReason === 'swapped' ? 'Swapped' : 'Sold'}
                  </div>
                  {/* keep blurred overlay but allow clicks */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-0"></div>
                </>
              )}

              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="h-48 w-full object-cover relative z-10"
              />

              {/* Content */}
              <div className="p-4 space-y-2 relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-500">
                      {item.category}
                      {item.condition ? ` • ${item.condition}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {item.__status ? (
                      <span className="px-2 py-1 rounded-md bg-gray-300 text-gray-700">
                        {item.__status}
                      </span>
                    ) : (
                      item.__badges.map((badge) => (
                        <span
                          key={badge}
                          className={`px-2 py-1 rounded-md ${
                            badge === 'Listed'
                              ? 'bg-blue-100 text-blue-700'
                              : badge === 'Offered'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {badge}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t">
                  {item.available ? (
                    <>
                      {/* Listing toggle */}
                      {item.__listed ? (
                        <button
                          onClick={() => handleRemoveFromListing(item.id)}
                          className="w-full text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
                        >
                          Remove from Listing
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToListing(item.id)}
                          className="w-full text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Add to Listing
                        </button>
                      )}

                      {/* Edit & Delete */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className={`flex-1 text-sm px-3 py-2 rounded-md border ${
                            canEdit(item)
                              ? 'hover:bg-gray-50'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={item.__listed}
                          className={`flex-1 text-sm px-3 py-2 rounded-md ${
                            item.__listed
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Offer Type Selector (when listing) */}
                {selectOfferTypeFor === item.id && (
                  <div className="mt-3 border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm font-medium mb-2">
                      Accept offers as seller:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => confirmListing(item.id, 'money')}
                        className="text-sm px-2 py-1 rounded-md border hover:bg-white"
                      >
                        Money
                      </button>
                      <button
                        onClick={() => confirmListing(item.id, 'swap')}
                        className="text-sm px-2 py-1 rounded-md border hover:bg-white"
                      >
                        Swap
                      </button>
                      <button
                        onClick={() => confirmListing(item.id, 'both')}
                        className="text-sm px-2 py-1 rounded-md border hover:bg-white"
                      >
                        Both
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectOfferTypeFor(null)}
                      className="mt-3 text-xs text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
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
