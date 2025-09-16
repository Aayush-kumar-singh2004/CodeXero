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

function JuniorDeveloperCareer() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const careerStages = [
    {
      stage: "Week 1: Foundation Assessment",
      title: "Know Where You Stand",
      color: "from-blue-500 to-cyan-500",
      activities: [
        "Assess your current technical skills",
        "Identify knowledge gaps in core technologies",
        "Set realistic short-term and long-term goals",
        "Create a learning schedule that fits your lifestyle"
      ],
      deliverables: [
        "Skills assessment report",
        "Personal development plan",
        "Learning schedule"
      ]
    },
    {
      stage: "Week 2: Portfolio Development",
      title: "Build Your Digital Presence",
      color: "from-green-500 to-emerald-500",
      activities: [
        "Create/update your GitHub profile",
        "Build 2-3 showcase projects",
        "Write clear README files and documentation",
        "Deploy projects to live hosting platforms"
      ],
      deliverables: [
        "Professional GitHub profile",
        "3 deployed projects",
        "Personal portfolio website"
      ]
    },
    {
      stage: "Week 3: Networking & Community",
      title: "Connect with the Developer Community",
      color: "from-purple-500 to-pink-500",
      activities: [
        "Join developer communities (Discord, Reddit, Stack Overflow)",
        "Attend local meetups or virtual events",
        "Start contributing to open source projects",
        "Build your LinkedIn and Twitter presence"
      ],
      deliverables: [
        "Active community memberships",
        "First open source contribution",
        "Professional social media profiles"
      ]
    },
    {
      stage: "Week 4: Job Search Strategy",
      title: "Land Your First Developer Role",
      color: "from-orange-500 to-red-500",
      activities: [
        "Optimize your resume for ATS systems",
        "Practice coding interviews and technical questions",
        "Apply to entry-level positions and internships",
        "Prepare for behavioral interviews"
      ],
      deliverables: [
        "ATS-optimized resume",
        "Interview preparation materials",
        "Job applications submitted"
      ]
    }
  ];

  const skillCategories = [
    {
      category: "Technical Skills",
      icon: "💻",
      skills: [
        {
          skill: "Programming Languages",
          description: "Master at least one language deeply (JavaScript, Python, Java, etc.)",
          priority: "High"
        },
        {
          skill: "Version Control (Git)",
          description: "Essential for collaboration and code management",
          priority: "High"
        },
        {
          skill: "Web Development",
          description: "HTML, CSS, and a modern framework (React, Vue, Angular)",
          priority: "High"
        },
        {
          skill: "Database Basics",
          description: "SQL fundamentals and basic database design",
          priority: "Medium"
        },
        {
          skill: "Testing",
          description: "Unit testing and basic testing frameworks",
          priority: "Medium"
        }
      ]
    },
    {
      category: "Soft Skills",
      icon: "🤝",
      skills: [
        {
          skill: "Communication",
          description: "Explain technical concepts clearly to different audiences",
          priority: "High"
        },
        {
          skill: "Problem Solving",
          description: "Break down complex problems into manageable pieces",
          priority: "High"
        },
        {
          skill: "Continuous Learning",
          description: "Stay updated with new technologies and best practices",
          priority: "High"
        },
        {
          skill: "Collaboration",
          description: "Work effectively in team environments",
          priority: "Medium"
        },
        {
          skill: "Time Management",
          description: "Balance learning, projects, and job search effectively",
          priority: "Medium"
        }
      ]
    }
  ];

  const portfolioProjects = [
    {
      type: "Full-Stack Web Application",
      description: "A complete web app with frontend, backend, and database",
      technologies: ["React/Vue", "Node.js/Python", "Database", "Deployment"],
      examples: ["Todo app with user auth", "Blog platform", "E-commerce site"]
    },
    {
      type: "API Integration Project",
      description: "Demonstrate ability to work with external APIs",
      technologies: ["REST APIs", "Authentication", "Data visualization"],
      examples: ["Weather dashboard", "Movie search app", "Social media aggregator"]
    },
    {
      type: "Mobile or Desktop Application",
      description: "Show versatility beyond web development",
      technologies: ["React Native", "Flutter", "Electron"],
      examples: ["Mobile game", "Desktop productivity tool", "Cross-platform app"]
    }
  ];

  const networkingTips = [
    {
      platform: "LinkedIn",
      strategy: "Professional networking and industry insights",
      actions: [
        "Connect with developers in your target companies",
        "Share your learning journey and projects",
        "Comment thoughtfully on industry posts",
        "Join relevant LinkedIn groups"
      ]
    },
    {
      platform: "Twitter/X",
      strategy: "Engage with the developer community",
      actions: [
        "Follow influential developers and companies",
        "Share your coding progress (#100DaysOfCode)",
        "Participate in tech discussions",
        "Tweet about your projects and learnings"
      ]
    },
    {
      platform: "GitHub",
      strategy: "Showcase your code and contribute to projects",
      actions: [
        "Maintain an active contribution graph",
        "Contribute to open source projects",
        "Star and fork interesting repositories",
        "Write detailed commit messages"
      ]
    },
    {
      platform: "Local Meetups",
      strategy: "Build real-world connections",
      actions: [
        "Attend regular meetups in your area",
        "Volunteer to help organize events",
        "Give lightning talks about your projects",
        "Exchange contacts and follow up"
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
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Junior Developer Career Path
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Navigate your early career with confidence. Learn essential skills, build an impressive portfolio, and land your first developer job.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-full text-sm font-medium">
              Beginner Friendly
            </span>
            <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
              4 Weeks Duration
            </span>
            <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
              Career Focused
            </span>
          </div>
        </div>
      </div>

      {/* 4-Week Career Plan */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">4-Week Career Launch Plan</h2>
        <div className="space-y-8">
          {careerStages.map((stage, index) => {
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

                <div className={`bg-gradient-to-r ${stage.color} p-6 text-white relative z-10`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{stage.stage}</h3>
                      <p className="text-white/90">{stage.title}</p>
                    </div>
                    <span className="text-4xl">🎯</span>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-4">Weekly Activities</h4>
                      <ul className="space-y-3">
                        {stage.activities.map((activity, activityIndex) => (
                          <li key={activityIndex} className="flex items-start">
                            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-4">Deliverables</h4>
                      <ul className="space-y-2">
                        {stage.deliverables.map((deliverable, deliverableIndex) => (
                          <li key={deliverableIndex} className="flex items-center">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                            <span className="text-gray-300">{deliverable}</span>
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

      {/* Essential Skills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Essential Skills for Junior Developers</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => {
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

                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <h3 className="text-xl font-bold">{category.category}</h3>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <div className="space-y-4">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="border-l-2 border-indigo-500 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-medium">{skill.skill}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            skill.priority === 'High' 
                              ? 'bg-red-600/20 text-red-400' 
                              : 'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {skill.priority}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Portfolio Projects */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Portfolio Project Ideas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portfolioProjects.map((project, index) => {
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
                  <h3 className="text-xl font-bold text-white mb-3">{project.type}</h3>
                  <p className="text-gray-400 mb-4">{project.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-indigo-600/20 text-indigo-400 text-sm rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {project.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-gray-300 text-sm">
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Networking Strategies */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Networking & Community Building</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {networkingTips.map((tip, index) => {
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
                  <h3 className="text-xl font-bold text-white mb-2">{tip.platform}</h3>
                  <p className="text-gray-400 mb-4">{tip.strategy}</p>
                  
                  <h4 className="text-white font-medium mb-3">Action Items:</h4>
                  <ul className="space-y-2">
                    {tip.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start">
                        <svg className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300 text-sm">{action}</span>
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
            Ready to Launch Your Developer Career?
          </h2>
          <p className="text-gray-400 mb-8">
            Take the first step towards becoming a professional developer. Your journey starts now!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/home')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Start Building
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

export default JuniorDeveloperCareer;