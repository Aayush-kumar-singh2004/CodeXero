import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import mockupImg from "./2x2.jpg";

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

// Custom hook for in-view animations
function useInView(options = { threshold: 0.1, triggerOnce: true }) {
  const [inView, setInView] = useState(false);
  const ref = useRef();

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

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    e.preventDefault();
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  const productsMenu = [
    { name: "DSA Practice", link: "/data-structures" },
    { name: "Algorithm Practice", link: "/algorithms" },
    { name: "Mock Interviewer", link: "/practice" },
    { name: "Contests", link: "/contest" },
  ];

  const solutionsMenu = [
    { name: "For Students", link: "/home" },
    { name: "For Professionals", link: "/home" },
  ];

  const resourcesMenu = [
    { name: "Blogs", link: "/blog" },
    { name: "Guides", link: "/guides" },
    { name: "FAQs", link: "/faq" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="group flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
                <svg
                  className="w-5 h-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">CodeXero</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="text-gray-300 hover:text-indigo-400 font-medium flex items-center">
                Products
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div className="absolute hidden group-hover:block bg-gray-800 rounded-lg shadow-lg py-2 w-48 z-50">
                {productsMenu.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="block px-4 py-2 text-gray-300 hover:bg-indigo-700 hover:text-white"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button className="text-gray-300 hover:text-indigo-400 font-medium flex items-center">
                Solutions
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div className="absolute hidden group-hover:block bg-gray-800 rounded-lg shadow-lg py-2 w-48 z-50">
                {solutionsMenu.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="block px-4 py-2 text-gray-300 hover:bg-indigo-700 hover:text-white"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button className="text-gray-300 hover:text-indigo-400 font-medium flex items-center">
                Resources
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div className="absolute hidden group-hover:block bg-gray-800 rounded-lg shadow-lg py-2 w-48 z-50">
                {resourcesMenu.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="block px-4 py-2 text-gray-300 hover:bg-indigo-700 hover:text-white"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <a
              href="/about"
              className="text-gray-300 hover:text-indigo-400 font-medium"
            >
              About Us
            </a>
            <a
              href="/pricing"
              className="text-gray-300 hover:text-indigo-400 font-medium"
            >
              Pricing
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/login"
              className="text-gray-300 hover:text-indigo-400 font-medium"
              onClick={handleLoginClick}
            >
              Log In
            </a>
            <button
              onClick={() => navigate("/home")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 shadow-sm hover:shadow-md"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-gray-100 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 py-2 px-4 border-t border-gray-700">
          <div className="py-2">
            <div className="relative mb-2">
              <button className="w-full text-left py-2 font-medium text-gray-300 flex justify-between items-center">
                Products
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div className="pl-4">
                {productsMenu.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="block py-2 text-gray-400 hover:text-indigo-400"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="relative mb-2">
              <button className="w-full text-left py-2 font-medium text-gray-300 flex justify-between items-center">
                Solutions
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div className="pl-4">
                {solutionsMenu.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="block py-2 text-gray-400 hover:text-indigo-400"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="relative mb-2">
              <button className="w-full text-left py-2 font-medium text-gray-300 flex justify-between items-center">
                Resources
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div className="pl-4">
                {resourcesMenu.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="block py-2 text-gray-400 hover:text-indigo-400"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <a href="/about" className="block py-2 font-medium text-gray-300">
              About Us
            </a>
            <a href="/pricing" className="block py-2 font-medium text-gray-300">
              Pricing
            </a>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <a
                href="/login"
                className="block py-2 font-medium text-gray-300"
                onClick={handleLoginClick}
              >
                Log In
              </a>
              <button
                onClick={() => navigate("/home")}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MockupImageWithTilt() {
  const [ref, position, isActive] = useElementMousePosition();
  
  const rotateX = ((position.y - 50) / 50) * 10;
  const rotateY = ((position.x - 50) / 50) * -10;

  return (
    <div className="mt-16 max-w-3xl mx-auto relative">
      {/* Floating UI Elements */}
      <div className="absolute -top-8 -left-8 z-20">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg px-4 py-2 text-green-400 text-sm font-medium animate-float-gentle">
          ✓ Problem Solved
        </div>
      </div>
      
      <div className="absolute -top-4 -right-12 z-20">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 text-sm font-medium animate-float-gentle" style={{ animationDelay: '2s' }}>
          AI Feedback
        </div>
      </div>

      <div className="absolute -bottom-6 left-8 z-20">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 text-sm font-medium animate-float-gentle" style={{ animationDelay: '4s' }}>
          Time: O(log n)
        </div>
      </div>

      <div
        ref={ref}
        className="rounded-xl overflow-hidden shadow-xl border border-gray-700 bg-gray-900 relative"
        style={{ perspective: "1200px" }}
      >
        {/* Light effect */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: isActive ? 1 : 0,
            background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 40%, transparent 80%)`,
            filter: "blur(16px)",
            transition: "opacity 0.3s, filter 0.3s",
          }}
        />
        <div
          className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl w-full h-64 md:h-80 flex items-center justify-center p-0 m-0 z-10 relative"
          style={{
            transform: isActive ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : 'rotateX(0deg) rotateY(0deg)',
            transition: "transform 0.3s cubic-bezier(.25,.8,.25,1)",
          }}
        >
          <img
            src={mockupImg}
            alt="Platform Mockup"
            className="w-full h-full object-contain rounded-xl shadow-lg m-0 p-0"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  return (
    <div
      className="pt-28 pb-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
          Master Coding with AI. Land Your Dream Job.
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
          Sharpen your problem-solving skills with tailored DSA practice,
          real-time contests, and mock interviews — all powered by our advanced
          AI.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            onClick={() => navigate("/home")}
          >
            Get Started
          </button>
          <button className="bg-gray-800 hover:bg-gray-600 text-indigo-400 border border-gray-700 font-medium py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg hover:shadow-xl"             onClick={() => navigate("/home")}
 
>
            View Features
          </button>
        </div>
      </div>
      {/* Mockup image with tilt and light effect */}
      <MockupImageWithTilt />
    </div>
  );
}

function FeaturesSection() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Practice by Data Structure",
      description: "Choose any data structure and solve curated problems.",
      path: "/data-structures",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Algorithm Focus",
      description: "Select any algorithm and practice specific problems.",
      path: "/algorithms",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Live Contests",
      description:
        "Compete with peers, climb the leaderboard, and win rewards.",
      path: "/contest",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Mock Interviewer",
      description:
        "Get real interview practice — your AI interviewer behaves just like a real DSA or System Design interviewer.",
      path: "/practice",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Performance Analytics",
      description: "Track progress, identify weaknesses, and improve.",
      path: "/profile",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Personalized Learning",
      description:
        "AI creates customized learning paths based on your skill level.",
      path: "/home",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          ></path>
        </svg>
      ),
    },
  ];

  return (
    <div
      className="py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Powerful Features to Boost Your Skills
          </h2>
          <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to prepare for technical interviews and master
            data structures & algorithms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, i) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
              <div
                key={i}
                ref={ref}
                className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl flex flex-col items-center text-center border border-gray-800 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-500/30 cursor-pointer relative overflow-hidden group"
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                  }}
                />
                
                {/* Floating elements */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(3)].map((_, idx) => (
                    <div 
                      key={idx}
                      className="absolute rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 animate-float-gentle transition-all duration-1000"
                      style={{
                        width: `${20 + idx * 15}px`,
                        height: `${20 + idx * 15}px`,
                        top: `${15 + idx * 20}%`,
                        left: `${10 + idx * 25}%`,
                        animationDelay: `${idx * 0.5}s`,
                        opacity: 0.1,
                        filter: 'blur(4px)',
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative z-10 flex flex-col items-center flex-1">
                  <div className="mb-6 p-4 rounded-full bg-gray-800/50 group-hover:bg-indigo-900/50 transition-colors z-10 relative">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 z-10 relative">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-6 z-10 relative">
                    {feature.description}
                  </p>
                  <button
                    onClick={() => navigate(feature.path)}
                    className="mt-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 group-hover:from-indigo-500 group-hover:to-purple-500 z-10 relative group-hover:scale-105 group-hover:shadow-xl overflow-hidden"
                  >
                    Learn More
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
                  </button>
                </div>
                
                {/* Animated border */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl -z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                </div>
                
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl"
                    style={{
                      maskImage: 'radial-gradient(ellipse at center, white, transparent 70%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, white, transparent 70%)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompanyScrollSection() {
  const companies = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber", 
    "Flipkart", "Zomato", "Swiggy", "Paytm", "PhonePe", "Razorpay", "Ola",
    "Tesla", "Spotify", "Adobe", "Salesforce", "Oracle", "IBM", "Intel",
    "NVIDIA", "Airbnb", "LinkedIn", "Twitter", "Snapchat", "TikTok", "ByteDance"
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Trusted by professionals at top companies
        </h3>
        <p className="text-gray-400 text-lg">
          Join thousands who've landed their dream jobs
        </p>
      </div>
      
      {/* Scrolling companies container */}
      <div className="relative">
        {/* Scrolling track */}
        <div className="flex animate-scroll-left whitespace-nowrap">
          {/* First set of companies */}
          {companies.map((company, index) => (
            <div
              key={`first-${index}`}
              className="inline-flex items-center justify-center mx-8 px-6 py-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 font-medium text-lg hover:text-white hover:border-indigo-500/50 transition-all duration-300 flex-shrink-0"
            >
              {company}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {companies.map((company, index) => (
            <div
              key={`second-${index}`}
              className="inline-flex items-center justify-center mx-8 px-6 py-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 font-medium text-lg hover:text-white hover:border-indigo-500/50 transition-all duration-300 flex-shrink-0"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CallToActionSection() {
  const navigate = useNavigate();
  return (
    <div
      className="py-20 px-4 sm:px-6 lg:px-8 text-white text-center"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Ready to Elevate Your Coding Game?
        </h2>
        <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
          Join CodeXero today and transform your interview preparation with
          cutting-edge AI tools.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            onClick={() => navigate("/home")}
          >
            Get Started
          </button>
          <button className="bg-gray-800 hover:bg-gray-600 text-indigo-400 border border-gray-700 font-medium py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => navigate("/home")}
>
            View Features
          </button>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <div
      className="py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((_, idx) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
              <div 
                key={idx}
                ref={ref}
                className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-800 text-gray-300 flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-500/30 cursor-pointer relative overflow-hidden group"
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                  }}
                />
                
                <p className="text-lg italic mb-6 relative z-10">
                  {idx === 0 
                    ? "\"CodeXero transformed my interview prep. The AI mock interviews were incredibly realistic! I landed my dream job.\"" 
                    : "\"The tailored DSA problems helped me pinpoint my weaknesses. My coding skills have never been sharper.\""}
                </p>
                <p className="font-semibold text-white mt-auto relative z-10">
                  {idx === 0 
                    ? "- Jane Doe, Software Engineer at Google" 
                    : "- John Smith, Aspiring Developer"}
                </p>
                
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl"
                    style={{
                      maskImage: 'radial-gradient(ellipse at center, white, transparent 70%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, white, transparent 70%)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PricingSection() {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePayment = async (plan, amount) => {
    if (plan === 'Free') {
      navigate('/home');
      return;
    }

    if (plan === 'Enterprise') {
      navigate('/contact');
      return;
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    try {
      // Razorpay payment integration
      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag', //y Test key - replace with your actual ke
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'CodeXero',
        description: `${plan} Plan Subscription`,
        handler: function (response) {
          // Payment successful
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // Here you would typically send the payment details to your backend
          navigate('/home');
        },
        prefill: {
          name: 'Aayush Kumar Singh',
          email: 'aayu.kumar2004@gmail.com',
          contact: '2222222222'
        },
        notes: {
          plan: plan,
          user_id: 'user_123'
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
        console.error('Payment failed:', response.error);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      // Fallback to simple modal
      setSelectedPlan({ name: plan, amount: amount });
      setShowPaymentModal(true);
    }
  };

  const handleFallbackPayment = () => {
    // Simulate payment success for demo
    alert(`Payment successful for ${selectedPlan.name} plan! Amount: ₹${selectedPlan.amount}`);
    setShowPaymentModal(false);
    navigate('/home');
  };

  return (
    <div
      className="py-20 px-4 sm:px-6 lg:px-8 text-white text-center"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Free', price: 0, originalPrice: 0 },
            { name: 'Pro', price: 3999, originalPrice: 5999 },
            { name: 'Enterprise', price: 'Custom', originalPrice: null }
          ].map((plan, idx) => {
            const [ref, position, isActive] = useElementMousePosition();
            const isPro = plan.name === 'Pro';
            
            return (
              <div 
                key={idx}
                ref={ref}
                className={`enhanced-card ${
                  isPro 
                    ? 'bg-emerald-600 border-emerald-500' 
                    : 'bg-gray-900/50 border-gray-800'
                } p-8 rounded-2xl shadow-xl border flex flex-col transform ${
                  isPro ? 'scale-105' : ''
                } transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                  isPro ? '' : 'hover:border-indigo-500/30'
                } cursor-pointer relative overflow-hidden group`}
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                  }}
                />
                
                {isPro && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-semibold mb-4 text-white">{plan.name}</h3>
                <div className="mb-2">
                  <p className={`text-5xl font-extrabold ${
                    isPro ? 'text-white' : 'text-white'
                  }`}>
                    {plan.name === 'Free' 
                      ? '₹0' 
                      : plan.name === 'Enterprise' 
                        ? 'Custom' 
                        : `₹${plan.price}`}
                    {plan.name !== 'Enterprise' && (
                      <span className={`text-lg font-medium ${
                        isPro ? 'text-emerald-200' : 'text-gray-400'
                      }`}>
                        /month
                      </span>
                    )}
                  </p>
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <p className="text-sm text-gray-400 line-through">
                      ₹{plan.originalPrice}/month
                    </p>
                  )}
                  {isPro && (
                    <p className="text-sm text-emerald-200 font-medium">
                      Save ₹{plan.originalPrice - plan.price}/month
                    </p>
                  )}
                </div>
                <p className={`mb-6 ${
                  isPro ? 'text-emerald-100' : 'text-gray-400'
                }`}>
                  {plan.name === 'Free' 
                    ? 'Basic access to practice problems and AI features.' 
                    : plan.name === 'Pro' 
                      ? 'Unlock all features for serious interview preparation.' 
                      : 'Tailored solutions for large organizations and teams.'}
                </p>
                <ul className={`text-left space-y-2 mb-8 flex-1 ${
                  isPro ? 'text-emerald-50' : 'text-gray-300'
                }`}>
                  {plan.name === 'Free' && (
                    <>
                      <li>✔️ Limited DSA practice</li>
                      <li>✔️ Basic algorithm problems</li>
                      <li>✔️ Community support</li>
                      <li>✔️ 5 AI mock interviews/month</li>
                    </>
                  )}
                  {plan.name === 'Pro' && (
                    <>
                      <li>✔️ Unlimited DSA practice</li>
                      <li>✔️ All algorithm problems</li>
                      <li>✔️ Unlimited AI mock interviews</li>
                      <li>✔️ System design practice</li>
                      <li>✔️ Priority support</li>
                      <li>✔️ Contest access</li>
                      <li>✔️ Advanced analytics</li>
                      <li>✔️ Resume review</li>
                    </>
                  )}
                  {plan.name === 'Enterprise' && (
                    <>
                      <li>✔️ Everything in Pro</li>
                      <li>✔️ Custom problem sets</li>
                      <li>✔️ Dedicated account manager</li>
                      <li>✔️ Team analytics</li>
                      <li>✔️ On-site training</li>
                      <li>✔️ API access</li>
                    </>
                  )}
                </ul>
                <button 
                  onClick={() => handlePayment(plan.name, plan.price)}
                  className={`font-medium py-3 px-6 rounded-lg transition duration-300 ${
                    isPro 
                      ? 'bg-white hover:bg-emerald-50 text-emerald-600' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {plan.name === 'Free' 
                    ? 'Start Free' 
                    : plan.name === 'Pro' 
                      ? 'Subscribe Now' 
                      : 'Contact Sales'}
                </button>
                
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl"
                    style={{
                      maskImage: 'radial-gradient(ellipse at center, white, transparent 70%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, white, transparent 70%)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fallback Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">Complete Payment</h3>
            <div className="mb-6">
              <p className="text-gray-300 mb-2">Plan: {selectedPlan?.name}</p>
              <p className="text-gray-300 mb-4">Amount: ₹{selectedPlan?.amount}</p>
              <p className="text-sm text-gray-400">
                This is a demo payment. In production, this would integrate with a real payment gateway.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleFallbackPayment}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
              >
                Complete Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommunitySection() {
  return (
    <div
      className="py-20 px-4 sm:px-6 lg:px-8 text-white text-center"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Join Our Thriving Community
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Connect with fellow coders, share insights, and get support on your
          coding journey. Our community is here to help you succeed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {['Students', 'Professionals', 'Companies'].map((type, idx) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
              <div 
                key={idx}
                ref={ref}
                className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-800 text-gray-300 flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-500/30 cursor-pointer relative overflow-hidden group"
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                  }}
                />
                
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  For {type}
                </h3>
                <p className="text-gray-400">
                  {type === 'Students' 
                    ? 'Join our community of aspiring developers and get help with your coding journey.' 
                    : type === 'Professionals' 
                      ? 'Connect with experienced developers and share your knowledge.' 
                      : 'Partner with us to provide AI-powered interview preparation for your team.'}
                </p>
                <button className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                  {type === 'Companies' ? 'Contact Us' : 'Join Community'}
                </button>
                
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl"
                    style={{
                      maskImage: 'radial-gradient(ellipse at center, white, transparent 70%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, white, transparent 70%)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="text-gray-300 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <div className="group flex items-center gap-3 mb-4">
            <div className="relative flex items-center justify-center w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
              <svg
                className="w-5 h-5 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">CodeXero</span>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CodeXer. All rights reserved.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Products</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/data-structures"
                className="hover:text-white transition-colors duration-200"
              >
                DSA Practice
              </a>
            </li>
            <li>
              <a
                href="/algorithms"
                className="hover:text-white transition-colors duration-200"
              >
                Algorithm Practice
              </a>
            </li>
            <li>
              <a
                href="/practice"
                className="hover:text-white transition-colors duration-200"
              >
                Mock Interviewer
              </a>
            </li>
            <li>
              <a
                href="/contest"
                className="hover:text-white transition-colors duration-200"
              >
                Contests
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/about');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-white transition-colors duration-200 cursor-pointer"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/pricing"
                className="hover:text-white transition-colors duration-200"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-white transition-colors duration-200"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/blog"
                className="hover:text-white transition-colors duration-200"
              >
                Blogs
              </a>
            </li>
            <li>
              <a
                href="/guides"
                className="hover:text-white transition-colors duration-200"
              >
                Guides
              </a>
            </li>
            <li>
              <a
                href="/faq"
                className="hover:text-white transition-colors duration-200"
              >
                FAQs
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function DisclaimerBar() {
  return (
    <div
      className="text-gray-500 text-xs text-center py-3 px-4 sm:px-6 lg:px-8"
    >
      <p>
        Disclaimer: This platform is for educational and practice purposes only.
        It does not guarantee job placement or specific interview outcomes. AI
        responses may vary.
      </p>
    </div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/home");
    }
  }, [isAuthenticated, loading, navigate]);
  
  return (
    <div className="min-h-screen font-['Inter'] relative overflow-hidden">
      {/* Mouse-following glow effect */}
      <div
        className="fixed inset-0 transition-all duration-1000 ease-out z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
              rgba(139, 92, 246, 0.15) 0%,
              rgba(59, 130, 246, 0.1) 25%,
              transparent 70%
            ),
            radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
            linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
          `,
        }}
      />
      
      {/* Floating bubbles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-white/15 to-indigo-400/5 backdrop-blur-sm animate-float-gentle"
            style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 3}s`,
              opacity: 0.15,
            }}
          />
        ))}
      </div>
      
      {/* Content wrapper with proper z-index */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <CompanyScrollSection />
        <FeaturesSection />
        <CallToActionSection />
        <TestimonialsSection />
        <PricingSection />
        <CommunitySection />
        <Footer />
        <DisclaimerBar />
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
        
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle linear infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
          will-change: transform;
        }
        
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