import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Problems() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list' - default to list
  const problemsPerPage = viewMode === 'grid' ? 8 : 15;

  // Mouse effect states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
        const solvedResponse = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(solvedResponse.data);
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
    setCurrentPage(1);
  }, [filters, searchTerm, viewMode]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id)) ||
                      (filters.status === 'unsolved' && !solvedProblems.some(sp => sp._id === problem._id));
    const searchMatch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  // Stats
  const totalProblems = problems.length;
  const totalSolved = solvedProblems.length;
  const completionPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
  const startIndex = (currentPage - 1) * problemsPerPage;
  const endIndex = startIndex + problemsPerPage;
  const currentProblems = filteredProblems.slice(startIndex, endIndex);

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '🌱';
      case 'medium': return '🌿';
      case 'hard': return '🌳';
      default: return '📝';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-emerald-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-rose-500';
      default: return 'text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'radial-gradient(circle at top left, #1e1b4b, #121212)' }}>
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400"></div>
            <p className="text-gray-300 text-lg">Loading problems...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen font-urbanist text-gray-200 overflow-hidden relative"
      style={{ background: 'radial-gradient(circle at top left, #1e1b4b, #121212)' }}
    >
      {/* Mouse-following glowing background */}
      <div 
        className="fixed inset-0 transition-all duration-1000 ease-out z-0 pointer-events-none"
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

      {/* Back Button */}
      <div className="fixed top-0 left-0 p-4 z-50">
       <button
            onClick={() => navigate('/home')}
            className="text-gray-300 hover:text-[#7f5af0] transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pt-20 relative z-10">
        {/* Compact Stats Overview */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Stats */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 overflow-x-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-white">{totalProblems}</span>
                  <span className="text-xs sm:text-sm text-gray-400 ml-1">Total</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-white">{totalSolved}</span>
                  <span className="text-xs sm:text-sm text-gray-400 ml-1">Solved</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-white">{completionPercent}%</span>
                  <span className="text-xs sm:text-sm text-gray-400 ml-1">Rate</span>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 bg-[#7f5af0] hover:bg-[#6f4ae0] text-white rounded-lg font-medium transition-all text-xs sm:text-sm w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Compact Filters Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-800/50 border border-gray-700/50 text-gray-200 placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7f5af0]/50 transition-all duration-300"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select 
                className="compact-select"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
              
              <select 
                className="compact-select"
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              >
                <option value="all">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              
              <select 
                className="compact-select"
                value={filters.tag}
                onChange={(e) => setFilters({...filters, tag: e.target.value})}
              >
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
            </div>
          </div>
        </div>

        <style jsx>{`
          .compact-select {
            background-color: rgba(31, 41, 55, 0.5);
            border: 1px solid rgba(55, 65, 81, 0.5);
            color: #e5e7eb;
            border-radius: 0.5rem;
            padding: 0.375rem 1.5rem 0.375rem 0.75rem;
            font-size: 0.75rem;
            min-width: 120px;
            cursor: pointer;
            transition: all 0.3s ease;
            appearance: none;
            background-image: 
              linear-gradient(45deg, transparent 50%, #9ca3af 50%),
              linear-gradient(135deg, #9ca3af 50%, transparent 50%);
            background-position:
              calc(100% - 12px) center,
              calc(100% - 8px) center;
            background-size:
              4px 4px,
              4px 4px;
            background-repeat: no-repeat;
          }
          .compact-select:hover {
            background-color: rgba(31, 41, 55, 0.7);
          }
          .compact-select:focus {
            outline: none;
            border-color: rgba(127, 90, 240, 0.5);
            box-shadow: 0 0 0 2px rgba(127, 90, 240, 0.5);
          }
          .compact-select option {
            background: rgba(31, 41, 55, 0.9);
            color: #e5e7eb;
            padding: 0.5rem;
          }
          .compact-select option:checked {
            background: rgba(127, 90, 240, 0.3);
            color: white;
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
          .animate-float-gentle {
            animation: float-gentle linear infinite;
            will-change: transform, opacity;
            backface-visibility: hidden;
            perspective: 1000px;
          }
        `}</style>

        {/* Compact Results Summary and View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              {filteredProblems.length} Problem{filteredProblems.length !== 1 ? 's' : ''}
            </h2>
            {searchTerm && (
              <div className="text-xs sm:text-sm text-gray-400 bg-gray-800/30 px-2 sm:px-3 py-1 rounded-lg">
                "<span className="text-[#7f5af0]">{searchTerm}</span>"
              </div>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700/50 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 flex-1 sm:flex-initial ${
                viewMode === 'list' 
                  ? 'bg-[#7f5af0] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 flex-1 sm:flex-initial ${
                viewMode === 'grid' 
                  ? 'bg-[#7f5af0] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Grid
            </button>
          </div>
        </div>
        
        {/* Problems Display */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-900/50 backdrop-blur-md mb-6 border border-gray-700/50">
              <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No problems found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
              }}
              className="btn bg-[#7f5af0] hover:bg-[#6f4ae0] text-white py-3 px-6 rounded-full shadow hover:shadow-[0_0_15px_#7f5af0] transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {currentProblems.map((problem, index) => (
                  <div 
                    key={problem._id} 
                    className="group transition-all duration-500"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <NavLink to={`/problem/${problem._id}`} className="block h-full">
                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-[#7f5af0]/30 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                        {/* Problem header */}
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white group-hover:text-[#7f5af0] transition-colors duration-300 line-clamp-2">
                              {problem.title}
                            </h3>
                          </div>
                          {solvedProblems.some(sp => sp._id === problem._id) && (
                            <div className="flex-shrink-0 ml-2">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-400/30">
                                <span className="hidden sm:inline">Solved</span>
                                <span className="sm:hidden">✓</span>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Difficulty and tags */}
                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(problem.difficulty)} bg-gray-800/50 border border-gray-700/50`}>
                              <span className="mr-1">{getDifficultyIcon(problem.difficulty)}</span>
                              {problem.difficulty}
                            </span>
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-cyan-300 bg-gray-800/50 border border-gray-700/50 truncate">
                              {problem.tags}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-3 sm:mt-4">
                             <button className="text-xs sm:text-sm font-medium text-[#7f5af0] group-hover:text-[#00ffff] transition-colors duration-300">
                              <span className="hidden sm:inline">Solve Challenge →</span>
                              <span className="sm:hidden">Solve →</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden sm:block bg-gray-800/50 border-b border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4">
                  <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-6">Title</div>
                    <div className="col-span-2 text-center">Difficulty</div>
                    <div className="col-span-2 text-center">Category</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-gray-700/50">
                  {currentProblems.map((problem, index) => {
                    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                    return (
                      <div 
                        key={problem._id}
                        className="group hover:bg-gray-800/30 transition-all duration-200"
                        style={{ transitionDelay: `${index * 30}ms` }}
                      >
                        {/* Desktop Layout */}
                        <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-4 items-center px-4 sm:px-6 py-3 sm:py-4">
                          {/* Status */}
                          <div className="col-span-1 flex justify-center">
                            {isSolved ? (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-600"></div>
                            )}
                          </div>
                          
                          {/* Title */}
                          <div className="col-span-6">
                            <NavLink 
                              to={`/problem/${problem._id}`}
                              className="text-white hover:text-[#7f5af0] transition-colors duration-200 font-medium group-hover:text-[#7f5af0] text-sm sm:text-base"
                            >
                              {problem.title}
                            </NavLink>
                          </div>
                          
                          {/* Difficulty */}
                          <div className="col-span-2 text-center">
                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(problem.difficulty)} bg-gray-800/50 border border-gray-700/50`}>
                              <span className="mr-1">{getDifficultyIcon(problem.difficulty)}</span>
                              {problem.difficulty}
                            </span>
                          </div>
                          
                          {/* Category */}
                          <div className="col-span-2 text-center">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-cyan-300 bg-gray-800/50 border border-gray-700/50 truncate">
                              {problem.tags}
                            </span>
                          </div>
                          
                          {/* Action */}
                          <div className="col-span-1 text-center">
                            <NavLink 
                              to={`/problem/${problem._id}`}
                              className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#7f5af0]/20 hover:bg-[#7f5af0]/30 text-[#7f5af0] hover:text-white transition-all duration-200 group-hover:scale-110"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </NavLink>
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="sm:hidden p-4">
                          <NavLink to={`/problem/${problem._id}`} className="block">
                            <div className="flex items-start gap-3">
                              {/* Status */}
                              <div className="flex-shrink-0 mt-1">
                                {isSolved ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium text-sm group-hover:text-[#7f5af0] transition-colors duration-200 mb-2">
                                  {problem.title}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)} bg-gray-800/50 border border-gray-700/50`}>
                                    <span className="mr-1">{getDifficultyIcon(problem.difficulty)}</span>
                                    {problem.difficulty}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-cyan-300 bg-gray-800/50 border border-gray-700/50">
                                    {problem.tags}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Arrow */}
                              <div className="flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#7f5af0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </NavLink>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 animate-fade-up">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-circle btn-outline border-gray-700 hover:border-[#7f5af0] hover:bg-[#7f5af0]/10 text-gray-300 disabled:opacity-30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 
                      ? i + 1 
                      : currentPage >= totalPages - 2 
                        ? totalPages - 4 + i 
                        : currentPage - 2 + i;
                    
                    return pageNum > 0 && pageNum <= totalPages ? (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          currentPage === pageNum 
                            ? 'bg-[#7f5af0] text-white shadow-[0_0_10px_#7f5af0]' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-circle btn-outline border-gray-700 hover:border-[#7f5af0] hover:bg-[#7f5af0]/10 text-gray-300 disabled:opacity-30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm border-t border-gray-800/50 mt-12 relative z-10">
        <p>© 2023 CodeMaster. All rights reserved. Solve problems, master coding.</p>
      </div>
    </div>
  );
}

export default Problems;