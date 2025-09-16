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

function CodingContestStrategy() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const strategies = [
    {
      title: "Pre-Contest Preparation",
      icon: "📚",
      color: "from-blue-500 to-cyan-500",
      strategies: [
        "Review common algorithms and data structures",
        "Practice typing speed and IDE shortcuts",
        "Prepare template code for common patterns",
        "Set up your development environment"
      ]
    },
    {
      title: "Contest Time Management",
      icon: "⏰",
      color: "from-green-500 to-emerald-500",
      strategies: [
        "Read all problems first (5-10 minutes)",
        "Solve problems in order of difficulty",
        "Don't spend more than 30 minutes on one problem",
        "Leave time for debugging and testing"
      ]
    },
    {
      title: "Problem Analysis Techniques",
      icon: "🔍",
      color: "from-purple-500 to-pink-500",
      strategies: [
        "Identify the problem type and constraints",
        "Look for patterns and edge cases",
        "Estimate time complexity before coding",
        "Consider multiple approaches"
      ]
    },
    {
      title: "Implementation Best Practices",
      icon: "💻",
      color: "from-orange-500 to-red-500",
      strategies: [
        "Write clean, readable code",
        "Use meaningful variable names",
        "Add comments for complex logic",
        "Test with sample inputs immediately"
      ]
    }
  ];

  const contestPlatforms = [
    {
      name: "Codeforces",
      description: "Most popular competitive programming platform with regular contests",
      difficulty: "Beginner to Expert",
      frequency: "2-3 contests per week",
      speciality: "Algorithmic problems"
    },
    {
      name: "AtCoder",
      description: "Japanese platform known for high-quality problems and clear editorials",
      difficulty: "Beginner to Advanced",
      frequency: "Weekly contests",
      speciality: "Mathematical problems"
    },
    {
      name: "CodeChef",
      description: "Indian platform with long and short contests",
      difficulty: "All levels",
      frequency: "Monthly long contests",
      speciality: "Diverse problem types"
    },
    {
      name: "TopCoder",
      description: "One of the oldest platforms with SRM (Single Round Matches)",
      difficulty: "Intermediate to Expert",
      frequency: "Weekly SRMs",
      speciality: "Algorithm competitions"
    }
  ];

  const weeklyPlan = [
    {
      week: "Week 1-2",
      focus: "Foundation Building",
      activities: [
        "Solve 20 easy problems daily",
        "Learn basic algorithms (sorting, searching)",
        "Practice implementation speed",
        "Participate in virtual contests"
      ]
    },
    {
      week: "Week 3-4",
      focus: "Pattern Recognition",
      activities: [
        "Solve 15 medium problems daily",
        "Study common problem patterns",
        "Analyze contest problems and solutions",
        "Join live contests regularly"
      ]
    },
    {
      week: "Week 5-6",
      focus: "Advanced Techniques",
      activities: [
        "Tackle hard problems",
        "Learn advanced data structures",
        "Practice under time pressure",
        "Review and optimize solutions"
      ]
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
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Coding Contest Strategy Guide
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Master competitive programming with proven strategies, time management techniques, and platform-specific tips.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-full text-sm font-medium">
              Intermediate Level
            </span>
            <span className="px-4 py-2 bg-orange-600/20 text-orange-400 rounded-full text-sm font-medium">
              6 Weeks Duration
            </span>
            <span className="px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-medium">
              Contest Ready
            </span>
          </div>
        </div>
      </div>

      {/* Core Strategies */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Core Contest Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {strategies.map((strategy, index) => {
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

                <div className={`bg-gradient-to-r ${strategy.color} p-6 text-white relative z-10`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{strategy.icon}</span>
                    <h3 className="text-xl font-bold">{strategy.title}</h3>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <ul className="space-y-3">
                    {strategy.strategies.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contest Platforms */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Popular Contest Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contestPlatforms.map((platform, index) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
              <div
                key={index}
                ref={ref}
                className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                  }}
                />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2">{platform.name}</h3>
                  <p className="text-gray-400 mb-4">{platform.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Difficulty:</span>
                      <p className="text-gray-300">{platform.difficulty}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Frequency:</span>
                      <p className="text-gray-300">{platform.frequency}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-sm rounded-full">
                      {platform.speciality}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6-Week Training Plan */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">6-Week Training Plan</h2>
        <div className="space-y-8">
          {weeklyPlan.map((week, index) => {
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

                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{week.week}</h3>
                      <p className="text-yellow-100">{week.focus}</p>
                    </div>
                    <span className="text-4xl">🎯</span>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <h4 className="text-white font-semibold mb-4">Weekly Activities</h4>
                  <ul className="space-y-3">
                    {week.activities.map((activity, activityIndex) => (
                      <li key={activityIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300">{activity}</span>
                      </li>
                    ))}
                  </ul>
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
            Ready to Dominate Coding Contests?
          </h2>
          <p className="text-gray-400 mb-8">
            Start implementing these strategies and watch your contest performance improve dramatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contest')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Join Contest
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

export default CodingContestStrategy;