import React, { useEffect, useRef, useState } from 'react';
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

function Blog() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const blogPosts = [
    {
      id: 1,
      title: "Mastering Dynamic Programming: A Complete Guide",
      excerpt: "Learn the fundamentals of dynamic programming with practical examples and step-by-step solutions to common problems.",
      author: "Sarah Chen",
      date: "January 15, 2025",
      readTime: "8 min read",
      category: "Algorithms",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "Top 10 Data Structures Every Developer Should Know",
      excerpt: "Explore the most important data structures and understand when and how to use them effectively in your coding interviews.",
      author: "Mike Johnson",
      date: "January 12, 2025",
      readTime: "12 min read",
      category: "Data Structures",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Acing System Design Interviews: Real-World Examples",
      excerpt: "Break down complex system design problems with practical examples from top tech companies like Google, Amazon, and Meta.",
      author: "Alex Rodriguez",
      date: "January 10, 2025",
      readTime: "15 min read",
      category: "System Design",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Binary Trees vs Binary Search Trees: Key Differences",
      excerpt: "Understand the fundamental differences between binary trees and BSTs, with implementation examples and use cases.",
      author: "Emily Davis",
      date: "January 8, 2025",
      readTime: "6 min read",
      category: "Data Structures",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop"
    },
    {
      id: 5,
      title: "Graph Algorithms Made Simple: BFS, DFS, and Beyond",
      excerpt: "Master graph traversal algorithms with visual explanations and practical coding examples for interview success.",
      author: "David Kim",
      date: "January 5, 2025",
      readTime: "10 min read",
      category: "Algorithms",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop"
    },
    {
      id: 6,
      title: "Time and Space Complexity: Big O Notation Explained",
      excerpt: "Learn how to analyze algorithm efficiency and optimize your code for better performance in technical interviews.",
      author: "Lisa Wang",
      date: "January 3, 2025",
      readTime: "9 min read",
      category: "Fundamentals",
      image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=250&fit=crop"
    }
  ];

  const categories = ["All", "Algorithms", "Data Structures", "System Design", "Fundamentals"];
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

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
            Coding Blog
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Stay updated with the latest coding tips, algorithm explanations, and interview preparation strategies from our expert team.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
            <article
              key={post.id}
              ref={ref}
              className="enhanced-card bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-800 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer group relative"
            >
              {/* Shine effect */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: isActive ? 1 : 0,
                  background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                }}
              />
              
              <div className="aspect-video overflow-hidden relative z-10">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-sm">{post.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Our Latest Posts
          </h2>
          <p className="text-gray-400 mb-8">
            Get weekly coding tips and interview preparation strategies delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
              Subscribe
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

export default Blog;