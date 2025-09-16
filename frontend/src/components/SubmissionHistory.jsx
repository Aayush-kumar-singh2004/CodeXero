import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!problemId) {
        setSubmissions([]);
        setError('No problem selected');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        // Defensive: treat any non-array or empty response as no submissions
        if (Array.isArray(response.data) && response.data.length > 0) {
          setSubmissions(response.data);
          setError(null);
        } else {
          setSubmissions([]);
          setError(null); // No error, just no submissions
        }
      } catch (err) {
        setSubmissions([]);
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'wrong': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return '✓';
      case 'wrong': return '✗';
      case 'error': return '⚠';
      case 'pending': return '⏳';
      default: return '?';
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-base-content/60">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="alert alert-error">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="px-6 py-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
          <h2 className="text-2xl font-bold text-base-content flex items-center">
            <svg className="w-6 h-6 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Submission History
          </h2>
        </div>
        
        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-base-200 mb-4">
              <svg className="h-8 w-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-base-content mb-2">No submissions yet</h3>
            <p className="text-base-content/70">Be the first to submit a solution for this problem!</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-base-300">
                <thead className="bg-base-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">Runtime</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">Memory</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">Test Cases</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-base-100 divide-y divide-base-300">
                  {submissions.map((sub, index) => (
                    <tr key={sub._id} className="hover:bg-base-200 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-base-content">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          {sub.language}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sub.status)}`}>
                          <span className="mr-1">{getStatusIcon(sub.status)}</span>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content font-mono">
                        {sub.runtime}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content font-mono">
                        {formatMemory(sub.memory)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content font-mono">
                        <span className="font-medium">{sub.testCasesPassed}</span>
                        <span className="text-base-content/40">/{sub.testCasesTotal}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/60">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          View Code
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-3 bg-base-200 border-t border-base-300">
              <p className="text-sm text-base-content/60">
                Showing <span className="font-medium">{submissions.length}</span> submission{submissions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Code View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedSubmission(null)}></div>
            </div>

            <div className="inline-block align-bottom bg-base-100 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full border border-base-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Submission Details
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {selectedSubmission.language} • {formatDate(selectedSubmission.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-white/80 hover:text-white transition-colors duration-150 p-2 hover:bg-white/20 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold">{getStatusIcon(selectedSubmission.status)}</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">Status</p>
                        <p className="text-lg font-semibold text-green-900">
                          {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-800">Runtime</p>
                        <p className="text-lg font-semibold text-blue-900">{selectedSubmission.runtime}s</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-800">Memory</p>
                        <p className="text-lg font-semibold text-purple-900">{formatMemory(selectedSubmission.memory)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-800">Test Cases</p>
                        <p className="text-lg font-semibold text-orange-900">
                          {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Error Message */}
                {selectedSubmission.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error Message</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <pre className="whitespace-pre-wrap font-mono bg-red-100 p-3 rounded-lg border border-red-200">
                            {selectedSubmission.errorMessage}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Code Display */}
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
                  {/* Code Header */}
                  <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-300 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          {selectedSubmission.language}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {selectedSubmission.code.split('\n').length} lines
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Code Content */}
                  <div className="relative">
                    <div className="overflow-x-auto">
                      <pre className="p-6 text-sm text-gray-100 font-mono leading-relaxed">
                        <code className="block">
                          {selectedSubmission.code.split('\n').map((line, index) => (
                            <div key={index} className="flex group hover:bg-gray-800/50 transition-colors duration-150">
                              <span className="text-gray-500 text-xs w-12 text-right pr-4 select-none group-hover:text-gray-400">
                                {index + 1}
                              </span>
                              <span className="flex-1 pl-2">{line || ' '}</span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>
                    
                    {/* Copy Button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSubmission.code);
                        // You could add a toast notification here
                      }}
                      className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-150 opacity-0 group-hover:opacity-100"
                      title="Copy code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
                              {/* Footer */}
                <div className="bg-base-200 px-6 py-4 border-t border-base-300 flex justify-between items-center">
                  <div className="text-sm text-base-content/60">
                    Submitted on {formatDate(selectedSubmission.createdAt)}
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSubmission.code);
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;