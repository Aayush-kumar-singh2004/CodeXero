// Utility function to dispatch streak update event
export const dispatchStreakUpdate = () => {
  const event = new CustomEvent('streakUpdated');
  window.dispatchEvent(event);
};

// Utility function to get streak color class
export const getStreakColor = (streak) => {
  if (streak === 0) return 'text-gray-500 dark:text-gray-400';
  if (streak < 7) return 'text-orange-500 dark:text-orange-400';
  if (streak < 30) return 'text-red-500 dark:text-red-400';
  if (streak < 100) return 'text-purple-500 dark:text-purple-400';
  return 'text-yellow-500 dark:text-yellow-400';
};

// Utility function to get streak icon
export const getStreakIcon = (streak) => {
  if (streak === 0) return '😴';
  if (streak < 7) return '🔥';
  if (streak < 30) return '🚀';
  if (streak < 100) return '⚡';
  return '👑';
};

// Utility function to get streak message
export const getStreakMessage = (streak) => {
  if (streak === 0) return 'Start your coding journey!';
  if (streak === 1) return 'Great start! Keep it up!';
  if (streak < 7) return 'Building momentum!';
  if (streak < 30) return 'You\'re on fire!';
  if (streak < 100) return 'Incredible dedication!';
  return 'Legendary streak!';
};