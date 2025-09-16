import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';

const ProblemDiscussion = ({ problemId, problemTitle }) => {
  const { user } = useSelector((state) => state.auth);
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [discussions]);

  useEffect(() => {
    fetchDiscussions();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDiscussions, 5000);
    return () => clearInterval(interval);
  }, [problemId]);

  const fetchDiscussions = async () => {
    try {
      const response = await axiosClient.get(`/discussion/problem/${problemId}`);
      setDiscussions(response.data.discussions || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
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
      const response = await axiosClient.post(`/discussion/problem/${problemId}`, {
        message: newMessage.trim()
      });
      
      setDiscussions(prev => [...prev, response.data.discussion]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-3 text-base-content/70">Loading discussions...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-base-300">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-base-content">Discussion</h2>
          <p className="text-sm text-base-content/70">Share your approach and learn from others</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-base-content/60 mb-2">No discussions yet</h3>
            <p className="text-base-content/50">Be the first to share your approach or ask a question!</p>
          </div>
        ) : (
          discussions.map((discussion, index) => (
            <div key={discussion._id || index} className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                  {getInitials(discussion.user?.firstName || discussion.author?.firstName)}
                </div>
              </div>
              
              {/* Message */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-base-content text-sm">
                    {discussion.user?.firstName || discussion.author?.firstName || 'Anonymous'}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {formatTime(discussion.createdAt)}
                  </span>
                </div>
                <div className="bg-base-200 rounded-lg px-3 py-2">
                  <p className="text-sm text-base-content whitespace-pre-wrap">
                    {discussion.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-base-300 p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your approach, ask questions, or help others..."
              className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows="2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              !newMessage.trim() || sending
                ? 'bg-base-300 text-base-content/50 cursor-not-allowed'
                : 'bg-primary text-primary-content hover:bg-primary/90'
            }`}
          >
            {sending ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Send
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-base-content/60 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ProblemDiscussion;