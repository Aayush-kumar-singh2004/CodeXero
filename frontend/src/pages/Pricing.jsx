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

function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const mousePosition = useMousePosition();

  const handlePayment = async (plan, amount) => {
    if (plan.name === 'Free') {
      navigate('/home');
      return;
    }

    if (plan.name === 'Enterprise') {
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
        key: 'rzp_test_1DP5mmOlF5G5ag', // Test key - replace with your actual key
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'CodeXero',
        description: `${plan.name} Plan - ${billingCycle} Subscription`,
        handler: function (response) {
          // Payment successful
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // Here you would typically send the payment details to your backend
          navigate('/home');
        },
        prefill: {
          name: 'Bharat Pawar',
          email: 'bharat1234512345777@gmail.com',
          contact: '9999999999'
        },
        notes: {
          plan: plan.name,
          billing_cycle: billingCycle,
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
      alert('Payment initialization failed. Please try again.');
    }
  };

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for getting started with coding practice",
      features: [
        "Access to 100+ coding problems",
        "Basic problem categories",
        "5 AI chat sessions per month",
        "Basic progress tracking",
        "Community support"
      ],
      limitations: [
        "Limited AI interactions",
        "No mock interviews",
        "Basic analytics only"
      ],
      buttonText: "Get Started Free",
      popular: false,
      color: "from-gray-600 to-gray-700"
    },
    {
      name: "Pro",
      price: { monthly: 1499, annual: 14990 },
      description: "Ideal for serious interview preparation",
      features: [
        "Access to 1000+ coding problems",
        "All problem categories & difficulties",
        "Unlimited AI chat sessions",
        "AI mock interviews (DSA & Behavioral)",
        "Advanced progress analytics",
        "Video solution explanations",
        "Priority support",
        "Contest participation"
      ],
      limitations: [],
      buttonText: "Start Pro Trial",
      popular: true,
      color: "from-indigo-600 to-purple-600"
    },
    {
      name: "Enterprise",
      price: { monthly: 4999, annual: 49990 },
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "System design mock interviews",
        "Custom problem sets",
        "Team analytics dashboard",
        "Bulk user management",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      popular: false,
      color: "from-purple-600 to-pink-600"
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly."
    },
    {
      question: "Is there a free trial for Pro?",
      answer: "Yes! We offer a 7-day free trial for the Pro plan. No credit card required to start your trial."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay via invoice."
    },
    {
      question: "Do you offer student discounts?",
      answer: "Yes! Students with a valid .edu email address get 50% off any paid plan. Contact support to apply your discount."
    }
  ];

  const getSavings = (plan) => {
    if (billingCycle === 'annual' && plan.price.monthly > 0) {
      const monthlyCost = plan.price.monthly * 12;
      const annualCost = plan.price.annual;
      const savings = monthlyCost - annualCost;
      return Math.round((savings / monthlyCost) * 100);
    }
    return 0;
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
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your coding interview preparation journey. All plans include our core features with no hidden fees.
          </p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex justify-center">
          <div className="bg-gray-800 p-1 rounded-lg flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 relative ${
                billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const [ref, position, isActive] = useElementMousePosition();
            
            return (
            <div
              key={index}
              ref={ref}
              className={`enhanced-card relative bg-gray-900/50 backdrop-blur-lg rounded-2xl border overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-indigo-500 shadow-indigo-500/20 shadow-xl scale-105' 
                  : 'border-gray-800 hover:border-indigo-500/30'
              }`}
            >
              {/* Shine effect */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: isActive ? 1 : 0,
                  background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                }}
              />

              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 text-sm font-medium z-10">
                  Most Popular
                </div>
              )}

              <div className={`bg-gradient-to-r ${plan.color} p-6 ${plan.popular ? 'pt-12' : ''} relative z-10`}>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-extrabold text-white">
                    ₹{billingCycle === 'monthly' ? plan.price.monthly : Math.round(plan.price.annual / 12)}
                  </span>
                  <span className="text-white/80 ml-2">/month</span>
                </div>
                {billingCycle === 'annual' && plan.price.monthly > 0 && (
                  <div className="text-green-300 text-sm mb-4">
                    Save {getSavings(plan)}% with annual billing
                  </div>
                )}
                <p className="text-white/90">{plan.description}</p>
              </div>

              <div className="p-6 relative z-10">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <li key={limitIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    const amount = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
                    handlePayment(plan, amount);
                  }}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                  }`}
                >
                  {plan.name === 'Free' ? 'Start Free' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Feature Comparison</h2>
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">Features</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Free</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Pro</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { feature: "Coding Problems", free: "100+", pro: "1000+", enterprise: "1000+" },
                  { feature: "AI Chat Sessions", free: "5/month", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Mock Interviews", free: "❌", pro: "✅", enterprise: "✅" },
                  { feature: "System Design", free: "❌", pro: "❌", enterprise: "✅" },
                  { feature: "Analytics", free: "Basic", pro: "Advanced", enterprise: "Team Dashboard" },
                  { feature: "Support", free: "Community", pro: "Priority", enterprise: "Dedicated Manager" }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 text-gray-300 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{row.free}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{row.pro}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
              <p className="text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of developers who have successfully landed their dream jobs with CodeXero.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/home')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Contact Sales
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

export default Pricing;