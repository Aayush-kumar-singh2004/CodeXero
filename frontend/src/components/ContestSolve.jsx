import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Editor from '@monaco-editor/react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
  python: 'Python'
};

function ContestSolve({
  problem,
  initialCode = '',
  initialLanguage = 'javascript',
  onRun,
  onSubmit,
  runResult,
  submitResult,
  loading,
  onLanguageChange: onLangChangeProp,
  onCodeChange: onCodeChangeProp,
  timer, // seconds left
  points,
  progress, // { current, total }
  onSkip,
  timeUp, // boolean: true if time is up
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode);
  const [resultTabs, setResultTabs] = useState([]); // {id, type, label, content}
  const [activeTab, setActiveTab] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);
  let tabId = useRef(0);
  const navigate = useNavigate();

  // Mouse tracking for dynamic effects
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

  // Sync code state with initialCode prop
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // Add new result tab when runResult or submitResult changes
  useEffect(() => {
    if (runResult) {
      const id = ++tabId.current;
      setResultTabs(tabs => [
        ...tabs,
        {
          id,
          type: 'run',
          label: `Run #${tabs.filter(t => t.type === 'run').length + 1}`,
          content: runResult,
        },
      ]);
      setActiveTab(id);
    }
  }, [runResult]);

  useEffect(() => {
    if (submitResult) {
      const id = ++tabId.current;
      setResultTabs(tabs => [
        ...tabs,
        {
          id,
          type: 'submit',
          label: `Submit #${tabs.filter(t => t.type === 'submit').length + 1}`,
          content: submitResult,
        },
      ]);
      setActiveTab(id);
    }
  }, [submitResult]);

  const handleEditorChange = (value) => {
    setCode(value || '');
    if (onCodeChangeProp) onCodeChangeProp(value || '');
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (onLangChangeProp) onLangChangeProp(lang);
  };

  // Format timer as mm:ss
  const formatTimer = (t) => {
    const m = Math.floor(t / 60);
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Tab close handler
  const closeTab = (id) => {
    setResultTabs(tabs => {
      const idx = tabs.findIndex(t => t.id === id);
      const newTabs = tabs.filter(t => t.id !== id);
      // If closing the active tab, activate the previous or next tab
      if (activeTab === id) {
        if (newTabs.length === 0) setActiveTab(null);
        else if (idx > 0) setActiveTab(newTabs[idx - 1].id);
        else setActiveTab(newTabs[0].id);
      }
      return newTabs;
    });
  };

  // Find active tab content
  const activeTabObj = resultTabs.find(t => t.id === activeTab);

  // Helper to render test case results
  const renderTestCaseResults = (result) => {
    if (!result || !Array.isArray(result.testCases)) return null;
    const passed = result.testCases.filter(tc => tc.status_id === 3).length;
    const total = result.testCases.length;
    return (
      <div>
        <div className="mb-2 font-semibold text-base md:text-lg">
          Test Cases Passed: <span className="text-green-600">{passed}</span> / <span className="text-blue-700">{total}</span>
        </div>
        <div className="flex flex-col gap-2">
          {result.testCases.map((tc, idx) => (
            <div key={idx} className={`rounded-lg p-2 md:p-3 border flex flex-col gap-1 ${tc.status_id === 3 ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
              <div className="flex items-center gap-2 font-semibold">
                {tc.status_id === 3 ? (
                  <span className="text-green-600">✔️ Pass</span>
                ) : (
                  <span className="text-red-600">❌ Fail</span>
                )}
                <span className="text-gray-500 text-sm">Test Case {idx + 1}</span>
              </div>
              <div className="text-xs md:text-sm text-gray-700 font-mono">Input: {tc.stdin}</div>
              <div className="text-xs md:text-sm text-gray-700 font-mono">Expected Output: {tc.expected_output}</div>
              <div className="text-xs md:text-sm text-gray-700 font-mono">Your Output: {tc.stdout ?? '-'}</div>
              {tc.status_id !== 3 && tc.stderr && (
                <div className="text-xs text-red-500">Error: {tc.stderr}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col gap-4 md:gap-6 w-full min-h-screen relative text-gray-200 font-sans overflow-hidden"
      style={{ 
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(59, 130, 246, 0.1) 25%,
            rgba(16, 185, 129, 0.05) 50%,
            transparent 70%
          ),
          radial-gradient(circle at top left, #1e1b4b, #121212)
        `
      }}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-white/10 to-indigo-400/5 backdrop-blur-sm animate-float-gentle"
            style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 3}s`,
              opacity: 0.1,
            }}
          />
        ))}
      </div>

      {/* Back Button - Fixed size and position */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-900/70 backdrop-blur-lg border border-gray-700/50 hover:bg-gray-800/60 hover:border-indigo-500/50 text-gray-300 hover:text-indigo-400 text-xs font-medium shadow transition-all duration-300 group"
        aria-label="Back"
      >
        <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Exit</span>
      </button>

      {/* Contest Header */}
      <div className="relative z-10 bg-gray-900/30 backdrop-blur-lg border-b border-gray-700/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between px-4 py-4 md:px-8 md:py-6 gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-indigo-900/30 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-indigo-500/30">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-indigo-400 rounded-full animate-pulse"></div>
              <span className="text-sm md:text-xl font-bold text-indigo-400">
                Q{progress?.current}/{progress?.total}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-900/30 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-emerald-500/30">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 0v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm md:text-xl font-bold text-emerald-400">
                {points} Points
              </span>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl backdrop-blur-sm border shadow-md md:shadow-lg transition-all duration-300 ${
            timer <= 60 
              ? 'bg-red-900/40 border-red-500/50 text-red-400 animate-pulse' 
              : timer <= 180 
                ? 'bg-yellow-900/40 border-yellow-500/50 text-yellow-400' 
                : 'bg-gray-900/40 border-gray-600/50 text-gray-300'
          }`}>
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg md:text-2xl font-bold">
              {formatTimer(timer)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Main 3-column layout: Left = Problem, Center = Editor, Right = Result Tabs */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 w-full px-3 md:px-6 pb-3 md:pb-6 h-full overflow-hidden relative z-10">
        {/* Left: Problem Description */}
        <div className="flex flex-col w-full lg:w-[30%] min-w-[300px] max-w-full bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 overflow-y-auto max-h-full shadow-lg md:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 md:w-2 md:h-8 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full"></div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{problem?.title}</h1>
          </div>
          
          <div className="text-sm md:text-base lg:text-lg text-gray-300 whitespace-pre-wrap mb-6 leading-relaxed">
            {problem?.description}
          </div>
          
          {/* Examples */}
          {problem?.visibleTestCases && problem.visibleTestCases.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="font-bold text-white text-lg md:text-xl">Examples:</h2>
              </div>
              {problem.visibleTestCases.map((ex, i) => (
                <div key={i} className="mb-3 p-4 md:p-5 bg-gray-800/40 backdrop-blur-sm border border-gray-600/30 rounded-lg md:rounded-xl hover:border-indigo-500/30 transition-all duration-300">
                  <div className="mb-2">
                    <span className="font-semibold text-indigo-400 text-sm md:text-base">Input:</span> 
                    <span className="font-mono text-gray-300 text-xs md:text-sm ml-2 bg-gray-700/50 px-2 py-1 rounded">{ex.input}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-emerald-400 text-sm md:text-base">Output:</span> 
                    <span className="font-mono text-gray-300 text-xs md:text-sm ml-2 bg-gray-700/50 px-2 py-1 rounded">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-gray-400 text-xs md:text-sm mt-2 p-2 md:p-3 bg-gray-700/30 rounded-md md:rounded-lg border-l-4 border-indigo-500/50">
                      <span className="font-semibold text-indigo-400">Explanation:</span> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Constraints */}
          {problem?.constraints && (
            <div className="mt-4 p-3 md:p-4 bg-amber-900/20 backdrop-blur-sm border border-amber-500/30 rounded-lg md:rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-bold text-amber-400 text-sm md:text-base">Constraints:</span>
              </div>
              <div className="text-gray-300 text-sm md:text-base">{problem.constraints}</div>
            </div>
          )}
        </div>
        
        {/* Center: Editor, Language, Buttons */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-6 h-full">
          {/* Language Selector & Editor Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg md:shadow-xl">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="font-medium text-base md:text-lg text-gray-300">Language:</span>
              </div>
              <select
                className="flex-1 border border-gray-600/50 rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2 bg-gray-800/50 backdrop-blur-sm text-white text-base md:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                value={selectedLanguage}
                onChange={e => handleLanguageChange(e.target.value)}
              >
                {Object.keys(langMap).map(lang => (
                  <option key={lang} value={lang} className="bg-gray-800">{langMap[lang]}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 md:px-3 md:py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-300 text-xs md:text-sm"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'flex-1'} min-h-[300px] md:min-h-[400px] bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300`}>
            <Editor
              height="100%"
              language={selectedLanguage}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
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
                fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
                fontLigatures: true,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection',
              }}
            />
          </div>

          {/* Action Buttons - Fixed layout for all screen sizes */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              className="w-full sm:flex-1 flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-600/60 backdrop-blur-sm text-gray-300 hover:text-white px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl font-medium text-sm md:text-base transition-all duration-300 border border-gray-600/30 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              onClick={onSkip}
              disabled={loading || timeUp}
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3-3 3m-4-6l3 3-3 3" />
              </svg>
              Skip
            </button>
            
            <button
              className="w-full sm:flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl font-medium text-sm md:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/20"
              onClick={() => onRun && onRun(code, selectedLanguage)}
              disabled={loading || timeUp}
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {loading ? 'Running...' : 'Run'}
            </button>
            
            <button
              className="w-full sm:flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl font-medium text-sm md:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-emerald-500/20"
              onClick={() => onSubmit && onSubmit(code, selectedLanguage)}
              disabled={loading || timeUp}
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {timeUp && (
            <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-lg md:rounded-xl p-3 md:p-4 text-red-400 font-semibold text-sm md:text-base shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Time's up! You can no longer submit or run code for this question.</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Right: Result Tabs */}
        <div className="flex flex-col w-full lg:w-[28%] min-w-[280px] max-w-full bg-[#23272e] border border-[#333842] rounded-xl md:rounded-2xl overflow-y-auto max-h-full">
          <div className="flex gap-1 px-2 pt-1 md:px-3 md:pt-2 bg-[#181a1b] border-b border-[#333842]">
            {resultTabs.map(tab => (
              <div
                key={tab.id}
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-t-md md:rounded-t-lg cursor-pointer font-medium text-xs md:text-sm ${activeTab === tab.id ? 'bg-[#23272e] border-t-2 border-[#4f8cff] text-[#4f8cff]' : 'bg-[#333842] text-[#e0e6ed]'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="truncate max-w-[80px] md:max-w-[100px] inline-block align-middle">{tab.label}</span>
                <button
                  className="ml-1 text-red-400 hover:text-red-600 text-xs"
                  onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex-1 p-2 md:p-3 overflow-y-auto min-h-[80px]">
            {activeTabObj ? (
              <div className={activeTabObj.type === 'run' ? 'text-[#4f8cff]' : 'text-[#4ade80]'}>
                <strong>{activeTabObj.type === 'run' ? 'Run Result:' : 'Submit Result:'}</strong>
                {typeof activeTabObj.content === 'string' ? (
                  <div className="mt-1 text-xs md:text-sm">{activeTabObj.content}</div>
                ) : (
                  renderTestCaseResults(activeTabObj.content)
                )}
              </div>
            ) : (
              <div className="text-[#b0b6be] text-xs md:text-sm text-center py-4">No results yet. Click Run or Submit to see results here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContestSolve;