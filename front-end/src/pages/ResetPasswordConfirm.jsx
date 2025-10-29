import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ResetPasswordConfirm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      toast.error('Please fill in both fields.');
      return;
    }

    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    toast.success('Password reset successfully!');
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Set New Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Reset Password
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Back to{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}

