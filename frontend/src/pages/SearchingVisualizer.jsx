import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const SearchingVisualizer = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState("");
  const [customArray, setCustomArray] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [searchComplete, setSearchComplete] = useState(false);
  const [algorithm, setAlgorithm] = useState("linear");
  const [speed, setSpeed] = useState(500);
  const [explanation, setExplanation] = useState("");
  const [step, setStep] = useState(0);
  const [comparisons, setComparisons] = useState(0);

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
    generateRandomArray();
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 1);
    setArray(newArray);
    resetSearch();
  };

  const handleCustomArray = () => {
    try {
      const newArray = customArray.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
      if (newArray.length > 0) {
        setArray(newArray);
        resetSearch();
      }
    } catch (error) {
      alert("Please enter valid numbers separated by commas");
    }
  };

  const resetSearch = () => {
    setCurrentIndex(-1);
    setFoundIndex(-1);
    setSearchComplete(false);
    setIsSearching(false);
    setExplanation("");
    setStep(0);
    setComparisons(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const linearSearch = async () => {
    const targetNum = parseInt(target);
    if (isNaN(targetNum)) {
      alert("Please enter a valid target number");
      return;
    }

    setIsSearching(true);
    setExplanation("Starting Linear Search: Checking each element one by one from left to right");
    setStep(0);
    setComparisons(0);

    // Wait a moment to show the initial message
    await new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, speed);
    });

    for (let i = 0; i < array.length; i++) {
      // Check if search was stopped
      if (timeoutRef.current === null) break;
      
      setCurrentIndex(i);
      setStep(i + 1);
      setComparisons(i + 1);
      setExplanation(`Step ${i + 1}: Checking if target ${targetNum} == bar${i + 1} (value: ${array[i]})`);

      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, speed);
      });

      // Check again if search was stopped during the timeout
      if (timeoutRef.current === null) break;

      if (array[i] === targetNum) {
        setFoundIndex(i);
        setSearchComplete(true);
        setIsSearching(false);
        setExplanation(`🎉 YES! Target ${targetNum} == bar${i + 1} (value: ${array[i]}). Found at index ${i}! Linear search completed in ${i + 1} comparisons.`);
        return;
      } else {
        setExplanation(`Step ${i + 1}: NO! Target ${targetNum} != bar${i + 1} (value: ${array[i]}). Moving to next element...`);
        await new Promise(resolve => {
          timeoutRef.current = setTimeout(resolve, speed / 2);
        });
      }
    }

    setCurrentIndex(-1);
    setSearchComplete(true);
    setIsSearching(false);
    setExplanation(`❌ Target ${targetNum} not found in the array. Searched all ${array.length} elements.`);
  };

  const binarySearch = async () => {
    const targetNum = parseInt(target);
    if (isNaN(targetNum)) {
      alert("Please enter a valid target number");
      return;
    }

    // Sort array for binary search
    const sortedArray = [...array].sort((a, b) => a - b);
    setArray(sortedArray);
    
    setIsSearching(true);
    setExplanation("Starting Binary Search: Array sorted. Dividing search space in half each time");
    setStep(0);
    setComparisons(0);

    // Wait a moment to show the initial message
    await new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, speed);
    });

    let left = 0;
    let right = sortedArray.length - 1;
    let stepCount = 0;
    let comparisonCount = 0;

    while (left <= right) {
      // Check if search was stopped
      if (timeoutRef.current === null) break;
      
      const mid = Math.floor((left + right) / 2);
      stepCount++;
      comparisonCount++;
      
      setCurrentIndex(mid);
      setStep(stepCount);
      setComparisons(comparisonCount);
      setExplanation(`Step ${stepCount}: Checking if target ${targetNum} == bar${mid + 1} (value: ${sortedArray[mid]}). Search range: [${left}, ${right}]`);

      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, speed);
      });

      // Check again if search was stopped during the timeout
      if (timeoutRef.current === null) break;

      if (sortedArray[mid] === targetNum) {
        setFoundIndex(mid);
        setSearchComplete(true);
        setIsSearching(false);
        setExplanation(`🎉 YES! Target ${targetNum} == bar${mid + 1} (value: ${sortedArray[mid]}). Found at index ${mid}! Binary search completed in ${comparisonCount} comparisons.`);
        return;
      } else if (sortedArray[mid] < targetNum) {
        left = mid + 1;
        setExplanation(`Step ${stepCount}: NO! Target ${targetNum} > bar${mid + 1} (value: ${sortedArray[mid]}). Searching right half: [${mid + 1}, ${right}]`);
      } else {
        right = mid - 1;
        setExplanation(`Step ${stepCount}: NO! Target ${targetNum} < bar${mid + 1} (value: ${sortedArray[mid]}). Searching left half: [${left}, ${mid - 1}]`);
      }

      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, speed);
      });
    }

    setCurrentIndex(-1);
    setSearchComplete(true);
    setIsSearching(false);
    setExplanation(`❌ Target ${targetNum} not found in the array. Binary search completed in ${comparisonCount} comparisons.`);
  };

  const startSearch = () => {
    resetSearch();
    if (algorithm === "linear") {
      linearSearch();
    } else {
      binarySearch();
    }
  };

  const stopSearch = () => {
    setIsSearching(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleBackToVisualize = () => navigate("/visualize");

  const getBarColor = (index) => {
    if (foundIndex === index) return "bg-emerald-500 border-emerald-400";
    if (currentIndex === index) return "bg-yellow-500 border-yellow-400";
    return "bg-indigo-500 border-indigo-400";
  };

  const getBarHeight = (value) => {
    const maxValue = Math.max(...array);
    const minHeight = window.innerWidth < 640 ? 30 : 40;
    const maxHeight = window.innerWidth < 640 ? 150 : 200;
    return minHeight + (value / maxValue) * (maxHeight - minHeight);
  };

  const getBarWidth = () => {
    if (window.innerWidth < 640) return '28px';
    if (window.innerWidth < 768) return '32px';
    return '40px';
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
        `
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
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Searching Algorithm Visualizer
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-3xl mx-auto px-4">
            Watch how different searching algorithms find elements in arrays
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-800 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isSearching}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="linear">Linear Search</option>
                <option value="binary">Binary Search</option>
              </select>
            </div>

            {/* Target Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Value</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isSearching}
                placeholder="Enter target"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Speed (ms)</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isSearching}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={1000}>Slow (1s)</option>
                <option value={500}>Medium (0.5s)</option>
                <option value={250}>Fast (0.25s)</option>
                <option value={100}>Very Fast (0.1s)</option>
              </select>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Statistics</label>
              <div className="text-sm text-gray-400">
                <div>Step: {step}</div>
                <div>Comparisons: {comparisons}</div>
              </div>
            </div>
          </div>

          {/* Array Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Custom Array (comma-separated)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customArray}
                onChange={(e) => setCustomArray(e.target.value)}
                disabled={isSearching}
                placeholder="e.g., 1,5,3,9,2,8,4"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleCustomArray}
                disabled={isSearching}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Set Array
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={startSearch}
              disabled={isSearching || !target}
              className="px-3 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              {isSearching ? "Searching..." : "Start Search"}
            </button>
            <button
              onClick={stopSearch}
              disabled={!isSearching}
              className="px-3 sm:px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Stop
            </button>
            <button
              onClick={generateRandomArray}
              disabled={isSearching}
              className="px-3 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <span className="hidden sm:inline">Generate Random Array</span>
              <span className="sm:hidden">Random</span>
            </button>
            <button
              onClick={resetSearch}
              disabled={isSearching}
              className="px-3 sm:px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Array Visualization</h3>
          
          <div className="relative">
            {/* Moving Target Block */}
            {isSearching && currentIndex >= 0 && target && (
              <div 
                className="absolute top-0 transition-all duration-500 ease-in-out z-10 flex justify-center"
                style={{
                  left: '50%',
                  transform: `translateX(calc(-50% + ${(currentIndex - (array.length - 1) / 2) * 42}px)) translateY(-60px)`
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-red-500 border-2 border-red-400 rounded-lg flex items-center justify-center text-white font-bold shadow-lg animate-bounce">
                    {target}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">Target</div>
                  {/* Arrow pointing down */}
                  <div className="flex justify-center mt-1">
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Static Target Display when not searching */}
            {!isSearching && target && (
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-300 mb-2">Target Value</div>
                  <div className="w-12 h-12 bg-red-500 border-2 border-red-400 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    {target}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-end justify-center gap-1 sm:gap-2 min-h-[200px] sm:min-h-[250px] p-2 sm:p-4 pt-16 sm:pt-20 overflow-x-auto scrollbar-hide">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center relative flex-shrink-0">
                  <div
                    className={`border-2 rounded-t-lg transition-all duration-300 flex items-end justify-center text-white font-bold text-xs sm:text-sm ${getBarColor(index)} relative`}
                    style={{ 
                      height: `${Math.max(getBarHeight(value), 30)}px`,
                      width: getBarWidth(),
                      minWidth: getBarWidth()
                    }}
                  >
                    <span className="mb-1 sm:mb-2">{value}</span>
                    
                    {/* Comparison indicator */}
                    {currentIndex === index && isSearching && (
                      <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-yellow-500 text-black text-xs px-1 sm:px-2 py-1 rounded font-bold whitespace-nowrap">
                          <span className="hidden sm:inline">Checking...</span>
                          <span className="sm:hidden">✓</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Found indicator */}
                    {foundIndex === index && (
                      <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-emerald-500 text-white text-xs px-1 sm:px-2 py-1 rounded font-bold whitespace-nowrap">
                          <span className="hidden sm:inline">Found! ✓</span>
                          <span className="sm:hidden">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 hidden sm:block">bar{index + 1}</div>
                  <div className="text-xs text-gray-500 sm:hidden">{index}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-500 border border-indigo-400 rounded"></div>
              <span className="text-gray-300">Unvisited</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 border border-yellow-400 rounded"></div>
              <span className="text-gray-300 hidden sm:inline">Currently Checking</span>
              <span className="text-gray-300 sm:hidden">Checking</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border border-emerald-400 rounded"></div>
              <span className="text-gray-300 hidden sm:inline">Found Target</span>
              <span className="text-gray-300 sm:hidden">Found</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 border border-red-400 rounded"></div>
              <span className="text-gray-300">Target</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Step-by-Step Explanation</h3>
            <p className="text-gray-300 text-lg leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchingVisualizer;