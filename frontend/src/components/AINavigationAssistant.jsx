import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { Bot, Send, X, MessageCircle, ArrowRight, Move } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const AINavigationAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your navigation assistant. I can help you navigate to any page on the platform. Just tell me where you want to go!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Drag functionality states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage or use default
    const saved = localStorage.getItem("ai-assistant-position");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved position:", e);
      }
    }
    return { x: window.innerWidth - 80, y: window.innerHeight - 80 };
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ai-assistant-position", JSON.stringify(position));
  }, [position]);

  // Handle window resize to keep button in bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 56),
        y: Math.min(prev.y, window.innerHeight - 56),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Unified drag functionality for both mouse and touch
  const getEventCoordinates = (e) => {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = (e) => {
    // Handle both mouse and touch events
    if (e.type === "mousedown" && e.button !== 0) return; // Only left click for mouse

    e.preventDefault(); // Prevent default touch behaviors

    const rect = buttonRef.current.getBoundingClientRect();
    const coords = getEventCoordinates(e);
    const startPos = {
      x: coords.x,
      y: coords.y,
    };

    setDragStartPos(startPos);
    setDragOffset({
      x: coords.x - rect.left,
      y: coords.y - rect.top,
    });
    setHasMoved(false);
  };

  const handlePointerMove = (e) => {
    if (!dragStartPos.x && !dragStartPos.y) return;

    const coords = getEventCoordinates(e);
    const deltaX = Math.abs(coords.x - dragStartPos.x);
    const deltaY = Math.abs(coords.y - dragStartPos.y);
    const dragThreshold = 5; // pixels

    // Only start dragging if pointer moved beyond threshold
    if ((deltaX > dragThreshold || deltaY > dragThreshold) && !isDragging) {
      setIsDragging(true);
      setHasMoved(true);
    }

    if (isDragging) {
      e.preventDefault(); // Prevent scrolling while dragging

      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;

      // Keep button within viewport bounds
      const maxX = window.innerWidth - 56; // 56px is button width
      const maxY = window.innerHeight - 56; // 56px is button height

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handlePointerUp = (e) => {
    // Reset drag states
    setIsDragging(false);
    setDragStartPos({ x: 0, y: 0 });

    // If we haven't moved significantly, treat it as a click
    if (!hasMoved) {
      setIsOpen(!isOpen);
    }

    setHasMoved(false);
  };

  // Add global pointer event listeners for both mouse and touch
  useEffect(() => {
    const handleGlobalPointerMove = (e) => handlePointerMove(e);
    const handleGlobalPointerUp = (e) => handlePointerUp(e);

    if (dragStartPos.x || dragStartPos.y) {
      // Add both mouse and touch event listeners
      document.addEventListener("mousemove", handleGlobalPointerMove);
      document.addEventListener("mouseup", handleGlobalPointerUp);
      document.addEventListener("touchmove", handleGlobalPointerMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleGlobalPointerUp);

      if (isDragging) {
        document.body.style.userSelect = "none"; // Prevent text selection while dragging
        document.body.style.cursor = "grabbing";
        document.body.style.touchAction = "none"; // Prevent scrolling on mobile
      }

      return () => {
        document.removeEventListener("mousemove", handleGlobalPointerMove);
        document.removeEventListener("mouseup", handleGlobalPointerUp);
        document.removeEventListener("touchmove", handleGlobalPointerMove);
        document.removeEventListener("touchend", handleGlobalPointerUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        document.body.style.touchAction = "";
      };
    }
  }, [dragStartPos, isDragging, dragOffset, hasMoved]);

  const fetchAIResponse = async (userMessage) => {
    setLoading(true);
    setIsStreaming(true);

    // Add empty message that will be updated with streaming content
    let messageIndex;
    setMessages((prev) => {
      messageIndex = prev.length;
      return [...prev, { role: "assistant", content: "" }];
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/navigation-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        credentials: "include",
        body: JSON.stringify({
          message: userMessage,
          currentPage: location.pathname,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") {
              setLoading(false);
              setIsStreaming(false);
              return;
            }
            if (dataStr === "") continue;

            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[messageIndex] = {
                role: "assistant",
                content: dataStr,
              };
              return newMessages;
            });
          } else if (line.startsWith("event: end")) {
            setLoading(false);
            setIsStreaming(false);

            // Parse the final response for navigation
            setMessages((prev) => {
              const finalMessage = prev[messageIndex];
              if (finalMessage && finalMessage.content) {
                let content = finalMessage.content;

                // Check if the content contains NAVIGATE format
                if (content.includes("NAVIGATE:")) {
                  try {
                    // Extract navigation info from NAVIGATE:/route:message format
                    const parts = content.split(":");
                    if (parts.length >= 3 && parts[0] === "NAVIGATE") {
                      const route = parts[1];
                      const message = parts.slice(2).join(":");

                      // Update the message to show only the user-friendly message
                      const newMessages = [...prev];
                      newMessages[messageIndex] = {
                        role: "assistant",
                        content: message || "Navigating...",
                      };

                      setTimeout(() => {
                        navigate(route);
                        setIsOpen(false);
                      }, 1000);

                      return newMessages;
                    }
                  } catch (e) {
                    console.log("Navigation parsing error:", e);
                  }
                }
              }
              return prev;
            });

            return;
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);

      // Fallback to regular API call
      try {
        const response = await axiosClient.post("/navigation-ai", {
          message: userMessage,
          currentPage: location.pathname,
        });

        const result = response.data;

        // Handle the response
        let displayMessage =
          result.message ||
          result ||
          "I can help you navigate to different pages. Where would you like to go?";
        let navigationAction = null;

        // Check if result is already parsed
        if (result.action === "navigate" && result.route) {
          navigationAction = result;
          displayMessage = result.message;
        } else if (
          typeof displayMessage === "string" &&
          displayMessage.includes("NAVIGATE:")
        ) {
          // Parse NAVIGATE format
          const parts = displayMessage.split(":");
          if (parts.length >= 3 && parts[0] === "NAVIGATE") {
            const route = parts[1];
            const message = parts.slice(2).join(":");
            navigationAction = { action: "navigate", route, message };
            displayMessage = message;
          }
        }

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[messageIndex] = {
            role: "assistant",
            content: displayMessage,
          };
          return newMessages;
        });

        // Handle navigation
        if (navigationAction) {
          setTimeout(() => {
            navigate(navigationAction.route);
            setIsOpen(false);
          }, 1000);
        }
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);

        // Simple client-side navigation as last resort
        const lowerMessage = userMessage.toLowerCase();
        let route = null;
        let pageName = "";

        // Specific visualizer navigation (check these first for more specific matches)
        if (
          lowerMessage.includes("sorting") &&
          (lowerMessage.includes("visualiz") ||
            lowerMessage.includes("algorithm"))
        ) {
          route = "/sorting-visualizer";
          pageName = "Sorting Visualizer";
        } else if (
          lowerMessage.includes("search") &&
          (lowerMessage.includes("visualiz") ||
            lowerMessage.includes("algorithm"))
        ) {
          route = "/searching-visualizer";
          pageName = "Searching Visualizer";
        } else if (
          lowerMessage.includes("n-queen") ||
          lowerMessage.includes("nqueen") ||
          (lowerMessage.includes("queen") && lowerMessage.includes("visualiz"))
        ) {
          route = "/nqueens-visualizer";
          pageName = "N-Queens Visualizer";
        } else if (lowerMessage.includes("sudoku")) {
          route = "/sudoku-visualizer";
          pageName = "Sudoku Solver";
        } else if (
          lowerMessage.includes("stack") &&
          (lowerMessage.includes("visualiz") ||
            lowerMessage.includes("data structure"))
        ) {
          route = "/stack-visualizer";
          pageName = "Stack Visualizer";
        } else if (
          lowerMessage.includes("queue") &&
          (lowerMessage.includes("visualiz") ||
            lowerMessage.includes("data structure"))
        ) {
          route = "/queue-visualizer";
          pageName = "Queue Visualizer";
        } else if (
          lowerMessage.includes("graph") &&
          (lowerMessage.includes("visualiz") ||
            lowerMessage.includes("traversal") ||
            lowerMessage.includes("bfs") ||
            lowerMessage.includes("dfs"))
        ) {
          route = "/graph-visualizer";
          pageName = "Graph Visualizer";
        } else if (
          lowerMessage.includes("tree") &&
          (lowerMessage.includes("visualiz") ||
            lowerMessage.includes("traversal") ||
            lowerMessage.includes("binary"))
        ) {
          route = "/tree-visualizer";
          pageName = "Tree Visualizer";
        }
        // General visualizer navigation (only if no specific visualizer matched)
        else if (lowerMessage.includes("visualiz") && !route) {
          route = "/visualize";
          pageName = "Algorithm Visualizer Hub";
        }
        // Main navigation
        else if (lowerMessage.includes("home")) {
          route = "/home";
          pageName = "Home";
        } else if (lowerMessage.includes("problem")) {
          route = "/problems";
          pageName = "Problems";
        } else if (lowerMessage.includes("practice")) {
          route = "/practice";
          pageName = "Practice";
        } else if (lowerMessage.includes("contest")) {
          route = "/contest";
          pageName = "Contest";
        } else if (lowerMessage.includes("leaderboard")) {
          route = "/leaderboard";
          pageName = "Leaderboard";
        } else if (lowerMessage.includes("profile")) {
          route = "/profile";
          pageName = "Profile";
        } else if (lowerMessage.includes("community")) {
          route = "/community";
          pageName = "Community";
        } else if (lowerMessage.includes("data structure")) {
          route = "/data-structures";
          pageName = "Data Structures";
        } else if (
          lowerMessage.includes("algorithm") &&
          !lowerMessage.includes("visualiz")
        ) {
          route = "/algorithms";
          pageName = "Algorithms";
        }

        if (route) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[messageIndex] = {
              role: "assistant",
              content: `Taking you to ${pageName}!`,
            };
            return newMessages;
          });

          setTimeout(() => {
            navigate(route);
            setIsOpen(false);
          }, 1000);
        } else {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[messageIndex] = {
              role: "assistant",
              content:
                "I can help you navigate to:\n\n📚 Main Pages: Home, Problems, Practice, Contest, Leaderboard, Profile, Community\n\n🎯 Learning: Data Structures, Algorithms\n\n🎨 Visualizers:\n• Algorithm Visualizer Hub\n• Sorting Visualizer\n• Searching Visualizer\n• N-Queens Visualizer\n• Sudoku Solver\n• Stack Visualizer\n• Queue Visualizer\n• Graph Visualizer\n• Tree Visualizer\n\nJust say something like 'Go to sorting visualizer' or 'Show me graph algorithms'!",
            };
            return newMessages;
          });
        }
      }
    }
    setLoading(false);
    setIsStreaming(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    await fetchAIResponse(userMessage);
  };

  const handleQuickAction = async (action) => {
    setMessages((prev) => [...prev, { role: "user", content: action }]);
    await fetchAIResponse(action);
  };

  const quickActions = [
    "Go to sorting visualizer",
    "Show me searching visualizer",
    "Take me to problems",
    "Open stack visualizer",
    "Show me tree visualizer",
    "Go to profile",
  ];

  // Don't show on login/signup pages or if not authenticated
  if (
    !isAuthenticated ||
    location.pathname === "/login" ||
    location.pathname === "/signup"
  ) {
    return null;
  }

  return (
    <>
      {/* AI Assistant Button - Now Draggable */}
      <div
        className="fixed z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging ? "none" : "all 0.3s ease",
        }}
      >
        <button
          ref={buttonRef}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          className={`group relative w-14 h-14 rounded-full shadow-2xl transition-all duration-300 touch-none ${
            isDragging
              ? "scale-110 cursor-grabbing"
              : "hover:scale-110 active:scale-95 cursor-pointer hover:cursor-grab"
          } ${
            isOpen
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>

          {/* Main Icon */}
          {isOpen ? (
            <X className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}

          {/* Drag Indicator */}
          {!isOpen && (
            <Move className="w-3 h-3 text-white/60 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          )}

          {/* Tooltip */}
          <div
            className={`absolute mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none ${
              position.x > window.innerWidth / 2
                ? "right-0 bottom-full"
                : "left-0 bottom-full"
            }`}
          >
            {isDragging
              ? "Dragging..."
              : isOpen
              ? "Close Assistant"
              : "Tap to open • Drag to move"}
          </div>

          {/* Drag Visual Feedback */}
          {isDragging && (
            <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping"></div>
          )}
        </button>
      </div>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div
          className="fixed w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col animate-slide-up"
          style={{
            left:
              position.x > window.innerWidth / 2
                ? `${position.x - 384}px`
                : `${position.x}px`, // 384px = w-96
            top:
              position.y > window.innerHeight / 2
                ? `${position.y - 500}px`
                : `${position.y + 60}px`, // 500px = panel height, 60px = button height + margin
            maxWidth: "90vw",
            maxHeight: "80vh",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Navigation Assistant</h3>
                <p className="text-xs opacity-90">
                  Ask me to navigate anywhere!
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  {message.role === "assistant" &&
                    message.content.includes("Taking you to") && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Navigating...
                        </span>
                      </div>
                    )}
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-500 animate-bounce" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions - Always show for easy navigation */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Quick navigation:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="text-xs p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-left text-gray-900 dark:text-white"
                  disabled={loading}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AINavigationAssistant;
