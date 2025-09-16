import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import NavbarStreak from './NavbarStreak';

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase();
}



function HomepageNavbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  // Theme persistence
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="group flex items-center gap-3">
              {/* Updated Logo from Welcome page */}
              <div className="relative flex items-center justify-center w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">CodeXero</span>
            </div>
          </div>

          {/* Right side: User Dropdown / Theme Toggle and Mobile Menu Button */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Streak Indicator */}
            <NavbarStreak />
            
            {/* Theme Toggle Button removed */}
            {user && (
<div className="dropdown dropdown-start">
                <div 
                  tabIndex={0} 
                  className="group flex items-center gap-3 px-2 py-1 rounded-xl transition-all duration-300 cursor-pointer"
                >
                  {/* User Avatar */}
                  <div className="relative">
                    <div className="avatar placeholder">
                      <div className="bg-gray-700 border border-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                        <span className="text-lg font-bold leading-none flex items-center justify-center w-full h-full">{getInitials(user.firstName)}</span>
                      </div>
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full shadow-sm"></div>
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden md:flex flex-col items-start">
                    <span className="font-semibold text-white text-sm">{user.firstName}</span>
                    <span className="text-xs text-gray-400">{user.role === 'admin' ? 'Administrator' : 'Developer'}</span>
                  </div>
                  
                  {/* Dropdown Arrow */}
                  <svg 
                    className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown Menu */}
<ul className="mt-3 py-3 shadow-xl menu menu-sm dropdown-content bg-gray-800 rounded-2xl w-64 border border-gray-700/50 backdrop-blur-md" style={{ zIndex: 9999 }}>
                  {/* User Header */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-gray-700 border border-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center">
                          <span className="text-xl font-bold leading-none flex items-center justify-center w-full h-full">{getInitials(user.firstName)}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <li>
                      <NavLink
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 font-medium text-white hover:bg-gray-700 rounded-lg mx-2 transition-all duration-200 group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </NavLink>
                    </li>
                    <li>
                      <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-4 py-3 font-medium text-white hover:bg-gray-700 rounded-lg mx-2 transition-all duration-200 group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </li>
                    
                    {user.role === 'admin' && (
                      <>
                        <div className="my-2 border-t border-gray-700 mx-4"></div>
                        <li>
                          <NavLink
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-3 font-medium text-white hover:bg-gray-700 rounded-lg mx-2 transition-all duration-200 group"
                          >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Panel
                          </NavLink>
                        </li>
                      </>
                    )}
                  </div>
                </ul>
              </div>
            )}
            
            
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-300 hover:text-gray-100 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 py-2 px-4 border-t border-gray-800">
          <div className="py-2">
            {/* Mobile User Dropdown / Theme Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              {user && (
                <a href="/profile" className="block py-2 font-medium text-gray-300">
                  Hello, {user.firstName}!
                </a>
              )}
              <button
                onClick={onLogout}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                Logout
              </button>
              
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default HomepageNavbar; 