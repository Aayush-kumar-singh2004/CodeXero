import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router';
import { logoutUser } from '../authSlice';
import HomepageNavbar from '../components/HomepageNavbar';
import axiosClient from '../utils/axiosClient';

// Custom hook for detecting when elements enter the viewport
function useInView(options = { threshold: 0.1, triggerOnce: true }) {
  const [inView, setInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (options.triggerOnce) {
          observer.unobserve(entry.target);
        }
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, inView];
}

// Optimized Animation wrapper component
const AnimatedElement = ({
  children,
  animation = "fadeUp",
  delay = 0,
  className = "",
  ...props
}) => {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  const animationStyles = {
    base: `transition-opacity duration-500 ease-out transform`, // Reduced duration for better performance
    fadeUp: inView
      ? `opacity-100 translate-y-0`
      : `opacity-0 translate-y-4`, // Reduced translate distance
    fadeIn: inView
      ? `opacity-100`
      : `opacity-0`,
    slideLeft: inView
      ? `opacity-100 translate-x-0`
      : `opacity-0 -translate-x-4`, // Reduced translate distance
    slideRight: inView
      ? `opacity-100 translate-x-0`
      : `opacity-0 translate-x-4`, // Reduced translate distance
    zoom: inView
      ? `opacity-100 scale-100`
      : `opacity-0 scale-98` // Reduced scale difference
  };

  return (
    <div
      ref={ref}
      className={`${animationStyles.base} ${animationStyles[animation]} ${className}`}
      style={{
        transitionDelay: inView ? `${delay}ms` : '0ms',
        willChange: inView ? 'auto' : 'transform, opacity', // Optimize will-change
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Disabled mouse effects for better scroll performance
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [hoveredCard, setHoveredCard] = useState(null);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all problems
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);

        // Fetch solved problems
        const solvedResponse = await axiosClient.get('/problem/problemSolvedByUser');
        const solvedProblems = solvedResponse.data;
        setSolvedProblems(solvedProblems);

        // Fetch user progress data
        console.log('Fetching progress data...');
        try {
          // First test if basic streak endpoint works
          const basicStreakResponse = await axiosClient.get('/streak');
          console.log('Basic streak data:', basicStreakResponse.data);
          
          // Now try the progress endpoint
          const progressResponse = await axiosClient.get('/streak/progress');
          console.log('Progress data received:', progressResponse.data);
          setProgressData(progressResponse.data);
        } catch (progressError) {
          console.error('Progress API error:', progressError);
          // Fallback to basic streak data if progress fails
          try {
            const basicStreakResponse = await axiosClient.get('/streak');
            console.log('Using basic streak data as fallback');
            setProgressData({
              streak: {
                current: basicStreakResponse.data.currentStreak || 0,
                longest: basicStreakResponse.data.longestStreak || 0,
                totalActiveDays: basicStreakResponse.data.totalActiveDays || 0
              },
              problems: { solved: solvedProblems.length, successRate: 0, avgPerWeek: 0 },
              monthlyProgress: [],
              calendar: basicStreakResponse.data.calendar || [],
              recentActivity: []
            });
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            throw progressError; // Re-throw original error
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set empty progress data to prevent infinite loading
        setProgressData({
          streak: { current: 0, longest: 0, totalActiveDays: 0 },
          problems: { solved: 0, successRate: 0, avgPerWeek: 0 },
          monthlyProgress: [],
          calendar: [],
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  // Stats data for cleaner mapping
  const stats = [
    {
      icon: (
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      value: problems.length,
      label: "Total Problems",
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      value: solvedProblems.length,
      label: "Problems Solved",
    },
    {
      icon: (
        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      value: problems.length > 0 ? Math.round((solvedProblems.length / problems.length) * 100) : 0,
      label: "Completion Rate",
    }
  ];

  // Navigation cards data - includes all sidebar items plus extra cards
  const navCards = [
    {
      to: "/home",
      icon: (
        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: "Home",
      description: "Return to your personalized dashboard with progress tracking and insights",
      buttonText: "Go Home",
    },
    {
      to: "/problems",
      icon: (
        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Problems",
      description: "Browse and solve coding problems from all categories and difficulty levels",
      buttonText: "View Problems",
    },
    {
      to: "/community",
      icon: (
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      title: "Community",
      description: "Join discussions, share approaches, and learn from fellow developers",
      buttonText: "Join Community",
    },
    {
      to: "/leaderboard",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      title: "Leaderboard",
      description: "See how you stack up against other coders and track your progress",
      buttonText: "View Leaderboard",
    },
    {
      to: "/profile",
      icon: (
        <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "Profile",
      description: "View and manage your coding profile, achievements, and statistics",
      buttonText: "View Profile",
    },
    {
      to: "/practice",
      icon: (
        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Practice",
      description: "Sharpen your coding skills with curated practice problems and mock interviews",
      buttonText: "Start Practicing",
    },
    {
      to: "/contest",
      icon: (
        <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Contest",
      description: "Compete in timed contests, solve random problems, and climb the leaderboard",
      buttonText: "Enter Contest",
    },
    {
      to: "/visualize",
      icon: (
        <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Visualize",
      description: "Visualize algorithms and data structures to better understand concepts",
      buttonText: "Start Visualizing",
    },
   
    // Extra cards
    {
      to: "/data-structures",
      icon: (
        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2m0 0V9a2 2 0 012-2m0 0V7a2 2 0 012-2h10a2 2 0 012 2v2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
        </svg>
      ),
      title: "Data Structures",
      description: "Learn and practice fundamental data structures with interactive examples",
      buttonText: "Explore Data Structures",
    },
    {
      to: "/algorithms",
      icon: (
        <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Algorithms",
      description: "Master essential algorithms with step-by-step explanations and implementations",
      buttonText: "Study Algorithms",
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "radial-gradient(circle at top left, #1e1b4b, #121212)" }}>
        <HomepageNavbar user={user} onLogout={handleLogout} />
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
            <p className="text-gray-400 text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: 'home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home',
      to: '/home'
    },
    {
      id: 'problems',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Problems',
      to: '/problems'
    },
   
    {
      id: 'community',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      label: 'Community',
      to: '/community'
    },
    {
      id: 'leaderboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      label: 'Leaderboard',
      to: '/leaderboard'
    },

    {
      id: 'profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile',
      to: '/profile'
    },
    {
      id: 'practice',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: 'Practice',
      to: '/practice'
    },
    {
      id: 'contest',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      label: 'Contest',
      to: '/contest'
    },
    {
      id: 'visualize',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Visualize',
      to: '/visualize'
    },
     
  ];

  return (
    <div
      className="min-h-screen font-sans text-gray-200"
      style={{ 
        background: `
          radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
          linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
        `,
        position: 'relative'
      }}
    >
      {/* Optimized mouse effect overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 25%, transparent 50%)`,
          zIndex: 1,
          willChange: 'background'
        }}
      />
      {/* Fixed Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-12 sm:w-16' : 'w-56 sm:w-64'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out fixed left-0 top-0 h-screen flex-shrink-0 z-20`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-2 sm:-right-3 top-4 sm:top-6 w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ zIndex: 30 }}
        >
          <svg 
            className={`w-2 h-2 sm:w-3 sm:h-3 text-gray-300 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo */}
        <div className={`${sidebarCollapsed ? 'p-2 sm:p-4' : 'p-4 sm:p-6'} border-b border-gray-800 transition-all duration-300`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg sm:text-xl font-bold text-white transition-opacity duration-200">CodeXero</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-1 sm:p-2' : 'p-2 sm:p-4'} transition-all duration-300`}>
          <div className="space-y-1 sm:space-y-2">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-2 sm:px-3 sm:py-3' : 'gap-2 sm:gap-3 px-2 py-2 sm:px-4 sm:py-3'} rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`
                }
                title={sidebarCollapsed ? item.label : ''}
              >
                <div className="flex-shrink-0">
                  <div className="w-4 h-4 sm:w-6 sm:h-6">
                    {item.icon}
                  </div>
                </div>
                {!sidebarCollapsed && (
                  <span className="font-medium transition-opacity duration-200 text-sm sm:text-base truncate">{item.label}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs sm:text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className={`${sidebarCollapsed ? 'p-1 sm:p-2' : 'p-2 sm:p-4'} border-t border-gray-800 transition-all duration-300`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2 sm:gap-3'}`}>
            
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-200">
                <p className="text-white font-medium text-xs sm:text-sm truncate">{user.firstName} {user.lastName}</p>
                <p className="text-gray-400 text-xs truncate">{user.emailId}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen relative z-10 ${sidebarCollapsed ? 'ml-12 sm:ml-16' : 'ml-56 sm:ml-64'} transition-all duration-300 ease-in-out`} style={{ isolation: 'isolate' }}>
        {/* Fixed Top Header */}
        <div className="bg-gray-900/20 backdrop-blur-lg border-b border-gray-800 p-4 sm:p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Ready to tackle some coding challenges?
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {user.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className="px-3 py-2 sm:px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700 flex items-center justify-center text-sm sm:text-base"
                >
                  Admin
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700 text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Dashboard Content */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden" 
          style={{ 
            scrollBehavior: 'auto',
            transform: 'translateZ(0)',
            willChange: 'scroll-position'
          }}
        >
          <div className="p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <AnimatedElement
                key={index}
                animation="zoom"
                delay={index * 150}
              >
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-800/50 rounded-xl group-hover:bg-indigo-900/50 transition-colors flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl sm:text-2xl font-bold text-white truncate">
                        {stat.value}{stat.label === "Completion Rate" && "%"}
                      </p>
                      <p className="text-gray-400 text-sm sm:text-base truncate">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            ))}
          </div>

          {/* Track Your Progress Section */}
          <AnimatedElement animation="fadeUp" delay={200}>
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800 mb-6 sm:mb-8">
              {!progressData ? (
                <div className="flex justify-center items-center py-8 sm:py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    <p className="text-gray-400 text-sm sm:text-base">Loading your progress...</p>
                  </div>
                </div>
              ) : (
                <>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Track Your Progress</h2>
                  <p className="text-gray-400 text-sm sm:text-base">Monitor your coding journey and maintain your streak</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-orange-400">🔥</div>
                    <div className="text-base sm:text-lg font-bold text-white">{progressData?.streak?.current || 0}</div>
                    <div className="text-xs text-gray-400">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">📈</div>
                    <div className="text-base sm:text-lg font-bold text-white">{progressData?.monthlyProgress?.[5]?.solved || 0}</div>
                    <div className="text-xs text-gray-400">This Month</div>
                  </div>
                </div>
              </div>

              {/* Progress Charts Container */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                {/* Activity Heatmap */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Activity Heatmap</h3>
                  <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-xs sm:text-sm text-gray-400">Less</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-700 rounded-sm"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-900 rounded-sm"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-700 rounded-sm"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-sm"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-sm"></div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-400">More</span>
                    </div>
                    
                    {/* Heatmap Grid */}
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 overflow-x-auto">
                      {(progressData?.calendar || Array.from({ length: 91 }, () => ({ problemsSolved: 0, hasActivity: false }))).map((day, i) => {
                        const intensity = Math.min(4, day.problemsSolved);
                        const colors = [
                          'bg-gray-700',
                          'bg-green-900',
                          'bg-green-700',
                          'bg-green-500',
                          'bg-green-400'
                        ];
                        return (
                          <div
                            key={i}
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-sm ${colors[intensity]} hover:ring-1 hover:ring-green-400 transition-all cursor-pointer`}
                            title={`${day.problemsSolved} problems solved${day.date ? ` on ${new Date(day.date).toLocaleDateString()}` : ''}`}
                          ></div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>3 months ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Progress Chart */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Monthly Progress</h3>
                  <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700">
                    <div className="space-y-2 sm:space-y-3">
                      {(progressData?.monthlyProgress || []).map((data, index) => {
                        const percentage = data.total > 0 ? (data.solved / data.total) * 100 : 0;
                        return (
                          <div key={index} className="space-y-1 sm:space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-300 truncate">{data.month}</span>
                              <span className="text-gray-400 flex-shrink-0 ml-2">{data.solved}/{data.total}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 sm:h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak Information */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1 sm:mb-2">🏆</div>
                  <div className="text-base sm:text-lg font-bold text-white">{progressData?.streak?.longest || 0}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Longest Streak</div>
                </div>
                
                <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1 sm:mb-2">📊</div>
                  <div className="text-base sm:text-lg font-bold text-white">{progressData?.problems?.avgPerWeek || 0}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Avg Problems/Week</div>
                </div>
                
                <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1 sm:mb-2">⚡</div>
                  <div className="text-base sm:text-lg font-bold text-white">{progressData?.problems?.successRate || 0}%</div>
                  <div className="text-xs sm:text-sm text-gray-400">Success Rate</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Recent Activity</h3>
                <div className="space-y-2 sm:space-y-3">
                  {(progressData?.recentActivity || []).length > 0 ? (
                    progressData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-800/30 rounded-lg p-3 border border-gray-700 gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            activity.status === 'solved' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}></div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-medium text-sm sm:text-base truncate">{activity.problem}</div>
                            <div className="text-xs sm:text-sm text-gray-400">{activity.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
                            activity.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                            activity.difficulty === 'hard' ? 'bg-red-900 text-red-300' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {activity.difficulty?.charAt(0).toUpperCase() + activity.difficulty?.slice(1) || 'Unknown'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'solved' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {activity.status === 'solved' ? 'Solved' : 'Attempted'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-400">
                      <div className="text-3xl sm:text-4xl mb-2">🚀</div>
                      <div className="text-base sm:text-lg font-medium">No recent activity</div>
                      <div className="text-xs sm:text-sm">Start solving problems to see your progress here!</div>
                    </div>
                  )}
                </div>
              </div>
                </>
              )}
            </div>
          </AnimatedElement>

          {/* Quick Actions */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {navCards.map((card, index) => (
                <AnimatedElement
                  key={index}
                  animation="fadeUp"
                  delay={index * 100}
                >
                  <NavLink 
                    to={card.to}
                    className="block"
                  >
                    <div className="bg-gray-900/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl group hover:border-indigo-500/30 cursor-pointer h-full">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-800/50 rounded-xl group-hover:bg-indigo-900/30 transition-colors flex-shrink-0">
                          {card.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                            {card.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                        {card.description}
                      </p>
                      <div className="flex items-center text-indigo-400 text-xs sm:text-sm font-medium group-hover:text-indigo-300 transition-colors">
                        <span className="truncate">{card.buttonText}</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transform group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </NavLink>
                </AnimatedElement>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Optimized for performance - no smooth scroll */
        * {
          box-sizing: border-box;
        }
        
        html, body {
          overflow: visible;
          scroll-behavior: auto;
        }
        
        /* High-performance scrolling */
        div[class*="overflow-y-auto"] {
          scroll-behavior: auto !important;
          overscroll-behavior: none;
          -webkit-overflow-scrolling: auto;
          transform: translateZ(0);
          will-change: scroll-position;
          contain: layout style paint;
        }
        
        /* Disable transitions during scroll for performance */
        * {
          transition: none !important;
          animation: none !important;
        }
        
        /* Re-enable only essential hover effects */
        .hover\\:bg-gray-700:hover {
          background-color: rgb(55 65 81);
        }
        
        .hover\\:bg-gray-800\\/50:hover {
          background-color: rgb(31 41 55 / 0.5);
        }
        
        /* Minimal scrollbar */
        div[class*="overflow-y-auto"]::-webkit-scrollbar {
          width: 6px;
        }
        
        div[class*="overflow-y-auto"]::-webkit-scrollbar-track {
          background: transparent;
        }
        
        div[class*="overflow-y-auto"]::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 3px;
        }
        
        div[class*="overflow-y-auto"]::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
        
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          33% {
            transform: translateY(-8px) scale(1.05);
          }
          66% {
            transform: translateY(-4px) scale(0.95);
          }
        }
        
        @keyframes borderPan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle linear infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* Optimized hover animations */
        .homepage-card-inner-glow {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          will-change: transform;
          transform: translateZ(0); /* Force hardware acceleration */
        }
        
        .homepage-card-inner-glow:hover {
          transform: translateY(-4px) translateZ(0);
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.2);
        }
        
        .homepage-card-inner-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.2));
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .homepage-card-inner-glow:hover::before {
          opacity: 1;
        }

        /* Line clamp utility for better text truncation */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Mobile-specific adjustments */
        @media (max-width: 640px) {
          .homepage-card-inner-glow:hover {
            transform: translateY(-4px) scale(1.01);
          }
        }
      `}</style>
    </div>
  );
}

export default Homepage;