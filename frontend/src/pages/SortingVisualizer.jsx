import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const SortingVisualizer = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [array, setArray] = useState([]);
  const [customArray, setCustomArray] = useState("");
  const [isSorting, setIsSorting] = useState(false);
  const [currentIndices, setCurrentIndices] = useState([]);
  const [comparedIndices, setComparedIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [sortComplete, setSortComplete] = useState(false);
  const [algorithm, setAlgorithm] = useState("bubble");
  const [speed, setSpeed] = useState(500);
  const [explanation, setExplanation] = useState("");
  const [step, setStep] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

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
    resetSort();
  };

  const handleCustomArray = () => {
    try {
      const newArray = customArray.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
      if (newArray.length > 0) {
        setArray(newArray);
        resetSort();
      }
    } catch (error) {
      alert("Please enter valid numbers separated by commas");
    }
  };

  const resetSort = () => {
    setCurrentIndices([]);
    setComparedIndices([]);
    setSortedIndices([]);
    setSortComplete(false);
    setIsSorting(false);
    setExplanation("");
    setStep(0);
    setComparisons(0);
    setSwaps(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const sleep = (ms) => {
    return new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  };

  const bubbleSort = async () => {
    setIsSorting(true);
    setExplanation("Starting Bubble Sort: Compare adjacent elements and swap if they're in wrong order");
    setStep(0);
    setComparisons(0);
    setSwaps(0);

    await sleep(speed);

    const arr = [...array];
    const n = arr.length;
    let stepCount = 0;
    let comparisonCount = 0;
    let swapCount = 0;

    for (let i = 0; i < n - 1; i++) {
      if (timeoutRef.current === null) break;

      for (let j = 0; j < n - i - 1; j++) {
        if (timeoutRef.current === null) break;

        stepCount++;
        comparisonCount++;
        setStep(stepCount);
        setComparisons(comparisonCount);
        setCurrentIndices([j, j + 1]);
        setExplanation(`Step ${stepCount}: Comparing elements at positions ${j} and ${j + 1} (values: ${arr[j]} and ${arr[j + 1]})`);

        await sleep(speed);
        if (timeoutRef.current === null) break;

        if (arr[j] > arr[j + 1]) {
          // Swap elements
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapCount++;
          setSwaps(swapCount);
          setArray([...arr]);
          setExplanation(`Step ${stepCount}: ${arr[j + 1]} > ${arr[j]}, swapping! Array after swap: [${arr.join(', ')}]`);
          
          await sleep(speed);
          if (timeoutRef.current === null) break;
        } else {
          setExplanation(`Step ${stepCount}: ${arr[j]} <= ${arr[j + 1]}, no swap needed. Moving to next pair.`);
          await sleep(speed / 2);
          if (timeoutRef.current === null) break;
        }
      }
      
      // Mark the last element as sorted
      setSortedIndices(prev => [...prev, n - 1 - i]);
    }

    if (timeoutRef.current !== null) {
      setSortedIndices(Array.from({ length: n }, (_, i) => i));
      setCurrentIndices([]);
      setComparedIndices([]);
      setSortComplete(true);
      setIsSorting(false);
      setExplanation(`🎉 Bubble Sort completed! Array is now sorted in ${comparisonCount} comparisons and ${swapCount} swaps.`);
    }
  };

  const selectionSort = async () => {
    setIsSorting(true);
    setExplanation("Starting Selection Sort: Find minimum element and place it at the beginning");
    setStep(0);
    setComparisons(0);
    setSwaps(0);

    await sleep(speed);

    const arr = [...array];
    const n = arr.length;
    let stepCount = 0;
    let comparisonCount = 0;
    let swapCount = 0;

    for (let i = 0; i < n - 1; i++) {
      if (timeoutRef.current === null) break;

      let minIdx = i;
      setCurrentIndices([i]);
      setExplanation(`Pass ${i + 1}: Finding minimum element from position ${i} to ${n - 1}`);
      
      await sleep(speed);
      if (timeoutRef.current === null) break;

      for (let j = i + 1; j < n; j++) {
        if (timeoutRef.current === null) break;

        stepCount++;
        comparisonCount++;
        setStep(stepCount);
        setComparisons(comparisonCount);
        setComparedIndices([j]);
        setExplanation(`Step ${stepCount}: Comparing ${arr[j]} with current minimum ${arr[minIdx]} at position ${minIdx}`);

        await sleep(speed);
        if (timeoutRef.current === null) break;

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          setCurrentIndices([minIdx]);
          setExplanation(`Step ${stepCount}: Found new minimum ${arr[minIdx]} at position ${minIdx}`);
          await sleep(speed / 2);
          if (timeoutRef.current === null) break;
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swapCount++;
        setSwaps(swapCount);
        setArray([...arr]);
        setExplanation(`Swapping ${arr[minIdx]} at position ${i} with ${arr[i]} at position ${minIdx}`);
        await sleep(speed);
        if (timeoutRef.current === null) break;
      }

      setSortedIndices(prev => [...prev, i]);
      setCurrentIndices([]);
      setComparedIndices([]);
    }

    if (timeoutRef.current !== null) {
      setSortedIndices(Array.from({ length: n }, (_, i) => i));
      setCurrentIndices([]);
      setComparedIndices([]);
      setSortComplete(true);
      setIsSorting(false);
      setExplanation(`🎉 Selection Sort completed! Array is now sorted in ${comparisonCount} comparisons and ${swapCount} swaps.`);
    }
  };

  const insertionSort = async () => {
    setIsSorting(true);
    setExplanation("Starting Insertion Sort: Insert each element into its correct position in the sorted portion");
    setStep(0);
    setComparisons(0);
    setSwaps(0);

    await sleep(speed);

    const arr = [...array];
    const n = arr.length;
    let stepCount = 0;
    let comparisonCount = 0;
    let swapCount = 0;

    setSortedIndices([0]); // First element is considered sorted

    for (let i = 1; i < n; i++) {
      if (timeoutRef.current === null) break;

      let key = arr[i];
      let j = i - 1;
      
      setCurrentIndices([i]);
      setExplanation(`Pass ${i}: Inserting element ${key} at position ${i} into sorted portion [0...${i-1}]`);
      
      await sleep(speed);
      if (timeoutRef.current === null) break;

      while (j >= 0 && arr[j] > key) {
        if (timeoutRef.current === null) break;

        stepCount++;
        comparisonCount++;
        setStep(stepCount);
        setComparisons(comparisonCount);
        setComparedIndices([j]);
        setExplanation(`Step ${stepCount}: Comparing ${key} with ${arr[j]} at position ${j}. ${arr[j]} > ${key}, shifting right.`);

        arr[j + 1] = arr[j];
        swapCount++;
        setSwaps(swapCount);
        setArray([...arr]);
        
        await sleep(speed);
        if (timeoutRef.current === null) break;
        
        j--;
      }

      arr[j + 1] = key;
      setArray([...arr]);
      setSortedIndices(prev => [...prev, i]);
      setCurrentIndices([]);
      setComparedIndices([]);
      setExplanation(`Inserted ${key} at position ${j + 1}. Sorted portion is now [0...${i}]`);
      
      await sleep(speed);
      if (timeoutRef.current === null) break;
    }

    if (timeoutRef.current !== null) {
      setSortedIndices(Array.from({ length: n }, (_, i) => i));
      setCurrentIndices([]);
      setComparedIndices([]);
      setSortComplete(true);
      setIsSorting(false);
      setExplanation(`🎉 Insertion Sort completed! Array is now sorted in ${comparisonCount} comparisons and ${swapCount} operations.`);
    }
  };

  const startSort = () => {
    resetSort();
    if (algorithm === "bubble") {
      bubbleSort();
    } else if (algorithm === "selection") {
      selectionSort();
    } else if (algorithm === "insertion") {
      insertionSort();
    }
  };

  const stopSort = () => {
    setIsSorting(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleBackToVisualize = () => navigate("/visualize");

  const getBarColor = (index) => {
    if (sortedIndices.includes(index)) return "bg-emerald-500 border-emerald-400";
    if (currentIndices.includes(index)) return "bg-yellow-500 border-yellow-400";
    if (comparedIndices.includes(index)) return "bg-orange-500 border-orange-400";
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
            Sorting Algorithm Visualizer
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-3xl mx-auto px-4">
            Watch how different sorting algorithms organize elements step by step
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
                disabled={isSorting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="bubble">Bubble Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="insertion">Insertion Sort</option>
              </select>
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Speed (ms)</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isSorting}
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Operations</label>
              <div className="text-sm text-gray-400">
                <div>Swaps: {swaps}</div>
                <div>Array Size: {array.length}</div>
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
                disabled={isSorting}
                placeholder="e.g., 64,34,25,12,22,11,90"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleCustomArray}
                disabled={isSorting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Set Array
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={startSort}
              disabled={isSorting}
              className="px-3 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              {isSorting ? "Sorting..." : "Start Sort"}
            </button>
            <button
              onClick={stopSort}
              disabled={!isSorting}
              className="px-3 sm:px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Stop
            </button>
            <button
              onClick={generateRandomArray}
              disabled={isSorting}
              className="px-3 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <span className="hidden sm:inline">Generate Random Array</span>
              <span className="sm:hidden">Random</span>
            </button>
            <button
              onClick={resetSort}
              disabled={isSorting}
              className="px-3 sm:px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Array Visualization</h3>
          
          <div className="flex items-end justify-center gap-1 sm:gap-2 min-h-[200px] sm:min-h-[250px] p-2 sm:p-4 overflow-x-auto scrollbar-hide">
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
                  
                  {/* Status indicators */}
                  {currentIndices.includes(index) && (
                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-500 text-black text-xs px-1 sm:px-2 py-1 rounded font-bold whitespace-nowrap">
                        <span className="hidden sm:inline">Current</span>
                        <span className="sm:hidden">C</span>
                      </div>
                    </div>
                  )}
                  
                  {comparedIndices.includes(index) && (
                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-orange-500 text-white text-xs px-1 sm:px-2 py-1 rounded font-bold whitespace-nowrap">
                        <span className="hidden sm:inline">Comparing</span>
                        <span className="sm:hidden">~</span>
                      </div>
                    </div>
                  )}
                  
                  {sortedIndices.includes(index) && (
                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-emerald-500 text-white text-xs px-1 sm:px-2 py-1 rounded font-bold whitespace-nowrap">
                        <span className="hidden sm:inline">Sorted ✓</span>
                        <span className="sm:hidden">✓</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1 hidden sm:block">idx: {index}</div>
                <div className="text-xs text-gray-500 sm:hidden">{index}</div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-500 border border-indigo-400 rounded"></div>
              <span className="text-gray-300">Unsorted</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 border border-yellow-400 rounded"></div>
              <span className="text-gray-300 hidden sm:inline">Current Element</span>
              <span className="text-gray-300 sm:hidden">Current</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 border border-orange-400 rounded"></div>
              <span className="text-gray-300 hidden sm:inline">Being Compared</span>
              <span className="text-gray-300 sm:hidden">Comparing</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border border-emerald-400 rounded"></div>
              <span className="text-gray-300">Sorted</span>
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

export default SortingVisualizer;