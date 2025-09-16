import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from '../utils/axiosClient';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/leaderboard/${userId}`);
        setUser(res.data);
      } catch (err) {
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div className="flex justify-center items-center py-20 text-lg text-base-content/70 animate-pulse">Loading user profile...</div>;
  if (error) return <div className="flex justify-center items-center py-20 text-lg text-error">{error}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-start py-10">
      <button
        onClick={() => navigate('/leaderboard')}
        className="flex items-center gap-2 px-4 py-2 mb-8 rounded-xl bg-base-200 hover:bg-primary/10 border border-base-300 hover:border-primary text-base-content hover:text-primary font-semibold shadow transition-all duration-300 group hover:shadow-lg active:scale-[98%] focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Back to leaderboard"
      >
        <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Leaderboard</span>
      </button>
      
      <div className="w-full max-w-2xl bg-base-100/80 dark:bg-base-300/80 backdrop-blur-sm rounded-3xl shadow-xl border border-base-300/50 p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary mb-2 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-0.5">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-1">
            {user.name}
          </h2>
          <p className="text-base-content/70 mb-2">User ID: {user.userId}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            { value: user.problemsSolved, label: "Problems Solved", color: "text-success" },
            { value: user.bestMemory !== null ? user.bestMemory : '-', label: "Best Memory (kB)", color: "text-accent" },
            { value: user.bestRuntime !== null ? user.bestRuntime : '-', label: "Best Runtime (ms)", color: "text-warning" },
            { value: user.recentProblems.length, label: "Recent Problems", color: "text-primary" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-base-200/70 dark:bg-base-300/70 rounded-xl p-4 flex flex-col items-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-base-300/30 animate-fade-in"
              style={{ animationDelay: `${index * 100 + 200}ms` }}
            >
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-base-content/60 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
        
        <div className="mb-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Recent Problems
          </h3>
          {user.recentProblems.length === 0 ? (
            <div className="text-base-content/40 italic">No recent problems</div>
          ) : (
            <ul className="space-y-2">
              {user.recentProblems.map((prob) => (
                <li 
                  key={prob.problemId} 
                  className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-base-content/80 bg-base-200/50 hover:bg-base-300/50 rounded-lg p-2 transition-all duration-200"
                >
                  <button
                    className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors duration-200 text-left focus:ring-2 focus:ring-primary/50 focus:outline-none rounded"
                    onClick={() => navigate(`/problem/${prob.problemId}`)}
                  >
                    {prob.problemName}
                  </button>
                  <span className="text-xs text-base-content/50">({new Date(prob.solvedAt).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '700ms' }}>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            All Accepted Submissions
          </h3>
          {user.submissions.length === 0 ? (
            <div className="text-base-content/40 italic">No accepted submissions</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-base-300/30 shadow-sm">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-base-200/80 dark:bg-base-300/80 backdrop-blur-sm text-left rounded-tl-xl">Problem</th>
                    <th className="py-3 px-4 bg-base-200/80 dark:bg-base-300/80 backdrop-blur-sm text-center rounded-tr-xl">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.submissions.map((sub, index) => (
                    <tr 
                      key={sub.problemId + sub.createdAt} 
                      className={`${index % 2 === 0 ? 'bg-base-100/50' : 'bg-base-200/30 dark:bg-base-300/20'} hover:bg-primary/10 transition-colors duration-150`}
                    >
                      <td className="py-2 px-4 border-t border-base-300/30">
                        <button
                          className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors duration-200 text-left w-full py-1 focus:ring-2 focus:ring-primary/50 focus:outline-none rounded"
                          onClick={() => navigate(`/problem/${sub.problemId}`)}
                        >
                          {sub.problemName}
                        </button>
                      </td>
                      <td className="py-2 px-4 text-center border-t border-base-300/30 text-base-content/70">
                        {new Date(sub.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;