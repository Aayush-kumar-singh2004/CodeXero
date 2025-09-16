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

function SystemDesignMastery() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const designPrinciples = [
    {
      title: "Scalability",
      icon: "📈",
      description: "Design systems that can handle increasing load",
      concepts: ["Horizontal vs Vertical Scaling", "Load Balancing", "Auto-scaling", "Microservices"]
    },
    {
      title: "Reliability",
      icon: "🛡️",
      description: "Build fault-tolerant systems that stay operational",
      concepts: ["Redundancy", "Failover", "Circuit Breakers", "Disaster Recovery"]
    },
    {
      title: "Availability",
      icon: "⚡",
      description: "Ensure systems are accessible when needed",
      concepts: ["SLA/SLO", "Uptime", "Health Checks", "Monitoring"]
    },
    {
      title: "Consistency",
      icon: "🔄",
      description: "Maintain data integrity across distributed systems",
      concepts: ["ACID Properties", "CAP Theorem", "Eventual Consistency", "Transactions"]
    }
  ];

  const systemComponents = [
    {
      component: "Load Balancer",
      purpose: "Distribute incoming requests across multiple servers",
      types: ["Layer 4 (Transport)", "Layer 7 (Application)", "DNS Load Balancing"],
      examples: ["NGINX", "HAProxy", "AWS ALB", "Cloudflare"]
    },
    {
      component: "Database",
      purpose: "Store and retrieve data efficiently",
      types: ["SQL (RDBMS)", "NoSQL (Document, Key-Value, Graph)", "NewSQL"],
      examples: ["PostgreSQL", "MongoDB", "Redis", "Cassandra"]
    },
    {
      component: "Cache",
      purpose: "Store frequently accessed data for faster retrieval",
      types: ["In-memory", "Distributed", "CDN", "Database Cache"],
      examples: ["Redis", "Memcached", "CloudFront", "Varnish"]
    },
    {
      component: "Message Queue",
      purpose: "Enable asynchronous communication between services",
      types: ["Point-to-Point", "Publish-Subscribe", "Stream Processing"],
      examples: ["RabbitMQ", "Apache Kafka", "AWS SQS", "Redis Pub/Sub"]
    },
    {
      component: "API Gateway",
      purpose: "Manage API requests, authentication, and routing",
      types: ["REST Gateway", "GraphQL Gateway", "gRPC Gateway"],
      examples: ["Kong", "AWS API Gateway", "Zuul", "Envoy"]
    },
    {
      component: "Monitoring & Logging",
      purpose: "Track system performance and debug issues",
      types: ["Metrics", "Logs", "Traces", "Alerts"],
      examples: ["Prometheus", "ELK Stack", "Jaeger", "DataDog"]
    }
  ];

  const designProcess = [
    {
      step: 1,
      title: "Clarify Requirements",
      description: "Understand functional and non-functional requirements",
      activities: [
        "Ask clarifying questions about features",
        "Estimate scale (users, data, requests/sec)",
        "Define success metrics and constraints",
        "Identify key use cases and user flows"
      ]
    },
    {
      step: 2,
      title: "Estimate Scale",
      description: "Calculate system capacity and performance needs",
      activities: [
        "Estimate daily/monthly active users",
        "Calculate read/write ratios",
        "Estimate data storage requirements",
        "Determine bandwidth and latency needs"
      ]
    },
    {
      step: 3,
      title: "Design High-Level Architecture",
      description: "Create the overall system structure",
      activities: [
        "Identify major components and services",
        "Define data flow between components",
        "Choose appropriate databases and storage",
        "Plan for scalability and reliability"
      ]
    },
    {
      step: 4,
      title: "Design Core Components",
      description: "Detail the implementation of key services",
      activities: [
        "Design database schemas",
        "Define API contracts",
        "Plan caching strategies",
        "Design for fault tolerance"
      ]
    },
    {
      step: 5,
      title: "Scale the Design",
      description: "Address bottlenecks and scaling challenges",
      activities: [
        "Identify potential bottlenecks",
        "Add load balancers and caching",
        "Consider database sharding",
        "Plan for geographic distribution"
      ]
    }
  ];

  const commonSystems = [
    {
      system: "URL Shortener (like bit.ly)",
      complexity: "Beginner",
      keyComponents: ["Web Server", "Database", "Cache", "Analytics"],
      challenges: ["Custom short URLs", "Analytics tracking", "Rate limiting", "URL expiration"]
    },
    {
      system: "Social Media Feed",
      complexity: "Intermediate", 
      keyComponents: ["User Service", "Post Service", "Timeline Service", "Notification Service"],
      challenges: ["Feed generation", "Real-time updates", "Content ranking", "Scalability"]
    },
    {
      system: "Chat Application",
      complexity: "Intermediate",
      keyComponents: ["WebSocket Server", "Message Queue", "User Service", "Notification Service"],
      challenges: ["Real-time messaging", "Message ordering", "Online presence", "Group chats"]
    },
    {
      system: "Video Streaming Platform",
      complexity: "Advanced",
      keyComponents: ["CDN", "Video Processing", "Metadata Service", "Recommendation Engine"],
      challenges: ["Video encoding", "Global distribution", "Adaptive streaming", "Recommendations"]
    },
    {
      system: "Distributed Cache",
      complexity: "Advanced",
      keyComponents: ["Cache Nodes", "Consistent Hashing", "Replication", "Monitoring"],
      challenges: ["Data distribution", "Fault tolerance", "Cache invalidation", "Hot keys"]
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
          <div className="text-6xl mb-6">🏗️</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            System Design Interview Mastery
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Learn how to approach system design questions with real-world examples, scalable architectures, and proven methodologies.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
              Intermediate to Advanced
            </span>
            <span className="px-4 py-2 bg-pink-600/20 text-pink-400 rounded-full text-sm font-medium">
              8 Weeks Duration
            </span>
            <span className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
              Real-World Systems
            </span>
          </div>
        </div>
      </div>

      {/* Design Principles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Core Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designPrinciples.map((principle, index) => {
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
                
                <div className="text-4xl mb-4 relative z-10">{principle.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{principle.title}</h3>
                <p className="text-gray-400 mb-4 relative z-10">{principle.description}</p>
                <div className="space-y-2 relative z-10">
                  {principle.concepts.map((concept, conceptIndex) => (
                    <span
                      key={conceptIndex}
                      className="inline-block px-2 py-1 bg-indigo-600/20 text-indigo-400 text-xs rounded mr-1 mb-1"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Components */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Essential System Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {systemComponents.map((component, index) => {
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

                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative z-10">
                  <h3 className="text-xl font-bold">{component.component}</h3>
                  <p className="text-purple-100 mt-2">{component.purpose}</p>
                </div>

                <div className="p-6 relative z-10">
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Types:</h4>
                    <ul className="space-y-1">
                      {component.types.map((type, typeIndex) => (
                        <li key={typeIndex} className="text-gray-300 text-sm flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                          {type}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2">Examples:</h4>
                    <div className="flex flex-wrap gap-2">
                      {component.examples.map((example, exampleIndex) => (
                        <span
                          key={exampleIndex}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Design Process */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">System Design Process</h2>
        <div className="space-y-8">
          {designProcess.map((step, index) => {
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

                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-purple-100">{step.description}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <h4 className="text-white font-semibold mb-4">Key Activities:</h4>
                  <ul className="space-y-3">
                    {step.activities.map((activity, activityIndex) => (
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

      {/* Common System Design Questions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Common System Design Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {commonSystems.map((system, index) => {
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{system.system}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      system.complexity === 'Beginner' 
                        ? 'bg-green-600/20 text-green-400'
                        : system.complexity === 'Intermediate'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {system.complexity}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Key Components:</h4>
                    <div className="flex flex-wrap gap-2">
                      {system.keyComponents.map((component, componentIndex) => (
                        <span
                          key={componentIndex}
                          className="px-2 py-1 bg-indigo-600/20 text-indigo-400 text-sm rounded"
                        >
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Key Challenges:</h4>
                    <ul className="space-y-1">
                      {system.challenges.map((challenge, challengeIndex) => (
                        <li key={challengeIndex} className="text-gray-400 text-sm flex items-center">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                          {challenge}
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

      {/* CTA Section */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Master System Design?
          </h2>
          <p className="text-gray-400 mb-8">
            Start practicing with our AI-powered system design interviews and build scalable systems with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/practice/system-design-with-ai')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Practice System Design
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

export default SystemDesignMastery;