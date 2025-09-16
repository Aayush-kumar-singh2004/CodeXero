import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import axiosClient from "../utils/axiosClient";
import Navbar from '../components/Navbar';
import { getServerUrl } from '../config/api';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
  python: 'Python',
};

function MultiplayerRandomChallenge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { timeLimit, userId, username } = location.state || {};
  
  const [status, setStatus] = useState('connecting'); // connecting, searching, vs-animation, matched, in-game, finished
  const [socket, setSocket] = useState(null);
  const [match, setMatch] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Panel resizing states
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  const [isLeftFullscreen, setIsLeftFullscreen] = useState(false);
  const [isRightFullscreen, setIsRightFullscreen] = useState(false);
  const containerRef = useRef(null);
  const leftContentRef = useRef(null);
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const editorRef = useRef(null);

  // Theme for Monaco Editor
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  useEffect(() => {
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
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  useEffect(() => {
    console.log('MultiplayerRandomChallenge - Received state:', { timeLimit, userId, username });
    console.log('Location state:', location.state);
    
    const { isPrivateMatch, match: privateMatch, isPrivateRoom, roomCode } = location.state || {};
    
    if (!timeLimit || !userId || !username) {
      console.log('Missing required parameters:', { 
        timeLimit: !!timeLimit, 
        userId: !!userId, 
        username: !!username 
      });
      console.log('Redirecting to multiplayer');
      navigate('/multiplayer');
      return;
    }

    // If this is a private match, set it up directly
    if (isPrivateMatch && privateMatch) {
      console.log('Setting up private match:', privateMatch);
      setMatch(privateMatch);
      setStatus('matched');
      
      // Set initial code from problem
      if (privateMatch.problem && privateMatch.problem.startCode) {
        const initialCode = privateMatch.problem.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
        setCode(initialCode);
      }
      
      // Set opponent info
      const opponent = privateMatch.players.find(p => p.id !== userId);
      if (opponent) {
        setOpponent(opponent);
      }
      
      // Start game timer
      const endTime = privateMatch.endTime;
      startGameTimer(endTime);
      setStatus('in-game');
      
      // Initialize socket for win/lose notifications
      const newSocket = io(getServerUrl(), {
        withCredentials: true
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to server for private match');
        newSocket.emit('authenticate', { id: userId, username });
      });
      
      // Add win/lose listeners
      newSocket.on('match-won', (data) => {
        console.log('🎉 MATCH WON EVENT RECEIVED:', data);
        setGameResult({ type: 'won', message: data.message });
        setStatus('finished');
      });

      newSocket.on('match-lost', (data) => {
        console.log('💔 MATCH LOST EVENT RECEIVED:', data);
        setGameResult({ type: 'lost', message: data.message });
        setStatus('finished');
      });

      newSocket.on('opponent-disconnected', (data) => {
        console.log('Opponent disconnected:', data);
        setGameResult({ type: 'won', message: data.message });
        setStatus('finished');
      });
      
      socketRef.current = newSocket;
      setSocket(newSocket);
      
      return;
    }



    // Regular random matchmaking
    const newSocket = io(getServerUrl(), {
      withCredentials: true
    });
    
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setStatus('searching');
      
      // Authenticate user
      console.log('Authenticating user:', { id: userId, username });
      newSocket.emit('authenticate', { id: userId, username });
      
      // Join matchmaking
      newSocket.emit('join-matchmaking', { timeLimit, userId, username });
    });

    newSocket.on('matchmaking-joined', (data) => {
      console.log('Joined matchmaking queue:', data);
    });

    newSocket.on('match-found', (data) => {
      console.log('Match found:', data);
      console.log('Setting status to vs-animation');
      setMatch(data.match);
      setStatus('vs-animation');
      setTimeRemaining(data.match.timeLimit);
      
      // Set opponent info
      const opponentInfo = data.match.players.find(p => p.id !== userId);
      setOpponent(opponentInfo);
      console.log('Opponent info set:', opponentInfo);
      
      // Set initial code from problem
      if (data.match.problem && data.match.problem.startCode) {
        const initialCode = data.match.problem.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
        setCode(initialCode);
      }
      
      // Show VS animation for 5 seconds, then start the game
      console.log('Starting VS animation timeout for 5 seconds');
      setTimeout(() => {
        console.log('VS animation timeout completed, starting game');
        setStatus('in-game');
        startGameTimer(data.match.endTime);
      }, 5000);
    });

    newSocket.on('match-won', (data) => {
      console.log('🎉 MATCH WON EVENT RECEIVED:', data);
        setGameResult({ type: 'won', message: data.message });
        setStatus('finished');
        if (timerRef.current) clearInterval(timerRef.current);
    });

    newSocket.on('match-lost', (data) => {
      console.log('💔 MATCH LOST EVENT RECEIVED:', data);
        setGameResult({ type: 'lost', message: data.message });
        setStatus('finished');
        if (timerRef.current) clearInterval(timerRef.current);
    });

    newSocket.on('match-timeout', (data) => {
      console.log('Match timeout:', data);
      setGameResult({ type: 'draw', message: data.message });
      setStatus('finished');
      if (timerRef.current) clearInterval(timerRef.current);
    });

    newSocket.on('opponent-disconnected', (data) => {
      console.log('Opponent disconnected:', data);
      setGameResult({ type: 'won', message: data.message });
      setStatus('finished');
      if (timerRef.current) clearInterval(timerRef.current);
    });

    newSocket.on('submission-result', (data) => {
      console.log('Submission result from socket:', data);
      
      // Update submission result for display
      setSubmitResult(data.result);
      setLoading(false);
      setIsSubmitting(false);
      setActiveRightTab('result');
      
      // Add to submissions history for tracking
      setSubmissions(prev => [...prev, {
        code,
        language: selectedLanguage,
        success: data.success,
        message: data.message,
        timestamp: Date.now()
      }]);
    });

    newSocket.on('submission-error', (data) => {
      console.log('Submission error:', data);
      setIsSubmitting(false);
      setLoading(false);
      alert(data.message);
    });

    // Add run result listeners
    newSocket.on('run-result', (data) => {
      console.log('Run result from socket:', data);
      setLoading(false);
      
      // Update run result for display
      setRunResult({
        success: data.success,
        testCases: data.testCases,
        runtime: data.runtime,
        memory: data.memory
      });
      setActiveRightTab('output');
    });

    newSocket.on('run-error', (data) => {
      console.log('Run error:', data);
      setLoading(false);
      alert(data.message);
    });

    newSocket.on('matchmaking-error', (data) => {
      console.log('Matchmaking error:', data);
      alert(data.message);
      navigate('/multiplayer');
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.emit('leave-matchmaking', { timeLimit, userId });
        socketRef.current.disconnect();
      }
    };
  }, [timeLimit, userId, username, navigate]);

  // Handle language changes separately without re-initializing multiplayer
  useEffect(() => {
    if (match && match.problem && match.problem.startCode) {
      const initialCode = match.problem.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, match]);

  const startGameTimer = (endTime) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setStatus('finished');
        setGameResult({ type: 'draw', message: 'Time\'s up! The match is a draw.' });
      }
    }, 1000);
  };

  // Panel resizing functionality
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
    setLeftPanelWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

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

  // Editor functions
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    // Update code when language changes
    if (match && match.problem && match.problem.startCode) {
      const initialCode = match.problem.startCode?.find(sc => sc.language === langMap[language])?.initialCode || '';
      setCode(initialCode);
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



  const handleSubmitCode = async () => {
    if (!code.trim() || !match || isSubmitting) return;
    
    console.log('📤 Submitting code...', { 
      problemId: match.problem.id, 
      language: selectedLanguage, 
      codeLength: code.trim().length 
    });
    
    setIsSubmitting(true);
    setLoading(true);
    setSubmitResult(null);
    
    try {
      // Use direct API call like in ProblemPage.jsx
      const response = await axiosClient.post(`/submission/submit/${match.problem.id}`, {
        code: code.trim(),
        language: selectedLanguage
      });

      console.log('✅ Submit response received:', response.data);
      setSubmitResult(response.data);
      setLoading(false);
      setIsSubmitting(false);
      setActiveRightTab('result');
      
      // Check if the submission was accepted for multiplayer win logic
      if (response.data.accepted && socket && socket.connected) {
        // Notify other players via socket that this user won
        socket.emit('player-won', {
          matchId: match.id,
          userId: userId,
          username: username
        });
      }
      
    } catch (error) {
      console.error('❌ Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        error: 'Submission failed. Please try again.',
        passedTestCases: 0,
        totalTestCases: 10,
        runtime: '0.000',
        memory: 0
      });
      setLoading(false);
      setIsSubmitting(false);
      setActiveRightTab('result');
    }
  };

  const handleBack = () => {
    if (socket) {
      socket.emit('leave-matchmaking', { timeLimit, userId });
      socket.disconnect();
    }
    navigate('/multiplayer');
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderStatus = () => {
    console.log('Current status:', status, 'Match:', !!match, 'Opponent:', !!opponent);
    switch (status) {
      case 'connecting':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-12 border border-gray-800 text-center max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700 border-t-indigo-500 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Connecting to Arena</h2>
              <p className="text-gray-400 text-lg">Establishing secure connection...</p>
            </div>
          </div>
        );
      
      case 'searching':
        return (
          <div 
            className="min-h-screen font-sans text-gray-200 flex items-center justify-center"
            style={{ 
              background: `
                radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
                  rgba(139, 92, 246, 0.15) 0%,
                  rgba(59, 130, 246, 0.1) 25%,
                  transparent 70%
                ),
                radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
                linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
              `
            }}
          >
            <div className="text-center">
              <div className="relative mb-12">
                {/* Outer ring */}
                <div className="w-40 h-40 border-2 border-blue-500/20 rounded-full flex items-center justify-center mx-auto relative">
                  {/* Middle ring */}
                  <div className="w-32 h-32 border-2 border-blue-500/40 rounded-full flex items-center justify-center animate-pulse">
                    {/* Inner spinning ring */}
                    <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {/* Floating particles */}
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute left-0 top-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
              
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Searching for Opponent
              </h2>
              <p className="text-gray-300 text-xl mb-12 max-w-md mx-auto leading-relaxed">
                Finding a skilled developer to challenge you in real-time coding battle
              </p>
              
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 mb-12 inline-block border border-gray-800">
                <div className="flex items-center gap-3 text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-lg">Battle Duration: {timeLimit} minutes</span>
                </div>
              </div>
              
              <div className="flex justify-center mb-12">
                <div className="flex space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              
              <button
                onClick={handleBack}
                className="px-8 py-3 text-gray-300 hover:text-white transition-all duration-300 border border-gray-600 rounded-xl hover:border-gray-400 hover:bg-gray-800/30 backdrop-blur-sm"
              >
                Cancel Search
              </button>
            </div>
          </div>
        );
      
      case 'vs-animation':
        return renderVSAnimation();
        
      case 'matched':
      case 'in-game':
        return renderGameInterface();
      
      case 'finished':
        return renderGameResult();
      
      default:
        return null;
    }
  };

  const renderVSAnimation = () => {
    console.log('renderVSAnimation called - Match:', !!match, 'Opponent:', !!opponent);
    if (!match) {
      console.log('VS Animation returning null - missing match');
      return null;
    }
    
    // If opponent isn't set yet, try to find it from match data
    const opponentInfo = opponent || (match.players ? match.players.find(p => p.id !== userId) : null);
    if (!opponentInfo) {
      console.log('VS Animation returning null - missing opponent info');
      return null;
    }

    const currentUser = `${user?.firstName || 'You'} ${user?.lastName || ''}`.trim() || 'You';
    console.log('Rendering VS Animation with opponent:', opponentInfo.username);

    return (
      <div 
        className="min-h-screen font-sans text-gray-200 flex items-center justify-center overflow-hidden relative"
        style={{ 
          background: `
            radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 70%),
            radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
            linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
          `
        }}
      >
        <div className="text-center z-10 p-6">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <div 
              className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div 
              className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full animate-pulse"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
          
          {/* Players */}
          <div className="relative z-10 flex items-center justify-center gap-16 mb-8">
            {/* Current User */}
            <div className="text-center animate-slide-in-left">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-2xl border-4 border-blue-300">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  👤 YOU
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{currentUser}</h3>
              <p className="text-blue-400 font-semibold">Ready to battle!</p>
            </div>

            {/* VS Text */}
            <div className="text-center animate-zoom-in">
              <div className="text-8xl font-black text-white mb-4 animate-pulse">⚔️ VS ⚔️</div>
              <div className="text-2xl text-yellow-400 font-bold mb-2">OPPONENT FOUND!</div>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
            </div>

            {/* Opponent */}
            <div className="text-center animate-slide-in-right">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-2xl border-4 border-purple-300">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  🎯 FOE
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{opponentInfo.username}</h3>
              <p className="text-purple-400 font-semibold">Your challenger!</p>
            </div>
          </div>

          {/* Match Info */}
          <div className="relative z-10 animate-fade-in-up">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-8 inline-block border border-gray-600">
              <h4 className="text-3xl font-bold text-white mb-3 text-center">🎯 BATTLE BEGINS!</h4>
              <div className="text-center mb-6">
                <p className="text-xl text-yellow-300 font-semibold mb-2">{match.problem.title}</p>
                <p className="text-gray-300">Prepare for an epic coding duel!</p>
              </div>
              <div className="flex items-center justify-center gap-6 text-lg">
                <div className="flex items-center gap-2 text-blue-400 bg-blue-900/30 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">{timeLimit} min</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400 bg-purple-900/30 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-bold capitalize">{match.problem.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="relative z-10 mt-8 animate-bounce">
            <div className="text-center">
              <p className="text-2xl text-white font-bold mb-2">⚡ GET READY! ⚡</p>
              <p className="text-gray-400 text-lg">Battle starts in seconds...</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGameInterface = () => {
    if (!match) return null;

    return (
      <div className="h-screen flex flex-col bg-base-100">
        <Navbar user={user} />
        
        {/* Battle Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-bold">LIVE BATTLE</span>
              </div>
              <div className="text-sm">
                vs <span className="font-bold">{opponent?.username || 'Unknown'}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs opacity-90">Time Remaining</div>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Exit Battle
            </button>
          </div>
        </div>

        {/* Fullscreen Overlay */}
        {(isLeftFullscreen || isRightFullscreen) && (
          <div 
            className="absolute inset-0 bg-black/20 z-40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={exitFullscreen}
          />
        )}
        
        <div 
          ref={containerRef}
          className="flex flex-1 overflow-hidden relative"
        >
          {/* Left Panel - Problem Description */}
          <div 
            className={`flex flex-col border-r border-base-300 transition-all duration-300 relative ${
              isLeftFullscreen ? 'absolute inset-0 w-full z-50 shadow-2xl bg-base-100' : 
              isRightFullscreen ? 'w-0 overflow-hidden' : 'relative'
            }`}
            style={{ 
              width: isLeftFullscreen ? '100%' : 
                     isRightFullscreen ? '0%' : 
                     `${leftPanelWidth}%`,
              transition: isResizing ? 'none' : 'width 0.3s ease-in-out'
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

            {/* Left Tabs */}
            <div className="flex border-b border-base-300 bg-base-100 px-1">
              <button 
                className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLeftTab === 'description' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
                }`}
                onClick={() => setActiveLeftTab('description')}
              >
                <span className="mr-1 align-middle inline-block" aria-label="Description">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>
                </span>
                Description
              </button>
              <button 
                className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLeftTab === 'submissions' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
                }`}
                onClick={() => setActiveLeftTab('submissions')}
              >
                <span className="mr-1 align-middle inline-block" aria-label="Submissions">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </span>
                Battle Log
              </button>
            </div>

            {/* Left Content */}
            <div className="flex-1 flex flex-col bg-base-100 min-h-0">
              <div 
                ref={leftContentRef}
                className="flex-1 overflow-y-auto p-6" 
                style={{ 
                  scrollBehavior: 'smooth',
                  overscrollBehavior: 'contain',
                  touchAction: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  overflowY: 'auto',
                  userSelect: 'auto',
                  pointerEvents: 'auto'
                }}
              >
                {match.problem && (
                  <>
                    <div className="flex items-center gap-3 mb-4 border-b border-base-200 pb-3">
                      <h1 className="text-2xl font-semibold text-base-content flex-1 truncate">{match.problem.title}</h1>
                      <span className={`badge badge-outline ${getDifficultyColor(match.problem.difficulty)} text-xs font-medium px-2 py-1`}>
                        {match.problem.difficulty.charAt(0).toUpperCase() + match.problem.difficulty.slice(1)}
                      </span>
                    </div>

                    {activeLeftTab === 'description' && (
                      <div className="space-y-4">
                        {/* Problem Description */}
                        <div>
                          <h2 className="text-lg font-semibold text-base-content mb-3">Problem Description</h2>
                          <div className="text-sm leading-relaxed text-base-content">
                            {match.problem.description}
                          </div>
                        </div>

                        {/* Examples Section */}
                        <div>
                          <h3 className="text-lg font-semibold text-base-content mb-3">Examples</h3>
                          <div className="space-y-3">
                            {match.problem.examples?.map((example, index) => (
                              <div key={index} className="border border-base-300 rounded-lg p-4">
                                <div className="font-medium text-base-content mb-3">Example {index + 1}</div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Input */}
                                  <div>
                                    <div className="text-sm font-medium text-base-content/70 mb-2">Input</div>
                                    <pre className="text-sm font-mono text-base-content bg-base-200 p-2 rounded whitespace-pre-wrap">
                                      {example.input}
                                    </pre>
                                  </div>
                                  
                                  {/* Output */}
                                  <div>
                                    <div className="text-sm font-medium text-base-content/70 mb-2">Output</div>
                                    <pre className="text-sm font-mono text-base-content bg-base-200 p-2 rounded whitespace-pre-wrap">
                                      {example.output}
                                    </pre>
                                  </div>
                                  
                                  {/* Explanation */}
                                  <div>
                                    <div className="text-sm font-medium text-base-content/70 mb-2">Explanation</div>
                                    <div className="text-sm text-base-content bg-base-200 p-2 rounded">
                                      {example.explanation}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeLeftTab === 'submissions' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-base-content">Battle Submissions</h2>
                            <p className="text-base-content/70 text-sm">Your attempts in this battle</p>
                          </div>
                        </div>
                        
                        {submissions.length > 0 ? (
                          <div className="space-y-3">
                            {submissions.map((submission, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300 hover:border-base-400 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    submission.success ? 'bg-green-500' : 'bg-red-500'
                                  }`}>
                                    {submission.success ? (
                                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-base-content font-medium">
                                      Attempt #{index + 1}
                                    </span>
                                    <span className="text-base-content/60 text-sm ml-2">
                                      ({langMap[submission.language] || submission.language})
                                    </span>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    submission.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                                  }`}>
                                    {submission.success ? 'PASSED' : 'FAILED'}
                                  </span>
                                </div>
                                <div className="text-sm text-base-content/60 font-mono">
                                  {new Date(submission.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-base-content/60 mb-2">No submissions yet</h3>
                            <p className="text-base-content/50">Submit your code to see your battle attempts here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Resizer */}
          {!isLeftFullscreen && !isRightFullscreen && (
            <div
              className={`w-1 bg-base-300 hover:bg-primary cursor-col-resize flex-shrink-0 relative group transition-all duration-200 ${
                isResizing ? 'bg-primary w-2 shadow-lg' : ''
              }`}
              onMouseDown={handleMouseDown}
              onDoubleClick={() => setLeftPanelWidth(40)}
              title="Double-click to reset to 50/50 split"
            >
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
            </div>
          )}

          {/* Right Panel - Code Editor */}
          <div 
            className={`flex flex-col transition-all duration-300 relative ${
              isRightFullscreen ? 'absolute inset-0 w-full z-50 shadow-2xl bg-base-100' : 
              isLeftFullscreen ? 'w-0 overflow-hidden' : 'relative'
            } ${isResizing ? 'select-none' : ''}`}
            style={{ 
              width: isRightFullscreen ? '100%' : 
                     isLeftFullscreen ? '0%' : 
                     `${100 - leftPanelWidth}%`,
              transition: isResizing ? 'none' : 'width 0.3s ease-in-out'
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
            <div className="flex border-b border-base-300 bg-base-100 px-1">
              <button 
                className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeRightTab === 'code' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
                }`}
                onClick={() => setActiveRightTab('code')}
              >
                <span className="mr-1 align-middle inline-block" aria-label="Code">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </span>
                Code
              </button>
              <button 
                className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeRightTab === 'testcase' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
                }`}
                onClick={() => setActiveRightTab('testcase')}
              >
                <span className="mr-1 align-middle inline-block" aria-label="Testcase">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
                </span>
                Testcase
              </button>
              <button 
                className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeRightTab === 'result' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
                }`}
                onClick={() => setActiveRightTab('result')}
              >
                <span className="mr-1 align-middle inline-block" aria-label="Result">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 17 10"/></svg>
                </span>
                Result
              </button>
            </div>

            {/* Right Content */}
            <div className="flex-1 flex flex-col bg-base-100">
              <div className="flex-1 flex flex-col min-h-0">
                {activeRightTab === 'code' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Language Selector */}
                    <div className="flex justify-between items-center p-4 border-b border-base-300 flex-shrink-0">
                      <div className="dropdown dropdown-hover">
                        <div tabIndex={0} role="button" className="btn btn-primary btn-sm">
                          {langMap[selectedLanguage] || selectedLanguage}
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto">
                          {['cpp', 'java', 'javascript', 'python'].map((lang) => (
                            <li key={lang}>
                              <button
                                className={`${selectedLanguage === lang ? 'bg-primary text-primary-content' : ''}`}
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
                          fontSize: 14,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          insertSpaces: true,
                          wordWrap: 'on',
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
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
                      className="flex-1 p-4 overflow-y-auto"
                      style={{ 
                        scrollBehavior: 'smooth',
                        overscrollBehavior: 'contain'
                      }}
                    >
                      <h3 className="font-semibold mb-4 text-lg text-base-content">Test Results</h3>
                      {runResult ? (
                        <div className="mb-4">
                          <div className={`flex items-center gap-3 px-4 py-3 rounded-t-xl font-semibold text-xl ${runResult.success ? 'bg-green-500/90 text-white' : 'bg-base-200 text-base-content'}`}> 
                            {runResult.success ? (
                              <>
                                <span className="text-3xl">✔</span>
                                <span>All test cases passed!</span>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl">✗</span>
                                <span>Some test cases failed</span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-3 px-4 py-2 bg-base-200 rounded-b-xl border-b border-base-300 text-sm">
                            <span className="px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content">Runtime: <span className="font-bold">{runResult.runtime} sec</span></span>
                            <span className="px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content">Memory: <span className="font-bold">{runResult.memory} KB</span></span>
                          </div>
                          <div className="mt-6 flex flex-col gap-5">
                            {runResult.testCases.map((tc, i) => (
                              <div key={i} className={`relative flex flex-col md:flex-row md:items-center gap-3 bg-base-100 border border-base-300 rounded-lg shadow-sm p-4 pl-6 ${tc.status_id==3 ? 'border-l-8 border-green-500' : 'border-l-8 border-red-500'}`}> 
                                <div className={`absolute left-0 top-4 md:top-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full ${tc.status_id==3 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-4 mb-2">
                                    <div className="min-w-[120px]">
                                      <div className="text-xs text-base-content/60 font-semibold mb-1">Input</div>
                                      <pre className="bg-base-200 border border-base-300 rounded px-2 py-1 font-mono text-xs whitespace-pre-wrap text-base-content">{tc.stdin}</pre>
                                    </div>
                                    <div className="min-w-[120px]">
                                      <div className="text-xs text-base-content/60 font-semibold mb-1">Expected</div>
                                      <pre className="bg-base-200 border border-base-300 rounded px-2 py-1 font-mono text-xs whitespace-pre-wrap text-base-content">{tc.expected_output}</pre>
                                    </div>
                                    <div className="min-w-[120px]">
                                      <div className="text-xs text-base-content/60 font-semibold mb-1">Output</div>
                                      <pre className="bg-base-200 border border-base-300 rounded px-2 py-1 font-mono text-xs whitespace-pre-wrap text-base-content">{tc.stdout}</pre>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center md:flex-col gap-2 md:gap-0 min-w-[80px]">
                                  <span className={`px-3 py-1 rounded-full text-base font-bold ${tc.status_id==3 ? 'bg-success/20 text-success border border-success/30' : 'bg-error/20 text-error border border-error/30'}`}>{tc.status_id==3 ? 'Passed' : 'Failed'}</span>
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
                          <div className={`flex items-center gap-3 px-4 py-3 rounded-t-xl font-semibold text-xl ${submitResult.accepted ? 'bg-green-500/90 text-white' : 'bg-base-200 text-base-content'}`}> 
                            {submitResult.accepted ? (
                              <>
                                <span className="text-3xl">🎉</span>
                                <span>Accepted</span>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl">❌</span>
                                <span>{submitResult.error || 'Some test cases failed'}</span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-3 px-4 py-2 bg-base-200 rounded-b-xl border-b border-base-300 text-sm">
                            <span className="px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content">Test Cases Passed: <span className="font-bold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span></span>
                            <span className="px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content">Runtime: <span className="font-bold">{submitResult.runtime} sec</span></span>
                            <span className="px-3 py-1 rounded-full bg-base-100 border border-base-300 font-mono text-base-content">Memory: <span className="font-bold">{submitResult.memory} KB</span></span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-base-content/60 text-sm">
                          Click "Submit" to submit your solution for evaluation.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Persistent Footer with Action Buttons */}
              <div className="border-t border-base-300 bg-base-100 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Live Battle</span>
                    </div>
                    <div className="text-sm text-base-content/60">
                      Attempts: {submissions.length}
                    </div>
                    <div className="text-sm text-base-content/60">
                      vs {opponent?.username || 'Unknown'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSubmitCode}
                      disabled={loading || isSubmitting}
                      className="btn btn-sm btn-primary"
                      title="Submit solution"
                    >
                      {loading || isSubmitting ? (
                        <span className="loading loading-spinner loading-xs mr-1"></span>
                      ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    );
  };

  const renderGameResult = () => {
    if (!gameResult) return null;

    const getResultColor = () => {
      switch (gameResult.type) {
        case 'won': return 'from-green-500 to-emerald-500';
        case 'lost': return 'from-red-500 to-rose-500';
        case 'draw': return 'from-yellow-500 to-orange-500';
        default: return 'from-gray-500 to-gray-500';
      }
    };

    const getResultIcon = () => {
      switch (gameResult.type) {
        case 'won':
          return (
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        case 'lost':
          return (
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          );
        case 'draw':
          return (
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        default:
          return null;
      }
    };

    const getResultEmoji = () => {
      switch (gameResult.type) {
        case 'won': return '🏆';
        case 'lost': return '💔';
        case 'draw': return '🤝';
        default: return '⚡';
      }
    };

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-12 border border-gray-800 text-center max-w-2xl mx-auto shadow-2xl">
          {/* Result Icon */}
          <div className="relative mb-8">
            <div className={`w-32 h-32 bg-gradient-to-br ${getResultColor()} rounded-full flex items-center justify-center mx-auto shadow-2xl`}>
              {getResultIcon()}
            </div>
            <div className="absolute -top-4 -right-4 text-6xl">
              {getResultEmoji()}
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
          </div>
          
          {/* Result Title */}
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {gameResult.type === 'won' ? 'Victory!' : 
             gameResult.type === 'lost' ? 'Defeat!' : 
             'Draw!'}
          </h2>
          
          {/* Result Message */}
          <div className="bg-gray-800/30 rounded-xl p-6 mb-8 border border-gray-700/50">
            <p className="text-gray-300 text-xl leading-relaxed">{gameResult.message}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => navigate('/multiplayer')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Battle Again
            </button>
            
            <button
              onClick={() => navigate('/home')}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show loading/searching states with the old design
  if (status === 'connecting' || status === 'searching') {
    return (
      <div 
        className="min-h-screen font-sans text-gray-200"
        style={{ 
          background: `
            radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
            linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
          `
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-200 group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Battle Arena
            </h1>
            <div></div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto">
            {renderStatus()}
          </div>
        </div>
      </div>
    );
  }

  // Show game result with the old design
  if (status === 'finished') {
    return (
      <div 
        className="min-h-screen font-sans text-gray-200"
        style={{ 
          background: `
            radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
            linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
          `
        }}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {renderGameResult()}
          </div>
        </div>
      </div>
    );
  }

  // Show the ProblemPage-style interface for active games
  return renderGameInterface();
}

export default MultiplayerRandomChallenge;