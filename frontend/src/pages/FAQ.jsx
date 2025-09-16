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

function FAQ() {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);
  const mousePosition = useMousePosition();

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          id: 1,
          question: "How do I create an account on CodeXero?",
          answer: "Simply click the 'Get Started' button on our homepage and follow the registration process. You can sign up with your email or use social login options like Google, GitHub, or Microsoft."
        },
        {
          id: 2,
          question: "Is CodeXero free to use?",
          answer: "CodeXero offers both free and premium features. You can access basic problem solving, some practice sessions, and limited AI interactions for free. Premium features include unlimited AI mock interviews, advanced analytics, and priority support."
        },
        {
          id: 3,
          question: "What programming languages are supported?",
          answer: "We support all major programming languages including Python, Java, C++, JavaScript, C#, Go, Rust, and many more. Our code execution environment uses Judge0 API for reliable testing."
        }
      ]
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          id: 4,
          question: "How does the AI mock interviewer work?",
          answer: "Our AI mock interviewer uses Google's Gemini AI to simulate real interview scenarios. It can conduct DSA interviews, system design discussions, and behavioral interviews. The AI adapts to your responses and provides personalized feedback."
        },
        {
          id: 5,
          question: "Can I track my progress over time?",
          answer: "Yes! Your profile includes detailed analytics showing your problem-solving progress, strengths, weaknesses, and improvement areas. You can see your performance across different topics and difficulty levels."
        },
        {
          id: 6,
          question: "How are problems categorized and organized?",
          answer: "Problems are organized by data structures (Arrays, Trees, Graphs, etc.) and algorithms (Sorting, Searching, Dynamic Programming, etc.). Each problem has difficulty levels and tags to help you find relevant practice material."
        },
        {
          id: 7,
          question: "What makes CodeXero different from other coding platforms?",
          answer: "CodeXero combines traditional problem solving with AI-powered personalized learning. Our unique features include AI mock interviews, real-time feedback, personalized learning paths, and comprehensive system design practice."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          id: 8,
          question: "My code is not running properly. What should I do?",
          answer: "First, check for syntax errors and ensure your code follows the expected input/output format. If the issue persists, try refreshing the page or switching browsers. Contact our support team if problems continue."
        },
        {
          id: 9,
          question: "How do I report a bug or issue?",
          answer: "You can report bugs through our contact form or email us directly. Please include details about the issue, your browser, and steps to reproduce the problem. We typically respond within 24 hours."
        },
        {
          id: 10,
          question: "Can I use CodeXero on mobile devices?",
          answer: "While CodeXero is optimized for desktop use due to the coding environment, you can access most features on tablets and mobile devices. For the best coding experience, we recommend using a desktop or laptop."
        }
      ]
    },
    {
      category: "Account & Billing",
      questions: [
        {
          id: 11,
          question: "How do I upgrade to premium?",
          answer: "Click on the 'Upgrade' button in your profile or visit our pricing page. We offer monthly and annual subscription options with different feature tiers to suit your needs."
        },
        {
          id: 12,
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access to premium features until the end of your current billing period."
        },
        {
          id: 13,
          question: "Do you offer student discounts?",
          answer: "Yes! We offer a 50% student discount for verified students. Contact our support team with your student ID or .edu email address to apply for the discount."
        }
      ]
    },
    {
      category: "Learning & Practice",
      questions: [
        {
          id: 14,
          question: "How should I structure my practice sessions?",
          answer: "We recommend starting with easier problems in your weak areas, then gradually increasing difficulty. Use our AI tutor for guidance, and don't forget to practice mock interviews regularly. Consistency is key!"
        },
        {
          id: 15,
          question: "How long should I prepare for technical interviews?",
          answer: "Preparation time varies by experience level. Beginners typically need 3-6 months of consistent practice, while experienced developers might need 1-3 months. Our personalized learning paths can help optimize your preparation time."
        },
        {
          id: 16,
          question: "Can I practice system design even as a junior developer?",
          answer: "Absolutely! Our system design practice starts with fundamentals and gradually builds complexity. The AI tutor adapts to your level and helps you understand concepts step by step."
        }
      ]
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

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
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about CodeXero's features, functionality, and how to get the most out of your coding interview preparation.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for answers..."
            className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <svg
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                {categoryIndex + 1}
              </span>
              {category.category}
            </h2>
            
            <div className="space-y-4">
              {category.questions.map((faq) => {
                const [ref, position, isActive] = useElementMousePosition();
                
                return (
                <div
                  key={faq.id}
                  ref={ref}
                  className="enhanced-card bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 relative"
                >
                  {/* Shine effect */}
                  <div 
                    className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: isActive ? 1 : 0,
                      background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                    }}
                  />
                  
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors relative z-10"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-indigo-400 transform transition-transform ${
                        openFAQ === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openFAQ === faq.id && (
                    <div className="px-6 pb-4 relative z-10">
                      <div className="border-t border-gray-700 pt-4">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support Section */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-400 mb-8">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Contact Support
            </button>
            <button 
              onClick={() => navigate('/guides')}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              View Guides
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

export default FAQ;