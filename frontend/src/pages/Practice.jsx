import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router';

const practiceOptions = [
  {
    title: 'Practice DSA with AI',
    to: '/practice/dsa-with-ai',
    icon: (
      <div className="w-16 h-16 rounded-full bg-indigo-900/30 backdrop-blur-md flex items-center justify-center group-hover:bg-indigo-900/50 transition-all duration-300">
        <svg className="w-8 h-8 text-indigo-500 group-hover:text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
    ),
    desc: 'Sharpen your Data Structures & Algorithms skills with AI guidance.'
  },
  {
    title: 'Practice Behavioral with AI',
    to: '/practice/behavioral-with-ai',
    icon: (
      <div className="w-16 h-16 rounded-full bg-pink-900/30 backdrop-blur-md flex items-center justify-center group-hover:bg-pink-900/50 transition-all duration-300">
        <svg className="w-8 h-8 text-pink-500 group-hover:text-pink-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 10-8 0v3m12 0a4 4 0 01-8 0" />
        </svg>
      </div>
    ),
    desc: 'Prepare for behavioral interviews with realistic AI scenarios.'
  },
  {
    title: 'System Design Practice with AI',
    to: '/practice/system-design-with-ai',
    icon: (
      <div className="w-16 h-16 rounded-full bg-green-900/30 backdrop-blur-md flex items-center justify-center group-hover:bg-green-900/50 transition-all duration-300">
        <svg className="w-8 h-8 text-green-500 group-hover:text-green-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 01-1 1h-3m-4 4v4a1 1 0 001 1h3m10-5v4a1 1 0 01-1 1h-3" />
        </svg>
      </div>
    ),
    desc: 'Tackle system design questions with AI-powered feedback.'
  },
  {
    title: 'Mock HR + Technical Round',
    to: '/practice/mock-hr-technical',
    icon: (
      <div className="w-16 h-16 rounded-full bg-yellow-900/30 backdrop-blur-md flex items-center justify-center group-hover:bg-yellow-900/50 transition-all duration-300">
        <svg className="w-8 h-8 text-yellow-500 group-hover:text-yellow-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    ),
    desc: 'Simulate real HR and technical interviews in one go.'
  }
];

function Practice() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen text-white font-urbanist overflow-hidden relative">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(139, 92, 246, 0.3) 0%, 
              rgba(59, 130, 246, 0.2) 25%, 
              rgba(16, 185, 129, 0.1) 50%, 
              transparent 70%
            ),
            linear-gradient(135deg, 
              #0f0f23 0%, 
              #1a1a2e 25%, 
              #16213e 50%, 
              #0f0f23 75%, 
              #000000 100%
            )
          `,
        }}
      />

      {/* Interactive Floating Bubbles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const baseX = Math.random() * 100;
          const baseY = Math.random() * 100;
          
          // Calculate distance from mouse to bubble
          const distanceX = Math.abs(mousePosition.x - baseX);
          const distanceY = Math.abs(mousePosition.y - baseY);
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          // Only move if mouse is within 12% distance of the bubble
          const isNearMouse = distance < 12;
          const moveIntensity = isNearMouse ? Math.max(0, (12 - distance) / 12) : 0;
          
          const offsetX = isNearMouse ? (mousePosition.x - baseX) * 0.2 * moveIntensity : 0;
          const offsetY = isNearMouse ? (mousePosition.y - baseY) * 0.2 * moveIntensity : 0;
          
          return (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-white/15 to-indigo-400/5 backdrop-blur-sm animate-float-gentle transition-all duration-500 ease-out"
              style={{
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`,
                left: `${baseX}%`,
                top: `${baseY}%`,
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${1 + moveIntensity * 0.3})`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 3}s`,
                opacity: 0.15 + moveIntensity * 0.25,
              }}
            />
          );
        })}
      </div>

      {/* Glassmorphism Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
        >
          <svg className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-white font-semibold">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 pt-20 pb-16">
          <div className={`text-center transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative mb-8">
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
                Practice Mode
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-cyan-600/20 blur-3xl rounded-full"></div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Choose an <span className="text-indigo-400 font-semibold">AI-powered mode</span> to boost your interview preparation
            </p>
          </div>

          {/* 3D Cards Grid */}
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {practiceOptions.map((option, index) => (
                <NavLink
                  key={option.to}
                  to={option.to}
                  className={`group relative block transform transition-all duration-700 hover:scale-105 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                  style={{ 
                    animationDelay: `${index * 200}ms`,
                    perspective: '1000px'
                  }}
                >
                  {/* Card Container */}
                  <div className="relative h-80 overflow-hidden">
                    {/* Main Card */}
                    <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 group-hover:shadow-2xl">
                      {/* Inner Glow Effect */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl animate-pulse-glow"></div>
                        <div className="absolute inset-[1px] bg-gradient-to-br from-white/5 to-white/2 rounded-3xl"></div>
                      </div>
                      
                      {/* Border Light Effect */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/30 to-transparent rounded-3xl animate-border-glow"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-400/30 to-transparent rounded-3xl animate-border-glow-reverse"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                        {/* Icon Container */}
                        <div className="relative mb-6 transform group-hover:scale-110 transition-all duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative">
                            {option.icon}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-all duration-300">
                          {option.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                          {option.desc}
                        </p>

                        {/* Hover Indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex items-center gap-2 text-sm text-indigo-400 font-semibold">
                            <span>Start Practice</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* World-Class 3D Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.8;
          }
        }

        @keyframes float-gentle {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
          }
          33% { 
            transform: translateY(-8px) scale(1.05); 
          }
          66% { 
            transform: translateY(-4px) scale(0.95); 
          }
        }

        @keyframes rotate-y-12 {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(12deg); }
        }

        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4);
          }
        }

        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .rotate-y-12 {
          transform: rotateY(12deg);
        }

        .translate-z-[-50px] {
          transform: translateZ(-50px);
        }

        .translate-z-[-100px] {
          transform: translateZ(-100px);
        }

        .group:hover .rotate-y-12 {
          animation: rotate-y-12 0.5s ease-out forwards;
        }

        /* Glassmorphism Effects */
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #8b5cf6, #06b6d4);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #7c3aed, #0891b2);
        }

        /* Responsive 3D Effects */
        @media (max-width: 768px) {
          .preserve-3d {
            transform-style: flat;
          }
          
          .group:hover .rotate-y-12 {
            animation: none;
            transform: scale(1.05);
          }
        }

        /* Advanced Hover Effects */
        .card-hover-effect {
          position: relative;
          overflow: hidden;
        }

        .card-hover-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s;
        }

        .card-hover-effect:hover::before {
          left: 100%;
        }

        /* Particle System */
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: radial-gradient(circle, #8b5cf6, transparent);
          border-radius: 50%;
          pointer-events: none;
        }

        /* Text Gradient Animation */
        .text-gradient-animate {
          background: linear-gradient(
            45deg,
            #8b5cf6,
            #06b6d4,
            #10b981,
            #f59e0b,
            #ef4444,
            #8b5cf6
          );
          background-size: 300% 300%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: text-shimmer 3s ease-in-out infinite;
        }

        /* Enhanced Shadow Effects */
        .shadow-3d {
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.24),
            0 10px 20px rgba(139, 92, 246, 0.1),
            0 6px 6px rgba(139, 92, 246, 0.1);
        }

        .shadow-3d:hover {
          box-shadow: 
            0 14px 28px rgba(0, 0, 0, 0.25),
            0 10px 10px rgba(0, 0, 0, 0.22),
            0 20px 40px rgba(139, 92, 246, 0.2),
            0 12px 12px rgba(139, 92, 246, 0.2);
        }
      `}</style>
    </div>
  );
}

export default Practice;