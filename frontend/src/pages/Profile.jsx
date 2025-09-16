import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate, useSearchParams } from 'react-router';
import axiosClient from '../utils/axiosClient';
import StreakCalendar from '../components/StreakCalendar';
import StreakStats from '../components/StreakStats';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase();
}

function getDifficultyStats(problems) {
  const stats = { easy: 0, medium: 0, hard: 0 };
  problems.forEach(problem => {
    const difficulty = problem.difficulty?.toLowerCase();
    if (stats.hasOwnProperty(difficulty)) {
      stats[difficulty]++;
    }
  });
  return stats;
}

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userStats, setUserStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    totalSubmissions: 0,
    successRate: 0,
    averageRuntime: 0,
    averageMemory: 0,
    difficultyStats: { easy: 0, medium: 0, hard: 0 },
    ranking: 0,
    contestRating: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [contestScores, setContestScores] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streakLoading, setStreakLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'solved');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        let allProblems = [];
        let solvedProblems = [];
        let submissions = [];
        let userContestScores = [];
        
        // Fetch all problems
        try {
          const allProblemsResponse = await axiosClient.get('/problem/getAllProblem');
          allProblems = allProblemsResponse.data || [];
        } catch (err) {
          console.error('Error fetching all problems:', err);
          allProblems = [];
        }
        
        // Fetch solved problems
        try {
          const solvedResponse = await axiosClient.get('/problem/problemSolvedByUser');
          solvedProblems = solvedResponse.data || [];
          setSolvedProblems(solvedProblems);
        } catch (err) {
          console.error('Error fetching solved problems:', err);
          solvedProblems = [];
          setSolvedProblems([]);
        }

        // Fetch recent submissions
        try {
          const submissionsResponse = await axiosClient.get('/submission/userSubmissions');
          submissions = submissionsResponse.data || [];
          setRecentSubmissions(submissions.slice(0, 10));
        } catch (err) {
          console.error('Error fetching submissions:', err);
          submissions = [];
          setRecentSubmissions([]);
        }

        // Fetch contest scores
        try {
          const contestResponse = await axiosClient.get('/contest-leaderboard');
          userContestScores = contestResponse.data?.leaderboard?.filter(entry => entry.userId === user._id) || [];
          setContestScores(userContestScores);
        } catch (err) {
          console.log('No contest scores found:', err.message);
          userContestScores = [];
          setContestScores([]);
        }

        // Fetch streak data
        try {
          setStreakLoading(true);
          const streakResponse = await axiosClient.get('/streak');
          setStreakData(streakResponse.data);
        } catch (err) {
          console.log('Error fetching streak data:', err.message);
          setStreakData({
            currentStreak: 0,
            longestStreak: 0,
            totalActiveDays: 0,
            lastActivityDate: null,
            calendar: []
          });
        } finally {
          setStreakLoading(false);
        }

        // Calculate statistics
        const totalSubmissions = Array.isArray(submissions) ? submissions.length : 0;
        const successfulSubmissions = Array.isArray(submissions) ? submissions.filter(sub => sub.status === 'accepted').length : 0;
        const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0;
        
        const avgRuntime = Array.isArray(submissions) && submissions.length > 0 
          ? (submissions.reduce((sum, sub) => sum + (sub.runtime || 0), 0) / submissions.length).toFixed(2)
          : 0;
        
        const avgMemory = Array.isArray(submissions) && submissions.length > 0 
          ? (submissions.reduce((sum, sub) => sum + (sub.memory || 0), 0) / submissions.length).toFixed(0)
          : 0;

        const solvedProblemsCount = Array.isArray(solvedProblems) ? solvedProblems.length : 0;
        const totalProblemsCount = Array.isArray(allProblems) ? allProblems.length : 0;
        const difficultyStats = getDifficultyStats(solvedProblems);

        // Get user's ranking from leaderboard
        let userRanking = 0;
        try {
          const leaderboardResponse = await axiosClient.get('/leaderboard');
          const leaderboard = leaderboardResponse.data?.leaderboard || [];
          const userIndex = leaderboard.findIndex(entry => entry.userId === user._id);
          userRanking = userIndex >= 0 ? userIndex + 1 : 0;
        } catch (err) {
          console.error('Error fetching leaderboard for ranking:', err);
          userRanking = 0;
        }

        setUserStats({
          totalProblems: totalProblemsCount,
          solvedProblems: solvedProblemsCount,
          totalSubmissions,
          successRate,
          averageRuntime: avgRuntime,
          averageMemory: avgMemory,
          difficultyStats,
          ranking: userRanking,
          contestRating: Array.isArray(userContestScores) && userContestScores.length > 0 ? Math.max(...userContestScores.map(s => s.score)) : 0
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserStats({
          totalProblems: 0,
          solvedProblems: 0,
          totalSubmissions: 0,
          successRate: 0,
          averageRuntime: 0,
          averageMemory: 0,
          difficultyStats: { easy: 0, medium: 0, hard: 0 },
          ranking: 0,
          contestRating: 0
        });
        setSolvedProblems([]);
        setRecentSubmissions([]);
        setContestScores([]);
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          totalActiveDays: 0,
          lastActivityDate: null,
          calendar: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-400';
      case 'wrong': return 'text-red-400';
      case 'error': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Prepare chart data
  const difficultyChartData = [
    { name: 'Easy', value: userStats.difficultyStats.easy, color: '#10b981' },
    { name: 'Medium', value: userStats.difficultyStats.medium, color: '#f59e0b' },
    { name: 'Hard', value: userStats.difficultyStats.hard, color: '#ef4444' }
  ];

  const performanceData = [
    { metric: 'Success Rate', value: userStats.successRate },
    { metric: 'Avg Runtime', value: parseFloat(userStats.averageRuntime) || 0 },
    { metric: 'Avg Memory', value: parseFloat(userStats.averageMemory) || 0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
          <p className="text-gray-400 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Profile Dashboard</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-6 py-8 border-b border-gray-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <div className="text-2xl font-bold text-white">
              {getInitials(user.firstName + ' ' + user.lastName)}
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-400 mb-4">{user.email}</p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 bg-orange-900/30 text-orange-200 rounded-full text-sm">
                {user.role === 'admin' ? '👑 Administrator' : '💻 Developer'}
              </span>
              <span className="px-3 py-1 bg-green-900/30 text-green-200 rounded-full text-sm">
                🟢 Active
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{userStats.ranking || 'N/A'}</div>
                <div className="text-sm text-gray-400">Ranking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{userStats.solvedProblems}</div>
                <div className="text-sm text-gray-400">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{userStats.successRate}%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{streakLoading ? '...' : (streakData?.currentStreak || 0)}</div>
                <div className="text-sm text-gray-400">Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Problem Progress */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Problem Solving Progress</h3>
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Problems Solved</span>
                  <span>{userStats.solvedProblems} / {userStats.totalProblems}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ 
                      width: `${userStats.totalProblems > 0 ? (userStats.solvedProblems / userStats.totalProblems) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={0}
                    >
                      {difficultyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center gap-4 mt-4">
                {difficultyChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-400">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Analytics */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Performance Analytics</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="metric" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        color: 'white'
                      }}
                      animationDuration={0}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3B82F6" 
                      animationBegin={0}
                      animationDuration={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Calendar */}
            {!streakLoading && streakData && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Activity Calendar</h3>
                <StreakCalendar data={streakData} />
              </div>
            )}
          </div>

          {/* Right Column - Stats and Activity */}
          <div className="space-y-12">
            
            {/* Statistics */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-300">Total Submissions</span>
                  <span className="font-semibold text-white">{userStats.totalSubmissions}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-300">Success Rate</span>
                  <span className="font-semibold text-green-400">{userStats.successRate}%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-300">Avg Runtime</span>
                  <span className="font-semibold text-blue-400">{userStats.averageRuntime}ms</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-300">Avg Memory</span>
                  <span className="font-semibold text-purple-400">{userStats.averageMemory}KB</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-300">Contest Rating</span>
                  <span className="font-semibold text-yellow-400">{userStats.contestRating}</span>
                </div>
              </div>
            </div>

            {/* Streak Stats */}
            {!streakLoading && streakData && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Streak Information</h3>
                <StreakStats data={streakData} />
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {Array.isArray(recentSubmissions) && recentSubmissions.slice(0, 5).map((submission, index) => (
                  <div key={index} className="py-3 border-b border-gray-700 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1">
                          {submission.problemName || `Problem ${submission.problemId}`}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatDate(submission.createdAt)}
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </div>
                    </div>
                  </div>
                ))}
                {(!Array.isArray(recentSubmissions) || recentSubmissions.length === 0) && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">No recent submissions</div>
                    <div className="text-sm text-gray-500">Start solving problems to see your activity here!</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="border-b border-gray-700 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'solved', label: 'Solved Problems', icon: '✅' },
                { id: 'submissions', label: 'All Submissions', icon: '📝' },
                { id: 'contests', label: 'Contest History', icon: '🏆' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'solved' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Solved Problems ({Array.isArray(solvedProblems) ? solvedProblems.length : 0})
                </h3>
                {(!Array.isArray(solvedProblems) || solvedProblems.length === 0) ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎯</div>
                    <div className="text-xl text-gray-400 mb-2">No problems solved yet</div>
                    <div className="text-gray-500 mb-6">Start your coding journey by solving your first problem!</div>
                    <NavLink
                      to="/problems"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                    >
                      <span>Browse Problems</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </NavLink>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(solvedProblems) && solvedProblems.map((problem, index) => (
                      <div key={index} className="py-4 border-b border-gray-700 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-white">
                                {problem.title}
                              </h4>
                              <span className={`text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              {problem.description}
                            </p>
                            {problem.tags && Array.isArray(problem.tags) && problem.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <span key={tagIndex} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                                {problem.tags.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                                    +{problem.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-6">
                            <div className="text-green-400 text-2xl">✅</div>
                            <NavLink
                              to={`/problem/${problem._id}`}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                            >
                              View
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  All Submissions ({Array.isArray(recentSubmissions) ? recentSubmissions.length : 0})
                </h3>
                {(!Array.isArray(recentSubmissions) || recentSubmissions.length === 0) ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400">No submissions yet</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(recentSubmissions) && recentSubmissions.map((submission, index) => (
                      <div key={index} className="py-4 border-b border-gray-700 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">
                              {submission.problemName || `Problem ${submission.problemId}`}
                            </h4>
                            <div className="text-sm text-gray-400 mt-1">
                              <div>Submitted: {formatDate(submission.createdAt)}</div>
                              {submission.runtime && <div>Runtime: {submission.runtime}ms</div>}
                              {submission.memory && <div>Memory: {submission.memory}KB</div>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                            <NavLink
                              to={`/problem/${submission.problemId}`}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              View
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contests' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Contest History ({Array.isArray(contestScores) ? contestScores.length : 0})
                </h3>
                {(!Array.isArray(contestScores) || contestScores.length === 0) ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">No contest participation yet</div>
                    <NavLink
                      to="/contest"
                      className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                    >
                      Join Contest
                    </NavLink>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(contestScores) && contestScores.map((contest, index) => (
                      <div key={index} className="py-4 border-b border-gray-700 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">
                              Contest #{contest.contestId}
                            </h4>
                            <div className="text-sm text-gray-400 mt-1">
                              Rank: #{contest.rank || 'N/A'} • Score: {contest.score} • {formatDate(contest.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Fix inconsistent scroll behavior */
        * {
          box-sizing: border-box;
        }
        
        html, body {
          scroll-behavior: auto !important;
          overflow-x: hidden;
          overflow-y: auto;
        }
        
        /* Disable momentum scrolling on mobile */
        body {
          -webkit-overflow-scrolling: auto;
          overscroll-behavior: none;
          scroll-snap-type: none;
        }
        
        /* Ensure consistent scroll speed */
        * {
          scroll-behavior: auto !important;
          -webkit-overflow-scrolling: auto !important;
          overscroll-behavior: none !important;
        }
        
        /* Remove any scroll snapping */
        div, section, main {
          scroll-snap-align: none !important;
          scroll-snap-type: none !important;
        }
        
        /* Disable smooth scrolling on all elements */
        *, *::before, *::after {
          scroll-behavior: auto !important;
        }
        
        /* Fix for Windows scroll wheel issues */
        body {
          scroll-behavior: auto;
          -ms-overflow-style: auto;
          scrollbar-width: auto;
        }
        
        /* Ensure no CSS transitions interfere with scrolling */
        * {
          transition: none !important;
          animation: none !important;
        }
        
        /* Custom scrollbar for consistent behavior */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #374151;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #6B7280;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>
    </div>
  );
}

export default Profile;