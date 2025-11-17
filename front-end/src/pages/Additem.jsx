import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import toast from 'react-hot-toast';
import { readImageFile } from '../utils/image';

const CATEGORIES = ['Electronics', 'Sports', 'Computers', 'Books', 'Home', 'Misc'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Used'];

export default function AddItem() {
  const { addItem } = useItems();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: 'Misc',
    condition: 'Good',
    description: '',
    image: 'https://picsum.photos/seed/newitem/600/400',
  });

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      setForm(prev => ({ ...prev, image: dataUrl }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      await addItem(form);
      toast.success('Item added!');
      navigate('/my-items');
    } catch (error) {
      toast.error(error.message || 'Failed to add item');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Add New Item</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <img src={form.image} alt="preview" className="w-64 h-40 object-cover rounded-lg border" />
          <label className="bg-blue-600 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-blue-700">
            Upload Image
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
            placeholder="e.g., DSLR Camera"
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
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Short details about your item..."
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
            Save Item
          </button>
        </div>
      </form>
    </div>
  );
}
