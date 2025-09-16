import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const GraphVisualizer = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isTraversing, setIsTraversing] = useState(false);
  const [algorithm, setAlgorithm] = useState("bfs");
  const [startNode, setStartNode] = useState(0);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(-1);
  const [queue, setQueue] = useState([]);
  const [stack, setStack] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [explanation, setExplanation] = useState("");
  const [step, setStep] = useState(0);
  const [traversalOrder, setTraversalOrder] = useState([]);

  const timeoutRef = useRef(null);

  // Predefined graph structures
  const graphPresets = {
    simple: {
      nodes: [
        { id: 0, x: 200, y: 100, label: "A" },
        { id: 1, x: 100, y: 200, label: "B" },
        { id: 2, x: 300, y: 200, label: "C" },
        { id: 3, x: 50, y: 300, label: "D" },
        { id: 4, x: 150, y: 300, label: "E" },
        { id: 5, x: 250, y: 300, label: "F" },
        { id: 6, x: 350, y: 300, label: "G" }
      ],
      edges: [
        { from: 0, to: 1 }, { from: 0, to: 2 },
        { from: 1, to: 3 }, { from: 1, to: 4 },
        { from: 2, to: 5 }, { from: 2, to: 6 },
        { from: 3, to: 4 }, { from: 5, to: 6 }
      ]
    },
    complex: {
      nodes: [
        { id: 0, x: 200, y: 50, label: "A" },
        { id: 1, x: 100, y: 150, label: "B" },
        { id: 2, x: 300, y: 150, label: "C" },
        { id: 3, x: 50, y: 250, label: "D" },
        { id: 4, x: 150, y: 250, label: "E" },
        { id: 5, x: 250, y: 250, label: "F" },
        { id: 6, x: 350, y: 250, label: "G" },
        { id: 7, x: 200, y: 350, label: "H" }
      ],
      edges: [
        { from: 0, to: 1 }, { from: 0, to: 2 },
        { from: 1, to: 3 }, { from: 1, to: 4 },
        { from: 2, to: 5 }, { from: 2, to: 6 },
        { from: 3, to: 7 }, { from: 4, to: 7 },
        { from: 5, to: 7 }, { from: 6, to: 7 },
        { from: 1, to: 2 }, { from: 4, to: 5 }
      ]
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
    loadGraph("simple");
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const loadGraph = (preset) => {
    const graph = graphPresets[preset];
    setNodes(graph.nodes);
    setEdges(graph.edges);
    resetTraversal();
  };

  const resetTraversal = () => {
    setVisitedNodes([]);
    setCurrentNode(-1);
    setQueue([]);
    setStack([]);
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

  const getNeighbors = (nodeId) => {
    return edges
      .filter(edge => edge.from === nodeId || edge.to === nodeId)
      .map(edge => edge.from === nodeId ? edge.to : edge.from);
  };

  const bfsTraversal = async () => {
    setIsTraversing(true);
    setExplanation(`Starting BFS (Breadth-First Search) from node ${nodes[startNode].label}`);
    setStep(0);

    const visited = [];
    const q = [startNode];
    const order = [];
    let stepCount = 0;

    setQueue([startNode]);
    await sleep(speed);

    while (q.length > 0) {
      if (timeoutRef.current === null) break;

      const current = q.shift();
      setQueue([...q]);
      
      if (visited.includes(current)) continue;

      stepCount++;
      setStep(stepCount);
      setCurrentNode(current);
      visited.push(current);
      order.push(current);
      setVisitedNodes([...visited]);
      setTraversalOrder([...order]);

      setExplanation(`Step ${stepCount}: Visiting node ${nodes[current].label}. Queue: [${q.map(id => nodes[id].label).join(', ')}]`);
      await sleep(speed);

      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!visited.includes(neighbor) && !q.includes(neighbor)) {
          q.push(neighbor);
        }
      }
      setQueue([...q]);
      setExplanation(`Step ${stepCount}: Added neighbors of ${nodes[current].label} to queue. Queue: [${q.map(id => nodes[id].label).join(', ')}]`);
      await sleep(speed / 2);
    }

    if (timeoutRef.current !== null) {
      setCurrentNode(-1);
      setQueue([]);
      setIsTraversing(false);
      setExplanation(`🎉 BFS completed! Traversal order: ${order.map(id => nodes[id].label).join(' → ')}`);
    }
  };

  const dfsTraversal = async () => {
    setIsTraversing(true);
    setExplanation(`Starting DFS (Depth-First Search) from node ${nodes[startNode].label}`);
    setStep(0);

    const visited = [];
    const s = [startNode];
    const order = [];
    let stepCount = 0;

    setStack([startNode]);
    await sleep(speed);

    while (s.length > 0) {
      if (timeoutRef.current === null) break;

      const current = s.pop();
      setStack([...s]);
      
      if (visited.includes(current)) continue;

      stepCount++;
      setStep(stepCount);
      setCurrentNode(current);
      visited.push(current);
      order.push(current);
      setVisitedNodes([...visited]);
      setTraversalOrder([...order]);

      setExplanation(`Step ${stepCount}: Visiting node ${nodes[current].label}. Stack: [${s.map(id => nodes[id].label).join(', ')}]`);
      await sleep(speed);

      const neighbors = getNeighbors(current).reverse(); // Reverse for consistent order
      for (const neighbor of neighbors) {
        if (!visited.includes(neighbor)) {
          s.push(neighbor);
        }
      }
      setStack([...s]);
      setExplanation(`Step ${stepCount}: Added neighbors of ${nodes[current].label} to stack. Stack: [${s.map(id => nodes[id].label).join(', ')}]`);
      await sleep(speed / 2);
    }

    if (timeoutRef.current !== null) {
      setCurrentNode(-1);
      setStack([]);
      setIsTraversing(false);
      setExplanation(`🎉 DFS completed! Traversal order: ${order.map(id => nodes[id].label).join(' → ')}`);
    }
  };

  const startTraversal = () => {
    resetTraversal();
    if (algorithm === "bfs") {
      bfsTraversal();
    } else {
      dfsTraversal();
    }
  };

  const stopTraversal = () => {
    setIsTraversing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleBackToVisualize = () => navigate("/visualize");

  const getNodeColor = (nodeId) => {
    if (currentNode === nodeId) return "bg-yellow-400 border-yellow-600";
    if (visitedNodes.includes(nodeId)) return "bg-green-400 border-green-600";
    if (queue.includes(nodeId) || stack.includes(nodeId)) return "bg-blue-400 border-blue-600";
    return "bg-gray-300 border-gray-600";
  };

  const getEdgeColor = (edge) => {
    const bothVisited = visitedNodes.includes(edge.from) && visitedNodes.includes(edge.to);
    return bothVisited ? "stroke-green-500" : "stroke-gray-400";
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
            Graph Traversal Visualizer
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Explore graph traversal algorithms: BFS (Breadth-First Search) and DFS (Depth-First Search)
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isTraversing}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="bfs">BFS (Breadth-First)</option>
                <option value="dfs">DFS (Depth-First)</option>
              </select>
            </div>

            {/* Start Node */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Node</label>
              <select
                value={startNode}
                onChange={(e) => setStartNode(parseInt(e.target.value))}
                disabled={isTraversing}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>{node.label}</option>
                ))}
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
                <div>Visited: {visitedNodes.length}/{nodes.length}</div>
              </div>
            </div>
          </div>

          {/* Graph Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Graph Presets</label>
            <div className="flex gap-2">
              <button
                onClick={() => loadGraph("simple")}
                disabled={isTraversing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Simple Graph
              </button>
              <button
                onClick={() => loadGraph("complex")}
                disabled={isTraversing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Complex Graph
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={startTraversal}
              disabled={isTraversing}
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

        {/* Graph Visualization */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Graph Visualization</h3>
          
          <div className="flex justify-center">
            <div className="relative bg-white rounded-lg p-4" style={{ width: '500px', height: '400px' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 400">
                {/* Edges */}
                {edges.map((edge, index) => {
                  const fromNode = nodes.find(n => n.id === edge.from);
                  const toNode = nodes.find(n => n.id === edge.to);
                  return (
                    <line
                      key={index}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      className={`${getEdgeColor(edge)} transition-all duration-300`}
                      strokeWidth="2"
                    />
                  );
                })}
                
                {/* Nodes */}
                {nodes.map(node => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="20"
                      className={`${getNodeColor(node.id)} transition-all duration-300`}
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-black font-bold text-sm"
                    >
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Data Structure Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {algorithm === "bfs" && (
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                <h4 className="text-blue-400 font-bold mb-2">Queue (BFS)</h4>
                <div className="flex gap-2 flex-wrap">
                  {queue.length === 0 ? (
                    <span className="text-gray-400 text-sm">Empty</span>
                  ) : (
                    queue.map((nodeId, index) => (
                      <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                        {nodes[nodeId].label}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {algorithm === "dfs" && (
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700">
                <h4 className="text-purple-400 font-bold mb-2">Stack (DFS)</h4>
                <div className="flex gap-2 flex-wrap">
                  {stack.length === 0 ? (
                    <span className="text-gray-400 text-sm">Empty</span>
                  ) : (
                    stack.map((nodeId, index) => (
                      <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                        {nodes[nodeId].label}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
              <h4 className="text-green-400 font-bold mb-2">Traversal Order</h4>
              <div className="text-white">
                {traversalOrder.length === 0 ? (
                  <span className="text-gray-400 text-sm">None</span>
                ) : (
                  traversalOrder.map(nodeId => nodes[nodeId].label).join(' → ')
                )}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 border border-gray-600 rounded-full"></div>
              <span className="text-gray-300">Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 border border-blue-600 rounded-full"></div>
              <span className="text-gray-300">In Queue/Stack</span>
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
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Step-by-Step Explanation</h3>
            <p className="text-gray-300 text-lg leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphVisualizer;