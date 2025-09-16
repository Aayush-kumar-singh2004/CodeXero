import React from 'react';

const StreakStats = ({ streakData, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStreakIcon = (streak) => {
    if (streak === 0) return '😴';
    if (streak < 7) return '🔥';
    if (streak < 30) return '🚀';
    if (streak < 100) return '⚡';
    return '👑';
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return 'Start your coding journey!';
    if (streak === 1) return 'Great start! Keep it up!';
    if (streak < 7) return 'Building momentum!';
    if (streak < 30) return 'You\'re on fire!';
    if (streak < 100) return 'Incredible dedication!';
    return 'Legendary streak!';
  };

  const getStreakColor = (streak) => {
    if (streak === 0) return 'text-gray-500';
    if (streak < 7) return 'text-orange-500';
    if (streak < 30) return 'text-red-500';
    if (streak < 100) return 'text-purple-500';
    return 'text-yellow-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">{getStreakIcon(streakData?.currentStreak || 0)}</span>
        Coding Streak
      </h3>
      
      <div className="space-y-4">
        {/* Current Streak */}
        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
          <div className={`text-4xl font-bold ${getStreakColor(streakData?.currentStreak || 0)}`}>
            {streakData?.currentStreak || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Current Streak
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {getStreakMessage(streakData?.currentStreak || 0)}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {streakData?.longestStreak || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Longest Streak
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {streakData?.totalActiveDays || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Active Days
            </div>
          </div>
        </div>

        {/* Last Activity */}
        {streakData?.lastActivityDate && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Last activity: {new Date(streakData.lastActivityDate).toLocaleDateString()}
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {streakData?.currentStreak === 0 
              ? "Solve a problem today to start your streak!" 
              : `Keep going! You're ${streakData?.currentStreak === 1 ? 'just getting started' : 'doing amazing'}!`
            }
          </div>
        </div>

        {/* Progress to next milestone */}
        {streakData?.currentStreak !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Next milestone</span>
              <span>
                {streakData.currentStreak < 7 ? `${7 - streakData.currentStreak} days to 1 week` :
                 streakData.currentStreak < 30 ? `${30 - streakData.currentStreak} days to 1 month` :
                 streakData.currentStreak < 100 ? `${100 - streakData.currentStreak} days to 100 days` :
                 'You\'ve reached legendary status!'}
              </span>
            </div>
            {streakData.currentStreak < 100 && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${
                      streakData.currentStreak < 7 ? (streakData.currentStreak / 7) * 100 :
                      streakData.currentStreak < 30 ? ((streakData.currentStreak - 7) / 23) * 100 :
                      ((streakData.currentStreak - 30) / 70) * 100
                    }%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakStats;