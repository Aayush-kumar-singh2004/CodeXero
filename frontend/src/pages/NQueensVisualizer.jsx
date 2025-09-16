import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const NQueensVisualizer = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [boardSize, setBoardSize] = useState(8);
  const [board, setBoard] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [currentRow, setCurrentRow] = useState(-1);
  const [currentCol, setCurrentCol] = useState(-1);
  const [attackingPositions, setAttackingPositions] = useState([]);
  const [solutionFound, setSolutionFound] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [explanation, setExplanation] = useState("");
  const [step, setStep] = useState(0);
  const [backtrackCount, setBacktrackCount] = useState(0);
  const [solutionCount, setSolutionCount] = useState(0);
  const [findAllSolutions, setFindAllSolutions] = useState(false);
  const [allSolutions, setAllSolutions] = useState([]);

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
    initializeBoard();
  }, [boardSize]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    setBoard(newBoard);
    resetSolver();
  };

  const resetSolver = () => {
    setCurrentRow(-1);
    setCurrentCol(-1);
    setAttackingPositions([]);
    setSolutionFound(false);
    setIsSolving(false);
    setExplanation("");
    setStep(0);
    setBacktrackCount(0);
    setSolutionCount(0);
    setAllSolutions([]);
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

  const isAttacking = (board, row, col) => {
    const attacks = [];
    
    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) {
        attacks.push([i, col]);
      }
    }
    
    // Check diagonal (top-left to bottom-right)
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) {
        attacks.push([i, j]);
      }
    }
    
    // Check diagonal (top-right to bottom-left)
    for (let i = row - 1, j = col + 1; i >= 0 && j < boardSize; i--, j++) {
      if (board[i][j] === 1) {
        attacks.push([i, j]);
      }
    }
    
    return attacks;
  };

  const isSafe = (board, row, col) => {
    return isAttacking(board, row, col).length === 0;
  };

  const solveNQueens = async (board, row, stepCount, backtrackCount) => {
    if (timeoutRef.current === null) return false;

    if (row === boardSize) {
      // Found a solution
      setSolutionCount(prev => prev + 1);
      setSolutionFound(true);
      setExplanation(`🎉 Solution found! All ${boardSize} queens are placed safely on the board.`);
      
      if (findAllSolutions) {
        setAllSolutions(prev => [...prev, board.map(row => [...row])]);
        setExplanation(`🎉 Solution ${solutionCount + 1} found! Continuing to find more solutions...`);
        await sleep(speed * 2);
        if (timeoutRef.current === null) return false;
        
        // Continue searching for more solutions
        return false; // This will trigger backtracking to find more solutions
      }
      
      return true;
    }

    for (let col = 0; col < boardSize; col++) {
      if (timeoutRef.current === null) return false;

      stepCount++;
      setStep(stepCount);
      setCurrentRow(row);
      setCurrentCol(col);
      setExplanation(`Step ${stepCount}: Trying to place queen at position (${row}, ${col})`);

      await sleep(speed);
      if (timeoutRef.current === null) return false;

      const attacks = isAttacking(board, row, col);
      setAttackingPositions(attacks);

      if (attacks.length === 0) {
        // Safe to place queen
        board[row][col] = 1;
        setBoard([...board.map(row => [...row])]);
        setExplanation(`Step ${stepCount}: Queen placed at (${row}, ${col}) - Safe position!`);
        
        await sleep(speed);
        if (timeoutRef.current === null) return false;

        // Recursively solve for next row
        if (await solveNQueens(board, row + 1, stepCount, backtrackCount)) {
          return true;
        }

        // Backtrack
        backtrackCount++;
        setBacktrackCount(backtrackCount);
        board[row][col] = 0;
        setBoard([...board.map(row => [...row])]);
        setExplanation(`Step ${stepCount}: Backtracking from (${row}, ${col}) - No solution found in this path`);
        
        await sleep(speed);
        if (timeoutRef.current === null) return false;
      } else {
        setExplanation(`Step ${stepCount}: Cannot place queen at (${row}, ${col}) - Attacked by ${attacks.length} queen(s)`);
        await sleep(speed / 2);
        if (timeoutRef.current === null) return false;
      }
    }

    setAttackingPositions([]);
    return false;
  };

  const startSolving = async () => {
    initializeBoard();
    setIsSolving(true);
    setExplanation(`Starting N-Queens solver for ${boardSize}x${boardSize} board using backtracking algorithm`);
    setStep(0);
    setBacktrackCount(0);
    setSolutionCount(0);
    setAllSolutions([]);

    await sleep(speed);
    if (timeoutRef.current === null) return;

    const newBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    const result = await solveNQueens(newBoard, 0, 0, 0);

    if (timeoutRef.current !== null) {
      setCurrentRow(-1);
      setCurrentCol(-1);
      setAttackingPositions([]);
      setIsSolving(false);

      if (findAllSolutions) {
        setExplanation(`🎉 Search completed! Found ${allSolutions.length} solution(s) for ${boardSize}-Queens problem.`);
      } else if (!result && solutionCount === 0) {
        setExplanation(`❌ No solution exists for ${boardSize}-Queens problem.`);
      }
    }
  };

  const stopSolving = () => {
    setIsSolving(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleBackToVisualize = () => navigate("/visualize");

  const getCellColor = (row, col) => {
    const isLight = (row + col) % 2 === 0;
    const baseColor = isLight ? "bg-amber-100" : "bg-amber-800";
    
    if (currentRow === row && currentCol === col) {
      return "bg-yellow-400 border-yellow-600";
    }
    
    if (attackingPositions.some(([r, c]) => r === row && c === col)) {
      return "bg-red-400 border-red-600";
    }
    
    if (board[row] && board[row][col] === 1) {
      return "bg-emerald-400 border-emerald-600";
    }
    
    return baseColor;
  };

  const renderQueen = (row, col) => {
    if (board[row] && board[row][col] === 1) {
      return (
        <div className="flex items-center justify-center h-full">
          <svg className="w-8 h-8 text-purple-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 20h18l-2-4H5zm2.5-5L6 9l1.5-2L9 9l1.5-2L12 9l1.5-2L15 9l1.5-2L18 9l-1.5 2H16l-1-1.5L14 11h-1l-1-1.5L11 11h-1l-1-1.5L8 11H7.5z"/>
          </svg>
        </div>
      );
    }
    return null;
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
            N-Queens Problem Visualizer
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Watch the backtracking algorithm solve the classic N-Queens puzzle
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Board Size */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Board Size (N)</label>
              <select
                value={boardSize}
                onChange={(e) => setBoardSize(parseInt(e.target.value))}
                disabled={isSolving}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={4}>4x4</option>
                <option value={5}>5x5</option>
                <option value={6}>6x6</option>
                <option value={7}>7x7</option>
                <option value={8}>8x8</option>
                <option value={9}>9x9</option>
                <option value={10}>10x10</option>
              </select>
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Speed (ms)</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isSolving}
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
                <div>Backtracks: {backtrackCount}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Solutions</label>
              <div className="text-sm text-gray-400">
                <div>Found: {solutionCount}</div>
                <div>Board: {boardSize}x{boardSize}</div>
              </div>
            </div>
          </div>

          {/* Find All Solutions Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={findAllSolutions}
                onChange={(e) => setFindAllSolutions(e.target.checked)}
                disabled={isSolving}
                className="rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
              />
              Find all solutions (may take longer for larger boards)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={startSolving}
              disabled={isSolving}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {isSolving ? "Solving..." : "Start Solving"}
            </button>
            <button
              onClick={stopSolving}
              disabled={!isSolving}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Stop
            </button>
            <button
              onClick={initializeBoard}
              disabled={isSolving}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Reset Board
            </button>
          </div>
        </div>

        {/* Chess Board Visualization */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Chess Board ({boardSize}x{boardSize})</h3>
          
          <div className="flex justify-center">
            <div 
              className="grid gap-1 p-4 bg-amber-900 rounded-lg border-4 border-amber-700"
              style={{ 
                gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                maxWidth: '600px',
                aspectRatio: '1'
              }}
            >
              {Array(boardSize).fill().map((_, row) =>
                Array(boardSize).fill().map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    className={`aspect-square border-2 transition-all duration-300 relative ${getCellColor(row, col)}`}
                    style={{ minWidth: '40px', minHeight: '40px' }}
                  >
                    {renderQueen(row, col)}
                    
                    {/* Position indicator for current cell */}
                    {currentRow === row && currentCol === col && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                    
                    {/* Attack indicator */}
                    {attackingPositions.some(([r, c]) => r === row && c === col) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-100 border border-gray-400 rounded"></div>
              <span className="text-gray-300">Light Square</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-800 border border-gray-400 rounded"></div>
              <span className="text-gray-300">Dark Square</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border border-yellow-600 rounded"></div>
              <span className="text-gray-300">Current Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 border border-red-600 rounded"></div>
              <span className="text-gray-300">Under Attack</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-400 border border-emerald-600 rounded"></div>
              <span className="text-gray-300">Queen Placed</span>
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

        {/* All Solutions Display */}
        {allSolutions.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">All Solutions Found ({allSolutions.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSolutions.map((solution, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Solution {index + 1}</h4>
                  <div 
                    className="grid gap-1 bg-amber-900 rounded border-2 border-amber-700"
                    style={{ 
                      gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                      maxWidth: '200px'
                    }}
                  >
                    {solution.map((row, r) =>
                      row.map((cell, c) => (
                        <div
                          key={`${r}-${c}`}
                          className={`aspect-square ${(r + c) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800'} flex items-center justify-center`}
                          style={{ minWidth: '20px', minHeight: '20px' }}
                        >
                          {cell === 1 && (
                            <svg className="w-3 h-3 text-purple-800" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5 16L3 20h18l-2-4H5zm2.5-5L6 9l1.5-2L9 9l1.5-2L12 9l1.5-2L15 9l1.5-2L18 9l-1.5 2H16l-1-1.5L14 11h-1l-1-1.5L11 11h-1l-1-1.5L8 11H7.5z"/>
                            </svg>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NQueensVisualizer;