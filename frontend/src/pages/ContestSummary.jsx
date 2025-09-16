import React from 'react';
import { useLocation, useNavigate } from 'react-router';

const ContestSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Score can be passed via location.state or query param
  const score = location.state?.score || 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fb]">
      <div className="bg-white rounded-3xl shadow-xl p-12 flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-green-600 mb-2">Contest Finished!</h1>
        <div className="text-2xl font-semibold text-blue-700">Your Score: <span className="text-4xl">{score}</span></div>
        <button
          className="mt-6 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xl font-bold shadow transition-all duration-200"
          onClick={() => navigate('/leaderboard?tab=contest')}
        >
          View Contest Leaderboard
        </button>
        <button
          className="mt-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-lg font-medium transition-all duration-200"
          onClick={() => navigate('/home')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ContestSummary; 