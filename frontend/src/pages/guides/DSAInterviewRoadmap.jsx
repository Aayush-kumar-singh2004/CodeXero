import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

// Custom hook for mouse tracking
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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
  
  return mousePosition;
}

// Custom hook for element mouse position tracking
function useElementMousePosition() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    };

    const handleMouseEnter = () => {
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, position, isActive];
}

function DSAInterviewRoadmap() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const roadmapWeeks = [
    {
      week: "Week 1-2",
      title: "Arrays & Strings Fundamentals",
      topics: ["Two Pointers", "Sliding Window", "String Manipulation", "Array Traversal"],
      problems: ["Two Sum", "Valid Palindrome", "Longest Substring Without Repeating Characters", "Maximum Subarray"],
      difficulty: "Easy to Medium"
    },
    {
      week: "Week 3-4",
      title: "Linked Lists & Stacks/Queues",
      topics: ["Linked List Operations", "Stack Applications", "Queue Implementation", "Deque Usage"],
      problems: ["Reverse Linked List", "Valid Parentheses", "Implement Queue using Stacks", "LRU Cache"],
      difficulty: "Easy to Medium"
    },
    {
      week: "Week 5-6",
      title: "Trees & Binary Search Trees",
      topics: ["Tree Traversal", "BST Properties", "Tree Construction", "Path Problems"],
      problems: ["Binary Tree Inorder Traversal", "Validate BST", "Lowest Common Ancestor", "Path Sum"],
      difficulty: "Medium"
    },
    {
      week: "Week 7-8",
      title: "Graphs & Advanced Trees",
      topics: ["BFS/DFS", "Topological Sort", "Union Find", "Trie Implementation"],
      problems: ["Number of Islands", "Course Schedule", "Word Search II", "Serialize Binary Tree"],
      difficulty: "Medium to Hard"
    },
    {
      week: "Week 9-10",
      title: "Dynamic Programming",
      topics: ["1D DP", "2D DP", "Optimization Problems", "State Machines"],
      problems: ["Climbing Stairs", "Coin Change", "Longest Increasing Subsequence", "Edit Distance"],
      difficulty: "Medium to Hard"
    },
    {
      week: "Week 11-12",
      title: "Advanced Topics & Mock Interviews",
      topics: ["Backtracking", "Greedy Algorithms", "Advanced Graph", "System Design Basics"],
      problems: ["N-Queens", "Meeting Rooms II", "Alien Dictionary", "Design Twitter"],
      difficulty: "Hard"
    }
  ];

  const studyTips = [
    {
      title: "Consistency is Key",
      description: "Dedicate 2-3 hours daily to problem solving. Regular practice is more effective than cramming.",
      icon: "⏰"
    },
    {
      title: "Understand Patterns",
      description: "Focus on recognizing problem patterns rather than memorizing individual solutions.",
      icon: "🧩"
    },
    {
      title: "Practice Explaining",
      description: "Always explain your approach out loud. This prepares you for actual interviews.",
      icon: "🗣️"
    },
    {
      title: "Time Yourself",
      description: "Practice solving problems within 20-30 minutes to simulate interview conditions.",
      icon: "⏱️"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-gray-900/80 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="group flex items-center gap-3"
              >
                <div className="relative flex items-center justify-center w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">CodeXero</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/guides')}
                className="text-gray-300 hover:text-indigo-400 font-medium"
              >
                ← Back to Guides
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🗺️</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Complete DSA Interview Preparation Roadmap
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            A comprehensive 12-week study plan to master data structures and algorithms for technical interviews at top tech companies.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
              Beginner to Advanced
            </span>
            <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
              12 Weeks Duration
            </span>
            <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
              150+ Problems
            </span>
          </div>
        </div>
      </div>

      {/* Study Tips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Study Tips for Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studyTips.map((tip, index) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
              <div
                key={index}
                ref={ref}
                className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800 text-center hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                  }}
                />
                
                <div className="text-3xl mb-3 relative z-10">{tip.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 relative z-10">{tip.title}</h3>
                <p className="text-gray-400 text-sm relative z-10">{tip.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Roadmap */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">12-Week Study Plan</h2>
        <div className="space-y-8">
          {roadmapWeeks.map((week, index) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
              <div
                key={index}
                ref={ref}
                className="enhanced-card bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 relative"
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                  }}
                />

                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{week.week}</h3>
                      <p className="text-blue-100">{week.title}</p>
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {week.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-3">Key Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {week.topics.map((topic, topicIndex) => (
                          <span
                            key={topicIndex}
                            className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-sm rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-3">Practice Problems</h4>
                      <ul className="space-y-2">
                        {week.problems.map((problem, problemIndex) => (
                          <li key={problemIndex} className="flex items-center text-gray-300">
                            <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {problem}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your DSA Journey?
          </h2>
          <p className="text-gray-400 mb-8">
            Begin your structured preparation today and land your dream job at a top tech company.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/home')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Start Practicing
            </button>
            <button 
              onClick={() => navigate('/guides')}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              View All Guides
            </button>
          </div>
        </div>
      </div>

      {/* Background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(124, 58, 237, 0.15) 0%, transparent 50%)`,
        }}
      />

      <style jsx>{`
        /* Enhanced card animations */
        .enhanced-card {
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28),
                      box-shadow 0.6s ease;
          will-change: transform, box-shadow;
        }
        
        .enhanced-card:hover {
          transform: 
            translateY(-8px) 
            rotateX(3deg) 
            rotateY(2deg)
            scale(1.02);
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 30px 5px rgba(124, 58, 237, 0.1);
        }
        
        .enhanced-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.2));
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .enhanced-card:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

export default DSAInterviewRoadmap;