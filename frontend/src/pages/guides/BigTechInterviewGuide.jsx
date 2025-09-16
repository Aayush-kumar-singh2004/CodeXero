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

function BigTechInterviewGuide() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const companies = [
    {
      name: "Google",
      logo: "🔍",
      color: "from-blue-500 to-green-500",
      focus: "Algorithm design and problem-solving",
      rounds: ["Phone Screen", "Technical Interviews (4-5)", "Hiring Committee"],
      tips: [
        "Focus on clean, efficient code",
        "Explain your thought process clearly",
        "Practice system design for senior roles",
        "Prepare for Googleyness questions"
      ],
      commonQuestions: [
        "Two Sum variations",
        "Tree traversal problems",
        "Dynamic programming",
        "System design (senior)"
      ]
    },
    {
      name: "Amazon",
      logo: "📦",
      color: "from-orange-500 to-yellow-500",
      focus: "Leadership principles and scalability",
      rounds: ["Online Assessment", "Phone Screen", "On-site (4-5 rounds)"],
      tips: [
        "Know the 16 Leadership Principles",
        "Prepare STAR method examples",
        "Focus on scalable solutions",
        "Practice behavioral questions extensively"
      ],
      commonQuestions: [
        "Array and string problems",
        "Graph algorithms",
        "Design scalable systems",
        "Leadership scenarios"
      ]
    },
    {
      name: "Meta (Facebook)",
      logo: "👥",
      color: "from-blue-600 to-purple-600",
      focus: "Product thinking and user impact",
      rounds: ["Recruiter Screen", "Technical Phone", "On-site (4-5 rounds)"],
      tips: [
        "Think about user impact",
        "Practice product design questions",
        "Focus on communication skills",
        "Prepare for culture fit questions"
      ],
      commonQuestions: [
        "Graph and tree problems",
        "Product design questions",
        "Behavioral interviews",
        "System architecture"
      ]
    },
    {
      name: "Apple",
      logo: "🍎",
      color: "from-gray-600 to-gray-800",
      focus: "Attention to detail and innovation",
      rounds: ["Phone Screen", "Technical Interviews", "Design Review"],
      tips: [
        "Focus on code quality and edge cases",
        "Prepare for hardware-software integration",
        "Practice low-level programming",
        "Show passion for Apple products"
      ],
      commonQuestions: [
        "Low-level programming",
        "Memory management",
        "Algorithm optimization",
        "Product design thinking"
      ]
    },
    {
      name: "Microsoft",
      logo: "🪟",
      color: "from-blue-500 to-cyan-500",
      focus: "Collaboration and technical depth",
      rounds: ["Phone Screen", "Virtual On-site (4-5 rounds)"],
      tips: [
        "Emphasize collaboration skills",
        "Prepare for technical depth questions",
        "Practice system design thoroughly",
        "Show growth mindset"
      ],
      commonQuestions: [
        "Data structures and algorithms",
        "System design problems",
        "Behavioral questions",
        "Technical deep dives"
      ]
    }
  ];

  const preparationPhases = [
    {
      phase: "Phase 1: Foundation (Weeks 1-3)",
      focus: "Core Skills Development",
      activities: [
        "Master fundamental data structures",
        "Practice 50+ easy-medium problems",
        "Learn time/space complexity analysis",
        "Build coding interview templates"
      ]
    },
    {
      phase: "Phase 2: Company Research (Weeks 4-5)",
      focus: "Company-Specific Preparation",
      activities: [
        "Research target company culture",
        "Study company-specific interview formats",
        "Practice company-tagged problems",
        "Prepare behavioral stories using STAR method"
      ]
    },
    {
      phase: "Phase 3: Advanced Topics (Weeks 6-8)",
      focus: "System Design & Leadership",
      activities: [
        "Learn system design fundamentals",
        "Practice designing scalable systems",
        "Prepare leadership and behavioral examples",
        "Mock interviews with peers"
      ]
    },
    {
      phase: "Phase 4: Final Preparation (Weeks 9-10)",
      focus: "Interview Simulation",
      activities: [
        "Daily mock interviews",
        "Review and optimize solutions",
        "Prepare questions to ask interviewers",
        "Practice salary negotiation"
      ]
    }
  ];

  const negotiationTips = [
    {
      title: "Research Market Rates",
      description: "Use sites like levels.fyi, Glassdoor, and Blind to understand compensation ranges",
      icon: "📊"
    },
    {
      title: "Consider Total Compensation",
      description: "Look beyond base salary - include stock, bonus, benefits, and growth opportunities",
      icon: "💰"
    },
    {
      title: "Negotiate Multiple Offers",
      description: "Having competing offers significantly strengthens your negotiating position",
      icon: "⚖️"
    },
    {
      title: "Be Professional",
      description: "Maintain positive relationships throughout the negotiation process",
      icon: "🤝"
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
          <div className="text-6xl mb-6">🏢</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Big Tech Company Interview Guide
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Master the interview process at Google, Amazon, Meta, Apple, and Microsoft with company-specific strategies and insider tips.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-medium">
              Advanced Level
            </span>
            <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
              10 Weeks Duration
            </span>
            <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
              FAANG Ready
            </span>
          </div>
        </div>
      </div>

      {/* Company-Specific Guides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Company-Specific Interview Guides</h2>
        <div className="space-y-8">
          {companies.map((company, index) => {
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

                <div className={`bg-gradient-to-r ${company.color} p-6 text-white relative z-10`}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{company.logo}</span>
                    <div>
                      <h3 className="text-2xl font-bold">{company.name}</h3>
                      <p className="text-white/90">{company.focus}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-3">Interview Process</h4>
                      <ul className="space-y-2">
                        {company.rounds.map((round, roundIndex) => (
                          <li key={roundIndex} className="flex items-center text-gray-300">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                            {round}
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="text-white font-semibold mb-3 mt-6">Success Tips</h4>
                      <ul className="space-y-2">
                        {company.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start text-gray-300">
                            <svg className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-3">Common Question Types</h4>
                      <div className="space-y-2">
                        {company.commonQuestions.map((question, questionIndex) => (
                          <span
                            key={questionIndex}
                            className="inline-block px-3 py-1 bg-indigo-600/20 text-indigo-400 text-sm rounded-full mr-2 mb-2"
                          >
                            {question}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10-Week Preparation Plan */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">10-Week Preparation Timeline</h2>
        <div className="space-y-8">
          {preparationPhases.map((phase, index) => {
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

                <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-white relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{phase.phase}</h3>
                      <p className="text-red-100">{phase.focus}</p>
                    </div>
                    <span className="text-4xl">🎯</span>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <h4 className="text-white font-semibold mb-4">Key Activities</h4>
                  <ul className="space-y-3">
                    {phase.activities.map((activity, activityIndex) => (
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

      {/* Salary Negotiation Tips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Salary Negotiation Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {negotiationTips.map((tip, index) => {
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

      {/* CTA Section */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Land Your Dream Job at Big Tech?
          </h2>
          <p className="text-gray-400 mb-8">
            Start your structured preparation today and join thousands of engineers at top tech companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/practice')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Start Mock Interviews
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

export default BigTechInterviewGuide;