import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Video, Home, RefreshCw, Zap, ArrowLeft } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';

function Admin() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Check user preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    setIsMounted(true);
    
    return () => setIsMounted(false);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      gradient: 'from-emerald-500 to-teal-500',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      gradient: 'from-amber-500 to-yellow-500',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      gradient: 'from-rose-500 to-pink-500',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      gradient: 'from-indigo-500 to-purple-500',
      route: '/admin/video'
    }
  ];

  // Theme classes for light/dark mode
  const themeClasses = darkMode 
    ? 'bg-gray-900 text-gray-100' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800';

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-100';

  return (
    
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses}`}>
      {/* Back button and Theme toggle */}
      <div className="fixed top-4 left-4 z-50">
        <button 
          onClick={() => navigate('/')}
          className={`p-2 rounded-full shadow-lg transition-all duration-300 mr-2 ${
            darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleDarkMode}
          className={`p-2 rounded-full shadow-lg transition-all duration-300 ${
            darkMode 
              ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Zap size={20} /> : <Home size={20} />}
        </button>
      </div>

      <div className={`container mx-auto px-4 py-8 transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Animated header */}
        <div className="text-center mb-16">
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
              Admin Panel
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
          </div>
          <p className={`text-lg max-w-2xl mx-auto mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage coding problems and video content on your platform with these powerful tools
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <NavLink 
                key={option.id}
                to={option.route}
                className="block"
              >
                <div className={`
                  h-full border rounded-2xl overflow-hidden shadow-xl
                  transform transition-all duration-500 hover:scale-105
                  ${cardClasses}
                `}>
                  {/* Card header with gradient */}
                  <div className={`h-2 bg-gradient-to-r ${option.gradient}`}></div>
                  
                  <div className="p-6">
                    {/* Icon with gradient background */}
                    <div className={`
                      w-16 h-16 rounded-xl flex items-center justify-center mb-6
                      bg-gradient-to-br ${option.gradient} text-white
                      shadow-lg
                    `}>
                      <IconComponent size={28} />
                    </div>
                    
                    {/* Title with gradient text */}
                    <h2 className={`
                      text-xl font-bold mb-2 bg-clip-text text-transparent
                      bg-gradient-to-r ${option.gradient}
                    `}>
                      {option.title}
                    </h2>
                    
                    {/* Description */}
                    <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {option.description}
                    </p>
                    
                    {/* Action Button */}
                    <div className="flex justify-end">
                      <button className={`
                        px-4 py-2 rounded-lg font-medium transition-all duration-300
                        ${darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                      `}>
                        Go to {option.title.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Stats section */}
        <div className={`mt-16 max-w-4xl mx-auto p-8 rounded-3xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-6 text-center">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard 
              title="Problems" 
              value="142" 
              change="+12" 
              darkMode={darkMode} 
              icon={<Plus size={20} />}
              gradient="from-green-400 to-emerald-500"
            />
            <StatCard 
              title="Videos" 
              value="86" 
              change="+8" 
              darkMode={darkMode} 
              icon={<Video size={20} />}
              gradient="from-blue-400 to-indigo-500"
            />
            <StatCard 
              title="Users" 
              value="3.2k" 
              change="+214" 
              darkMode={darkMode} 
              icon={<Home size={20} />}
              gradient="from-amber-400 to-orange-500"
            />
            <StatCard 
              title="Solutions" 
              value="1.8k" 
              change="+142" 
              darkMode={darkMode} 
              icon={<RefreshCw size={20} />}
              gradient="from-purple-400 to-pink-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({ title, value, change, darkMode, icon, gradient }) {
  return (
    <div className={`
      p-5 rounded-2xl transition-all duration-300
      ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}
    `}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-rose-500'}`}>
            {change} this week
          </p>
        </div>
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          bg-gradient-to-br ${gradient} text-white
        `}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Admin;