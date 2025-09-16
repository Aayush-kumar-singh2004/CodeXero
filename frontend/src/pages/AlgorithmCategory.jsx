import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';

function AlgorithmCategory() {
  const { categoryId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    status: 'all' 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const problemsPerPage = viewMode === 'grid' ? 8 : 15;

  const categoryInfo = {
    sorting: { name: 'Sorting Algorithms', icon: '🔄', description: 'Bubble sort, merge sort, quick sort, and other sorting techniques' },
    searching: { name: 'Searching Algorithms', icon: '🔍', description: 'Binary search, linear search, and advanced searching techniques' },
    dp: { name: 'Dynamic Programming', icon: '🧠', description: 'Memoization, tabulation, and optimization problems' },
    greedy: { name: 'Greedy Algorithms', icon: '🎯', description: 'Greedy choice property and optimization strategies' },
    backtracking: { name: 'Backtracking', icon: '🔄', description: 'Recursive backtracking and constraint satisfaction problems' },
    twoPointers: { name: 'Two Pointers', icon: '👆', description: 'Two pointer technique for array and string problems' },
    slidingWindow: { name: 'Sliding Window', icon: '🪟', description: 'Fixed and variable size sliding window techniques' },
    bitManipulation: { name: 'Bit Manipulation', icon: '⚡', description: 'Bitwise operations and bit manipulation tricks' }
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/problem/getAllProblem');
        let backendTag = categoryId;
        if (categoryId === 'sorting') backendTag = 'sortingalgorithms';
        if (categoryId === 'searching') backendTag = 'searchingalgorithms';
        if (categoryId === 'dp') backendTag = 'dynamicprogramming';
        if (categoryId === 'greedy') backendTag = 'greedyalgorithm';
        if (categoryId === 'backtracking') backendTag = 'backtracking';
        if (categoryId === 'twoPointers') backendTag = 'twopointer';
        if (categoryId === 'slidingWindow') backendTag = 'slidingwindow';
        if (categoryId === 'bitManipulation') backendTag = 'bitmanipulation';
        const filteredProblems = data.filter(p => p.tags === backendTag);
        setProblems(filteredProblems);

        const solvedResponse = await axiosClient.get('/problem/problemSolvedByUser');
        const solvedProblems = solvedResponse.data;
        setSolvedProblems(solvedProblems);

      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && categoryInfo[categoryId]) {
      fetchProblems();
    }
  }, [user, categoryId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const statusMatch = filters.status === 'all' || 
                      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id)) ||
                      (filters.status === 'unsolved' && !solvedProblems.some(sp => sp._id === problem._id));
    const searchMatch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    return difficultyMatch && statusMatch && searchMatch;
  });

  // Pagination logic
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

  const getDifficultyBorderColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'border-green-400/30';
      case 'medium': return 'border-yellow-400/30';
      case 'hard': return 'border-red-400/30';
      default: return 'border-gray-700/50';
    }
  };

  // Use same color for top and middle sections
  const sectionBgClass = "bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-gray-800 backdrop-blur-sm";

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
            <p className="text-gray-400 text-lg">Loading problems...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryInfo[categoryId]) {
    return (
      <div 
        className="min-h-screen text-gray-200 font-urbanist"
        style={{
          background: 'radial-gradient(circle at top left, #1e1b4b, #121212)'
        }}
      >
         <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center bg-gray-900/50 backdrop-blur rounded-3xl p-12 border border-gray-700/50 shadow-2xl">
            <h1 className="text-2xl font-bold text-gray-200 mb-6">Category not found</h1>
            <NavLink 
              to="/algorithms" 
              className="btn bg-purple-600 hover:bg-purple-700 border-purple-500/50 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
            >
              Back to Algorithms
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  const category = categoryInfo[categoryId];

  return (
    <div 
      className="min-h-screen text-gray-200 font-urbanist"
      style={{
        background: 'radial-gradient(circle at top left, #1e1b4b, #121212)'
      }}
    >
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
        {/* Category Header */}
          <div className="fixed top-6 left-6 z-50">
          <button
            onClick={() => navigate('/algorithms')}
            className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <svg className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white font-semibold">Back</span>
          </button>
        </div>
        <div className="text-center mb-16 animate-fade-up">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-900/20 to-purple-900/5 backdrop-blur-sm border border-gray-700/30 shadow-xl mb-6">
              <span className="text-5xl">{category.icon}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{category.name}</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">{category.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 shadow-xl animate-slide-left">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{problems.length}</p>
                <p className="text-gray-400">Total Problems</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 shadow-xl animate-slide-left">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {solvedProblems.filter(sp => problems.find(p => p._id === sp._id)).length}
                </p>
                <p className="text-gray-400">Problems Solved</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 shadow-xl animate-slide-left">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {problems.length > 0 ? Math.round((solvedProblems.filter(sp => problems.find(p => p._id === sp._id)).length / problems.length) * 100) : 0}%
                </p>
                <p className="text-gray-400">Completion Rate</p>
              </div>
            </div>
          </div>
          </div>

        {/* Compact Filters Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 mb-6 shadow-xl animate-slide-left">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${category.name.toLowerCase()} problems...`}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-200 placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
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
            border-color: rgba(147, 51, 234, 0.5);
            box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
          }
          .compact-select option {
            background: rgba(31, 41, 55, 0.9);
            color: #e5e7eb;
            padding: 0.5rem;
          }
          .compact-select option:checked {
            background: rgba(147, 51, 234, 0.3);
            color: white;
          }
        `}</style>

        {/* Compact Results Summary and View Toggle */}
        <div className="flex items-center justify-between mb-4 animate-fade-up">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">
              {filteredProblems.length} Problem{filteredProblems.length !== 1 ? 's' : ''}
            </h2>
            {searchTerm && (
              <div className="text-sm text-gray-400 bg-gray-800/30 px-3 py-1 rounded-lg">
                "<span className="text-purple-400">{searchTerm}</span>"
              </div>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white shadow-lg' 
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
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-purple-600 text-white shadow-lg' 
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
                <span className="text-4xl">{category.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No {category.name.toLowerCase()} problems found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setFilters({ difficulty: 'all', status: 'all' });
                }}
                className="btn bg-purple-600 hover:bg-purple-700 border-purple-500/50 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProblems.map((problem, index) => (
                    <div 
                      key={problem._id} 
                      className="group transition-all duration-500"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <NavLink to={`/problem/${problem._id}`} className="block h-full">
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                          {/* Problem header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                                {problem.title}
                              </h3>
                            </div>
                            {solvedProblems.some(sp => sp._id === problem._id) && (
                              <div className="flex-shrink-0 ml-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-400/30">
                                  Solved
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Difficulty and tags */}
                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)} bg-gray-800/50 border border-gray-700/50`}>
                                <span className="mr-1">{getDifficultyIcon(problem.difficulty)}</span>
                                {problem.difficulty}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-cyan-300 bg-gray-800/50 border border-gray-700/50">
                                {problem.tags}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-sm text-gray-400">ID: {problem.problemId}</span>
                              <button className="text-sm font-medium text-purple-400 group-hover:text-cyan-400 transition-colors duration-300">
                                Solve Challenge →
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
                  {/* Table Header */}
                  <div className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
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
                          <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">
                            {/* Status */}
                            <div className="col-span-1 flex justify-center">
                              {isSolved ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-600"></div>
                              )}
                            </div>
                            
                            {/* Title */}
                            <div className="col-span-6">
                              <NavLink 
                                to={`/problem/${problem._id}`}
                                className="text-white hover:text-purple-400 transition-colors duration-200 font-medium group-hover:text-purple-400"
                              >
                                {problem.title}
                              </NavLink>
                            </div>
                            
                            {/* Difficulty */}
                            <div className="col-span-2 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)} bg-gray-800/50 border border-gray-700/50`}>
                                <span className="mr-1">{getDifficultyIcon(problem.difficulty)}</span>
                                {problem.difficulty}
                              </span>
                            </div>
                            
                            {/* Category */}
                            <div className="col-span-2 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-cyan-300 bg-gray-800/50 border border-gray-700/50">
                                {problem.tags}
                              </span>
                            </div>
                            
                            {/* Action */}
                            <div className="col-span-1 text-center">
                              <NavLink 
                                to={`/problem/${problem._id}`}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-white transition-all duration-200 group-hover:scale-110"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </NavLink>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 animate-fade-up">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-circle btn-outline border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 text-gray-300 disabled:opacity-30 transition-all"
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
                          ? 'bg-purple-600 text-white shadow-[0_0_10px_purple-500]' 
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
                className="btn btn-circle btn-outline border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 text-gray-300 disabled:opacity-30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm border-t border-gray-800/50 mt-12">
        <p>© 2025 . All rights reserved. Solve problems, master coding.</p>
      </div>
    </div>
  );
}

export default AlgorithmCategory;