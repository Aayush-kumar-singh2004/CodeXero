import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import ProblemDiscussion from '../components/ProblemDiscussion';
import Navbar from '../components/Navbar';
import { useSelector } from 'react-redux';
import { useState as useThemeState, useEffect as useThemeEffect } from 'react';

const langMap = {
        cpp: 'C++',
        java: 'Java',
        javascript: 'JavaScript',
        python: 'Python',
         
       
         
};


const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let {problemId}  = useParams();
  const [allProblems, setAllProblems] = useState([]);
  const [showNextProblems, setShowNextProblems] = useState(false);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Problem interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);

  // Panel resizing and fullscreen states
  const [leftPanelWidth, setLeftPanelWidth] = useState(40); // percentage - more like LeetCode
  const [leftPanelHeight, setLeftPanelHeight] = useState(50); // percentage for mobile
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileResizing, setIsMobileResizing] = useState(false);
  const [isLeftFullscreen, setIsLeftFullscreen] = useState(false);
  const [isRightFullscreen, setIsRightFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const leftContentRef = useRef(null);

  const { handleSubmit } = useForm();
  const { user } = useSelector((state) => state.auth);

  // Theme for Monaco Editor
  const [editorTheme, setEditorTheme] = useThemeState('vs-dark');
  useThemeEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      setEditorTheme(theme === 'light' ? 'light' : 'vs-dark');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

 useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
       
        
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;

        setProblem(response.data);
        
        setCode(initialCode);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Load problem-specific states when problemId changes
  useEffect(() => {
    if (!problemId) return;
    
    // Load persisted data for this problem
    const savedData = localStorage.getItem(`problem_${problemId}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setIsLiked(data.isLiked || false);
        setIsDisliked(data.isDisliked || false);
        setLikeCount(data.likeCount || 0);
        setDislikeCount(data.dislikeCount || 0);
        setComments(data.comments || []);
      } catch (error) {
        console.error('Error loading problem data:', error);
      }
    } else {
      // Reset to default values for new problems
      setIsLiked(false);
      setIsDisliked(false);
      setLikeCount(0);
      setDislikeCount(0);
      setComments([]);
    }
    
    // Always reset these UI states
    setComment('');
    setShowComments(false);
    setShowCommentModal(false);
    
    // Reset result states (these should not persist)
    setRunResult(null);
    setSubmitResult(null);
  }, [problemId]);

  // Save problem-specific data whenever it changes
  useEffect(() => {
    if (!problemId) return;
    
    const dataToSave = {
      isLiked,
      isDisliked,
      likeCount,
      dislikeCount,
      comments,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(`problem_${problemId}`, JSON.stringify(dataToSave));
  }, [problemId, isLiked, isDisliked, likeCount, dislikeCount, comments]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  useEffect(() => {
    // Fetch all problems for navigation (now sorted on backend)
    const fetchAllProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        // Problems are now sorted by creation date on the backend (newest first)
        setAllProblems(data);
      } catch (err) {
        setAllProblems([]);
      }
    };
    fetchAllProblems();
  }, []);

  // Fetch videos for the current problem
  useEffect(() => {
    const fetchVideos = async () => {
      if (!problemId) return;
      
      setVideosLoading(true);
      try {
        const response = await axiosClient.get(`/video/problem/${problemId}`);
        const fetchedVideos = response.data.videos || [];
        setVideos(fetchedVideos);
        
        // Auto-select first video when editorial tab is active and videos are available
        if (activeLeftTab === 'editorial' && fetchedVideos.length > 0 && !selectedVideo) {
          setSelectedVideo(fetchedVideos[0]);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, [problemId]);

  // Auto-select first video when switching to editorial tab
  useEffect(() => {
    if (activeLeftTab === 'editorial' && videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [activeLeftTab, videos, selectedVideo]);

  // Force enable mouse wheel scrolling and debug
  useEffect(() => {
    const leftContent = leftContentRef.current;
    if (!leftContent) return;

    // Ensure the element can receive wheel events
    leftContent.style.pointerEvents = 'auto';
    leftContent.style.userSelect = 'auto'; // Override any select-none
    leftContent.tabIndex = -1; // Make it focusable but not in tab order
    
    return () => {
      if (leftContent) {
        leftContent.style.pointerEvents = '';
        leftContent.style.userSelect = '';
        leftContent.removeAttribute('tabindex');
      }
    };
  }, [isResizing, isMobileResizing]);

  // Handle window resize to update layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Panel resizing functionality
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (!isMobile) {
      setIsResizing(true);
    }
  };

  const handleMobileMouseDown = (e) => {
    e.preventDefault();
    if (isMobile) {
      setIsMobileResizing(true);
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (isMobile) {
      setIsMobileResizing(true);
    }
  };

  const getEventPosition = (e) => {
    // Handle both mouse and touch events
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const { clientX, clientY } = getEventPosition(e);
    
    if (isResizing && !isMobile) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 20% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftPanelWidth(constrainedWidth);
    }
    
    if (isMobileResizing && isMobile) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftHeight = ((clientY - containerRect.top) / containerRect.height) * 100;
      
      // Constrain between 20% and 80%
      const constrainedHeight = Math.min(Math.max(newLeftHeight, 20), 80);
      setLeftPanelHeight(constrainedHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setIsMobileResizing(false);
  };

  useEffect(() => {
    if (isResizing || isMobileResizing) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Touch events for mobile
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      document.body.style.cursor = isResizing ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none'; // Prevent scrolling during resize
    } else {
      // Remove mouse events
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Remove touch events
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    }

    return () => {
      // Cleanup mouse events
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Cleanup touch events
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    };
  }, [isResizing, isMobileResizing]);

  // Fullscreen handlers
  const toggleLeftFullscreen = () => {
    setIsLeftFullscreen(!isLeftFullscreen);
    setIsRightFullscreen(false);
  };

  const toggleRightFullscreen = () => {
    setIsRightFullscreen(!isRightFullscreen);
    setIsLeftFullscreen(false);
  };

  const exitFullscreen = () => {
    setIsLeftFullscreen(false);
    setIsRightFullscreen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC to exit fullscreen
      if (e.key === 'Escape' && (isLeftFullscreen || isRightFullscreen)) {
        exitFullscreen();
      }
      // F11 or Ctrl+Shift+F to toggle left fullscreen
      if ((e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) && !isRightFullscreen) {
        e.preventDefault();
        toggleLeftFullscreen();
      }
      // Ctrl+Shift+R to toggle right fullscreen
      if (e.ctrlKey && e.shiftKey && e.key === 'R' && !isLeftFullscreen) {
        e.preventDefault();
        toggleRightFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLeftFullscreen, isRightFullscreen]);

  // Find current problem index in allProblems
  const currentIndex = allProblems.findIndex(p => p._id === problemId);
  const nextProblems = allProblems.slice(currentIndex + 1, currentIndex + 11);
  const prevProblemId = currentIndex > 0 ? allProblems[currentIndex - 1]?._id : null;
  const nextProblemId = currentIndex >= 0 && currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1]?._id : null;

  // Filtered problems for drawer (maintain newest first order)
  const filteredProblems = allProblems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // Handler for closing drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    const handleClick = (e) => {
      if (e.target.closest('.problem-drawer') || e.target.closest('.open-drawer-btn')) return;
      setDrawerOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [drawerOpen]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setRunLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setRunLoading(false);
      setActiveRightTab('testcase');
      
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setRunLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setSubmitLoading(true);
    setSubmitResult(null);
    
    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });

       setSubmitResult(response.data);
       setSubmitLoading(false);
       setActiveRightTab('result');
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setSubmitLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript':
      case 'js': return 'javascript';
      case 'java': return 'java';
      case 'cpp':
      case 'c++': return 'cpp';
      case 'python':
      case 'py': return 'python';
    
    
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Problem interaction handlers
  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      if (isDisliked) {
        setIsDisliked(false);
        setDislikeCount(prev => prev - 1);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
      setDislikeCount(prev => prev - 1);
    } else {
      setIsDisliked(true);
      setDislikeCount(prev => prev + 1);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      }
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        text: comment.trim(),
        author: user?.name || 'Anonymous',
        timestamp: new Date().toISOString(),
      };
      setComments(prev => [newComment, ...prev]);
      setComment('');
      setShowCommentModal(false);
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-100 overflow-hidden">
      <Navbar user={user} />
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Ensure mobile text doesn't overflow */
        @media (max-width: 640px) {
          .font-mono {
            font-size: 0.75rem;
            line-height: 1rem;
          }
        }
      `}</style>
      
      {/* Fullscreen Overlay */}
      {(isLeftFullscreen || isRightFullscreen) && (
        <div 
          className="absolute inset-0 bg-black/20 z-40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={exitFullscreen}
        />
      )}
      
      <div 
        ref={containerRef}
        className="flex flex-col lg:flex-row flex-1 overflow-hidden relative"
      >
        {/* Split Ratio Indicator */}
        {!isLeftFullscreen && !isRightFullscreen && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-base-300/80 backdrop-blur-sm text-base-content text-xs px-2 py-1 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {isMobile 
              ? `${Math.round(leftPanelHeight)}% | ${Math.round(100 - leftPanelHeight)}%`
              : `${Math.round(leftPanelWidth)}% | ${Math.round(100 - leftPanelWidth)}%`
            }
          </div>
        )}


        {/* Left Panel */}
        <div 
          className={`flex flex-col border-r lg:border-r border-b lg:border-b-0 border-base-300 transition-all duration-300 relative ${
            isLeftFullscreen ? 'absolute inset-0 w-full z-50 shadow-2xl bg-base-100' : 
            isRightFullscreen ? 'w-0 h-0 lg:w-0 lg:h-auto overflow-hidden' : 'relative'
          }`}
          style={{ 
            width: isLeftFullscreen ? '100%' : 
                   isRightFullscreen ? '0%' : 
                   isMobile ? '100%' : `${leftPanelWidth}%`,
            height: isLeftFullscreen ? '100%' : 
                    isRightFullscreen ? '0%' : 
                    isMobile ? `${leftPanelHeight}%` : 'auto',
            transition: (isResizing || isMobileResizing) ? 'none' : 'width 0.3s ease-in-out, height 0.3s ease-in-out'
          }}
        >
          {/* Left Panel Fullscreen Button */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={toggleLeftFullscreen}
              className="btn btn-sm btn-circle btn-ghost text-base-content/80 hover:text-base-content hover:bg-base-200"
              title={isLeftFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {isLeftFullscreen ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                ) : (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                )}
              </svg>
            </button>
          </div>

          {/* Sliding Drawer for All Problems */}
          {/* Overlay */}
          <div
            className={`fixed inset-0 z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setDrawerOpen(false)}
          ></div>

          {/* Drawer */}
          <div
            className={`problem-drawer fixed top-0 right-0 h-full w-full sm:w-[400px] max-w-full z-50 bg-base-100 shadow-2xl sm:rounded-l-2xl border-l border-base-300 flex flex-col transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Header */}
            <div className="sticky top-0 bg-base-100 border-b border-base-300 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 z-10">
              <div>
                <h2 className="text-base sm:text-lg font-bold">All Problems</h2>
                <p className="text-xs text-base-content/60 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Sorted by newest first
                </p>
              </div>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setDrawerOpen(false)}>
                ✕
              </button>
            </div>
            {/* Search Bar */}
            <div className="px-4 sm:px-6 py-3 border-b border-base-200 bg-base-100 sticky top-[56px] z-10">
              <input
                type="text"
                className="input input-bordered w-full text-sm sm:text-base"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Problem List */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{ 
                scrollBehavior: 'smooth',
                overscrollBehavior: 'contain'
              }}
            >
              <ul>
                {filteredProblems.length === 0 ? (
                  <li className="text-base-content/60">No problems found.</li>
                ) : (
                  filteredProblems.map((p, idx) => {
                    // Find the original index in allProblems for consistent numbering
                    const originalIndex = allProblems.findIndex(problem => problem._id === p._id);
                    return (
                      <li key={p._id}>
                        <button
                          className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition font-medium text-sm sm:text-base ${
                            p._id === problemId
                              ? 'bg-primary/10 text-primary border border-primary'
                              : 'hover:bg-base-200'
                          }`}
                          onClick={() => {
                            setDrawerOpen(false);
                            navigate(`/problem/${p._id}`);
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                            <span className="truncate">{originalIndex + 1}. {p.title}</span>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              {p.createdAt && (
                                <span className="text-xs text-base-content/50">
                                  {new Date(p.createdAt).toLocaleDateString()}
                                </span>
                              )}
                              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                New
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
          {/* End Drawer */}
          {/* Next 10 Problems Popup */}
          {showNextProblems && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
              <div className="bg-base-100 p-4 sm:p-6 rounded-xl shadow-lg max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                  onClick={() => setShowNextProblems(false)}
                >
                  ✕
                </button>
                <h2 className="text-base sm:text-lg font-bold mb-4">Next 10 Problems</h2>
                <ul className="space-y-2">
                  {nextProblems.length === 0 ? (
                    <li className="text-base-content/60">No more problems.</li>
                  ) : (
                    nextProblems.map((p, idx) => (
                      <li key={p._id}>
                        <button
                          className="text-primary hover:underline text-left w-full"
                          onClick={() => {
                            setShowNextProblems(false);
                            navigate(`/problem/${p._id}`);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{currentIndex + idx + 2}. {p.title}</span>
                            {p.createdAt && (
                              <span className="text-xs text-base-content/50">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
          {/* Left Tabs */}
          <div className="flex border-b border-base-300 bg-base-100 px-1 overflow-x-auto">
            <button 
              className={`px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeLeftTab === 'description' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
              }`}
              onClick={() => setActiveLeftTab('description')}
            >
              <span className="mr-1 align-middle inline-block" aria-label="Description">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>
              </span>
              <span className="hidden sm:inline">Description</span>
              <span className="sm:hidden">Desc</span>
            </button>
            <button 
              className={`px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeLeftTab === 'editorial' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
              }`}
              onClick={() => setActiveLeftTab('editorial')}
            >
              <span className="mr-1 align-middle inline-block" aria-label="Editorial">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              </span>
              Editorial
            </button>
            <button 
              className={`px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeLeftTab === 'solutions' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
              }`}
              onClick={() => setActiveLeftTab('solutions')}
            >
              <span className="mr-1 align-middle inline-block" aria-label="Solutions">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </span>
              <span className="hidden sm:inline">Solutions</span>
              <span className="sm:hidden">Sol</span>
            </button>
            <button 
              className={`px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeLeftTab === 'submissions' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
              }`}
              onClick={() => setActiveLeftTab('submissions')}
            >
              <span className="mr-1 align-middle inline-block" aria-label="Submissions">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </span>
              <span className="hidden sm:inline">Submissions</span>
              <span className="sm:hidden">Sub</span>
            </button>
            <button 
              className={`px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeLeftTab === 'chatAI' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
              }`}
              onClick={() => setActiveLeftTab('chatAI')}
            >
              <span className="mr-1 align-middle inline-block" aria-label="ChatAI">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              <span className="hidden sm:inline">ChatAI</span>
              <span className="sm:hidden">AI</span>
            </button>
          </div>

          {/* Left Content - Restructured with fixed footer */}
          <div className="flex-1 flex flex-col bg-base-100 min-h-0">
            {/* Scrollable Content Area */}
            <div 
              ref={leftContentRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6" 
              style={{ 
                scrollBehavior: 'smooth',
                overscrollBehavior: 'contain',
                touchAction: 'auto',
                WebkitOverflowScrolling: 'touch',
                overflowY: 'auto',
                userSelect: 'auto',
                pointerEvents: 'auto'
              }}
              onWheel={(e) => {
                // Ensure wheel events work by stopping propagation to parent
                e.stopPropagation();
              }}
            >
            {problem && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 border-b border-base-200 pb-3">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-base-content flex-1 truncate">{problem.title}</h1>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge badge-outline ${getDifficultyColor(problem.difficulty)} text-xs font-medium px-2 py-1`}>{problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}</span>
                    <span className="badge badge-primary text-xs font-medium px-2 py-1 truncate max-w-[120px]">{problem.tags}</span>
                  </div>
                </div>
                {activeLeftTab === 'description' && (
                  <div className="space-y-4">
                    {/* Problem Description */}
                    <div>
                      <h2 className="text-lg font-semibold text-base-content mb-3">Problem Description</h2>
                      <div className="text-sm leading-relaxed text-base-content">
                        {problem.description}
                      </div>
                    </div>

                    {/* Examples Section */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-base-content mb-3">Examples</h3>
                      <div className="space-y-3">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="border border-base-300 rounded-lg p-3 sm:p-4">
                            <div className="font-medium text-base-content mb-3 text-sm sm:text-base">Example {index + 1}</div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                              {/* Input */}
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-base-content/70 mb-2">Input</div>
                                <pre className="text-xs sm:text-sm font-mono text-base-content bg-base-200 p-2 rounded whitespace-pre-wrap overflow-x-auto">
                                  {example.input}
                                </pre>
                              </div>
                              
                              {/* Output */}
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-base-content/70 mb-2">Output</div>
                                <pre className="text-xs sm:text-sm font-mono text-base-content bg-base-200 p-2 rounded whitespace-pre-wrap overflow-x-auto">
                                  {example.output}
                                </pre>
                              </div>
                              
                              {/* Explanation */}
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-base-content/70 mb-2">Explanation</div>
                                <div className="text-xs sm:text-sm text-base-content bg-base-200 p-2 rounded">
                                  {example.explanation}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Constraints Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-base-content mb-3">Constraints</h3>
                      <div className="text-sm text-base-content/80 mb-2">
                        Make sure your solution handles all edge cases and follows the problem constraints.
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-base-content">
                        <li>1 ≤ n ≤ 10<sup>4</sup></li>
                        <li>-10<sup>9</sup> ≤ nums[i] ≤ 10<sup>9</sup></li>
                        <li>-10<sup>9</sup> ≤ target ≤ 10<sup>9</sup></li>
                      </ul>
                    </div>
                  </div>
                )}
                {activeLeftTab === 'editorial' && (
                  <div className="bg-base-100 p-3 sm:p-4 lg:p-6 rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content truncate">Editorial Videos</h2>
                        <p className="text-base-content/70 text-xs sm:text-sm">Solution explanations and walkthroughs</p>
                      </div>
                    </div>

                    {videosLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                        <span className="ml-3 text-base-content/70">Loading videos...</span>
                      </div>
                    ) : videos.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-xl font-semibold text-base-content/60 mb-2">No editorial videos available</div>
                        <p className="text-base-content/50">Editorial videos will appear here once uploaded by administrators.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Video Player - Always show when videos are available */}
                        {selectedVideo ? (
                          <div className="mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-base-content">Editorial Video</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                {videos.length > 1 && (
                                  <>
                                    <span className="text-xs sm:text-sm text-base-content/60">
                                      {videos.findIndex(v => v.id === selectedVideo.id) + 1} of {videos.length}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
                                          const prevIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
                                          setSelectedVideo(videos[prevIndex]);
                                        }}
                                        className="btn btn-xs sm:btn-sm btn-circle btn-outline"
                                        title="Previous video"
                                      >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => {
                                          const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
                                          const nextIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
                                          setSelectedVideo(videos[nextIndex]);
                                        }}
                                        className="btn btn-xs sm:btn-sm btn-circle btn-outline"
                                        title="Next video"
                                      >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => setSelectedVideo(null)}
                                      className="btn btn-xs sm:btn-sm btn-outline"
                                    >
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                      </svg>
                                      <span className="hidden sm:inline">Show All Videos</span>
                                      <span className="sm:hidden">All</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <Editorial 
                              secureUrl={selectedVideo.secureUrl}
                              thumbnailUrl={selectedVideo.thumbnailUrl}
                              duration={selectedVideo.duration}
                            />
                            <div className="mt-4 p-4 bg-base-200/50 rounded-lg">
                              <h4 className="font-semibold text-base-content mb-2">
                                {selectedVideo.title || 'Solution Walkthrough'}
                              </h4>
                              <p className="text-sm text-base-content/70 mb-2">
                                Step-by-step explanation of the solution approach and implementation.
                              </p>
                              <div className="flex items-center gap-2 text-xs text-base-content/60">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Uploaded {new Date(selectedVideo.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Video List - Show when no video is selected */
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-base-content">Available Videos</h3>
                            {videos.map((video, index) => (
                            <div key={video.id} className="bg-base-200/50 border border-base-300 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                              <div className="flex items-start gap-4">
                                {/* Video Thumbnail */}
                                <div className="flex-shrink-0 relative">
                                  <div 
                                    className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden relative group cursor-pointer"
                                    onClick={() => setSelectedVideo(video)}
                                  >
                                    {video.thumbnailUrl ? (
                                      <img 
                                        src={video.thumbnailUrl} 
                                        alt="Video thumbnail"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>
                                    {/* Duration Badge */}
                                    {video.duration && (
                                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Video Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="badge badge-primary badge-sm">Editorial #{index + 1}</span>
                                    <span className="text-xs text-base-content/60">
                                      Uploaded {new Date(video.uploadedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-base-content mb-2">
                                    Solution Walkthrough
                                  </h4>
                                  <p className="text-sm text-base-content/70 mb-3">
                                    Step-by-step explanation of the solution approach and implementation.
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span>By Admin</span>
                                    </div>
                                    <button 
                                      className="btn btn-primary btn-sm"
                                      onClick={() => setSelectedVideo(video)}
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Watch Video
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeLeftTab === 'solutions' && (
                  <div className="bg-base-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-base-content">Solutions</h2>
                        <p className="text-base-content/70 text-sm">Reference implementations in multiple languages</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div key={index} className="bg-base-100 border border-base-300 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                          {/* Solution Header */}
                          <div className="bg-primary/10 px-6 py-4 border-b border-base-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg">
                                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-base-content">{solution?.language}</h3>
                                  <p className="text-sm text-base-content/70">Reference Solution</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="badge badge-success gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Verified
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(solution?.completeCode);
                                    // You could add a toast notification here
                                  }}
                                  className="btn btn-sm btn-outline"
                                  title="Copy code"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Code Display */}
                          <div className="bg-gray-900 rounded-b-xl overflow-hidden">
                            {/* Code Header */}
                            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="flex space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-300 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    {solution?.language}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-400">
                                    {solution?.completeCode.split('\n').length} lines
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Code Content */}
                            <div className="relative">
                              <div className="overflow-x-auto">
                                <pre className="p-6 text-sm text-gray-100 font-mono leading-relaxed">
                                  <code className="block">
                                    {solution?.completeCode.split('\n').map((line, lineIndex) => (
                                      <div key={lineIndex} className="flex group hover:bg-gray-800/50 transition-colors duration-150">
                                        <span className="text-gray-500 text-xs w-12 text-right pr-4 select-none group-hover:text-gray-400">
                                          {lineIndex + 1}
                                        </span>
                                        <span className="flex-1 pl-2">{line || ' '}</span>
                                      </div>
                                    ))}
                                  </code>
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                                              )) || (
                          <div className="text-center py-12">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-base-200 mb-4">
                              <svg className="h-8 w-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-base-content mb-2">Solutions Locked</h3>
                            <p className="text-base-content/70 mb-4">Solutions will be available after you solve the problem.</p>
                            <div className="alert alert-warning">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>Solve the problem first to unlock solutions</span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
                {activeLeftTab === 'submissions' && (
                  <div className="bg-base-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-base-content">My Submissions</h2>
                        <p className="text-base-content/70 text-sm">View your submission history and results</p>
                      </div>
                    </div>
                    <div className="bg-base-100 border border-base-300 rounded-xl shadow-sm overflow-hidden">
                      <SubmissionHistory problemId={problemId} />
                    </div>
                  </div>
                )}
                {activeLeftTab === 'chatAI' && (
                  <div className="h-full flex flex-col">
                    <ChatAi problem={problem} />
                  </div>
                )}
                {activeLeftTab === 'discuss' && (
                  <div className="h-full flex flex-col">
                    <ProblemDiscussion problemId={problemId} problemTitle={problem.title} />
                  </div>
                )}
              </>
            )}
            </div>

            {/* Fixed Footer for Description Tab */}
            {activeLeftTab === 'description' && problem && (
              <div className="border-t border-base-300 bg-base-100 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Like Button */}
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                        isLiked 
                          ? 'bg-green-100 text-green-600 border border-green-200' 
                          : 'bg-base-200 text-base-content hover:bg-base-300'
                      }`}
                      title="Like this problem"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4h-2m0-4h2m-2-4h2m2-4h2.5" />
                      </svg>
                      <span className="text-xs sm:text-sm font-medium">{likeCount}</span>
                    </button>

                    {/* Dislike Button */}
                    <button
                      onClick={handleDislike}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                        isDisliked 
                          ? 'bg-red-100 text-red-600 border border-red-200' 
                          : 'bg-base-200 text-base-content hover:bg-base-300'
                      }`}
                      title="Dislike this problem"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isDisliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17V4m-3 4H9m0 4h3m-3 4h3m-3-8h2.5" />
                      </svg>
                      <span className="text-xs sm:text-sm font-medium">{dislikeCount}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Show Comments Toggle Button */}
                    {comments.length > 0 && (
                      <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-base-200 text-base-content rounded-lg hover:bg-base-300 transition-colors"
                        title={showComments ? "Hide comments" : "Show comments"}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium">
                          <span className="hidden sm:inline">{showComments ? 'Hide' : 'Show'} Comments ({comments.length})</span>
                          <span className="sm:hidden">({comments.length})</span>
                        </span>
                      </button>
                    )}

                    {/* Comment Button */}
                    <button
                      onClick={() => setShowCommentModal(true)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors"
                      title="Comment on this problem"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-xs sm:text-sm font-medium">Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Resizer */}
        {!isLeftFullscreen && !isRightFullscreen && !isMobile && (
          <div
            className={`w-1 bg-base-300 hover:bg-primary cursor-col-resize flex-shrink-0 relative group transition-all duration-200 ${
              isResizing ? 'bg-primary w-2 shadow-lg' : ''
            }`}
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setLeftPanelWidth(40)}
            title="Double-click to reset to 50/50 split"
          >
            {/* Resizer Handle */}
            <div className="absolute inset-y-0 -left-2 -right-2 flex items-center justify-center">
              <div className={`w-4 h-12 bg-base-300 group-hover:bg-primary rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                isResizing ? 'opacity-100 bg-primary scale-110' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <div className="flex flex-col space-y-0.5">
                  <div className="w-0.5 h-1 bg-base-content group-hover:bg-primary-content rounded-full"></div>
                  <div className="w-0.5 h-1 bg-base-content group-hover:bg-primary-content rounded-full"></div>
                  <div className="w-0.5 h-1 bg-base-content group-hover:bg-primary-content rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Resize indicator */}
            {isResizing && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-content px-2 py-1 rounded text-xs font-medium shadow-lg">
                {Math.round(leftPanelWidth)}% | {Math.round(100 - leftPanelWidth)}%
              </div>
            )}
          </div>
        )}

        {/* Mobile Resizer */}
        {!isLeftFullscreen && !isRightFullscreen && isMobile && (
          <div
            className={`h-3 bg-base-300 hover:bg-primary active:bg-primary cursor-row-resize flex-shrink-0 relative group transition-all duration-200 ${
              isMobileResizing ? 'bg-primary h-4 shadow-lg' : ''
            }`}
            onMouseDown={handleMobileMouseDown}
            onTouchStart={handleTouchStart}
            onDoubleClick={() => setLeftPanelHeight(50)}
            title="Drag to resize panels"
            style={{ touchAction: 'none' }}
          >
            {/* Resizer Handle */}
            <div className="absolute inset-x-0 -top-2 -bottom-2 flex items-center justify-center">
              <div className={`h-8 w-20 bg-base-200 border border-base-300 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                isMobileResizing ? 'bg-primary border-primary scale-105' : 'hover:bg-base-100'
              }`}>
                <div className="flex space-x-1">
                  <div className={`h-1 w-3 rounded-full transition-colors ${
                    isMobileResizing ? 'bg-primary-content' : 'bg-base-content/60'
                  }`}></div>
                  <div className={`h-1 w-3 rounded-full transition-colors ${
                    isMobileResizing ? 'bg-primary-content' : 'bg-base-content/60'
                  }`}></div>
                  <div className={`h-1 w-3 rounded-full transition-colors ${
                    isMobileResizing ? 'bg-primary-content' : 'bg-base-content/60'
                  }`}></div>
                </div>
              </div>
            </div>
            
            {/* Resize indicator */}
            {isMobileResizing && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-content px-2 py-1 rounded text-xs font-medium shadow-lg">
                {Math.round(leftPanelHeight)}% | {Math.round(100 - leftPanelHeight)}%
              </div>
            )}
          </div>
        )}

        {/* Right Panel */}
        <div 
          className={`flex flex-col transition-all duration-300 relative ${
            isRightFullscreen ? 'absolute inset-0 w-full z-50 shadow-2xl bg-base-100' : 
            isLeftFullscreen ? 'w-0 h-0 lg:w-0 lg:h-auto overflow-hidden' : 'relative'
          } ${isResizing ? 'select-none' : ''}`}
          style={{ 
            width: isRightFullscreen ? '100%' : 
                   isLeftFullscreen ? '0%' : 
                   isMobile ? '100%' : `${100 - leftPanelWidth}%`,
            height: isRightFullscreen ? '100%' : 
                    isLeftFullscreen ? '0%' : 
                    isMobile ? `${100 - leftPanelHeight}%` : 'auto',
            transition: (isResizing || isMobileResizing) ? 'none' : 'width 0.3s ease-in-out, height 0.3s ease-in-out'
          }}
        >
          {/* Right Panel Fullscreen Button */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={toggleRightFullscreen}
              className="btn btn-sm btn-circle btn-ghost text-base-content/80 hover:text-base-content hover:bg-base-200"
              title={isRightFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {isRightFullscreen ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                ) : (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                )}
              </svg>
            </button>
          </div>

          {/* Right Tabs */}
          <div className="flex border-b border-base-300 bg-base-100 px-1 overflow-x-auto">
            <button 
              className={`px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeRightTab === 'code' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
              }`}
              onClick={() => setActiveRightTab('code')}
            >
              <span className="mr-1 align-middle inline-block" aria-label="Code">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </span>
              Code
            </button>
            <button 
              className={`px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeRightTab === 'testcase' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
              }`}
              onClick={() => setActiveRightTab('testcase')}
            >
              <span className="mr-1 align-middle inline-block" aria-label="Testcase">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
              </span>
              <span className="hidden sm:inline">Testcase</span>
              <span className="sm:hidden">Test</span>
            </button>
            <button 
              className={`px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeRightTab === 'result' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
              }`}
              onClick={() => setActiveRightTab('result')}
            >
              <span className="mr-1 align-middle inline-block" aria-label="Result">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 17 10"/></svg>
              </span>
              Result
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col bg-base-100">
            {/* Main Content Area - Fixed height to account for footer */}
            <div className="flex-1 flex flex-col min-h-0">
              {activeRightTab === 'code' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Language Selector */}
                  <div className="flex justify-between items-center p-2 sm:p-3 lg:p-4 border-b border-base-300 flex-shrink-0">
                    <div className="dropdown dropdown-hover">
                      <div tabIndex={0} role="button" className="btn btn-primary btn-xs sm:btn-sm">
                        <span className="text-xs sm:text-sm">{langMap[selectedLanguage] || selectedLanguage}</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40 sm:w-52 max-h-96 overflow-y-auto">
                        {[
                          'cpp', 'java', 'javascript', 'python'
                        ].map((lang) => (
                          <li key={lang}>
                            <button
                              className={`text-xs sm:text-sm ${selectedLanguage === lang ? 'bg-primary text-primary-content' : ''}`}
                              onClick={() => handleLanguageChange(lang)}
                            >
                              {langMap[lang] || lang}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      theme={editorTheme}
                      options={{
                        fontSize: isMobile ? 12 : 14,
                        minimap: { enabled: !isMobile },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: isMobile ? 5 : 10,
                        lineNumbersMinChars: isMobile ? 2 : 3,
                        renderLineHighlight: 'line',
                        selectOnLineNumbers: true,
                        roundedSelection: false,
                        readOnly: false,
                        cursorStyle: 'line',
                        mouseWheelZoom: true,
                      }}
                    />
                  </div>
                </div>
              )}

              {activeRightTab === 'testcase' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div 
                    className="flex-1 p-2 sm:p-3 lg:p-4 overflow-y-auto"
                    style={{ 
                      scrollBehavior: 'smooth',
                      overscrollBehavior: 'contain'
                    }}
                  >
                    <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg text-base-content">Test Results</h3>
                    {runResult ? (
                      <div className="mb-4">
                        {/* Header Banner */}
                        <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-t-xl font-semibold text-base sm:text-lg lg:text-xl ${runResult.success ? 'bg-green-500/90 text-white' : 'bg-base-200 text-base-content'}`}> 
                          {runResult.success ? (
                            <>
                              <span className="text-xl sm:text-2xl lg:text-3xl">✔</span>
                              <span className="truncate">All test cases passed!</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xl sm:text-2xl lg:text-3xl">✗</span>
                              <span className="truncate">Some test cases failed</span>
                            </>
                          )}
                        </div>
                        {/* Stats Bar */}
                        <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 py-2 bg-base-200 rounded-b-xl border-b border-base-300 text-xs">
                          <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                            <span className="hidden sm:inline">Runtime: </span>
                            <span className="sm:hidden">⏱ </span>
                            <span className="font-bold">{runResult.runtime}s</span>
                          </span>
                          <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                            <span className="hidden sm:inline">Memory: </span>
                            <span className="sm:hidden">💾 </span>
                            <span className="font-bold">{runResult.memory}KB</span>
                          </span>
                        </div>
                        {/* Test Cases Timeline */}
                        <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:gap-5">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className={`relative flex flex-col gap-3 bg-base-100 border border-base-300 rounded-lg shadow-sm p-3 sm:p-4 pl-4 sm:pl-6 ${tc.status_id==3 ? 'border-l-4 sm:border-l-8 border-green-500' : 'border-l-4 sm:border-l-8 border-red-500'}`}> 
                              {/* Pass/Fail Badge */}
                              <div className={`absolute left-0 top-3 sm:top-4 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${tc.status_id==3 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <div className="flex-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-2">
                                  <div className="min-w-0">
                                    <div className="text-xs text-base-content/60 font-semibold mb-1">Input</div>
                                    <pre className="bg-base-200 border border-base-300 rounded px-2 py-1 font-mono text-xs whitespace-pre-wrap text-base-content overflow-x-auto">{tc.stdin}</pre>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs text-base-content/60 font-semibold mb-1">Expected</div>
                                    <pre className="bg-base-200 border border-base-300 rounded px-2 py-1 font-mono text-xs whitespace-pre-wrap text-base-content overflow-x-auto">{tc.expected_output}</pre>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs text-base-content/60 font-semibold mb-1">Output</div>
                                    <pre className="bg-base-200 border border-base-300 rounded px-2 py-1 font-mono text-xs whitespace-pre-wrap text-base-content overflow-x-auto">{tc.stdout}</pre>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-center sm:justify-start">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${tc.status_id==3 ? 'bg-success/20 text-success border border-success/30' : 'bg-error/20 text-error border border-error/30'}`}>
                                  <span className="hidden sm:inline">{tc.status_id==3 ? 'Passed' : 'Failed'}</span>
                                  <span className="sm:hidden">{tc.status_id==3 ? '✓' : '✗'}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-base-content/60 text-sm">
                        Click "Run" to test your code with the example test cases.
                      </div>
                    )}

                    {/* Show Submit Results in Testcase Tab if Available */}
                    {submitResult && (
                      <div className="mt-6 border-t border-base-300 pt-6">
                        <h3 className="font-semibold mb-4 text-lg text-base-content">Latest Submission Result</h3>
                        <div className="mb-4">
                          {/* Header Banner */}
                          <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-t-xl font-semibold text-base sm:text-lg lg:text-xl ${submitResult.accepted ? 'bg-green-500/90 text-white' : 'bg-base-200 text-base-content'}`}> 
                            {submitResult.accepted ? (
                              <>
                                <span className="text-xl sm:text-2xl lg:text-3xl">🎉</span>
                                <span className="truncate">Accepted</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xl sm:text-2xl lg:text-3xl">❌</span>
                                <span className="truncate">{submitResult.error || 'Some test cases failed'}</span>
                              </>
                            )}
                          </div>
                          {/* Stats Bar */}
                          <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 py-2 bg-base-200 rounded-b-xl border-b border-base-300 text-xs">
                            <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                              <span className="hidden lg:inline">Test Cases: </span>
                              <span className="lg:hidden">✓ </span>
                              <span className="font-bold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                            </span>
                            <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                              <span className="hidden sm:inline">Runtime: </span>
                              <span className="sm:hidden">⏱ </span>
                              <span className="font-bold">{submitResult.runtime}s</span>
                            </span>
                            <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                              <span className="hidden sm:inline">Memory: </span>
                              <span className="sm:hidden">💾 </span>
                              <span className="font-bold">{submitResult.memory}KB</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeRightTab === 'result' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div 
                    className="flex-1 p-4 overflow-y-auto"
                    style={{ 
                      scrollBehavior: 'smooth',
                      overscrollBehavior: 'contain'
                    }}
                  >
                    <h3 className="font-semibold mb-4 text-lg text-base-content">Submission Result</h3>
                    {submitResult ? (
                      <div className="mb-4">
                        {/* Header Banner */}
                        <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-t-xl font-semibold text-base sm:text-lg lg:text-xl ${submitResult.accepted ? 'bg-green-500/90 text-white' : 'bg-base-200 text-base-content'}`}> 
                          {submitResult.accepted ? (
                            <>
                              <span className="text-xl sm:text-2xl lg:text-3xl">🎉</span>
                              <span className="truncate">Accepted</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xl sm:text-2xl lg:text-3xl">❌</span>
                              <span className="truncate">{submitResult.error || 'Some test cases failed'}</span>
                            </>
                          )}
                        </div>
                        {/* Stats Bar */}
                        <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 py-2 bg-base-200 rounded-b-xl border-b border-base-300 text-xs">
                          <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                            <span className="hidden lg:inline">Test Cases: </span>
                            <span className="lg:hidden">✓ </span>
                            <span className="font-bold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                          </span>
                          <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                            <span className="hidden sm:inline">Runtime: </span>
                            <span className="sm:hidden">⏱ </span>
                            <span className="font-bold">{submitResult.runtime}s</span>
                          </span>
                          <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                            <span className="hidden sm:inline">Memory: </span>
                            <span className="sm:hidden">💾 </span>
                            <span className="font-bold">{submitResult.memory}KB</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-base-content/60 text-sm">
                        Click "Submit" to submit your solution for evaluation.
                      </div>
                    )}

                    {/* Show Run Results in Result Tab if Available */}
                    {runResult && (
                      <div className="mt-6 border-t border-base-300 pt-6">
                        <h3 className="font-semibold mb-4 text-lg text-base-content">Latest Test Results</h3>
                        <div className="mb-4">
                          {/* Header Banner */}
                          <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-t-xl font-semibold text-base sm:text-lg lg:text-xl ${runResult.success ? 'bg-green-500/90 text-white' : 'bg-base-200 text-base-content'}`}> 
                            {runResult.success ? (
                              <>
                                <span className="text-xl sm:text-2xl lg:text-3xl">✔</span>
                                <span className="truncate">All test cases passed!</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xl sm:text-2xl lg:text-3xl">✗</span>
                                <span className="truncate">Some test cases failed</span>
                              </>
                            )}
                          </div>
                          {/* Stats Bar */}
                          <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 py-2 bg-base-200 rounded-b-xl border-b border-base-300 text-xs">
                            <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                              <span className="hidden sm:inline">Runtime: </span>
                              <span className="sm:hidden">⏱ </span>
                              <span className="font-bold">{runResult.runtime}s</span>
                            </span>
                            <span className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content text-xs whitespace-nowrap">
                              <span className="hidden sm:inline">Memory: </span>
                              <span className="sm:hidden">💾 </span>
                              <span className="font-bold">{runResult.memory}KB</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persistent Footer with Navigation and Action Buttons */}
            <div className="border-t border-base-300 bg-base-100 p-2 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                {/* Navigation Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="btn btn-xs sm:btn-sm btn-outline whitespace-nowrap flex-shrink-0"
                    title="View all problems"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="hidden sm:inline">All Problems</span>
                    <span className="sm:hidden">All</span>
                  </button>
                  
                  <button
                    onClick={() => prevProblemId && navigate(`/problem/${prevProblemId}`)}
                    disabled={!prevProblemId}
                    className="btn btn-xs sm:btn-sm btn-outline whitespace-nowrap flex-shrink-0"
                    title="Previous problem"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  
                  <button
                    onClick={() => nextProblemId && navigate(`/problem/${nextProblemId}`)}
                    disabled={!nextProblemId}
                    className="btn btn-xs sm:btn-sm btn-outline whitespace-nowrap flex-shrink-0"
                    title="Next problem"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 justify-end flex-shrink-0">
                  <button
                    onClick={handleRun}
                    disabled={runLoading || submitLoading}
                    className="btn btn-xs sm:btn-sm btn-outline whitespace-nowrap"
                    title="Run code with test cases"
                  >
                    {runLoading ? (
                      <span className="loading loading-spinner loading-xs mr-1"></span>
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    Run
                  </button>
                  
                  <button
                    onClick={handleSubmitCode}
                    disabled={runLoading || submitLoading}
                    className="btn btn-xs sm:btn-sm btn-primary whitespace-nowrap"
                    title="Submit solution"
                  >
                    {submitLoading ? (
                      <span className="loading loading-spinner loading-xs mr-1"></span>
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                    Submit
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Comments Display Modal */}
      {showComments && comments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-base-300 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-base-content">Comments ({comments.length})</h3>
              <button
                onClick={() => setShowComments(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-base-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                      <span className="font-medium text-base-content text-sm sm:text-base">{comment.author}</span>
                      <span className="text-xs text-base-content/60">
                        {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-base-content leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-base-300 flex-shrink-0">
              <button
                onClick={() => {
                  setShowComments(false);
                  setShowCommentModal(true);
                }}
                className="btn btn-primary btn-sm"
              >
                Add Comment
              </button>
              <button
                onClick={() => setShowComments(false)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-base-300">
              <h3 className="text-lg font-semibold text-base-content">Add Comment</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-base-content mb-2">
                  Your Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="textarea textarea-bordered w-full h-32 resize-none"
                  placeholder="Share your thoughts about this problem..."
                  maxLength={500}
                />
                <div className="text-xs text-base-content/60 mt-1">
                  {comment.length}/500 characters
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-base-300">
              <button
                onClick={() => setShowCommentModal(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
                className="btn btn-primary btn-sm"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemPage;