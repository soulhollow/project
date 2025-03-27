import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Settings, Heart, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                FreelanceLocal
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {user ? (
                <>
                  <Link
                    to="/for-you"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    For You
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/favorites"
                      className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Favorites"
                    >
                      <Heart className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/chat"
                      className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Messages"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/account"
                      className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {user ? (
              <>
                <Link
                  to="/for-you"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  For You
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5 mr-3" />
                  Favorites
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Messages
                </Link>
                <Link
                  to="/account"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;