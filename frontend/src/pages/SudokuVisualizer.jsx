import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const SudokuVisualizer = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [board, setBoard] = useState([]);
  const [originalBoard, setOriginalBoard] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [currentRow, setCurrentRow] = useState(-1);
  const [currentCol, setCurrentCol] = useState(-1);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [conflictCells, setConflictCells] = useState([]);
  const [solutionFound, setSolutionFound] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [explanation, setExplanation] = useState("");
  const [step, setStep] = useState(0);
  const [backtrackCount, setBacktrackCount] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");

  const timeoutRef = useRef(null);

  // Predefined Sudoku puzzles
  const puzzles = {
    easy: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    medium: [
      [0, 0, 0, 6, 0, 0, 4, 0, 0],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 0, 0, 0, 9, 1, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 1, 8, 0, 0, 0, 3],
      [0, 0, 0, 3, 0, 6, 0, 4, 5],
      [0, 4, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 1, 0, 0]
    ],
    hard: [
      [0, 0, 0, 0, 0, 0, 6, 8, 0],
      [0, 0, 0, 0, 4, 6, 0, 0, 0],
      [7, 0, 0, 0, 0, 0, 0, 0, 9],
      [0, 5, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 6, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 4, 0, 0, 0, 0, 0, 0, 2],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 5, 2, 0, 0, 0, 0, 0]
    ]
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
    loadPuzzle();
  }, [difficulty]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const loadPuzzle = () => {
    const puzzle = puzzles[difficulty].map(row => [...row]);
    setBoard(puzzle);
    setOriginalBoard(puzzle.map(row => [...row]));
    resetSolver();
  };

  const resetSolver = () => {
    setCurrentRow(-1);
    setCurrentCol(-1);
    setCurrentNumber(0);
    setConflictCells([]);
    setSolutionFound(false);
    setIsSolving(false);
    setExplanation("");
    setStep(0);
    setBacktrackCount(0);
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

  const isValidMove = (board, row, col, num) => {
    const conflicts = [];

    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && board[row][x] === num) {
        conflicts.push([row, x]);
      }
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (x !== row && board[x][col] === num) {
        conflicts.push([x, col]);
      }
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const currentRow = startRow + i;
        const currentCol = startCol + j;
        if ((currentRow !== row || currentCol !== col) && 
            board[currentRow][currentCol] === num) {
          conflicts.push([currentRow, currentCol]);
        }
      }
    }

    return conflicts;
  };

  const findEmptyCell = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null;
  };

  const solveSudoku = async (board, stepCount, backtrackCount) => {
    if (timeoutRef.current === null) return false;

    const emptyCell = findEmptyCell(board);
    if (!emptyCell) {
      // Puzzle solved
      setSolutionFound(true);
      setExplanation("🎉 Sudoku puzzle solved successfully! All cells are filled correctly.");
      return true;
    }

    const [row, col] = emptyCell;
    setCurrentRow(row);
    setCurrentCol(col);

    for (let num = 1; num <= 9; num++) {
      if (timeoutRef.current === null) return false;

      stepCount++;
      setStep(stepCount);
      setCurrentNumber(num);
      setExplanation(`Step ${stepCount}: Trying number ${num} at position (${row + 1}, ${col + 1})`);

      await sleep(speed);
      if (timeoutRef.current === null) return false;

      const conflicts = isValidMove(board, row, col, num);
      setConflictCells(conflicts);

      if (conflicts.length === 0) {
        // Valid move
        board[row][col] = num;
        setBoard([...board.map(row => [...row])]);
        setExplanation(`Step ${stepCount}: Number ${num} placed at (${row + 1}, ${col + 1}) - Valid move!`);
        
        await sleep(speed);
        if (timeoutRef.current === null) return false;

        // Recursively solve
        if (await solveSudoku(board, stepCount, backtrackCount)) {
          return true;
        }

        // Backtrack
        backtrackCount++;
        setBacktrackCount(backtrackCount);
        board[row][col] = 0;
        setBoard([...board.map(row => [...row])]);
        setExplanation(`Step ${stepCount}: Backtracking from (${row + 1}, ${col + 1}) - No solution with ${num}`);
        
        await sleep(speed);
        if (timeoutRef.current === null) return false;
      } else {
        setExplanation(`Step ${stepCount}: Number ${num} conflicts with ${conflicts.length} cell(s) - Invalid move`);
        await sleep(speed / 2);
        if (timeoutRef.current === null) return false;
      }
    }

    setConflictCells([]);
    return false;
  };

  const startSolving = async () => {
    setIsSolving(true);
    setExplanation(`Starting Sudoku solver using backtracking algorithm (${difficulty} puzzle)`);
    setStep(0);
    setBacktrackCount(0);

    await sleep(speed);
    if (timeoutRef.current === null) return;

    const boardCopy = board.map(row => [...row]);
    const result = await solveSudoku(boardCopy, 0, 0);

    if (timeoutRef.current !== null) {
      setCurrentRow(-1);
      setCurrentCol(-1);
      setCurrentNumber(0);
      setConflictCells([]);
      setIsSolving(false);

      if (!result && !solutionFound) {
        setExplanation("❌ No solution exists for this Sudoku puzzle.");
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
    const isOriginal = originalBoard[row][col] !== 0;
    
    if (currentRow === row && currentCol === col) {
      return "bg-yellow-300 border-yellow-600 text-black";
    }
    
    if (conflictCells.some(([r, c]) => r === row && c === col)) {
      return "bg-red-300 border-red-600 text-black";
    }
    
    if (isOriginal) {
      return "bg-gray-300 border-gray-600 text-black font-bold";
    }
    
    if (board[row][col] !== 0) {
      return "bg-green-200 border-green-600 text-black";
    }
    
    return "bg-white border-gray-400 text-black";
  };

  const getBoxBorder = (row, col) => {
    let borderClass = "border-2 ";
    
    // Thick borders for 3x3 box separation
    if (row % 3 === 0) borderClass += "border-t-4 ";
    if (col % 3 === 0) borderClass += "border-l-4 ";
    if (row === 8) borderClass += "border-b-4 ";
    if (col === 8) borderClass += "border-r-4 ";
    
    return borderClass;
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
            Sudoku Solver Visualizer
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Watch the backtracking algorithm solve Sudoku puzzles step by step
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isSolving}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
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
                <option value={300}>Fast (0.3s)</option>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Current</label>
              <div className="text-sm text-gray-400">
                <div>Position: {currentRow >= 0 ? `(${currentRow + 1}, ${currentCol + 1})` : "None"}</div>
                <div>Trying: {currentNumber || "None"}</div>
              </div>
            </div>
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
              onClick={loadPuzzle}
              disabled={isSolving}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Load New Puzzle
            </button>
            <button
              onClick={resetSolver}
              disabled={isSolving}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sudoku Board Visualization */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Sudoku Board (9x9)</h3>
          
          <div className="flex justify-center">
            <div className="inline-block p-4 bg-gray-800 rounded-lg border-4 border-gray-600">
              <div className="grid grid-cols-9 gap-0">
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-12 h-12 flex items-center justify-center text-lg font-semibold
                        transition-all duration-300 relative
                        ${getCellColor(rowIndex, colIndex)}
                        ${getBoxBorder(rowIndex, colIndex)}
                      `}
                    >
                      {cell !== 0 ? cell : ""}
                      
                      {/* Current position indicator */}
                      {currentRow === rowIndex && currentCol === colIndex && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      )}
                      
                      {/* Conflict indicator */}
                      {conflictCells.some(([r, c]) => r === rowIndex && c === colIndex) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                        </div>
                      )}
                      
                      {/* Trying number indicator */}
                      {currentRow === rowIndex && currentCol === colIndex && currentNumber > 0 && cell === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-yellow-600 font-bold text-sm animate-bounce">
                            {currentNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 border border-gray-600 rounded"></div>
              <span className="text-gray-300">Original Numbers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-400 rounded"></div>
              <span className="text-gray-300">Empty Cell</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-300 border border-yellow-600 rounded"></div>
              <span className="text-gray-300">Current Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 border border-red-600 rounded"></div>
              <span className="text-gray-300">Conflict</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-600 rounded"></div>
              <span className="text-gray-300">Solved Cell</span>
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

export default SudokuVisualizer;