import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router'; // If you use react-router-dom, change this import!
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';

function Algorithms() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mouse effect states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);

        // Fetch all problems
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);

        // Fetch solved problems
        const solvedResponse = await axiosClient.get('/problem/problemSolvedByUser');
        const solvedProblems = solvedResponse.data;
        setSolvedProblems(solvedProblems);

      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProblems();
    }
  }, [user]);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Algorithms list
  const algorithms = [
    {
      id: 'sorting',
      name: 'Sorting Algorithms',
      description: 'Bubble sort, merge sort, quick sort, and other sorting techniques',
      icon: '🔄',
      problems: problems.filter(p => p.tags === 'sortingalgorithms'),
      solved: solvedProblems.filter(
        sp => problems.find(p => p._id === sp._id)?.tags === 'sortingalgorithms'
      ).length
    },
    {
      id: 'searching',
      name: 'Searching Algorithms',
      description: 'Binary search, linear search, and advanced searching techniques',
      icon: '🔍',
      problems: problems.filter(p => p.tags === 'searchingalgorithms'),
      solved: solvedProblems.filter(
        sp => problems.find(p => p._id === sp._id)?.tags === 'searchingalgorithms'
      ).length
    },
    {
      id: 'dp',
      name: 'Dynamic Programming',
      description: 'Memoization, tabulation, and optimization problems',
      icon: '🧠',
      problems: problems.filter(p => p.tags === 'dynamicprogramming'),
      solved: solvedProblems.filter(
        sp => problems.find(p => p._id === sp._id)?.tags === 'dynamicprogramming'
      ).length
    },
    {
      id: 'greedy',
      name: 'Greedy Algorithms',
      description: 'Greedy choice property and optimization strategies',
      icon: '🎯',
      problems: problems.filter(p => p.tags === 'greedyalgorithm'),
      solved: solvedProblems.filter(
        sp => problems.find(p => p._id === sp._id)?.tags === 'greedyalgorithm'
      ).length
    },
    {
      id: 'backtracking',
      name: 'Backtracking',
      description: 'Recursive backtracking and constraint satisfaction problems',
      icon: '🔄',
      problems: problems.filter(p => p.tags === 'backtracking'),
      solved: solvedProblems.filter(
        sp => problems.find(p => p._id === sp._id)?.tags === 'backtracking'
      ).length
    },
    {
      id: 'twoPointers',
      name: 'Two Pointers',
      description: 'Two pointer technique for array and string problems',
      icon: '👆',
      problems: problems.filter(p => p.tags === 'twopointer'),
      solved: solvedProblems.filter(
        sp => problems.find(p => p._id === sp._id)?.tags === 'twopointer'
      ).length
    },
    {
      id: 'slidingWindow',
      name: 'Sliding Window',
      description: 'Fixed and variable size sliding window techniques',
      icon: '🪟',
      problems: problems.filter(p => p.tags === 'slidingwindow'),
      solved: solvedProblems.filter(
        sp => problems.find(p => p._id === sp._id)?.tags === 'slidingwindow'
      ).length
    },
    {
      id: 'bitManipulation',
      name: 'Bit Manipulation',
      description: 'Bitwise operations and bit manipulation tricks',
      icon: '⚡',
      problems: problems.filter(p => p.tags === 'bitmanipulation'),
      solved: solvedProblems.filter(
        sp => problems.find(p => p._id === sp._id)?.tags === 'bitmanipulation'
      ).length
    }
  ];

  const totalProblems = algorithms.reduce((sum, algo) => sum + algo.problems.length, 0);
  const totalSolved = algorithms.reduce((sum, algo) => sum + algo.solved, 0);
  const completionPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  const availableCategories = algorithms.filter(algo => algo.problems.length > 0).length;

  if (loading) {
    return (
      <div
        className="min-h-screen text-gray-200 font-urbanist"
        style={{
          background: 'radial-gradient(circle at top left, #1e1b4b, #121212)'
        }}
      >
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 text-lg">Loading algorithms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen text-white font-urbanist overflow-hidden relative">
        {/* Mouse-following glowing background */}
        <div 
          className="fixed inset-0 transition-all duration-1000 ease-out z-0"
          style={{
            background: `
              radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(139, 92, 246, 0.3) 0%, 
                rgba(59, 130, 246, 0.2) 25%, 
                rgba(16, 185, 129, 0.1) 50%, 
                transparent 70%
              ),
              linear-gradient(135deg, 
                #0f0f23 0%, 
                #1a1a2e 25%, 
                #16213e 50%, 
                #0f0f23 75%, 
                #000000 100%
              )
            `,
          }}
        />

        {/* Interactive Floating Bubbles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => {
            const baseX = Math.random() * 100;
            const baseY = Math.random() * 100;

            const distanceX = Math.abs(mousePosition.x - baseX);
            const distanceY = Math.abs(mousePosition.y - baseY);
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            const isNearMouse = distance < 12;
            const moveIntensity = isNearMouse ? Math.max(0, (12 - distance) / 12) : 0;

            const offsetX = isNearMouse ? (mousePosition.x - baseX) * 0.2 * moveIntensity : 0;
            const offsetY = isNearMouse ? (mousePosition.y - baseY) * 0.2 * moveIntensity : 0;

            return (
              <div
                key={i}
                className="absolute rounded-full bg-gradient-to-br from-white/15 to-indigo-400/5 backdrop-blur-sm animate-float-gentle transition-all duration-500 ease-out"
                style={{
                  width: `${4 + (i % 3) * 2}px`,
                  height: `${4 + (i % 3) * 2}px`,
                  left: `${baseX}%`,
                  top: `${baseY}%`,
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${1 + moveIntensity * 0.3})`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${6 + Math.random() * 3}s`,
                  opacity: 0.15 + moveIntensity * 0.25,
                }}
              />
            );
          })}
        </div>

        {/* Glassmorphism Back Button */}
        <div className="fixed top-6 left-6 z-50">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <svg className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white font-semibold">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 pt-20 pb-16">
            <div className={`text-center transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative mb-8">
                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
                  Algorithms
                </h1>
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-cyan-600/20 blur-3xl rounded-full"></div>
              </div>

              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                Master <span className="text-indigo-400 font-semibold">essential algorithms</span> and problem-solving techniques
              </p>
            </div>

            {/* Compact Stats Overview */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 mb-8 shadow-xl max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white">{totalProblems}</span>
                    <span className="text-sm text-gray-400 ml-1">Total</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white">{totalSolved}</span>
                    <span className="text-sm text-gray-400 ml-1">Solved</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white">{availableCategories}</span>
                    <span className="text-sm text-gray-400 ml-1">Categories</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white">{completionPercent}%</span>
                    <span className="text-sm text-gray-400 ml-1">Complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Cards Grid */}
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {algorithms.map((algo, index) => (
                  <NavLink
                    key={algo.id}
                    to={`/algorithms/${algo.id}`}
                    className={`group relative block transform transition-all duration-700 hover:scale-105 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                    style={{
                      animationDelay: `${index * 200}ms`,
                    }}
                  >
                    {/* Card Container */}
                    <div className="relative h-80 overflow-hidden">
                      {/* Main Card */}
                      <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 group-hover:shadow-2xl">
                        {/* Inner Glow Effect */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl animate-pulse-glow"></div>
                          <div className="absolute inset-[1px] bg-gradient-to-br from-white/5 to-white/2 rounded-3xl"></div>
                        </div>

                        {/* Border Light Effect */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/30 to-transparent rounded-3xl animate-border-glow"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-400/30 to-transparent rounded-3xl animate-border-glow-reverse"></div>
                        </div>

                        {/* Content */}
                        <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                          {/* Icon Container */}
                          <div className="relative mb-6 transform group-hover:scale-110 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                                <span className="text-3xl">{algo.icon}</span>
                              </div>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-all duration-300">
                            {algo.name}
                          </h3>

                          {/* Description */}
                          <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed mb-4 text-sm">
                            {algo.description}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs mb-2 opacity-80 gap-6">
                            <span className="text-gray-400">{algo.problems.length} problems</span>
                            <span className="text-emerald-400">{algo.solved} solved</span>
                          </div>
                          {/* Completion Bar for each category */}
                          <div className="w-full mt-1">
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-700"
                                style={{
                                  width: `${algo.problems.length > 0 ? (algo.solved / algo.problems.length) * 100 : 0}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                              {algo.problems.length > 0
                                ? `${Math.round((algo.solved / algo.problems.length) * 100)}%`
                                : '0%'} completed
                            </p>
                          </div>

                          {/* Hover Indicator */}
                          <div className="absolute right-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            style={{
                              bottom: '1rem',
                               // bottom-5 for more gap (was bottom-4)
                            }}>
                            <div className="flex items-center   text-sm text-indigo-400 font-semibold">
                              <span>Start Learning</span>
                              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div> {/* End content */}
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`
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
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 0.2;
          }
          50% { 
            opacity: 0.4;
          }
        }
        @keyframes border-glow {
          0% { 
            transform: translateX(-100%);
          }
          100% { 
            transform: translateX(100%);
          }
        }
        @keyframes border-glow-reverse {
          0% { 
            transform: translateY(-100%);
          }
          100% { 
            transform: translateY(100%);
          }
        }
        .animate-float-gentle {
          animation: float-gentle linear infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-border-glow {
          animation: border-glow 2s linear infinite;
        }
        .animate-border-glow-reverse {
          animation: border-glow-reverse 2.5s linear infinite;
        }
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float-gentle {
            animation: none;
          }
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      </div>
    </>
  );
}

export default Algorithms;