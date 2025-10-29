import { useParams, Link } from 'react-router-dom';
import { mockItems } from '../utils/mockItems';

export default function ItemDetail() {
  const { id } = useParams();
  const item = mockItems.find((i) => i.id === parseInt(id));

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
