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

function Guides() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const guides = [
    {
      id: 1,
      title: "Complete DSA Interview Preparation Roadmap",
      description: "A comprehensive 12-week study plan to master data structures and algorithms for technical interviews.",
      difficulty: "Beginner to Advanced",
      duration: "12 weeks",
      topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming"],
      icon: "🗺️",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "System Design Interview Mastery",
      description: "Learn how to approach system design questions with real-world examples and scalable architectures.",
      difficulty: "Intermediate to Advanced",
      duration: "8 weeks",
      topics: ["Scalability", "Load Balancing", "Databases", "Caching", "Microservices"],
      icon: "🏗️",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Behavioral Interview Success Guide",
      description: "Master the STAR method and learn how to present your experiences effectively in behavioral interviews.",
      difficulty: "All Levels",
      duration: "2 weeks",
      topics: ["STAR Method", "Leadership", "Conflict Resolution", "Problem Solving"],
      icon: "💬",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 4,
      title: "Coding Contest Strategy Guide",
      description: "Improve your competitive programming skills with proven strategies and time management techniques.",
      difficulty: "Intermediate",
      duration: "6 weeks",
      topics: ["Time Management", "Problem Analysis", "Implementation Speed", "Debugging"],
      icon: "🏆",
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: 5,
      title: "Big Tech Company Interview Guide",
      description: "Specific preparation strategies for interviews at Google, Amazon, Meta, Apple, and Microsoft.",
      difficulty: "Advanced",
      duration: "10 weeks",
      topics: ["Company Culture", "Specific Formats", "Salary Negotiation", "Follow-up"],
      icon: "🏢",
      color: "from-red-500 to-rose-500"
    },
    {
      id: 6,
      title: "Junior Developer Career Path",
      description: "Navigate your early career with tips on skill development, networking, and career advancement.",
      difficulty: "Beginner",
      duration: "4 weeks",
      topics: ["Skill Building", "Portfolio", "Networking", "First Job"],
      icon: "🚀",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const quickTips = [
    {
      title: "Practice Daily",
      description: "Solve at least 2-3 coding problems every day to maintain consistency.",
      icon: "📅"
    },
    {
      title: "Understand, Don't Memorize",
      description: "Focus on understanding patterns and approaches rather than memorizing solutions.",
      icon: "🧠"
    },
    {
      title: "Mock Interviews",
      description: "Practice with peers or use AI mock interviews to simulate real conditions.",
      icon: "🎭"
    },
    {
      title: "Time Management",
      description: "Learn to solve problems within time constraints typical of real interviews.",
      icon: "⏰"
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
            <button
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-indigo-400 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Study Guides
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive guides to help you master coding interviews, from beginner fundamentals to advanced system design concepts.
          </p>
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Quick Success Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTips.map((tip, index) => {
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

      {/* Guides Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Complete Study Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
            <div
              key={guide.id}
              ref={ref}
              className="enhanced-card bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-800 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer group relative flex flex-col h-full"
            >
              {/* Shine effect */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: isActive ? 1 : 0,
                  background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                }}
              />

              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${guide.color} p-6 text-white relative z-10`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{guide.icon}</span>
                  <div>
                    <div className="text-sm opacity-90">{guide.difficulty}</div>
                    <div className="text-sm opacity-90">{guide.duration}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold">{guide.title}</h3>
              </div>

              {/* Content */}
              <div className="p-6 relative z-10 flex flex-col flex-1">
                <p className="text-gray-400 mb-6">{guide.description}</p>
                
                <div className="mb-6 flex-1">
                  <h4 className="text-white font-semibold mb-3">Topics Covered:</h4>
                  <div className="flex flex-wrap gap-2">
                    {guide.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const routeMap = {
                      1: '/guides/dsa-roadmap',
                      2: '/guides/system-design-mastery',
                      3: '/guides/behavioral-interview',
                      4: '/guides/coding-contest-strategy',
                      5: '/guides/big-tech-interview',
                      6: '/guides/junior-developer-career'
                    };
                    navigate(routeMap[guide.id]);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 group-hover:bg-indigo-500 mt-auto"
                >
                  Start Guide
                </button>
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
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of developers who have successfully landed their dream jobs using our guides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/home')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate('/practice')}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Try Practice Mode
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

export default Guides;