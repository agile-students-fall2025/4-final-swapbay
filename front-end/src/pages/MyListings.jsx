import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useOffers } from '../context/OfferContext';
import toast from 'react-hot-toast';

export default function MyListings() {
  const navigate = useNavigate();
  const { listedItems, removeFromListing, loading } = useItems();
  const { offers } = useOffers();

  const handleUnlist = async (id) => {
    try {
      await removeFromListing(id);
      toast.success('Item unlisted');
    } catch (error) {
      toast.error(error.message || 'Failed to update listing');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Listings</h1>
      {loading ? (
        <p className="text-gray-500">Loading listings...</p>
      ) : listedItems.length === 0 ? (
        <p className="text-gray-500">No public listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listedItems.map(item => (
            <div
              key={item.id}
              className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 space-y-2">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-500">
                  {item.category}
                  {item.condition ? ` • ${item.condition}` : ''}
                </p>
                <p className="text-blue-600 text-sm">
                  Accepting:{' '}
                  {item.offerType === 'money'
                    ? 'Money'
                    : item.offerType === 'swap'
                    ? 'Swap'
                    : 'Money + Swap'}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleUnlist(item.id)}
                    className="flex-1 bg-gray-200 text-gray-700 py-1 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Unlist
                  </button>
                  <button
                    onClick={() => navigate(`/listing/${item.id}/offers`)}
                    className="flex-1 bg-blue-600 text-white py-1 rounded-md hover:bg-blue-700 text-sm"
                  >
                    {(() => {
                      const pendingCount = offers.filter(
                        (offer) => offer.listingId === item.id && offer.status === 'Pending'
                      ).length;
                      return pendingCount > 0 ? `Offers (${pendingCount})` : 'Offers';
                    })()}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
