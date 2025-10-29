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
    isItemOffered,
  } = useItems();
  const { offers, removeOffersByUserItemTitle } = useOffers();
  const [selectOfferTypeFor, setSelectOfferTypeFor] = useState(null);

  // Compute item labels dynamically
  const itemsWithLabels = useMemo(() => {
    return items.map((i) => {
      const offered = isItemOffered(i.title, offers);
      const listed = i.status === 'public';
      const available = i.available;
      let label = 'Draft';

      if (!available) {
        label = i.unavailableReason === 'swapped' ? 'Swapped' : 'Sold';
      } else if (listed && offered) {
        label = 'Listed + Offered';
      } else if (listed) {
        label = 'Listed';
      } else if (offered) {
        label = 'Offered';
      }

      return { ...i, __offered: offered, __listed: listed, __label: label };
    });
  }, [items, offers, isItemOffered]);

  // Handlers
  const handleAddToListing = (id) => setSelectOfferTypeFor(id);

  const confirmListing = (id, sellerOfferType) => {
    addToListing(id, sellerOfferType);
    setSelectOfferTypeFor(null);
    toast.success('Item listed!');
  };

  const handleRemoveFromListing = (id) => {
    removeFromListing(id);
    toast('Listing removed (now private)');
  };

  const handleDelete = (id) => {
    const it = items.find((i) => i.id === id);
    deleteItem(id);
    if (it) toast.success(`Deleted "${it.title}"`);
  };

  const canEdit = (i) =>
    i.available &&
    !i.unavailableReason &&
    !i.__label.includes('Sold') &&
    !i.__label.includes('Swapped');

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
      {itemsWithLabels.length === 0 ? (
        <p className="text-gray-500">No items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {itemsWithLabels.map((item) => (
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
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      item.__label === 'Listed + Offered'
                        ? 'bg-purple-100 text-purple-700'
                        : item.__label === 'Listed'
                        ? 'bg-blue-100 text-blue-700'
                        : item.__label === 'Offered'
                        ? 'bg-yellow-100 text-yellow-700'
                        : !item.available
                        ? 'bg-gray-300 text-gray-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item.__label}
                  </span>
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
                          onClick={() => {
                            if (!canEdit(item))
                              return toast.error('Cannot edit this item.');
                            navigate(`/edit-item/${item.id}`);
                          }}
                          className={`flex-1 text-sm px-3 py-2 rounded-md ${
                            canEdit(item)
                              ? 'border hover:bg-gray-50'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 text-sm px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    // Delete (History)
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-full text-sm px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete (History)
                    </button>
                  )}
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
