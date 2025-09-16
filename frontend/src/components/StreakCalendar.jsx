import React, { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const StreakCalendar = ({ streakData }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    if (streakData?.calendar) {
      setCalendarData(streakData.calendar);
    }
  }, [streakData]);

  const getIntensityClass = (problemsSolved) => {
    if (problemsSolved === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (problemsSolved === 1) return 'bg-green-200 dark:bg-green-900';
    if (problemsSolved <= 3) return 'bg-green-300 dark:bg-green-700';
    if (problemsSolved <= 5) return 'bg-green-400 dark:bg-green-600';
    return 'bg-green-500 dark:bg-green-500';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeeksData = () => {
    const weeks = [];
    let currentWeek = [];
    
    calendarData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // If it's the last day, push the current week
      if (index === calendarData.length - 1) {
        weeks.push(currentWeek);
      }
    });
    
    return weeks;
  };

  const weeks = getWeeksData();
  const monthLabels = [];
  
  // Generate month labels
  if (calendarData.length > 0) {
    let currentMonth = '';
    calendarData.forEach((day, index) => {
      const date = new Date(day.date);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (monthName !== currentMonth && date.getDate() <= 7) {
        monthLabels.push({
          month: monthName,
          position: index
        });
        currentMonth = monthName;
      }
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Activity</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
            <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Month labels */}
        <div className="relative h-4">
          <div className="ml-12 relative">
            {monthLabels.map((label, index) => (
              <div
                key={index}
                className="absolute text-xs text-gray-500 dark:text-gray-400"
                style={{ left: `${(label.position / calendarData.length) * 100}%` }}
              >
                {label.month}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid with day labels */}
        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 w-8">
            <div className="h-3 flex items-center">Sun</div>
            <div className="h-3 flex items-center">Mon</div>
            <div className="h-3 flex items-center">Tue</div>
            <div className="h-3 flex items-center">Wed</div>
            <div className="h-3 flex items-center">Thu</div>
            <div className="h-3 flex items-center">Fri</div>
            <div className="h-3 flex items-center">Sat</div>
          </div>

          {/* Calendar grid */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1" style={{ minWidth: '700px' }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const day = week.find(d => new Date(d.date).getDay() === dayIndex);
                    
                    if (!day) {
                      return <div key={dayIndex} className="w-3 h-3"></div>;
                    }

                    return (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-gray-400 ${getIntensityClass(day.problemsSolved)}`}
                        title={`${formatDate(day.date)}: ${day.problemsSolved} problems solved`}
                        onClick={() => setSelectedDate(day)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip/Selected date info */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm">
            <div className="font-medium">{formatDate(selectedDate.date)}</div>
            <div className="text-gray-600 dark:text-gray-400">
              {selectedDate.problemsSolved} problem{selectedDate.problemsSolved !== 1 ? 's' : ''} solved
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakCalendar;