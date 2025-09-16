import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

const Community = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      const response = await axiosClient.get(`/discussion/community?page=${pageNum}&limit=20`);
      
      if (pageNum === 1) {
        setDiscussions(response.data.discussions || []);
      } else {
        setDiscussions(prev => [...prev, ...(response.data.discussions || [])]);
      }
      
      setHasMore(response.data.discussions?.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching community discussions:', error);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await axiosClient.post('/discussion/community', {
        message: newMessage.trim()
      });
      
      setDiscussions(prev => [response.data.discussion, ...prev]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchDiscussions(page + 1);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'hard': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent"></div>
      
      {/* Back Button */}
      <div className="relative z-10 p-6">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Community Hub</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Share anything with fellow developers - tips, experiences, questions, or just chat!
          </p>
        </div>

        {/* New Message Input */}
        <div className="mb-8">
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Share with the Community</h3>
            <form onSubmit={sendMessage} className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Press Enter to send, Shift+Enter for new line
                </p>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    !newMessage.trim() || sending
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {sending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Share'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 text-center border border-gray-800">
            <div className="text-2xl font-bold text-purple-400 mb-2">{discussions.length}+</div>
            <div className="text-sm text-gray-400">Community Posts</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 text-center border border-gray-800">
            <div className="text-2xl font-bold text-indigo-400 mb-2">24/7</div>
            <div className="text-sm text-gray-400">Always Active</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 text-center border border-gray-800">
            <div className="text-2xl font-bold text-pink-400 mb-2">∞</div>
            <div className="text-sm text-gray-400">Endless Learning</div>
          </div>
        </div>

        {/* Discussions */}
        <div className="space-y-6">
          {loading && discussions.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading loading-spinner loading-lg"></div>
              <span className="ml-3 text-base-content/70">Loading discussions...</span>
            </div>
          ) : discussions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-6">Be the first to share something with the community!</p>
            </div>
          ) : (
            discussions.map((discussion) => (
              <div key={discussion._id} className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-200 hover:border-gray-700">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                      {getInitials(discussion.user?.firstName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {discussion.user?.firstName} {discussion.user?.lastName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(discussion.createdAt)}
                        </span>
                      </div>
                      {discussion.problem && (
                        <div className="flex items-center gap-2 mt-1">
                          <NavLink 
                            to={`/problem/${discussion.problem._id}`}
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            {discussion.problem.title}
                          </NavLink>
                          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(discussion.problem.difficulty)}`}>
                            {discussion.problem.difficulty}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {discussion.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {discussion.likes?.length || 0}
                    </button>
                    <button className="flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {discussion.replies?.length || 0}
                    </button>
                  </div>
                  
                  {discussion.problem && (
                    <NavLink 
                      to={`/problem/${discussion.problem._id}#discuss`}
                      className="btn btn-sm btn-outline"
                    >
                      Join Discussion
                    </NavLink>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {hasMore && discussions.length > 0 && (
          <div className="text-center mt-8">
            <button 
              onClick={loadMore}
              disabled={loading}
              className="btn btn-outline"
            >
              {loading ? (
                <>
                  <div className="loading loading-spinner loading-sm"></div>
                  Loading...
                </>
              ) : (
                'Load More Discussions'
              )}
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Join the Discussion?</h2>
          <p className="text-gray-300 mb-6">
            Start solving problems and share your approaches with the community
          </p>
          <NavLink to="/problems" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Browse Problems
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Community;