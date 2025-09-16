import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';

function DataStructures() {
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

  const dataStructures = [
    {
      id: 'array',
      name: 'Arrays',
      description: 'Master array manipulation, searching, and sorting algorithms',
      icon: '📊',
      problems: problems.filter(p => p.tags === 'array'),
      solved: solvedProblems.filter(sp => problems.find(p => p._id === sp._id)?.tags === 'array').length
    },
    {
      id: 'linkedlist',
      name: 'Linked Lists',
      description: 'Learn singly and doubly linked list operations and algorithms',
      icon: '🔗',
      problems: problems.filter(p => p.tags === 'linkedlist'),
      solved: solvedProblems.filter(sp => problems.find(p => p._id === sp._id)?.tags === 'linkedlist').length
    },
    {
      id: 'tree',
      name: 'Trees',
      description: 'Binary trees, BST, AVL trees, and tree traversal algorithms',
      icon: '🌳',
      problems: problems.filter(p => p.tags === 'tree'),
      solved: solvedProblems.filter(sp => problems.find(p => p._id === sp._id)?.tags === 'tree').length
    },
    {
      id: 'graph',
      name: 'Graphs',
      description: 'Graph algorithms, DFS, BFS, shortest path, and more',
      icon: '🕸️',
      problems: problems.filter(p => p.tags === 'graph'),
      solved: solvedProblems.filter(sp => problems.find(p => p._id === sp._id)?.tags === 'graph').length
    },
    {
      id: 'stack',
      name: 'Stacks & Queues',
      description: 'Stack and queue data structures and their applications',
      icon: '📚',
      problems: problems.filter(p => p.tags === 'stack' || p.tags === 'queue'),
      solved: solvedProblems.filter(sp => {
        const problem = problems.find(p => p._id === sp._id);
        return problem && (problem.tags === 'stack' || problem.tags === 'queue');
      }).length
    },
    {
      id: 'hash',
      name: 'Hash Tables',
      description: 'Hash tables, collision resolution, and hash-based algorithms',
      icon: '🗂️',
      problems: problems.filter(p => p.tags === 'hashTable'),
      solved: solvedProblems.filter(sp => problems.find(p => p._id === sp._id)?.tags === 'hashTable').length
    },
    {
      id: 'heap',
      name: 'Heaps',
      description: 'Min/Max heaps, priority queues, and heap algorithms',
      icon: '🏗️',
      problems: problems.filter(p => p.tags === 'heap'),
      solved: solvedProblems.filter(sp => problems.find(p => p._id === sp._id)?.tags === 'heap').length
    },
    {
      id: 'string',
      name: 'Strings',
      description: 'String manipulation, pattern matching, and text algorithms',
      icon: '📝',
      problems: problems.filter(p => p.tags === 'string'),
      solved: solvedProblems.filter(sp => problems.find(p => p._id === sp._id)?.tags === 'string').length
    }
  ];

  const totalProblems = dataStructures.reduce((sum, ds) => sum + ds.problems.length, 0);
  const totalSolved = dataStructures.reduce((sum, ds) => sum + ds.solved, 0);
  const categoriesWithProblems = dataStructures.filter(ds => ds.problems.length > 0).length;
  const completionPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen font-urbanist" style={{ background: 'radial-gradient(circle at top left, #1e1b4b, #121212)' }}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400"></div>
            <p className="text-gray-300 text-lg">Loading data structures...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen text-white font-urbanist overflow-hidden relative">
        {/* Static Background */}
        <div
          className="fixed inset-0"
          style={{
            background: `
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
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => {
            const baseX = Math.random() * 100;
            const baseY = Math.random() * 100;

            // Calculate distance from mouse to bubble
            const distanceX = Math.abs(mousePosition.x - baseX);
            const distanceY = Math.abs(mousePosition.y - baseY);
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // Only move if mouse is within 12% distance of the bubble
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
                  Data Structures
                </h1>
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-cyan-600/20 blur-3xl rounded-full"></div>
              </div>

              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                Master <span className="text-indigo-400 font-semibold">fundamental data structures</span> to strengthen your algorithmic thinking
              </p>
            </div>

            {/* Compact Stats Overview */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 mb-8 shadow-xl max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white">{totalProblems}</span>
                    <span className="text-sm text-gray-400 ml-1">Total</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="text-lg font-bold text-white">{categoriesWithProblems}</span>
                    <span className="text-sm text-gray-400 ml-1">Categories</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {dataStructures.map((ds, index) => (
                  <NavLink
                    key={ds.id}
                    to={`/data-structures/${ds.id}`}
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
                                <span className="text-3xl">{ds.icon}</span>
                              </div>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-all duration-300">
                            {ds.name}
                          </h3>

                          {/* Description */}
                          <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed mb-4 text-sm">
                            {ds.description}
                          </p>

                          {/* Stats with gap and completion bar */}
                          <div className="flex items-center justify-between text-xs mb-2 opacity-80 gap-6">
                            <span className="text-gray-400">{ds.problems.length} problems</span>
                            <span className="text-emerald-400">{ds.solved} solved</span>
                          </div>
                          {/* Completion Bar */}
                          <div className="w-full mt-1">
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-700"
                                style={{
                                  width: `${ds.problems.length > 0 ? (ds.solved / ds.problems.length) * 100 : 0}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                              {ds.problems.length > 0
                                ? `${Math.round((ds.solved / ds.problems.length) * 100)}%`
                                : '0%'} completed
                            </p>
                          </div>

                          {/* Hover Indicator */}
                          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="flex items-center gap-2 text-sm text-indigo-400 font-semibold">
                              <span>Start Learning</span>
                              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {/* Empty State */}
          {dataStructures.every(ds => ds.problems.length === 0) && (
            <div className="text-center py-16">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-900/50 backdrop-blur-md mb-6 border border-gray-700/50">
                <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No data structure problems available</h3>
              <p className="text-gray-400 mb-6">Check back later for new problems in these categories</p>
              <NavLink
                to="/problems"
                className="inline-block bg-[#7f5af0] hover:bg-[#6f4ae0] text-white py-3 px-6 rounded-full shadow hover:shadow-[0_0_15px_#7f5af0] transition"
              >
                Browse All Problems
              </NavLink>
            </div>
          )}
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

export default DataStructures;