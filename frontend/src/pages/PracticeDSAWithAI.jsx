import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Bot, User, ChevronDown, Save, Download, FileText, Users, Clock, BookOpen, X, Code, Brain, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from "../utils/axiosClient";

const difficulties = ["Easy", "Medium", "Hard"];
const interviewerPersonas = [
  "Algorithm Expert",
  "Competitive Programmer",
  "Senior Software Engineer"
];

function PracticeDSAWithAI() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      parts: [{ 
        text: "Hello! I'll be your DSA interviewer today. We'll simulate a realistic coding interview experience focused on data structures and algorithms. Please select your difficulty level to begin." 
      }] 
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewerPersona, setInterviewerPersona] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [notes, setNotes] = useState("");
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const fetchModelResponse = async (userMessages) => {
    setLoading(true);
    setIsStreaming(true);
    setFeedback(""); // Clear previous feedback
    
    // Add empty message that will be updated with streaming content
    let messageIndex;
    setMessages(prev => {
      messageIndex = prev.length;
      return [...prev, { role: 'model', parts: [{ text: '' }] }];
    });
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/ai/practisedsa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: userMessages,
          difficulty: difficulty,
          persona: interviewerPersona
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              setLoading(false);
              setIsStreaming(false);
              return;
            }
            if (dataStr === '') continue;
            
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[messageIndex] = {
                role: 'model',
                parts: [{ text: dataStr }]
              };
              return newMessages;
            });
          } else if (line.startsWith('event: end')) {
            setLoading(false);
            setIsStreaming(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      
      // Fallback to regular API call
      try {
        const response = await axiosClient.post("/ai/practisedsa", {
          messages: userMessages,
          difficulty: difficulty,
          persona: interviewerPersona
        });
        const { message, feedback: fb } = response.data;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[messageIndex] = {
            role: 'model',
            parts: [{ text: message }]
          };
          return newMessages;
        });
        if (fb) setFeedback(fb);
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[messageIndex] = {
            role: 'model',
            parts: [{ text: "Sorry, I encountered an issue. Could you please repeat that?" }]
          };
          return newMessages;
        });
      }
    }
    setLoading(false);
    setIsStreaming(false);
  };

  const startInterview = async () => {
    if (!selectedDifficulty || !selectedPersona) return;
    
    setDifficulty(selectedDifficulty);
    setInterviewerPersona(selectedPersona);
    setInterviewStarted(true);
    setTimerActive(true);
    setTimerSeconds(0);
    
    const initialMessage = { 
      role: 'model', 
      parts: [{ 
        text: `Thanks for choosing ${selectedDifficulty} difficulty. I'll be interviewing you as a ${selectedPersona}. We'll begin with a DSA question. Take your time to think through each part.` 
      }] 
    };
    
    setMessages([initialMessage]);
    
    // Trigger the AI to ask the first question
    await fetchModelResponse([
      initialMessage,
      { 
        role: 'model', 
        parts: [{ 
          text: `Start the interview with a ${selectedDifficulty} level DSA question. Ask one question at a time and wait for responses.` 
        }] 
      }
    ]);
  };

  // Chat input handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    const newMessages = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(newMessages);
    setInput("");
    
    await fetchModelResponse(newMessages);
  };

  const handleRestart = () => {
    setMessages([
      { 
        role: 'model', 
        parts: [{ 
          text: "Hello! I'll be your DSA interviewer today. We'll simulate a realistic coding interview experience focused on data structures and algorithms. Please select your difficulty level to begin." 
        }] 
      },
    ]);
    setDifficulty("");
    setInterviewStarted(false);
    setFeedback("");
    setInterviewerPersona("");
    setSelectedDifficulty(null);
    setSelectedPersona(null);
    setTimerActive(false);
    setTimerSeconds(0);
    setNotes("");
  };

  const getDifficultyColor = (level) => {
    switch(level) {
      case 'Easy': return 'bg-emerald-500/10 border-emerald-500 text-emerald-300';
      case 'Medium': return 'bg-amber-500/10 border-amber-500 text-amber-300';
      case 'Hard': return 'bg-rose-500/10 border-rose-500 text-rose-300';
      default: return 'bg-blue-500/10 border-blue-500 text-blue-300';
    }
  };

  const getPersonaColor = (persona) => {
    switch(persona) {
      case 'Algorithm Expert': return 'bg-sky-500/10 border-sky-500 text-sky-300';
      case 'Competitive Programmer': return 'bg-purple-500/10 border-purple-500 text-purple-300';
      case 'Senior Software Engineer': return 'bg-amber-500/10 border-amber-500 text-amber-300';
      default: return 'bg-blue-500/10 border-blue-500 text-blue-300';
    }
  };

  const getPersonaIcon = (persona) => {
    switch(persona) {
      case 'Algorithm Expert': return <Brain className="w-5 h-5" />;
      case 'Competitive Programmer': return <Zap className="w-5 h-5" />;
      case 'Senior Software Engineer': return <Code className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
  };

  const downloadNotes = () => {
    const element = document.createElement("a");
    const file = new Blob([notes], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "dsa-interview-notes.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#0a0f1d] via-[#131b35] to-[#0a0f1d] text-white flex font-sans overflow-hidden">
      {/* Back Button */}
      <button
        className="fixed top-4 left-4 z-50 bg-[#0f172a]/95 backdrop-blur-xl rounded-lg shadow-2xl p-2.5 hover:bg-[#1a223b] transition-all flex items-center gap-2 border border-[#2a3655]/50 active:scale-95 focus:ring-2 focus:ring-[#2563eb]/30 hover:border-[#60a5fa]/50"
        onClick={() => navigate(-1)}
        aria-label="Go Back"
      >
        <ArrowLeft size={20} className="text-[#60a5fa]" />
      </button>

      {/* Difficulty Selection Modal */}
      {!interviewStarted && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1d]/95 backdrop-blur-sm px-4">
          <div className="bg-[#1a223b]/90 backdrop-blur-xl shadow-2xl transition-all duration-200 px-6 py-8 flex flex-col items-center border border-[#2a3655] max-w-2xl w-full mx-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-8 h-8 text-[#60a5fa]" />
              <h2 className="text-3xl font-bold text-white tracking-tight">
                DSA Interview Practice
              </h2>
            </div>
            
            <div className="mb-8 w-full">
              <div className="bg-[#141d33]/80 rounded-xl p-5 text-white text-base text-left font-medium shadow-lg border border-[#2a3655]">
                <h3 className="font-bold text-[#60a5fa] mb-3 text-lg">Interview Format:</h3>
                <ul className="list-disc pl-6 space-y-2 text-[#93c5fd]">
                  <li>Algorithm design and analysis</li>
                  <li>Data structure selection</li>
                  <li>Time and space complexity analysis</li>
                  <li>Problem-solving strategies</li>
                  <li>Coding implementation</li>
                </ul>
              </div>
            </div>
            
            <div className="w-full mb-8">
              <h3 className="text-xl font-semibold text-[#93c5fd] mb-4 flex items-center gap-2">
                <span className="bg-[#1e293b] p-1 rounded-lg">
                  <ChevronDown size={20} className="text-blue-400" />
                </span>
                Select Difficulty:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {difficulties.map((level) => (
                  <button
                    key={level}
                    className={`${getDifficultyColor(level)} px-6 py-4 rounded-xl font-semibold transition-all duration-200 group hover:bg-opacity-20 cursor-pointer border flex flex-col items-center
                      ${selectedDifficulty === level ? 'ring-4 ring-offset-2 ring-offset-[#0f172a] ring-[#60a5fa] scale-[1.02]' : ''}`}
                    onClick={() => setSelectedDifficulty(level)}
                  >
                    <span className="text-xl mb-1">{level}</span>
                    <div className="w-12 h-1 rounded-full mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      {level === 'Easy' && <div className="w-full h-full bg-emerald-500 rounded-full"></div>}
                      {level === 'Medium' && <div className="w-full h-full bg-amber-500 rounded-full"></div>}
                      {level === 'Hard' && <div className="w-full h-full bg-rose-500 rounded-full"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-full mb-8">
              <h3 className="text-xl font-semibold text-[#93c5fd] mb-4 flex items-center gap-2">
                <span className="bg-[#1e293b] p-1 rounded-lg">
                  <Users size={20} className="text-purple-400" />
                </span>
                Interviewer Persona:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {interviewerPersonas.map((persona) => (
                  <button
                    key={persona}
                    className={`${getPersonaColor(persona)} px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:bg-opacity-20 border flex flex-col items-center
                      ${selectedPersona === persona ? 'ring-4 ring-offset-2 ring-offset-[#0f172a] ring-[#60a5fa] scale-[1.02]' : ''}`}
                    onClick={() => setSelectedPersona(persona)}
                  >
                    <div className="flex items-center gap-2">
                      {getPersonaIcon(persona)}
                      <span className="text-lg">{persona}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-300 mt-4
                ${selectedDifficulty && selectedPersona 
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#3b82f6] hover:to-[#2563eb] shadow-lg shadow-[#2563eb]/30 hover:shadow-[#2563eb]/50 cursor-pointer'
                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}`}
              onClick={startInterview}
              disabled={!selectedDifficulty || !selectedPersona}
            >
              Start Interview
            </button>
            
            <p className="text-sm text-[#94a3b8] text-center px-4 py-3 bg-[#141d33]/50 rounded-lg border border-[#2a3655] mt-6">
              💡 Tip: Treat this like a real interview - explain your thought process and optimize solutions
            </p>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      {interviewStarted && (
        <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0f172a]/90 backdrop-blur-2xl relative animate-fade-in w-full border border-[#2a3655]">
          <div className="flex h-full min-h-0">
            {/* Chat Panel */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-[#131b35] to-[#0f172a] border-b border-[#2a3655] rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1a223b] p-2 rounded-xl">
                    <Code className="w-6 h-6 text-[#60a5fa]" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    DSA Interview Practice
                  </h1>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-medium border ${getDifficultyColor(difficulty)}`}>
                      {difficulty}
                    </span>
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-medium border ${getPersonaColor(interviewerPersona)}`}>
                      {interviewerPersona}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  {/* Timer */}
                  <div className="flex items-center gap-2 bg-[#1a223b] px-3 py-1.5 rounded-lg border border-[#2a3655]">
                    <Clock size={18} className="text-[#60a5fa]" />
                    <span className="text-white font-medium">{formatTime(timerSeconds)}</span>
                    <div className="flex gap-1 ml-1">
                      <button 
                        onClick={toggleTimer}
                        className="text-xs px-2 py-1 rounded bg-[#2563eb]/20 hover:bg-[#2563eb]/30 transition-colors"
                      >
                        {timerActive ? 'Pause' : 'Start'}
                      </button>
                      <button 
                        onClick={resetTimer}
                        className="text-xs px-2 py-1 rounded bg-[#1a223b] hover:bg-[#2563eb]/20 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowNotes(!showNotes)}
                    className="bg-[#1a223b] hover:bg-[#2563eb]/20 text-sky-300 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] border border-[#2a3655] flex items-center gap-2"
                  >
                    <BookOpen size={18} />
                    <span>Notes</span>
                  </button>
                  
                  <button 
                    onClick={handleRestart} 
                    className="bg-[#1a223b] hover:bg-red-900/30 text-red-300 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] border border-red-500/50 flex items-center gap-2"
                  >
                    <span>Restart</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 pb-2 gap-6 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in mb-6`}>
                    {msg.role === 'model' && (
                      <div className="flex items-start gap-4 animate-fade-in w-full max-w-4xl">
                        <div className="flex flex-col items-center pt-1">
                          <div className="bg-gradient-to-br from-[#1a223b] to-[#131b35] p-3 rounded-full shadow-lg backdrop-blur-sm border border-[#2a3655]">
                            <Bot size={24} className="text-[#60a5fa]" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-[#60a5fa] font-medium mb-1 pl-2">Interviewer</div>
                          <div className="rounded-2xl px-5 py-4 shadow-xl bg-gradient-to-br from-[#1a223b] to-[#131b35] border border-[#2a3655] text-white text-base font-normal animate-fade-in break-words overflow-wrap-anywhere">
                            {formatAIResponse(msg.parts[0].text)}
                          </div>
                        </div>
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="flex items-start gap-4 flex-row-reverse animate-fade-in w-full max-w-4xl">
                        <div className="flex flex-col items-center pt-1">
                          <div className="bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] p-3 rounded-full shadow-lg backdrop-blur-sm">
                            <User size={24} className="text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-[#60a5fa] font-medium mb-1 pr-2 text-right">You</div>
                          <div className="rounded-2xl px-5 py-4 shadow-xl bg-gradient-to-br from-[#2563eb]/90 to-[#1d4ed8]/90 text-white text-base font-normal animate-fade-in break-words overflow-wrap-anywhere text-right">
                            {msg.parts[0].text}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-3 mt-2 animate-fade-in px-4 py-3 bg-[#1a223b]/50 rounded-xl border border-[#2a3655] max-w-max">
                    <Bot size={20} className="text-[#60a5fa] animate-bounce" />
                    <span className="text-[#93c5fd] italic flex items-center gap-1 text-base">
                      Interviewer is thinking
                      <span className="inline-block w-2 h-2 rounded-full bg-[#60a5fa] animate-bounce [animation-delay:0s]"></span>
                      <span className="inline-block w-2 h-2 rounded-full bg-[#60a5fa] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="inline-block w-2 h-2 rounded-full bg-[#60a5fa] animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Feedback */}
              {feedback && feedback !== '' && (
                <div className="mx-4 md:mx-8 mb-4 p-4 bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-l-4 border-amber-500 rounded-xl shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <strong className="text-amber-300">Interviewer's Notes:</strong>
                  </div>
                  <p className="text-white mt-2 pl-4">{feedback}</p>
                </div>
              )}
              
              {/* Input Bar */}
              <div className="w-full bg-gradient-to-r from-[#131b35] to-[#0f172a] border-t border-[#2a3655] flex items-center gap-3 px-4 md:px-8 py-4 z-40 backdrop-blur-xl rounded-b-2xl animate-fade-in">
                <form onSubmit={handleSend} className="flex w-full gap-3">
                  <input
                    placeholder="Explain your approach, write pseudocode, or request a hint..."
                    className="input flex-1 text-base rounded-xl focus:ring-2 focus:ring-[#2563eb]/50 px-5 py-3.5 bg-[#1a223b]/70 border border-[#2a3655] text-white shadow-inner transition-colors duration-200 placeholder:text-[#94a3b8]"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white hover:from-[#3b82f6] hover:to-[#2563eb] active:scale-95 transition-all shadow-lg hover:shadow-[#2563eb]/40 disabled:opacity-50"
                    disabled={loading || !input.trim()}
                  >
                    <Send size={24} />
                  </button>
                </form>
              </div>
            </div>
            
            {/* Notes Sidebar */}
            {showNotes && (
              <div className="w-[400px] flex flex-col border-l border-[#2a3655] bg-[#0f172a]/90 backdrop-blur-xl">
                <div className="flex justify-between items-center px-5 py-4 border-b border-[#2a3655]">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-[#60a5fa]" />
                    <h3 className="text-lg font-semibold text-white">Interview Notes</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={downloadNotes}
                      className="p-2 rounded-lg hover:bg-[#1a223b] transition-colors"
                      title="Download Notes"
                    >
                      <Download size={18} className="text-[#93c5fd]" />
                    </button>
                    <button 
                      onClick={() => setShowNotes(false)}
                      className="p-2 rounded-lg hover:bg-[#1a223b] transition-colors"
                      title="Close Notes"
                    >
                      <X size={18} className="text-[#93c5fd]" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <textarea
                    className="w-full h-full bg-transparent p-5 text-white resize-none outline-none custom-scrollbar"
                    placeholder="Type your notes here during the interview..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
                <div className="p-4 border-t border-[#2a3655] text-sm text-[#94a3b8]">
                  Notes are automatically saved in your browser
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a3655;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334267;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function formatAIResponse(text) {
  if (!text) return '';
  
  // Check for realistic interview dialogue patterns
  const isInterviewDialogue = text.includes("?") || 
                             text.includes(":") || 
                             text.startsWith("Okay") || 
                             text.startsWith("Great") || 
                             text.startsWith("So");

  if (isInterviewDialogue) {
    return (
      <div className="text-white whitespace-pre-wrap break-words overflow-wrap-anywhere">
        {text.split('\n').map((paragraph, idx) => (
          <p key={idx} className="mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }
  
  // Handle structured responses
  const lines = text.split('\n');
  const isList = lines.filter(l => l.match(/^\s*(\d+\.|[-*])\s+/)).length > 1;
  
  if (isList) {
    return (
      <ul className="list-disc pl-6 space-y-2">
        {lines.map((line, i) => {
          if (line.match(/^\s*(\d+\.|[-*])\s+/)) {
            return <li key={i} className="text-white">{line.replace(/^\s*(\d+\.|[-*])\s+/, "")}</li>;
          }
          return line.trim() ? <p key={i} className="text-white">{line}</p> : null;
        })}
      </ul>
    );
  }
  
  // Handle code blocks
  if (text.includes("```")) {
    const parts = text.split("```");
    return (
      <div className="space-y-4">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return (
              <pre key={index} className="bg-[#141d33] p-4 rounded-lg overflow-x-auto text-sm text-[#93c5fd] border border-[#2a3655]">
                <code>{part}</code>
              </pre>
            );
          }
          return part.trim() ? <p key={index} className="text-white whitespace-pre-wrap">{part}</p> : null;
        })}
      </div>
    );
  }
  
  return < div className="text-white whitespace-pre-wrap break-words overflow-wrap-anywhere">{text}</div>;
}

export default PracticeDSAWithAI;