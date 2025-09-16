import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { getStreakColor, getStreakIcon, getStreakMessage } from '../utils/streakUtils';

const NavbarStreak = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStreak = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosClient.get('/streak');
        setStreakData(response.data);
      } catch (error) {
        console.error('Error fetching streak:', error);
        // Set default streak data if API fails
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          totalActiveDays: 0,
          lastActivityDate: null,
          calendar: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [isAuthenticated, user]);

  // Refresh streak data when user solves a problem (listen for storage events or implement a context)
  useEffect(() => {
    const handleStreakUpdate = () => {
      if (isAuthenticated && user) {
        fetchStreak();
      }
    };

    // Listen for custom streak update events
    window.addEventListener('streakUpdated', handleStreakUpdate);
    return () => window.removeEventListener('streakUpdated', handleStreakUpdate);
  }, [isAuthenticated, user]);

  const fetchStreak = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const response = await axiosClient.get('/streak');
      setStreakData(response.data);
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  
  // Debug logging
  console.log('NavbarStreak - isAuthenticated:', isAuthenticated);
  console.log('NavbarStreak - user:', user);
  console.log('NavbarStreak - streakData:', streakData);
  console.log('NavbarStreak - loading:', loading);

  const handleClick = () => {
    navigate('/profile?tab=streak');
  };

  return (
    <div 
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl    hover:border-primary/30  transition-all duration-300 cursor-pointer group hover:scale-105"
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
        {/* Changed from getStreakIcon(currentStreak) to 🔥 */}
        🔥
      </span>
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${getStreakColor(currentStreak)} group-hover:scale-105 transition-transform duration-200`}>
          {currentStreak}
        </span>
        <span className="text-xs text-base-content/60 dark:text-gray-400 leading-none">
          streak
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-base-300 dark:bg-gray-700 text-base-content dark:text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-base-200 dark:border-gray-600 whitespace-nowrap">
            <div className="font-semibold">{getStreakMessage(currentStreak)}</div>
            <div className="text-base-content/60 dark:text-gray-400">
              Longest: {longestStreak} days
            </div>
            <div className="text-base-content/60 dark:text-gray-400">
              Click to view details
            </div>
            {/* Arrow */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-base-300 dark:bg-gray-700 border-l border-t border-base-200 dark:border-gray-600 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarStreak;