import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !confirmEmail) {
      toast.error('Please fill in both fields.');
      return;
    }

    if (email !== confirmEmail) {
      toast.error('Emails do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email.');
    } catch (error) {
      toast.error(error.message || 'Unable to send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Reset Your Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Confirm Email
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Remembered your password?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
