import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const demoEmail = 'demo@swapbay.com';
  const demoPassword = 'password123';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both fields.');
      return;
    }

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Unable to log in');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
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

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/reset-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail(demoEmail);
              setPassword(demoPassword);
              toast.success('Demo credentials filled in');
            }}
            className="w-full border border-blue-200 text-blue-700 py-2 rounded-md font-medium hover:bg-blue-50 transition"
          >
            Use Demo Account
          </button>
        </form>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
          <p className="font-semibold mb-1">Demo credentials</p>
          <p>Email: {demoEmail}</p>
          <p>Password: {demoPassword}</p>
        </div>

        {/* Register Link */}
        <p className="text-sm text-gray-600 text-center mt-6">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
