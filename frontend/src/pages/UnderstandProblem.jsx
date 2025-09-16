import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

// Problem data structure
const problemsData = {
  'two-sum': {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    steps: [
      'Start iterating through the array',
      'For each element, calculate the complement (target - current)',
      'Check if the complement exists in our hash map',
      'If yes, return the indices',
      'If no, store current element and its index in hash map'
    ],
    code: {
      cpp: `unordered_map<int, int> mp;
for (int i = 0; i < nums.size(); ++i) {
    int rem = target - nums[i];
    if (mp.count(rem)) return {mp[rem], i};
    mp[nums[i]] = i;
}`,
      python: `hash_map = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in hash_map:
        return [hash_map[complement], i]
    hash_map[num] = i`,
      javascript: `const map = new Map();
for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
        return [map.get(complement), i];
    }
    map.set(nums[i], i);
}`
    }
  },
  'binary-search': {
    title: 'Binary Search',
    description: 'Given a sorted array of integers nums and an integer target, return the index of target if it exists, otherwise return -1.',
    difficulty: 'Easy',
    examples: [
      {
        input: 'nums = [-1,0,3,5,9,12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4'
      }
    ],
    steps: [
      'Initialize left and right pointers',
      'Calculate middle index',
      'Compare middle element with target',
      'If equal, return middle index',
      'If target is smaller, search left half',
      'If target is larger, search right half',
      'Repeat until found or search space exhausted'
    ],
    code: {
      cpp: `int left = 0, right = nums.size() - 1;
while (left <= right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] == target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1;`,
      python: `left, right = 0, len(nums) - 1
while left <= right:
    mid = (left + right) // 2
    if nums[mid] == target:
        return mid
    elif nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
return -1`,
      javascript: `let left = 0, right = nums.length - 1;
while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1;`
    }
  },
  'stack-operations': {
    title: 'Stack Operations',
    description: 'Implement a stack data structure with push, pop, top, and empty operations.',
    difficulty: 'Easy',
    examples: [
      {
        input: 'push(1), push(2), top(), pop(), empty()',
        output: '2, 2, false',
        explanation: 'Stack operations return top element, popped element, and empty status'
      }
    ],
    steps: [
      'Initialize an empty array/list',
      'Push: Add element to the end',
      'Pop: Remove and return last element',
      'Top: Return last element without removing',
      'Empty: Check if array length is 0'
    ],
    code: {
      cpp: `class MyStack {
    vector<int> data;
public:
    void push(int x) { data.push_back(x); }
    int pop() { int val = data.back(); data.pop_back(); return val; }
    int top() { return data.back(); }
    bool empty() { return data.empty(); }
};`,
      python: `class MyStack:
    def __init__(self):
        self.data = []
    
    def push(self, x):
        self.data.append(x)
    
    def pop(self):
        return self.data.pop()
    
    def top(self):
        return self.data[-1]
    
    def empty(self):
        return len(self.data) == 0`,
      javascript: `class MyStack {
    constructor() {
        this.data = [];
    }
    
    push(x) {
        this.data.push(x);
    }
    
    pop() {
        return this.data.pop();
    }
    
    top() {
        return this.data[this.data.length - 1];
    }
    
    empty() {
        return this.data.length === 0;
    }
}`
    }
  },
  'queue-operations': {
    title: 'Queue Operations',
    description: 'Implement a queue data structure with enqueue, dequeue, front, and empty operations.',
    difficulty: 'Easy',
    examples: [
      {
        input: 'enqueue(1), enqueue(2), front(), dequeue(), empty()',
        output: '1, 1, false',
        explanation: 'Queue operations return front element, dequeued element, and empty status'
      }
    ],
    steps: [
      'Initialize an empty array/list',
      'Enqueue: Add element to the end',
      'Dequeue: Remove and return first element',
      'Front: Return first element without removing',
      'Empty: Check if array length is 0'
    ],
    code: {
      cpp: `class MyQueue {
    queue<int> data;
public:
    void enqueue(int x) { data.push(x); }
    int dequeue() { int val = data.front(); data.pop(); return val; }
    int front() { return data.front(); }
    bool empty() { return data.empty(); }
};`,
      python: `from collections import deque

class MyQueue:
    def __init__(self):
        self.data = deque()
    
    def enqueue(self, x):
        self.data.append(x)
    
    def dequeue(self):
        return self.data.popleft()
    
    def front(self):
        return self.data[0]
    
    def empty(self):
        return len(self.data) == 0`,
      javascript: `class MyQueue {
    constructor() {
        this.data = [];
    }
    
    enqueue(x) {
        this.data.push(x);
    }
    
    dequeue() {
        return this.data.shift();
    }
    
    front() {
        return this.data[0];
    }
    
    empty() {
        return this.data.length === 0;
    }
}`
    }
  }
};

// Animation component for visualizations
const AnimationBox = ({ value, isHighlighted, isMatched, index, onClick }) => (
  <div
    className={`
      w-16 h-16 flex items-center justify-center rounded-lg border-2 cursor-pointer
      transition-all duration-500 transform hover:scale-105 font-bold text-lg
      ${isMatched 
        ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/50' 
        : isHighlighted 
        ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/50' 
        : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
      }
    `}
    onClick={() => onClick && onClick(index)}
  >
    {value}
  </div>
);

// Control Panel Component
const ControlPanel = ({ onStart, onPause, onStop, onReset, speed, onSpeedChange, isRunning, isPaused }) => (
  <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <span className="text-2xl">🎮</span>
      Control Panel
    </h3>
    
    <div className="flex flex-wrap gap-3 mb-4">
      <button
        onClick={onStart}
        disabled={isRunning && !isPaused}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
      >
        <span>▶️</span>
        Start
      </button>
      
      <button
        onClick={onPause}
        disabled={!isRunning}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
      >
        <span>⏸️</span>
        Pause
      </button>
      
      <button
        onClick={onStop}
        disabled={!isRunning && !isPaused}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
      >
        <span>⏹️</span>
        Stop
      </button>
      
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
      >
        <span>🔁</span>
        Reset
      </button>
    </div>
    
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Speed Control</label>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">🐢</span>
        <input
          type="range"
          min="1"
          max="3"
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs text-gray-400">🚀</span>
      </div>
      <div className="text-xs text-gray-400 text-center">
        {speed === 1 ? 'Slow' : speed === 2 ? 'Medium' : 'Fast'}
      </div>
    </div>
  </div>
);

// Two Sum Visualizer Component
const TwoSumVisualizer = ({ problem }) => {
  const [array, setArray] = useState([2, 7, 11, 15]);
  const [target, setTarget] = useState(9);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [hashMap, setHashMap] = useState({});
  const [foundIndices, setFoundIndices] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef(null);

  const speedMap = { 1: 2000, 2: 1000, 3: 500 };

  const resetVisualization = () => {
    setCurrentIndex(-1);
    setHashMap({});
    setFoundIndices([]);
    setCurrentStep(0);
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const startVisualization = () => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      continueVisualization();
      return;
    }

    resetVisualization();
    setIsRunning(true);
    
    let index = 0;
    let map = {};
    
    intervalRef.current = setInterval(() => {
      if (index >= array.length) {
        setIsRunning(false);
        clearInterval(intervalRef.current);
        return;
      }

      const current = array[index];
      const complement = target - current;
      
      setCurrentIndex(index);
      setCurrentStep(index + 1);
      
      if (map.hasOwnProperty(complement)) {
        setFoundIndices([map[complement], index]);
        setIsRunning(false);
        clearInterval(intervalRef.current);
      } else {
        map[current] = index;
        setHashMap({...map});
      }
      
      index++;
    }, speedMap[speed]);
  };

  const continueVisualization = () => {
    // Continue from where we paused
    setIsRunning(true);
  };

  const pauseVisualization = () => {
    setIsPaused(true);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stopVisualization = () => {
    resetVisualization();
  };

  const handleArrayChange = (e) => {
    const newArray = e.target.value.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    setArray(newArray);
    resetVisualization();
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Input Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Array (comma-separated)</label>
            <input
              type="text"
              value={array.join(', ')}
              onChange={handleArrayChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. 2, 7, 11, 15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target</label>
            <input
              type="number"
              value={target}
              onChange={(e) => {
                setTarget(parseInt(e.target.value));
                resetVisualization();
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter target"
            />
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Array Visualization
        </h3>
        
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {array.map((value, index) => (
            <div key={index} className="text-center">
              <AnimationBox
                value={value}
                isHighlighted={index === currentIndex}
                isMatched={foundIndices.includes(index)}
                index={index}
              />
              <div className="text-xs text-gray-400 mt-1">Index {index}</div>
            </div>
          ))}
        </div>

        {/* Hash Map Display */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white mb-3">Hash Map:</h4>
          <div className="bg-gray-700/50 rounded-lg p-4 min-h-[60px]">
            {Object.keys(hashMap).length === 0 ? (
              <div className="text-gray-400 text-center">Empty</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(hashMap).map(([value, index]) => (
                  <div key={value} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {value} → {index}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Result Display */}
        {foundIndices.length > 0 && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">✅ Solution Found!</h4>
            <p className="text-white">
              Indices: [{foundIndices.join(', ')}] → Values: [{foundIndices.map(i => array[i]).join(', ')}]
            </p>
            <p className="text-gray-300 text-sm mt-1">
              {array[foundIndices[0]]} + {array[foundIndices[1]]} = {target}
            </p>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <ControlPanel
        onStart={startVisualization}
        onPause={pauseVisualization}
        onStop={stopVisualization}
        onReset={resetVisualization}
        speed={speed}
        onSpeedChange={setSpeed}
        isRunning={isRunning}
        isPaused={isPaused}
      />
    </div>
  );
};

// Binary Search Visualizer Component
const BinarySearchVisualizer = ({ problem }) => {
  const [array, setArray] = useState([-1, 0, 3, 5, 9, 12]);
  const [target, setTarget] = useState(9);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(array.length - 1);
  const [mid, setMid] = useState(-1);
  const [found, setFound] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(2);
  const intervalRef = useRef(null);

  const speedMap = { 1: 2000, 2: 1000, 3: 500 };

  const resetVisualization = () => {
    setLeft(0);
    setRight(array.length - 1);
    setMid(-1);
    setFound(false);
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const startVisualization = () => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      return;
    }

    resetVisualization();
    setIsRunning(true);
    
    let l = 0;
    let r = array.length - 1;
    
    intervalRef.current = setInterval(() => {
      if (l > r) {
        setIsRunning(false);
        clearInterval(intervalRef.current);
        return;
      }

      const m = Math.floor((l + r) / 2);
      setLeft(l);
      setRight(r);
      setMid(m);
      
      if (array[m] === target) {
        setFound(true);
        setIsRunning(false);
        clearInterval(intervalRef.current);
      } else if (array[m] < target) {
        l = m + 1;
      } else {
        r = m - 1;
      }
    }, speedMap[speed]);
  };

  const pauseVisualization = () => {
    setIsPaused(true);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stopVisualization = () => {
    resetVisualization();
  };

  const handleArrayChange = (e) => {
    const newArray = e.target.value.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    newArray.sort((a, b) => a - b); // Keep sorted
    setArray(newArray);
    resetVisualization();
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Input Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sorted Array (comma-separated)</label>
            <input
              type="text"
              value={array.join(', ')}
              onChange={handleArrayChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. -1, 0, 3, 5, 9, 12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target</label>
            <input
              type="number"
              value={target}
              onChange={(e) => {
                setTarget(parseInt(e.target.value));
                resetVisualization();
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter target"
            />
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          Binary Search Visualization
        </h3>
        
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {array.map((value, index) => {
            let isHighlighted = false;
            let isMatched = false;
            let label = '';
            
            if (index === left) {
              isHighlighted = true;
              label = 'L';
            } else if (index === right) {
              isHighlighted = true;
              label = 'R';
            } else if (index === mid) {
              isMatched = found;
              isHighlighted = !found;
              label = 'M';
            }
            
            return (
              <div key={index} className="text-center">
                <AnimationBox
                  value={value}
                  isHighlighted={isHighlighted}
                  isMatched={isMatched}
                  index={index}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {label && <span className="font-bold text-blue-400">{label} </span>}
                  Index {index}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-semibold">Left Pointer</div>
            <div className="text-white text-lg">{left >= 0 ? left : '-'}</div>
          </div>
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3 text-center">
            <div className="text-purple-400 font-semibold">Mid Pointer</div>
            <div className="text-white text-lg">{mid >= 0 ? mid : '-'}</div>
          </div>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-semibold">Right Pointer</div>
            <div className="text-white text-lg">{right >= 0 ? right : '-'}</div>
          </div>
        </div>

        {/* Result Display */}
        {found && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">✅ Target Found!</h4>
            <p className="text-white">
              Target {target} found at index {mid}
            </p>
          </div>
        )}
        
        {!isRunning && !found && mid >= 0 && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">❌ Target Not Found</h4>
            <p className="text-white">
              Target {target} does not exist in the array
            </p>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <ControlPanel
        onStart={startVisualization}
        onPause={pauseVisualization}
        onStop={stopVisualization}
        onReset={resetVisualization}
        speed={speed}
        onSpeedChange={setSpeed}
        isRunning={isRunning}
        isPaused={isPaused}
      />
    </div>
  );
};

// Main Component
function UnderstandProblem() {
  const navigate = useNavigate();
  const [selectedProblem, setSelectedProblem] = useState('two-sum');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');

  const currentProblem = problemsData[selectedProblem];

  const renderVisualizer = () => {
    switch (selectedProblem) {
      case 'two-sum':
        return <TwoSumVisualizer problem={currentProblem} />;
      case 'binary-search':
        return <BinarySearchVisualizer problem={currentProblem} />;
      default:
        return (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-bold text-white mb-2">Visualizer Coming Soon!</h3>
            <p className="text-gray-400">
              The visualizer for {currentProblem.title} is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      <div className="flex h-screen">
        {/* Left Panel - Problem List */}
        <div className="w-80 bg-gray-900/50 backdrop-blur-lg border-r border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-2xl font-bold text-white">Understand Problems</h1>
            <p className="text-gray-400 text-sm mt-1">Interactive problem explanations</p>
          </div>

          {/* Problem List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {Object.entries(problemsData).map(([key, problem]) => (
                <button
                  key={key}
                  onClick={() => setSelectedProblem(key)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    selectedProblem === key
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{problem.title}</div>
                  <div className={`text-xs mt-1 ${
                    problem.difficulty === 'Easy' ? 'text-green-400' :
                    problem.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {problem.difficulty}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Problem Description */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-white">{currentProblem.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  currentProblem.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                  currentProblem.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' :
                  'bg-red-900/50 text-red-400 border border-red-700'
                }`}>
                  {currentProblem.difficulty}
                </span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">{currentProblem.description}</p>
              
              {/* Examples */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Example:</h3>
                {currentProblem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <div><span className="text-blue-400 font-medium">Input:</span> <code className="text-green-400">{example.input}</code></div>
                    <div><span className="text-blue-400 font-medium">Output:</span> <code className="text-green-400">{example.output}</code></div>
                    <div><span className="text-blue-400 font-medium">Explanation:</span> <span className="text-gray-300">{example.explanation}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Explanation */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Algorithm Steps
              </h3>
              <div className="space-y-3">
                {currentProblem.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-300 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Visualization */}
            {renderVisualizer()}

            {/* Code Implementation */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">💻</span>
                  Code Implementation
                </h3>
                <div className="flex gap-2">
                  {Object.keys(currentProblem.code).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{currentProblem.code[selectedLanguage]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnderstandProblem;