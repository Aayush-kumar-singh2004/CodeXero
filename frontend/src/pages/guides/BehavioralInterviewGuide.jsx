import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

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

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
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

    element.addEventListener("mousemove", handleMouseMove, { passive: true });
    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return [ref, position, isActive];
}

function BehavioralInterviewGuide() {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: "📋" },
    { id: "star-method", title: "STAR Method", icon: "⭐" },
    { id: "common-questions", title: "Common Questions", icon: "❓" },
    { id: "examples", title: "Example Answers", icon: "💡" },
    { id: "practice", title: "Practice Tips", icon: "🎯" },
    { id: "mistakes", title: "Common Mistakes", icon: "⚠️" },
  ];

  const starMethod = {
    S: {
      title: "Situation",
      description: "Set the context for your story",
      tips: [
        "Be specific about when and where",
        "Keep it concise",
        "Choose relevant situations",
      ],
    },
    T: {
      title: "Task",
      description: "Describe what you needed to accomplish",
      tips: [
        "Explain your responsibility",
        "Make it clear what was at stake",
        "Show the challenge",
      ],
    },
    A: {
      title: "Action",
      description: "Explain what you did to address the situation",
      tips: [
        "Focus on YOUR actions",
        "Be specific about steps taken",
        "Show leadership and initiative",
      ],
    },
    R: {
      title: "Result",
      description: "Share the outcomes of your actions",
      tips: [
        "Quantify when possible",
        "Show positive impact",
        "Include lessons learned",
      ],
    },
  };

  const commonQuestions = [
    {
      category: "Leadership & Teamwork",
      questions: [
        "Tell me about a time you led a team through a difficult project",
        "Describe a situation where you had to work with a difficult team member",
        "Give an example of when you had to motivate others",
        "Tell me about a time you had to delegate tasks effectively",
      ],
    },
    {
      category: "Problem Solving",
      questions: [
        "Describe a complex problem you solved at work",
        "Tell me about a time you had to make a decision with incomplete information",
        "Give an example of when you had to think outside the box",
        "Describe a time you identified and fixed a process improvement",
      ],
    },
    {
      category: "Conflict Resolution",
      questions: [
        "Tell me about a time you disagreed with your manager",
        "Describe a situation where you had to handle a conflict between team members",
        "Give an example of when you had to give difficult feedback",
        "Tell me about a time you had to stand up for your ideas",
      ],
    },
    {
      category: "Adaptability & Learning",
      questions: [
        "Describe a time you had to learn a new technology quickly",
        "Tell me about a time you failed and what you learned",
        "Give an example of when you had to adapt to significant changes",
        "Describe a time you received constructive criticism",
      ],
    },
  ];

  const exampleAnswers = [
    {
      question:
        "Tell me about a time you had to work with a difficult team member",
      situation:
        "During a critical product launch, I was working with a senior developer who was resistant to code reviews and often dismissed feedback from junior team members.",
      task: "As the team lead, I needed to ensure code quality while maintaining team morale and meeting our tight deadline.",
      action:
        "I scheduled a private one-on-one meeting with the developer to understand their perspective. I learned they felt overwhelmed and worried about appearing incompetent. I restructured our code review process to be more collaborative, pairing experienced developers with junior ones, and implemented a 'no-blame' policy for bugs found in reviews.",
      result:
        "The developer became more receptive to feedback, our code quality improved by 40%, and we delivered the product on time. The team reported higher satisfaction in our retrospective, and the developer later thanked me for the supportive approach.",
    },
    {
      question:
        "Describe a time you had to make a decision with incomplete information",
      situation:
        "Our main database server crashed during peak traffic hours, and we had limited information about the root cause. Customer complaints were flooding in.",
      task: "As the on-call engineer, I needed to restore service quickly while preventing data loss, despite not knowing the exact cause of the failure.",
      action:
        "I immediately implemented our disaster recovery protocol, switching to our backup server while simultaneously investigating the primary server. I communicated transparently with stakeholders about the situation and our response plan, providing regular updates every 15 minutes.",
      result:
        "Service was restored within 45 minutes with zero data loss. We later discovered it was a hardware failure. My quick decision-making and communication helped maintain customer trust, and we used this incident to improve our monitoring and failover procedures.",
    },
  ];

  const practiceSteps = [
    {
      step: 1,
      title: "Prepare Your Story Bank",
      description:
        "Create 8-10 detailed stories covering different competencies",
      tips: [
        "Use recent examples (last 2-3 years)",
        "Include diverse situations",
        "Practice quantifying results",
      ],
    },
    {
      step: 2,
      title: "Practice Out Loud",
      description: "Rehearse your stories verbally, not just mentally",
      tips: [
        "Record yourself speaking",
        "Practice with friends/family",
        "Time your responses (2-3 minutes each)",
      ],
    },
    {
      step: 3,
      title: "Mock Interviews",
      description: "Simulate real interview conditions",
      tips: [
        "Use our AI mock interviewer",
        "Practice with peers",
        "Get feedback on your delivery",
      ],
    },
    {
      step: 4,
      title: "Refine and Adapt",
      description: "Tailor your stories to specific companies and roles",
      tips: [
        "Research company values",
        "Align examples with job requirements",
        "Prepare follow-up questions",
      ],
    },
  ];

  const commonMistakes = [
    {
      mistake: "Being Too Vague",
      description: "Giving generic answers without specific details",
      solution: "Use concrete examples with specific metrics and outcomes",
    },
    {
      mistake: "Focusing on 'We' Instead of 'I'",
      description: "Not highlighting your individual contributions",
      solution:
        "Clearly articulate your specific role and actions in team situations",
    },
    {
      mistake: "Choosing Irrelevant Examples",
      description:
        "Using stories that don't demonstrate the required competency",
      solution: "Map your stories to common behavioral competencies beforehand",
    },
    {
      mistake: "Rambling or Going Off-Topic",
      description: "Losing focus and providing too much unnecessary detail",
      solution: "Practice concise storytelling and stick to the STAR structure",
    },
    {
      mistake: "Not Preparing Questions",
      description:
        "Failing to ask thoughtful questions about the role or company",
      solution: "Prepare 3-5 insightful questions that show genuine interest",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Behavioral Interview Success Guide
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Master the art of behavioral interviews with proven strategies,
                real examples, and practical tips that will help you showcase
                your experience and land your dream job.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "What are Behavioral Interviews?",
                  content:
                    "Behavioral interviews focus on how you've handled situations in the past to predict future performance. They typically start with 'Tell me about a time when...' or 'Give me an example of...'",
                },
                {
                  title: "Why Companies Use Them",
                  content:
                    "Employers want to assess soft skills like leadership, problem-solving, and teamwork that are hard to evaluate through technical questions alone.",
                },
                {
                  title: "Success Rate",
                  content:
                    "Candidates who prepare structured answers using the STAR method are 3x more likely to receive job offers compared to those who wing it.",
                },
              ].map((item, index) => {
                const [ref, position, isActive] = useElementMousePosition();
                return (
                  <div
                    key={index}
                    ref={ref}
                    className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800 relative overflow-hidden group"
                  >
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isActive ? 1 : 0,
                        background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                      }}
                    />
                    <h3 className="text-lg font-semibold text-white mb-3 relative z-10">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 relative z-10">
                      {item.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "star-method":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                The STAR Method
              </h2>
              <p className="text-gray-300 text-lg">
                Structure your behavioral interview answers for maximum impact
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(starMethod).map(([letter, details]) => {
                const [ref, position, isActive] = useElementMousePosition();
                return (
                  <div
                    key={letter}
                    ref={ref}
                    className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800 relative overflow-hidden group"
                  >
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isActive ? 1 : 0,
                        background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                      }}
                    />
                    <div className="flex items-center mb-4 relative z-10">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        {letter}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {details.title}
                      </h3>
                    </div>
                    <p className="text-gray-300 mb-4 relative z-10">
                      {details.description}
                    </p>
                    <ul className="space-y-2 relative z-10">
                      {details.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start text-gray-400"
                        >
                          <span className="text-indigo-400 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "common-questions":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Common Behavioral Questions
              </h2>
              <p className="text-gray-300 text-lg">
                Prepare for these frequently asked behavioral interview
                questions
              </p>
            </div>

            <div className="space-y-6">
              {commonQuestions.map((category, index) => {
                const [ref, position, isActive] = useElementMousePosition();
                return (
                  <div
                    key={index}
                    ref={ref}
                    className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800 relative overflow-hidden group"
                  >
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isActive ? 1 : 0,
                        background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                      }}
                    />
                    <h3 className="text-xl font-bold text-white mb-4 relative z-10">
                      {category.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {category.questions.map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className="bg-gray-800/50 p-4 rounded-lg"
                        >
                          <p className="text-gray-300">{question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "examples":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Example STAR Answers
              </h2>
              <p className="text-gray-300 text-lg">
                Learn from these well-structured behavioral interview responses
              </p>
            </div>

            <div className="space-y-8">
              {exampleAnswers.map((example, index) => {
                const [ref, position, isActive] = useElementMousePosition();
                return (
                  <div
                    key={index}
                    ref={ref}
                    className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800 relative overflow-hidden group"
                  >
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isActive ? 1 : 0,
                        background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                      }}
                    />
                    <h3 className="text-xl font-bold text-white mb-6 relative z-10">
                      "{example.question}"
                    </h3>

                    <div className="space-y-4 relative z-10">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-blue-400 mb-2">
                          Situation
                        </h4>
                        <p className="text-gray-300">{example.situation}</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-green-400 mb-2">
                          Task
                        </h4>
                        <p className="text-gray-300">{example.task}</p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-semibold text-yellow-400 mb-2">
                          Action
                        </h4>
                        <p className="text-gray-300">{example.action}</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-purple-400 mb-2">
                          Result
                        </h4>
                        <p className="text-gray-300">{example.result}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "practice":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Practice Strategy
              </h2>
              <p className="text-gray-300 text-lg">
                Follow these steps to master behavioral interviews
              </p>
            </div>

            <div className="space-y-6">
              {practiceSteps.map((step, index) => {
                const [ref, position, isActive] = useElementMousePosition();
                return (
                  <div
                    key={index}
                    ref={ref}
                    className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800 relative overflow-hidden group"
                  >
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isActive ? 1 : 0,
                        background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                      }}
                    />
                    <div className="flex items-start relative z-10">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6 flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-300 mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="flex items-start text-gray-400"
                            >
                              <span className="text-indigo-400 mr-2">•</span>
                              {tip}
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
        );

      case "mistakes":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Common Mistakes to Avoid
              </h2>
              <p className="text-gray-300 text-lg">
                Learn from these frequent behavioral interview pitfalls
              </p>
            </div>

            <div className="space-y-6">
              {commonMistakes.map((item, index) => {
                const [ref, position, isActive] = useElementMousePosition();
                return (
                  <div
                    key={index}
                    ref={ref}
                    className="enhanced-card bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800 relative overflow-hidden group"
                  >
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isActive ? 1 : 0,
                        background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                      }}
                    />
                    <div className="flex items-start relative z-10">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white mr-6 flex-shrink-0">
                        ⚠️
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-red-400 mb-2">
                          {item.mistake}
                        </h3>
                        <p className="text-gray-300 mb-4">{item.description}</p>
                        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                          <h4 className="font-semibold text-green-400 mb-2">
                            Solution:
                          </h4>
                          <p className="text-gray-300">{item.solution}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-gray-900/80 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/guides")}
                className="group flex items-center gap-3"
              >
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
                <span className="text-xl font-bold text-white">CodeZero</span>
              </button>
            </div>
            <button
              onClick={() => navigate("/guides")}
              className="text-gray-300 hover:text-indigo-400 font-medium"
            >
              ← Back to Guides
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Guide Sections
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                        activeSection === section.id
                          ? "bg-indigo-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">{renderContent()}</div>
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
          transform: translateY(-8px) rotateX(3deg) rotateY(2deg) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 30px 5px rgba(124, 58, 237, 0.1);
        }

        .enhanced-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.4),
            rgba(236, 72, 153, 0.2)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
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

export default BehavioralInterviewGuide;
