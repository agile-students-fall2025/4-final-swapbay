import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [offerTypeFilter, setOfferTypeFilter] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const conditions = ['All', 'New', 'Like New', 'Good', 'Fair', 'Used'];
  const offerTypes = ['All', 'Money Only', 'Swap Only', 'Both'];

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('search', query.trim());
      if (conditionFilter !== 'All') params.append('condition', conditionFilter);
      if (offerTypeFilter !== 'All') {
        const map = {
          'Money Only': 'money',
          'Swap Only': 'swap',
          Both: 'both',
        };
        params.append('offerType', map[offerTypeFilter] || 'all');
      }
      const path = params.toString()
        ? `/api/listings?${params.toString()}`
        : '/api/listings';
      const data = await api.get(path);
      const filtered = (data.items || []).filter((item) => !item.isMine);
      setItems(filtered);
    } catch (error) {
      toast.error(error.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [query, conditionFilter, offerTypeFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input
          type="text"
          placeholder="Search items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <div className="flex gap-3">
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {conditions.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={offerTypeFilter}
            onChange={(e) => setOfferTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {offerTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <p className="text-gray-600 text-center mt-10">Loading listings...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition relative"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-600">
                  {item.category} • {item.condition}
                </p>

                <p className="text-sm text-blue-600 font-semibold">
                  Offer Type:{' '}
                  {item.offerType === 'money'
                    ? 'Money Only'
                    : item.offerType === 'swap'
                    ? 'Swap Only'
                    : 'Both (Money + Swap)'}
                </p>

                <p className="text-gray-700 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.description}
                </p>
                <p className="text-xs text-gray-400">
                  Owner:{' '}
                  {item.owner === user?.username
                    ? 'You'
                    : `@${item.owner}${
                        item.ownerName && item.owner !== user?.username
                          ? ` (${item.ownerName})`
                          : ''
                      }`}
                </p>

                <div className="flex justify-between mt-3">
                  {item.isMine ? (
                    <button
                      onClick={() => navigate('/my-listings')}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                    >
                      Manage
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/offer/${item.id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Make Offer
                    </button>
                  )}
                  <Link
                    to={`/messages/${item.owner}`}
                    className="px-3 py-1 border border-blue-200 text-blue-600 rounded-md text-sm hover:bg-blue-50"
                  >
                    Message Owner
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
