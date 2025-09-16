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

  // Panel resizing and fullscreen states
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  const [isLeftFullscreen, setIsLeftFullscreen] = useState(false);
  const [isRightFullscreen, setIsRightFullscreen] = useState(false);
  const containerRef = useRef(null);
  const leftContentRef = useRef(null);

  const { handleSubmit } = useForm();
  const { user } = useSelector((state) => state.auth);

  // Theme for Monaco Editor
  const [editorTheme, setEditorTheme] = useThemeState('vs-dark');

  // Basic functions
  const toggleLeftFullscreen = () => {
    setIsLeftFullscreen(!isLeftFullscreen);
    setIsRightFullscreen(false);
  };

  const toggleRightFullscreen = () => {
    setIsRightFullscreen(!isRightFullscreen);
    setIsLeftFullscreen(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
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
    <div className="h-screen flex flex-col bg-base-100">
      <Navbar user={user} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel */}
        <div className="flex flex-col border-r border-base-300 w-2/5">
          {/* Left Tabs */}
          <div className="flex justify-between items-center border-b border-base-300 bg-base-100 px-4 py-2">
            <div className="flex">
              <button 
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                  activeLeftTab === 'description' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300'
                }`}
                onClick={() => setActiveLeftTab('description')}
              >
                📝 Description
              </button>
            </div>
            
            {/* Fullscreen Toggle Button */}
            <div className="flex gap-2">
              <button
                onClick={toggleLeftFullscreen}
                className="p-1.5 rounded hover:bg-base-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h6m0 0V1m0 6l-6-6M21 17h-6m0 0v6m0-6l6 6M7 3h10M7 21h10" />
                </svg>
              </button>
            </div>
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto bg-base-100 flex flex-col">
            {problem && (
              <>
                <div className="flex-1 p-6 pb-20">
                  {/* Problem Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-2xl font-bold text-base-content">{problem.title}</h1>
                    </div>
                  </div>

                  {activeLeftTab === 'description' && (
                    <div className="space-y-6">
                      {/* Problem Description */}
                      <div className="prose prose-base-content max-w-none">
                        <div className="text-base leading-relaxed text-base-content whitespace-pre-wrap">
                          {problem.description}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 px-6 py-3 z-40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content transition-colors">
                        👍 17.4K
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col w-3/5">
          <div className="p-4">
            <h2>Code Editor</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;