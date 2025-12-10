import { useParams, useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useOffers } from '../context/OfferContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { uploadImage } from '../utils/image';
const CATEGORIES = ['Electronics', 'Sports', 'Computers', 'Books', 'Home', 'Misc'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Used'];
export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, editItem, isItemOffered } = useItems();
  const { offers } = useOffers();
  const item = items.find((i) => i.id === id);
  const [form, setForm] = useState(() => ({
    title: item?.title || '',
    category: item?.category || 'Misc',
    condition: item?.condition || 'Good',
    description: item?.description || '',
    image: item?.image || 'https://picsum.photos/seed/editpreview/600/400',
  }));
  if (!item) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold text-gray-700">Item not found</h2>
        <button
          onClick={() => navigate('/my-items')}
          className="text-blue-600 hover:underline mt-2"
        >
          ← Back to My Items
        </button>
      </div>
    );
  }
  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'item');
      setForm((prev) => ({ ...prev, image: url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const offered = isItemOffered(item.title, offers);
    const listed = item.status === 'public';
    if (offered || listed) {
      toast.error('Cannot edit an item that is offered or listed.');
      return;
    }
    try {
      await editItem(item.id, form, offers);
      toast.success('Item updated!');
      navigate('/my-items');
    } catch (error) {
      toast.error(error.message || 'Failed to update item');
    }
  };
  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Edit Item</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <img
            src={form.image}
            alt="preview"
            className="w-64 h-40 object-cover rounded-lg border"
          />
          <label className="bg-blue-600 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-blue-700">
            Change Image
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Item title"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              name="condition"
              value={form.condition}
              onChange={onChange}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/my-items')}
            className="px-4 py-2 rounded-md border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
