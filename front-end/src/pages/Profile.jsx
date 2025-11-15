import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">
        <img
          src={user.photo}
          alt="Profile"
          className="w-32 h-32 mx-auto rounded-full border-4 border-blue-500 mb-4 object-cover"
        />
        <h1 className="text-2xl font-bold text-blue-700 mb-1">{user.name}</h1>
        <p className="text-gray-700">@{user.username}</p>
        <p className="text-gray-600 mb-6">{user.email}</p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/edit-profile')}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
