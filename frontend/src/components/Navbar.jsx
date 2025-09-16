import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import NavbarStreak from './NavbarStreak';

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase();
}

const themes = ['light', 'dark'];

export default function Navbar({ user, onLogout, logoTo = '/home' }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  };

  return (
    <nav className="bg-base-100 border-b border-base-300/50 px-4 py-2 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-full">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-4">
          <NavLink 
            to={logoTo}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-content" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-base-content flex items-center">
              CodeXero
            </span>
          </NavLink>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 ml-4">
            <NavLink to="/problems" className="px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-md transition-all">
              Problems
            </NavLink>
            <NavLink to="/contest" className="px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-md transition-all">
              Contest
            </NavLink>
            <NavLink to="/community" className="px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-md transition-all">
              Discuss
            </NavLink>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Streak Indicator */}
          <NavbarStreak />
        
          {/* Theme Toggle */}
          <button
            className="p-2 rounded-lg hover:bg-base-200 transition-colors"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

        {user && (
          <div className="dropdown dropdown-end">
            <div 
              tabIndex={0} 
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
            >
              {/* User Avatar */}
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8 h-8 flex items-center justify-center relative">
                  <span className="text-sm font-bold leading-none absolute inset-0 flex items-center justify-center">{getInitials(user.firstName)}</span>
                </div>
              </div>
              
              {/* User Name - Hidden on mobile */}
              <span className="hidden md:block text-sm font-medium text-base-content">{user.firstName}</span>
              
              {/* Dropdown Arrow */}
              <svg className="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Dropdown Menu */}
            <ul className="mt-2 py-2 shadow-lg menu dropdown-content bg-base-100 rounded-lg w-48 border border-base-300">
              <li>
                <NavLink to="/profile" className="px-3 py-2 text-sm hover:bg-base-200 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </NavLink>
              </li>
              
              {user.role === 'admin' && (
                <li>
                  <NavLink to="/admin" className="px-3 py-2 text-sm hover:bg-base-200 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Admin Panel
                  </NavLink>
                </li>
              )}
              
              <div className="divider my-1"></div>
              
              <li>
                <button onClick={onLogout} className="px-3 py-2 text-sm hover:bg-base-200 rounded text-left w-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
        </div>
      </div>
    </nav>
  );
} 