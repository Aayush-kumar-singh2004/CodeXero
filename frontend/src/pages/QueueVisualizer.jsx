import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const QueueVisualizer = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [queue, setQueue] = useState([]);
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
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    setExplanation(
      "Queue follows FIFO (First In, First Out) principle. Elements are added at the rear and removed from the front."
    );
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const sleep = (ms) => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  };

  const enqueue = async (value = null) => {
    const valueToUse = value || inputValue.trim();
    if (!valueToUse || isAnimating) return;

    setIsAnimating(true);
    setCurrentOperation("enqueue");
    setExplanation(`Enqueuing "${valueToUse}" to the rear of the queue...`);

    await sleep(speed / 2);

    const newQueue = [...queue, valueToUse];
    setQueue(newQueue);
    setHighlightedIndex(newQueue.length - 1);
    setOperationResult(`Enqueued "${valueToUse}" successfully!`);
    setExplanation(
      `Element "${valueToUse}" has been added to the rear of the queue. Queue size: ${newQueue.length}`
    );

    await sleep(speed);

    setHighlightedIndex(-1);
    if (!value) setInputValue(""); // Only clear input if it wasn't a random value
    setCurrentOperation("");
    setIsAnimating(false);
    setOperationResult("");
  };

  const enqueueRandom = () => {
    if (isAnimating) return;
    const randomValues = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];
    const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
    const allValues = [...randomValues, ...numbers];
    const randomValue = allValues[Math.floor(Math.random() * allValues.length)];
    enqueue(randomValue.toString());
  };

  const dequeue = async () => {
    if (queue.length === 0 || isAnimating) return;

    setIsAnimating(true);
    setCurrentOperation("dequeue");
    const frontElement = queue[0];
    setHighlightedIndex(0);
    setExplanation(
      `Dequeuing "${frontElement}" from the front of the queue...`
    );

    await sleep(speed);

    const newQueue = queue.slice(1);
    setQueue(newQueue);
    setOperationResult(`Dequeued "${frontElement}" successfully!`);
    setExplanation(
      `Element "${frontElement}" has been removed from the front. Queue size: ${newQueue.length}`
    );

    await sleep(speed / 2);

    setHighlightedIndex(-1);
    setCurrentOperation("");
    setIsAnimating(false);
    setOperationResult("");
  };

  const front = async () => {
    if (queue.length === 0 || isAnimating) return;

    setIsAnimating(true);
    setCurrentOperation("front");
    const frontElement = queue[0];
    setHighlightedIndex(0);
    setOperationResult(`Front element: "${frontElement}"`);
    setExplanation(
      `Front element is: "${frontElement}". The element remains in the queue.`
    );

    await sleep(speed);

    setHighlightedIndex(-1);
    setCurrentOperation("");
    setIsAnimating(false);
    setOperationResult("");
  };

  const rear = async () => {
    if (queue.length === 0 || isAnimating) return;

    setIsAnimating(true);
    setCurrentOperation("rear");
    const rearElement = queue[queue.length - 1];
    setHighlightedIndex(queue.length - 1);
    setOperationResult(`Rear element: "${rearElement}"`);
    setExplanation(
      `Rear element is: "${rearElement}". The element remains in the queue.`
    );

    await sleep(speed);

    setHighlightedIndex(-1);
    setCurrentOperation("");
    setIsAnimating(false);
    setOperationResult("");
  };

  const clear = () => {
    if (isAnimating) return;
    setQueue([]);
    setExplanation("Queue cleared. All elements have been removed.");
    setOperationResult("");
  };

  const handleBackToVisualize = () => navigate("/visualize");

  const getElementColor = (index) => {
    if (highlightedIndex === index) {
      if (currentOperation === "enqueue")
        return "bg-green-400 border-green-600 animate-pulse";
      if (currentOperation === "dequeue")
        return "bg-red-400 border-red-600 animate-pulse";
      if (currentOperation === "front")
        return "bg-blue-400 border-blue-600 animate-pulse";
      if (currentOperation === "rear")
        return "bg-purple-400 border-purple-600 animate-pulse";
    }

    // Front element gets special styling
    if (index === 0) {
      return "bg-blue-400 border-blue-600";
    }

    // Rear element gets special styling
    if (index === queue.length - 1 && queue.length > 1) {
      return "bg-purple-400 border-purple-600";
    }

    return "bg-gray-400 border-gray-600";
  };

  return (
    <div
      className="min-h-screen font-sans text-gray-200 overflow-x-hidden"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(59, 130, 246, 0.1) 25%,
            transparent 70%
          ),
          radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
          linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
        `,
      }}
    >
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 sm:pb-20">
        {/* Back Button */}
        <button
          onClick={handleBackToVisualize}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-900/50 hover:bg-indigo-500/20 border border-gray-800 hover:border-indigo-400 text-gray-300 hover:text-indigo-300 font-semibold shadow transition-all duration-300 group mb-6 sm:mb-8"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm sm:text-base">Back to Visualizer</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Queue Data Structure Visualizer
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-3xl mx-auto px-4">
            Explore queue operations: Enqueue, Dequeue, Front, and Rear with
            FIFO (First In, First Out) principle
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-800 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Input for Enqueue */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Element to Enqueue
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isAnimating}
                placeholder="Enter value"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && enqueue()}
              />
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Animation Speed
              </label>
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

            {/* Queue Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Queue Information
              </label>
              <div className="text-sm text-gray-400">
                <div>Size: {queue.length}</div>
                <div>Front: {queue.length > 0 ? queue[0] : "Empty"}</div>
                <div>
                  Rear: {queue.length > 0 ? queue[queue.length - 1] : "Empty"}
                </div>
              </div>
            </div>
          </div>

          {/* Operation Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => enqueue()}
              disabled={isAnimating || !inputValue.trim()}
              className="px-3 sm:px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Enqueue
            </button>
            <button
              onClick={enqueueRandom}
              disabled={isAnimating}
              className="px-3 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <span className="hidden sm:inline">Enqueue Random</span>
              <span className="sm:hidden">Random</span>
            </button>
            <button
              onClick={dequeue}
              disabled={isAnimating || queue.length === 0}
              className="px-3 sm:px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Dequeue
            </button>
            <button
              onClick={front}
              disabled={isAnimating || queue.length === 0}
              className="px-3 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Front
            </button>
            <button
              onClick={rear}
              disabled={isAnimating || queue.length === 0}
              className="px-3 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Rear
            </button>
            <button
              onClick={clear}
              disabled={isAnimating}
              className="px-3 sm:px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <span className="hidden sm:inline">Clear Queue</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>

          {/* Operation Result */}
          {operationResult && (
            <div className="mt-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg">
              <p className="text-blue-300 font-medium">{operationResult}</p>
            </div>
          )}
        </div>

        {/* Queue Visualization */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-800 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
            Queue Visualization
          </h3>

          <div className="flex justify-center overflow-x-auto scrollbar-hide">
            <div className="relative min-w-max">
              {/* Queue Container */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Front Label */}
                <div className="flex flex-col items-center mr-2 sm:mr-4 flex-shrink-0">
                  <span className="text-blue-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                    FRONT
                  </span>
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {/* Queue Elements */}
                <div className="flex gap-1 sm:gap-2">
                  {queue.length === 0 ? (
                    <div className="w-32 sm:w-48 h-12 sm:h-16 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 rounded-lg">
                      <span className="text-center text-xs sm:text-sm">
                        <span className="block">Queue is Empty</span>
                        <span className="text-xs hidden sm:block">
                          Enqueue elements to see them here
                        </span>
                      </span>
                    </div>
                  ) : (
                    queue.map((element, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 sm:w-20 sm:h-16 border-2 flex items-center justify-center text-white font-bold text-xs sm:text-sm transition-all duration-300 rounded-lg flex-shrink-0 ${getElementColor(
                          index
                        )}`}
                      >
                        <span className="truncate px-1">{element}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Rear Label */}
                <div className="flex flex-col items-center ml-2 sm:ml-4 flex-shrink-0">
                  <span className="text-purple-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                    REAR
                  </span>
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Operation Flow Arrows */}
              <div className="flex justify-between mt-4 sm:mt-8 text-xs sm:text-sm">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mb-1 sm:mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span className="text-red-400 font-medium text-center">
                    <span className="hidden sm:inline">Dequeue (Remove)</span>
                    <span className="sm:hidden">Dequeue</span>
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-1 sm:mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  <span className="text-green-400 font-medium text-center">
                    <span className="hidden sm:inline">Enqueue (Add)</span>
                    <span className="sm:hidden">Enqueue</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 border border-blue-600 rounded"></div>
              <span className="text-gray-300">Front</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-400 border border-purple-600 rounded"></div>
              <span className="text-gray-300">Rear</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 border border-gray-600 rounded"></div>
              <span className="text-gray-300 hidden sm:inline">
                Queue Element
              </span>
              <span className="text-gray-300 sm:hidden">Element</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 border border-green-600 rounded"></div>
              <span className="text-gray-300 hidden sm:inline">
                Enqueue Operation
              </span>
              <span className="text-gray-300 sm:hidden">Enqueue</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-400 border border-red-600 rounded"></div>
              <span className="text-gray-300 hidden sm:inline">
                Dequeue Operation
              </span>
              <span className="text-gray-300 sm:hidden">Dequeue</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-800 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              Operation Explanation
            </h3>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* Queue Operations Info */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-800">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
            Queue Operations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-green-900/30 p-3 sm:p-4 rounded-lg border border-green-700">
              <h4 className="text-green-400 font-bold mb-2 text-sm sm:text-base">
                Enqueue
              </h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                Adds an element to the rear of the queue. Time complexity: O(1)
              </p>
            </div>
            <div className="bg-red-900/30 p-3 sm:p-4 rounded-lg border border-red-700">
              <h4 className="text-red-400 font-bold mb-2 text-sm sm:text-base">
                Dequeue
              </h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                Removes and returns the front element from the queue. Time
                complexity: O(1)
              </p>
            </div>
            <div className="bg-blue-900/30 p-3 sm:p-4 rounded-lg border border-blue-700">
              <h4 className="text-blue-400 font-bold mb-2 text-sm sm:text-base">
                Front
              </h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                Returns the front element without removing it. Time complexity:
                O(1)
              </p>
            </div>
            <div className="bg-purple-900/30 p-3 sm:p-4 rounded-lg border border-purple-700">
              <h4 className="text-purple-400 font-bold mb-2 text-sm sm:text-base">
                Rear
              </h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                Returns the rear element without removing it. Time complexity:
                O(1)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueVisualizer;
