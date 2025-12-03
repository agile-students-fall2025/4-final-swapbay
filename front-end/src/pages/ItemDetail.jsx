import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchItem() {
      try {
        const data = await api.get(`/api/listings/${id}`);
        if (!ignore) setItem(data.item);
      } catch (error) {
        toast.error(error.message || 'Item not found');
        if (!ignore) setItem(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchItem();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading item details...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold text-gray-700">Item not found</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl overflow-hidden">
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
        <p className="text-gray-700 mb-4">{item.description}</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Make Offer
        </button>

        <div className="mt-4">
          <Link to="/" className="text-blue-600 hover:underline">
            ← Back to listings
          </Link>
        </div>
      </div>
    </div>
  );
}
