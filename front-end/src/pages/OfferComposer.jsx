import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { mockItems } from '../utils/mockItems'; // marketplace items w/ owner (seller)
import { useItems } from '../context/ItemContext'; // YOUR items (dynamic)
import { useOffers } from '../context/OfferContext';
import toast from 'react-hot-toast';

export default function OfferComposer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items } = useItems();
  const { addOffer } = useOffers();

  const targetItem = useMemo(
    () => mockItems.find((i) => i.id === parseInt(id)),
    [id]
  );

  // Only allow swapping with items that are private (not listed) so it’s realistic
  const myPrivateItems = useMemo(
    () => items.filter((i) => i.status === 'private'),
    [items]
  );

  const [selectedType, setSelectedType] = useState(
    targetItem?.offerType === 'both' ? 'money' : targetItem?.offerType || 'money'
  );
  const [moneyAmount, setMoneyAmount] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');

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

  const handleConfirm = () => {
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
        ? myPrivateItems.find((i) => i.id === parseInt(selectedItemId))
        : null;

    // Build full outgoing-offer object (matches mockMyOffers schema)
    const newOffer = {
      id: Date.now(),
      status: 'Pending',                 // 'Pending' | 'Accepted' | 'Rejected' | 'Canceled'
      offerType: selectedType,           // 'money' | 'swap' | 'both'
      amount: Number(moneyAmount) || 0,  // used for money/both
      myItemId: myItem?.id || null,
      myItem: myItem
        ? {
            id: myItem.id,
            title: myItem.title,
            category: myItem.category,
            condition: myItem.condition || 'Good',
            description: myItem.description || '',
            image: myItem.image,
          }
        : null,
      target: {
        title: targetItem.title,
        sellerUsername: targetItem.owner,
        category: targetItem.category,
        condition: targetItem.condition,
        description: targetItem.description,
        image: targetItem.image,
      },
    };

    addOffer(newOffer);
    toast.success('Offer created successfully!');
    navigate('/my-offers');
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
              Select Item to Swap (from your private items)
            </label>
            {myPrivateItems.length === 0 ? (
              <p className="text-gray-500 text-sm">
                You have no private items available. Go to <b>My Items</b> to add one.
              </p>
            ) : (
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Choose an item --</option>
                {myPrivateItems.map((i) => (
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
              ? myPrivateItems.find((i) => i.id === parseInt(selectedItemId))?.title ||
                'No item selected'
              : `${myPrivateItems.find((i) => i.id === parseInt(selectedItemId))?.title ||
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
