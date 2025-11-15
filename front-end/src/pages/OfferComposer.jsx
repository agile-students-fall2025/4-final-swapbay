import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useItems } from '../context/ItemContext'; // YOUR items (dynamic)
import { useOffers } from '../context/OfferContext';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export default function OfferComposer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items } = useItems();
  const { addOffer } = useOffers();

  const [targetItem, setTargetItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Allow swapping with any of my available items (listed or private)
  const myOfferableItems = useMemo(
    () => items.filter((i) => i.available),
    [items]
  );

  const [selectedType, setSelectedType] = useState('money');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');

  useEffect(() => {
    let ignore = false;
    async function fetchListing() {
      try {
        const data = await api.get(`/api/listings/${id}`);
        if (!ignore) {
          setTargetItem(data.item);
          const defaultType =
            data.item.offerType === 'both' ? 'money' : data.item.offerType;
          setSelectedType(defaultType);
        }
      } catch (error) {
        toast.error(error.message || 'Listing not available');
        if (!ignore) setTargetItem(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchListing();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">Loading listing...</div>
    );
  }

  if (!targetItem) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold text-gray-700">Item not found</h2>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:underline mt-2"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const handleConfirm = async () => {
    // Validate based on chosen type
    if ((selectedType === 'money' || selectedType === 'both') && !moneyAmount.trim()) {
      return toast.error('Please enter an offer amount.');
    }
    if ((selectedType === 'swap' || selectedType === 'both') && !selectedItemId) {
      return toast.error('Please select one of your items to swap.');
    }

    // Pull my offered item (only for swap/both)
    const myItem =
      selectedType === 'swap' || selectedType === 'both'
        ? myOfferableItems.find((i) => i.id === parseInt(selectedItemId))
        : null;

    try {
      await addOffer({
        listingId: targetItem.id,
        offerType: selectedType,
        amount: Number(moneyAmount) || 0,
        myItemId: myItem?.id || null,
      });
      toast.success('Offer created successfully!');
      navigate('/my-offers');
    } catch (error) {
      toast.error(error.message || 'Failed to create offer');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
      {/* Target item (what you’re buying) */}
      <img
        src={targetItem.image}
        alt={targetItem.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-blue-700">{targetItem.title}</h1>
        <p className="text-gray-600">{targetItem.description}</p>
        <p className="text-sm text-gray-500">
          Category: {targetItem.category} • Condition: {targetItem.condition}
        </p>
        <p className="font-semibold text-blue-600">
          Seller Offer Type:{' '}
          {targetItem.offerType === 'money'
            ? 'Money Only'
            : targetItem.offerType === 'swap'
            ? 'Swap Only'
            : 'Both'}
        </p>

        {/* Offer type choice (only if seller accepts both) */}
        {targetItem.offerType === 'both' && (
          <div className="space-y-1">
            <label className="font-medium text-gray-700">Choose Offer Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
            >
              <option value="money">Money Only</option>
              <option value="swap">Swap Only</option>
              <option value="both">Both (Money + Swap)</option>
            </select>
          </div>
        )}

        {/* Money input */}
        {(selectedType === 'money' || selectedType === 'both') && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Offer Amount ($)
            </label>
            <input
              type="number"
              value={moneyAmount}
              onChange={(e) => setMoneyAmount(e.target.value)}
              placeholder="Enter your offer amount"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Swap item selector */}
        {(selectedType === 'swap' || selectedType === 'both') && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Select Item to Swap (from your available items)
            </label>
            {myOfferableItems.length === 0 ? (
              <p className="text-gray-500 text-sm">
                You have no available items. Go to <b>My Items</b> to add one.
              </p>
            ) : (
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Choose an item --</option>
                {myOfferableItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title} ({i.category})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 border-t pt-3 text-gray-700 text-sm">
          <p>
            <b>Your Offer:</b>{' '}
            {selectedType === 'money'
              ? `$${moneyAmount || '0'}`
              : selectedType === 'swap'
              ? myOfferableItems.find((i) => i.id === parseInt(selectedItemId))?.title ||
                'No item selected'
              : `${myOfferableItems.find((i) => i.id === parseInt(selectedItemId))?.title ||
                  'No item'} + $${moneyAmount || '0'}`}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm Offer
          </button>
        </div>
      </div>
    </div>
  );
}
