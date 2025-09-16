import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const StackVisualizer = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stack, setStack] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentOperation, setCurrentOperation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [speed, setSpeed] = useState(500);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [operationResult, setOperationResult] = useState("");

  const timeoutRef = useRef(null);

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
    setExplanation("Stack follows LIFO (Last In, First Out) principle. Elements are added and removed from the top.");
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const sleep = (ms) => {
    return new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  };

  const push = async (value = null) => {
    const valueToUse = value || inputValue.trim();
    if (!valueToUse || isAnimating) return;
    
    setIsAnimating(true);
    setCurrentOperation("push");
    setExplanation(`Pushing "${valueToUse}" onto the stack...`);
    
    await sleep(speed / 2);
    
    const newStack = [...stack, valueToUse];
    setStack(newStack);
    setHighlightedIndex(newStack.length - 1);
    setOperationResult(`Pushed "${valueToUse}" successfully!`);
    setExplanation(`Element "${valueToUse}" has been pushed to the top of the stack. Stack size: ${newStack.length}`);
    
    await sleep(speed);
    
    setHighlightedIndex(-1);
    if (!value) setInputValue(""); // Only clear input if it wasn't a random value
    setCurrentOperation("");
    setIsAnimating(false);
    setOperationResult("");
  };

  const pushRandom = () => {
    if (isAnimating) return;
    const randomValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const numbers = Array.from({length: 100}, (_, i) => i + 1);
    const allValues = [...randomValues, ...numbers];
    const randomValue = allValues[Math.floor(Math.random() * allValues.length)];
    push(randomValue.toString());
  };

  const pop = async () => {
    if (stack.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    setCurrentOperation("pop");
    const topElement = stack[stack.length - 1];
    setHighlightedIndex(stack.length - 1);
    setExplanation(`Popping "${topElement}" from the top of the stack...`);
    
    await sleep(speed);
    
    const newStack = stack.slice(0, -1);
    setStack(newStack);
    setOperationResult(`Popped "${topElement}" successfully!`);
    setExplanation(`Element "${topElement}" has been removed from the top. Stack size: ${newStack.length}`);
    
    await sleep(speed / 2);
    
    setHighlightedIndex(-1);
    setCurrentOperation("");
    setIsAnimating(false);
    setOperationResult("");
  };

  const peek = async () => {
    if (stack.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    setCurrentOperation("peek");
    const topElement = stack[stack.length - 1];
    setHighlightedIndex(stack.length - 1);
    setOperationResult(`Top element: "${topElement}"`);
    setExplanation(`Peeking at the top element: "${topElement}". The element remains in the stack.`);
    
    await sleep(speed);
    
    setHighlightedIndex(-1);
    setCurrentOperation("");
    setIsAnimating(false);
    setOperationResult("");
  };

  const clear = () => {
    if (isAnimating) return;
    setStack([]);
    setExplanation("Stack cleared. All elements have been removed.");
    setOperationResult("");
  };

  const handleBackToVisualize = () => navigate("/visualize");

  const getElementColor = (index) => {
    if (highlightedIndex === index) {
      if (currentOperation === "push") return "bg-green-400 border-green-600 animate-pulse";
      if (currentOperation === "pop") return "bg-red-400 border-red-600 animate-pulse";
      if (currentOperation === "peek") return "bg-yellow-400 border-yellow-600 animate-pulse";
    }
    
    // Top element gets special styling
    if (index === stack.length - 1) {
      return "bg-indigo-400 border-indigo-600";
    }
    
    return "bg-gray-400 border-gray-600";
  };

  return (
    <div
      className="min-h-screen font-sans text-gray-200"
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
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">
        {/* Back Button */}
        <button
          onClick={handleBackToVisualize}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900/50 hover:bg-indigo-500/20 border border-gray-800 hover:border-indigo-400 text-gray-300 hover:text-indigo-300 font-semibold shadow transition-all duration-300 group mb-8"
        >
          <svg
            className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Visualizer</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Stack Data Structure Visualizer
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Explore stack operations: Push, Pop, and Peek with LIFO (Last In, First Out) principle
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Input for Push */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element to Push</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isAnimating}
                placeholder="Enter value"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && push()}
              />
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Animation Speed</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isAnimating}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={1000}>Slow (1s)</option>
                <option value={500}>Medium (0.5s)</option>
                <option value={250}>Fast (0.25s)</option>
                <option value={100}>Very Fast (0.1s)</option>
              </select>
            </div>

            {/* Stack Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stack Information</label>
              <div className="text-sm text-gray-400">
                <div>Size: {stack.length}</div>
                <div>Top: {stack.length > 0 ? stack[stack.length - 1] : "Empty"}</div>
              </div>
            </div>
          </div>

          {/* Operation Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => push()}
              disabled={isAnimating || !inputValue.trim()}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Push
            </button>
            <button
              onClick={pushRandom}
              disabled={isAnimating}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Push Random
            </button>
            <button
              onClick={pop}
              disabled={isAnimating || stack.length === 0}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Pop
            </button>
            <button
              onClick={peek}
              disabled={isAnimating || stack.length === 0}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Peek
            </button>
            <button
              onClick={clear}
              disabled={isAnimating}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Clear Stack
            </button>
          </div>

          {/* Operation Result */}
          {operationResult && (
            <div className="mt-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg">
              <p className="text-blue-300 font-medium">{operationResult}</p>
            </div>
          )}
        </div>

        {/* Stack Visualization */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Stack Visualization</h3>
          
          <div className="flex justify-center">
            <div className="relative">
              {/* Stack Base */}
              <div className="w-48 h-8 bg-gray-700 border-2 border-gray-600 rounded-b-lg flex items-center justify-center">
                <span className="text-gray-300 text-sm font-medium">Stack Base</span>
              </div>
              
              {/* Stack Elements */}
              <div className="flex flex-col-reverse">
                {stack.map((element, index) => (
                  <div
                    key={index}
                    className={`w-48 h-16 border-2 flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${getElementColor(index)}`}
                    style={{
                      marginBottom: index === 0 ? '0' : '2px'
                    }}
                  >
                    <span>{element}</span>
                    {index === stack.length - 1 && (
                      <div className="absolute -right-16 flex items-center">
                        <svg className="w-6 h-6 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-indigo-400 text-sm font-medium">TOP</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Empty Stack Message */}
              {stack.length === 0 && (
                <div className="w-48 h-32 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500">
                  <span className="text-center">
                    Stack is Empty<br />
                    <span className="text-sm">Push elements to see them here</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-400 border border-indigo-600 rounded"></div>
              <span className="text-gray-300">Top Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 border border-gray-600 rounded"></div>
              <span className="text-gray-300">Stack Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 border border-green-600 rounded"></div>
              <span className="text-gray-300">Push Operation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 border border-red-600 rounded"></div>
              <span className="text-gray-300">Pop Operation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border border-yellow-600 rounded"></div>
              <span className="text-gray-300">Peek Operation</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Operation Explanation</h3>
            <p className="text-gray-300 text-lg leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Stack Operations Info */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">Stack Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
              <h4 className="text-green-400 font-bold mb-2">Push Operation</h4>
              <p className="text-gray-300 text-sm">
                Adds an element to the top of the stack. Time complexity: O(1)
              </p>
            </div>
            <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
              <h4 className="text-red-400 font-bold mb-2">Pop Operation</h4>
              <p className="text-gray-300 text-sm">
                Removes and returns the top element from the stack. Time complexity: O(1)
              </p>
            </div>
            <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
              <h4 className="text-yellow-400 font-bold mb-2">Peek Operation</h4>
              <p className="text-gray-300 text-sm">
                Returns the top element without removing it. Time complexity: O(1)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackVisualizer;