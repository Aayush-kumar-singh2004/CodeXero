import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { Award, Medal, Star } from 'lucide-react';

const USERS_PER_PAGE = 10;

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase();
}

const Leaderboard = () => {
  const [tab, setTab] = useState('problem');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        if (tab === 'problem') {
          const res = await axios.get('/leaderboard');
          setLeaderboard(res.data.leaderboard);
        } else {
          const res = await axios.get('/contest-leaderboard');
          setLeaderboard(res.data.leaderboard);
        }
      } catch (err) {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [tab]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const totalPages = Math.ceil(leaderboard.length / USERS_PER_PAGE);
  const paginatedUsers = leaderboard.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#1e1b4b] to-[#121212]">
      <div className="animate-pulse text-lg text-indigo-300">Loading leaderboard...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#1e1b4b] to-[#121212]">
      <div className="text-lg text-rose-500">{error}</div>
    </div>
  );

  if (!loading && !error && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] to-[#121212] text-gray-200 font-urbanist">
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-500 mb-6 drop-shadow-md animate-fade-in">
            {tab === 'contest' ? '🏆 Contest Leaderboard' : 'Leaderboard'}
          </h1>
          <div className="flex gap-4 mb-8">
            <button
              className={`px-6 py-2 rounded-full font-bold text-lg border transition-all duration-200 ${
                tab === 'problem' 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' 
                  : 'bg-[#1f1f1f]/60 text-gray-300 border-gray-600 hover:bg-indigo-500/20 hover:border-indigo-400'
              }`}
              onClick={() => setTab('problem')}
            >
              Problem Leaderboard
            </button>
            <button
              className={`px-6 py-2 rounded-full font-bold text-lg border transition-all duration-200 ${
                tab === 'contest' 
                  ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-500/30' 
                  : 'bg-[#1f1f1f]/60 text-gray-300 border-gray-600 hover:bg-amber-500/20 hover:border-amber-400'
              }`}
              onClick={() => setTab('contest')}
            >
              Contest Leaderboard
            </button>
          </div>
          <div className="text-xl text-gray-400 mt-10">Currently no users on the leaderboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] to-[#121212] text-gray-200 font-urbanist">
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-500 mb-6 drop-shadow-md animate-fade-in">
          {tab === 'contest' ? '🏆 Contest Leaderboard' : 'Leaderboard'}
        </h1>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            className={`px-6 py-2 rounded-full font-bold text-lg border transition-all duration-200 ${
              tab === 'problem' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' 
                : 'bg-[#1f1f1f]/60 text-gray-300 border-gray-600 hover:bg-indigo-500/20 hover:border-indigo-400'
            }`}
            onClick={() => setTab('problem')}
          >
            Problem Leaderboard
          </button>
          <button
            className={`px-6 py-2 rounded-full font-bold text-lg border transition-all duration-200 ${
              tab === 'contest' 
                ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-500/30' 
                : 'bg-[#1f1f1f]/60 text-gray-300 border-gray-600 hover:bg-amber-500/20 hover:border-amber-400'
            }`}
            onClick={() => setTab('contest')}
          >
            Contest Leaderboard
          </button>
        </div>
        
        {/* Table Container */}
        <div className="w-full overflow-x-auto shadow-xl rounded-3xl border border-gray-700/40 bg-[#1f1f1f]/40 backdrop-blur-lg">
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead className="sticky top-0 z-10 bg-[#1f1f1f]/70 backdrop-blur-lg">
              <tr>
                <th className="py-5 px-6 font-bold text-lg uppercase tracking-wider text-indigo-300">Rank</th>
                <th className="py-5 px-6 font-bold text-lg uppercase tracking-wider text-indigo-300">User</th>
                {tab === 'problem' ? (
                  <>
                    <th className="py-5 px-6 font-bold text-lg uppercase tracking-wider text-indigo-300 text-center">Problems Solved</th>
                    <th className="py-5 px-6 font-bold text-lg uppercase tracking-wider text-indigo-300 text-center">Best Memory</th>
                    <th className="py-5 px-6 font-bold text-lg uppercase tracking-wider text-indigo-300 text-center">Best Runtime</th>
                  </>
                ) : (
                  <>
                    <th className="py-5 px-6 font-bold text-lg uppercase tracking-wider text-indigo-300 text-center">Contest Score</th>
                    <th className="py-5 px-6 font-bold text-lg uppercase tracking-wider text-indigo-300 text-center">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, idx) => {
                const globalRank = (page - 1) * USERS_PER_PAGE + idx + 1;
                return (
                  <tr
                    key={user.userId}
                    onClick={() => navigate(`/user/${user.userId}`)}
                    className={`
                      cursor-pointer transition-all duration-300 
                      hover:scale-[1.015] hover:shadow-lg hover:z-10 hover:bg-indigo-500/10
                      ${globalRank % 2 === 0 ? 'bg-[#1f1f1f]/30' : 'bg-[#1f1f1f]/10'}
                      animate-fade-in-up
                      ${globalRank === 1 ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-l-4 border-yellow-400' : ''}
                      ${globalRank === 2 ? 'bg-gradient-to-r from-gray-400/10 to-gray-400/5 border-l-4 border-gray-300' : ''}
                      ${globalRank === 3 ? 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-l-4 border-orange-400' : ''}
                    `}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="py-4 px-6 rounded-l-2xl font-bold text-xl">
                      <div className="flex items-center gap-2">
                        {globalRank === 1 && <Award className="w-6 h-6 text-yellow-400" />}
                        {globalRank === 2 && <Medal className="w-5 h-5 text-gray-300" />}
                        {globalRank === 3 && <Star className="w-5 h-5 text-orange-400" />}
                        <span className={`
                          ${globalRank === 1 ? 'text-yellow-400' : ''}
                          ${globalRank === 2 ? 'text-gray-300' : ''}
                          ${globalRank === 3 ? 'text-orange-400' : 'text-indigo-300'}
                        `}>
                          {globalRank}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 flex items-center gap-4">
                      <span className={`
                        inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg shadow-md
                        ${globalRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' : ''}
                        ${globalRank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' : ''}
                        ${globalRank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'}
                      `}>
                        {getInitials(user.name)}
                      </span>
                      <span className="font-semibold text-gray-100 text-lg hover:underline hover:text-indigo-300 transition-colors">
                        {user.name}
                      </span>
                    </td>
                    {tab === 'problem' ? (
                      <>
                        <td className="py-4 px-6 text-center text-emerald-400 font-bold text-lg">{user.problemsSolved}</td>
                        <td className="py-4 px-6 text-center text-cyan-300 text-lg">{user.bestMemory !== null ? `${user.bestMemory} kB` : '-'}</td>
                        <td className="py-4 px-6 text-center text-cyan-300 text-lg rounded-r-2xl">{user.bestRuntime !== null ? `${user.bestRuntime} ms` : '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-6 text-center text-amber-400 font-bold text-lg">{user.score}</td>
                        <td className="py-4 px-6 text-center text-cyan-300 text-lg rounded-r-2xl">{user.date ? new Date(user.date).toLocaleDateString() : '-'}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 pt-10">
          <button
            className="px-4 py-2 rounded-full border border-gray-600 bg-[#1f1f1f]/60 text-gray-300 font-semibold hover:bg-indigo-500/20 hover:border-indigo-400 transition-all duration-200 disabled:opacity-40"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`
                w-10 h-10 rounded-full mx-1 font-bold text-lg border transition-all duration-200
                ${page === i + 1 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' 
                  : 'bg-[#1f1f1f]/60 text-gray-300 border-gray-600 hover:bg-indigo-500/20 hover:border-indigo-400'
                }
              `}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            className="px-4 py-2 rounded-full border border-gray-600 bg-[#1f1f1f]/60 text-gray-300 font-semibold hover:bg-indigo-500/20 hover:border-indigo-400 transition-all duration-200 disabled:opacity-40"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;