import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const TreeVisualizer = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tree, setTree] = useState(null);
  const [isTraversing, setIsTraversing] = useState(false);
  const [algorithm, setAlgorithm] = useState("inorder");
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [speed, setSpeed] = useState(500);
  const [explanation, setExplanation] = useState("");
  const [step, setStep] = useState(0);
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const timeoutRef = useRef(null);

  // Tree node class
  class TreeNode {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
      this.x = 0;
      this.y = 0;
    }
  }

  // Predefined tree structures
  const treePresets = {
    simple: () => {
      const root = new TreeNode(50);
      root.left = new TreeNode(30);
      root.right = new TreeNode(70);
      root.left.left = new TreeNode(20);
      root.left.right = new TreeNode(40);
      root.right.left = new TreeNode(60);
      root.right.right = new TreeNode(80);
      return root;
    },
    complex: () => {
      const root = new TreeNode(50);
      root.left = new TreeNode(30);
      root.right = new TreeNode(70);
      root.left.left = new TreeNode(20);
      root.left.right = new TreeNode(40);
      root.right.left = new TreeNode(60);
      root.right.right = new TreeNode(80);
      root.left.left.left = new TreeNode(10);
      root.left.left.right = new TreeNode(25);
      root.left.right.left = new TreeNode(35);
      root.right.left.right = new TreeNode(65);
      root.right.right.left = new TreeNode(75);
      root.right.right.right = new TreeNode(90);
      return root;
    },
    unbalanced: () => {
      const root = new TreeNode(50);
      root.left = new TreeNode(30);
      root.left.left = new TreeNode(20);
      root.left.left.left = new TreeNode(10);
      root.right = new TreeNode(70);
      root.right.right = new TreeNode(80);
      root.right.right.right = new TreeNode(90);
      root.right.right.right.right = new TreeNode(100);
      return root;
    }
  };

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
    loadTree("simple");
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const loadTree = (preset) => {
    const newTree = treePresets[preset]();
    calculatePositions(newTree);
    setTree(newTree);
    resetTraversal();
  };

  const calculatePositions = (root) => {
    if (!root) return;
    
    const positions = new Map();
    let nodeCount = 0;
    
    // Count nodes and assign levels
    const countNodes = (node, level = 0) => {
      if (!node) return;
      nodeCount++;
      node.level = level;
      countNodes(node.left, level + 1);
      countNodes(node.right, level + 1);
    };
    
    countNodes(root);
    
    // Calculate positions using in-order traversal for x-coordinates
    let xIndex = 0;
    const assignPositions = (node) => {
      if (!node) return;
      
      assignPositions(node.left);
      node.x = 50 + (xIndex * 60); // Spacing between nodes
      node.y = 50 + (node.level * 80); // Vertical spacing
      xIndex++;
      assignPositions(node.right);
    };
    
    assignPositions(root);
  };

  const resetTraversal = () => {
    setVisitedNodes([]);
    setCurrentNode(null);
    setIsTraversing(false);
    setExplanation("");
    setStep(0);
    setTraversalOrder([]);
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

  const inorderTraversal = async (node, visited, order, stepCount) => {
    if (!node || timeoutRef.current === null) return stepCount;

    // Visit left subtree
    stepCount = await inorderTraversal(node.left, visited, order, stepCount);
    if (timeoutRef.current === null) return stepCount;

    // Visit current node
    stepCount++;
    setStep(stepCount);
    setCurrentNode(node);
    visited.push(node);
    order.push(node.value);
    setVisitedNodes([...visited]);
    setTraversalOrder([...order]);
    setExplanation(`Step ${stepCount}: Visiting node ${node.value} (In-order: Left → Root → Right)`);
    await sleep(speed);

    // Visit right subtree
    stepCount = await inorderTraversal(node.right, visited, order, stepCount);
    return stepCount;
  };

  const preorderTraversal = async (node, visited, order, stepCount) => {
    if (!node || timeoutRef.current === null) return stepCount;

    // Visit current node first
    stepCount++;
    setStep(stepCount);
    setCurrentNode(node);
    visited.push(node);
    order.push(node.value);
    setVisitedNodes([...visited]);
    setTraversalOrder([...order]);
    setExplanation(`Step ${stepCount}: Visiting node ${node.value} (Pre-order: Root → Left → Right)`);
    await sleep(speed);

    // Visit left subtree
    stepCount = await preorderTraversal(node.left, visited, order, stepCount);
    if (timeoutRef.current === null) return stepCount;

    // Visit right subtree
    stepCount = await preorderTraversal(node.right, visited, order, stepCount);
    return stepCount;
  };

  const postorderTraversal = async (node, visited, order, stepCount) => {
    if (!node || timeoutRef.current === null) return stepCount;

    // Visit left subtree
    stepCount = await postorderTraversal(node.left, visited, order, stepCount);
    if (timeoutRef.current === null) return stepCount;

    // Visit right subtree
    stepCount = await postorderTraversal(node.right, visited, order, stepCount);
    if (timeoutRef.current === null) return stepCount;

    // Visit current node last
    stepCount++;
    setStep(stepCount);
    setCurrentNode(node);
    visited.push(node);
    order.push(node.value);
    setVisitedNodes([...visited]);
    setTraversalOrder([...order]);
    setExplanation(`Step ${stepCount}: Visiting node ${node.value} (Post-order: Left → Right → Root)`);
    await sleep(speed);

    return stepCount;
  };

  const levelorderTraversal = async () => {
    if (!tree) return;

    const visited = [];
    const order = [];
    const queue = [tree];
    let stepCount = 0;

    while (queue.length > 0) {
      if (timeoutRef.current === null) break;

      const node = queue.shift();
      stepCount++;
      setStep(stepCount);
      setCurrentNode(node);
      visited.push(node);
      order.push(node.value);
      setVisitedNodes([...visited]);
      setTraversalOrder([...order]);
      setExplanation(`Step ${stepCount}: Visiting node ${node.value} (Level-order: Level by level, left to right)`);
      await sleep(speed);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  };

  const startTraversal = async () => {
    if (!tree) return;
    
    setIsTraversing(true);
    setExplanation(`Starting ${algorithm.toUpperCase()} traversal...`);
    
    const visited = [];
    const order = [];
    
    if (algorithm === "levelorder") {
      await levelorderTraversal();
    } else {
      let stepCount = 0;
      if (algorithm === "inorder") {
        await inorderTraversal(tree, visited, order, stepCount);
      } else if (algorithm === "preorder") {
        await preorderTraversal(tree, visited, order, stepCount);
      } else if (algorithm === "postorder") {
        await postorderTraversal(tree, visited, order, stepCount);
      }
    }

    if (timeoutRef.current !== null) {
      setCurrentNode(null);
      setIsTraversing(false);
      setExplanation(`🎉 ${algorithm.toUpperCase()} traversal completed! Order: ${traversalOrder.join(' → ')}`);
    }
  };

  const stopTraversal = () => {
    setIsTraversing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const insertNode = () => {
    if (!inputValue.trim() || isTraversing) return;
    
    const value = parseInt(inputValue.trim());
    if (isNaN(value)) return;

    const insert = (node, val) => {
      if (!node) return new TreeNode(val);
      
      if (val < node.value) {
        node.left = insert(node.left, val);
      } else if (val > node.value) {
        node.right = insert(node.right, val);
      }
      return node;
    };

    const newTree = tree ? insert(tree, value) : new TreeNode(value);
    calculatePositions(newTree);
    setTree(newTree);
    setInputValue("");
    resetTraversal();
  };

  const handleBackToVisualize = () => navigate("/visualize");

  const getNodeColor = (node) => {
    if (currentNode === node) return "bg-yellow-400 border-yellow-600";
    if (visitedNodes.includes(node)) return "bg-green-400 border-green-600";
    return "bg-gray-300 border-gray-600";
  };

  const renderTree = (node) => {
    if (!node) return null;

    return (
      <g key={`node-${node.value}`}>
        {/* Edges to children */}
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="gray"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="gray"
            strokeWidth="2"
          />
        )}
        
        {/* Node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r="20"
          className={`${getNodeColor(node)} transition-all duration-300`}
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Node value */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-black font-bold text-sm"
        >
          {node.value}
        </text>
        
        {/* Render children */}
        {node.left && renderTree(node.left)}
        {node.right && renderTree(node.right)}
      </g>
    );
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
            Binary Tree Traversal Visualizer
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Explore tree traversal algorithms: In-order, Pre-order, Post-order, and Level-order
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Traversal Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isTraversing}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="inorder">In-order (Left → Root → Right)</option>
                <option value="preorder">Pre-order (Root → Left → Right)</option>
                <option value="postorder">Post-order (Left → Right → Root)</option>
                <option value="levelorder">Level-order (Breadth-First)</option>
              </select>
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Speed</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isTraversing}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={1000}>Slow (1s)</option>
                <option value={500}>Medium (0.5s)</option>
                <option value={250}>Fast (0.25s)</option>
                <option value={100}>Very Fast (0.1s)</option>
              </select>
            </div>

            {/* Statistics */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Statistics</label>
              <div className="text-sm text-gray-400">
                <div>Step: {step}</div>
                <div>Visited: {visitedNodes.length}</div>
              </div>
            </div>
          </div>

          {/* Node Insertion */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Insert Node</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTraversing}
                placeholder="Enter value"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && insertNode()}
              />
              <button
                onClick={insertNode}
                disabled={isTraversing || !inputValue.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Insert
              </button>
            </div>
          </div>

          {/* Tree Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tree Presets</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadTree("simple")}
                disabled={isTraversing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Simple Tree
              </button>
              <button
                onClick={() => loadTree("complex")}
                disabled={isTraversing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Complex Tree
              </button>
              <button
                onClick={() => loadTree("unbalanced")}
                disabled={isTraversing}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Unbalanced Tree
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={startTraversal}
              disabled={isTraversing || !tree}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {isTraversing ? "Traversing..." : "Start Traversal"}
            </button>
            <button
              onClick={stopTraversal}
              disabled={!isTraversing}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Stop
            </button>
            <button
              onClick={resetTraversal}
              disabled={isTraversing}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Tree Visualization */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Binary Tree Visualization</h3>
          
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-4 overflow-auto" style={{ minWidth: '600px', minHeight: '400px' }}>
              {tree ? (
                <svg width="100%" height="400" viewBox="0 0 600 400">
                  {renderTree(tree)}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span>No tree loaded. Use presets or insert nodes.</span>
                </div>
              )}
            </div>
          </div>

          {/* Traversal Order Display */}
          <div className="mt-6 bg-green-900/30 p-4 rounded-lg border border-green-700">
            <h4 className="text-green-400 font-bold mb-2">Traversal Order</h4>
            <div className="text-white">
              {traversalOrder.length === 0 ? (
                <span className="text-gray-400 text-sm">Start traversal to see the order</span>
              ) : (
                traversalOrder.join(' → ')
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 border border-gray-600 rounded-full"></div>
              <span className="text-gray-300">Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border border-yellow-600 rounded-full"></div>
              <span className="text-gray-300">Current Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 border border-green-600 rounded-full"></div>
              <span className="text-gray-300">Visited</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Step-by-Step Explanation</h3>
            <p className="text-gray-300 text-lg leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Traversal Methods Info */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">Tree Traversal Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
              <h4 className="text-blue-400 font-bold mb-2">In-order Traversal</h4>
              <p className="text-gray-300 text-sm">
                Left → Root → Right. For BST, visits nodes in ascending order.
              </p>
            </div>
            <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
              <h4 className="text-green-400 font-bold mb-2">Pre-order Traversal</h4>
              <p className="text-gray-300 text-sm">
                Root → Left → Right. Useful for copying/serializing trees.
              </p>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700">
              <h4 className="text-purple-400 font-bold mb-2">Post-order Traversal</h4>
              <p className="text-gray-300 text-sm">
                Left → Right → Root. Useful for deleting trees or calculating sizes.
              </p>
            </div>
            <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-700">
              <h4 className="text-orange-400 font-bold mb-2">Level-order Traversal</h4>
              <p className="text-gray-300 text-sm">
                Level by level, left to right. Uses queue (BFS approach).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;