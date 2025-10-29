import { useState } from 'react';
import { mockItems } from '../utils/mockItems';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Home() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [offerTypeFilter, setOfferTypeFilter] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Electronics', 'Sports', 'Computers'];
  const offerTypes = ['All', 'Money Only', 'Swap Only', 'Both'];

  const filteredItems = mockItems.filter((item) => {
    const matchesCategory =
      categoryFilter === 'All' ||
      item.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesOfferType =
      offerTypeFilter === 'All' ||
      (offerTypeFilter === 'Money Only' && item.offerType === 'money') ||
      (offerTypeFilter === 'Swap Only' && item.offerType === 'swap') ||
      (offerTypeFilter === 'Both' && item.offerType === 'both');

    const matchesQuery = item.title
      .toLowerCase()
      .includes(query.toLowerCase());

    return matchesCategory && matchesOfferType && matchesQuery;
  });

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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {categories.map((c) => (
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
      {filteredItems.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
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
                    ? 'Money Only 💵'
                    : item.offerType === 'swap'
                    ? 'Swap Only 🔁'
                    : 'Both 💵 + 🔁'}
                </p>

                <p className="text-gray-700 text-sm">{item.description}</p>
                <p className="text-xs text-gray-400">Owner: @{item.owner}</p>

                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => navigate(`/offer/${item.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Make Offer
                  </button>
                  <Link
                    to={`/messages/${item.owner}`}
                    className="text-blue-600 hover:underline text-sm"
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
