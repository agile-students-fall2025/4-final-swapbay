import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'My Items', path: '/my-items' },
    { name: 'Messages', path: '/messages' },
    { name: 'Listings', path: '/my-listings' },
    { name: 'Offers', path: '/my-offers' },
  ];

  return (
    <header className="bg-white shadow sticky top-0 z-20">
      <nav className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2"
        >
          <img src="/vite.svg" alt="SwapBay logo" className="h-8 w-auto" />
          <span>SwapBay</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium items-center">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`hover:text-blue-600 transition ${
                  location.pathname === link.path ? 'text-blue-600' : ''
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}

          {/* Profile Picture */}
          <li>
            <Link to="/profile">
              <img
                src={user?.photo || 'https://picsum.photos/80'}
                alt="Profile"
                className="w-9 h-9 rounded-full border-2 border-blue-500 hover:scale-105 transition-transform"
              />
            </Link>
          </li>

          {/* Logout */}
          <li>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700"
            >
              Logout
            </button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl focus:outline-none"
        >
          ☰
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <ul className="md:hidden bg-white border-t text-gray-700 font-medium">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className="block p-3 border-b hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}

          <li>
            <Link
              to="/profile"
              className="flex items-center gap-2 p-3 hover:bg-gray-100 border-t"
              onClick={() => setMenuOpen(false)}
            >
              <img
                src={user?.photo || 'https://picsum.photos/80'}
                alt="Profile"
                className="w-8 h-8 rounded-full border"
              />
              Profile
            </Link>
          </li>

          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left p-3 text-red-600 hover:bg-gray-100 border-t"
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </header>
  );
}
