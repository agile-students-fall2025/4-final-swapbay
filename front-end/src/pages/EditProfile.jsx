import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { uploadImage } from '../utils/image';

export default function EditProfile() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    photo: user?.photo || 'https://picsum.photos/200',
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'avatar');
      setForm({ ...form, photo: url });
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      toast.success('Account deleted');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="flex flex-col items-center space-y-3">
            <img
              src={form.photo}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
            />
            <label className="bg-blue-600 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-blue-700">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value.replace(/\s+/g, '').toLowerCase(),
                })
              }
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3 pt-3">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
