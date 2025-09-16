import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router";

// Custom hook for detecting when elements enter the viewport
function useInView(options = { threshold: 0.1, triggerOnce: true }) {
  const [inView, setInView] = useState(false);
  const ref = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (options.triggerOnce) {
          observer.unobserve(entry.target);
        }
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, inView];
}

// Animation wrapper component
const AnimatedElement = ({
  children,
  animation = "fadeUp",
  delay = 0,
  className = "",
  ...props
}) => {
  const [ref, inView] = useInView();

  const animationStyles = {
    base: `transition-all duration-700 ease-out`,
    fadeUp: inView
      ? `opacity-100 translate-y-0`
      : `opacity-0 translate-y-10`,
    fadeIn: inView
      ? `opacity-100`
      : `opacity-0`,
    slideLeft: inView
      ? `opacity-100 translate-x-0`
      : `opacity-0 -translate-x-10`,
    slideRight: inView
      ? `opacity-100 translate-x-0`
      : `opacity-0 translate-x-10`,
    zoom: inView
      ? `opacity-100 scale-100`
      : `opacity-0 scale-95`
  };

  return (
    <div
      ref={ref}
      className={`${animationStyles.base} ${animationStyles[animation]} ${className}`}
      style={{
        transitionDelay: inView ? `${delay}ms` : '0ms',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

const Visualize = () => {
  const navigate = useNavigate();
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

  const handleBackToHome = () => navigate("/home");

  // Visualization options data
  const visualizationOptions = [
    {
      to: "/sorting-visualizer",
      icon: (
        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      title: "Sorting Algorithms",
      description: "Visualize bubble sort, merge sort, quick sort, and other sorting algorithms in action",
      buttonText: "Start Sorting",
      color: "indigo"
    },
    {
      to: "/searching-visualizer",
      icon: (
        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Searching Algorithms",
      description: "Watch linear search, binary search, and other searching techniques find elements",
      buttonText: "Start Searching",
      color: "emerald"
    },
    {
      to: "/nqueens-visualizer",
      icon: (
        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "N-Queens Problem",
      description: "Solve the classic N-Queens puzzle using backtracking algorithm visualization",
      buttonText: "Solve N-Queens",
      color: "purple"
    },
    {
      to: "/sudoku-visualizer",
      icon: (
        <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Sudoku Solver",
      description: "Watch the backtracking algorithm solve Sudoku puzzles step by step",
      buttonText: "Solve Sudoku",
      color: "amber"
    },
    {
      to: "/stack-visualizer",
      icon: (
        <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "Stack Operations",
      description: "Visualize stack data structure with push, pop, and peek operations",
      buttonText: "Explore Stack",
      color: "rose"
    },
    {
      to: "/queue-visualizer",
      icon: (
        <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Queue Operations",
      description: "Learn queue data structure through enqueue, dequeue, and front operations",
      buttonText: "Explore Queue",
      color: "cyan"
    },
    {
      to: "/graph-visualizer",
      icon: (
        <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Graph Algorithms",
      description: "Visualize BFS, DFS, Dijkstra's algorithm, and other graph traversal methods",
      buttonText: "Explore Graphs",
      color: "yellow"
    },
    {
      to: "/tree-visualizer",
      icon: (
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Tree Algorithms",
      description: "Understand binary trees, AVL trees, and tree traversal algorithms visually",
      buttonText: "Explore Trees",
      color: "green"
    }
  ];

  return (
    <div
      className="min-h-screen font-sans text-gray-200"
      style={{ 
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(59, 130, 246, 0.1) 25%,
            transparent 70%
          ),
          radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
          linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
        `
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 lg:pt-20 pb-12 sm:pb-20">
        {/* Back Button */}
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-900/50 hover:bg-indigo-500/20 border border-gray-800 hover:border-indigo-400 text-gray-300 hover:text-indigo-300 font-semibold shadow transition-all duration-300 group mb-6 sm:mb-8"
          aria-label="Back to homepage"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm sm:text-base">Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <AnimatedElement animation="fadeUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
              Algorithm Visualizer
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              Watch algorithms come to life! Interactive visualizations to help you understand 
              how different algorithms work step by step.
            </p>
          </AnimatedElement>
        </div>

        {/* Visualization Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {visualizationOptions.map((option, index) => (
            <AnimatedElement
              key={index}
              animation="fadeUp"
              delay={index * 100}
            >
              <NavLink 
                to={option.to}
                className="block"
              >
                <div className="bg-gray-900/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl group hover:border-indigo-500/30 cursor-pointer h-full">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-800/50 rounded-xl group-hover:bg-${option.color}-900/30 transition-colors flex-shrink-0`}>
                      <div className="w-8 h-8 sm:w-10 sm:h-10">
                        {option.icon}
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {option.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed text-center sm:text-left">
                    {option.description}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start text-indigo-400 text-xs sm:text-sm font-medium group-hover:text-indigo-300 transition-colors">
                    {option.buttonText}
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </NavLink>
            </AnimatedElement>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16">
          <AnimatedElement animation="fadeUp" delay={800}>
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Learn by Watching</h2>
              <p className="text-gray-400 text-lg max-w-4xl mx-auto">
                Our interactive visualizations help you understand complex algorithms by showing exactly 
                how they work. Step through each operation, control the speed, and see the data transform 
                in real-time. Perfect for students, developers, and anyone curious about computer science!
              </p>
            </div>
          </AnimatedElement>
        </div>
      </div>

      <style jsx>{`
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
        
        @keyframes borderPan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle linear infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* Enhanced hover animations */
        .visualizer-card-inner-glow {
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28),
                      box-shadow 0.6s ease;
          will-change: transform, box-shadow;
        }
        
        .visualizer-card-inner-glow:hover {
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
        
        .visualizer-card-inner-glow::before {
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
        
        .visualizer-card-inner-glow:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Visualize;
