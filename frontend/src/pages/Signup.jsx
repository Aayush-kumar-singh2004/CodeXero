import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router';
import { z } from 'zod';
import { clearError, registerUser } from '../authSlice';

const signupSchema = z.object({
  firstName: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  emailId: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[@$!%*?&]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { level: 'weak', color: 'bg-red-500', text: 'Weak' };
    if (strength <= 3) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    if (strength <= 4) return { level: 'good', color: 'bg-blue-500', text: 'Good' };
    return { level: 'strong', color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(passwordValue);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Also clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle OAuth loading state
  const handleOAuthLogin = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const oauthUrl = `${apiUrl}/user/auth/${provider}`;
    console.log('Redirecting to OAuth URL:', oauthUrl);
    window.location.href = oauthUrl;
  };

  const onSubmit = (data) => {
    // Clear any previous errors before submitting
    dispatch(clearError());
    dispatch(registerUser(data));
  };

  // Clear error when user starts typing
  const handleInputChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(circle at top left, #1e1b4b, #121212)" }}
    >
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-lg rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-10">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              CodeXero
            </h2>
            <p className="text-gray-400 mt-2">Create your account to begin your journey</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-400 text-sm font-medium">
                  {typeof error === 'string' ? error : error.message || 'Signup failed. Please try again.'}
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name Field */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John"
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white transition-all`}
                  {...register('firstName')}
                  onChange={(e) => {
                    handleInputChange();
                    register('firstName').onChange(e);
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {errors.firstName && (
                <span className="text-red-400 text-sm mt-1 block">{errors.firstName.message}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${
                    errors.emailId ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white transition-all`}
                  {...register('emailId')}
                  onChange={(e) => {
                    handleInputChange();
                    register('emailId').onChange(e);
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {errors.emailId && (
                <span className="text-red-400 text-sm mt-1 block">{errors.emailId.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white transition-all`}
                  {...register('password', {
                    onChange: (e) => {
                      setPasswordValue(e.target.value);
                      handleInputChange();
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level === 'weak' ? 'text-red-400' :
                      passwordStrength.level === 'medium' ? 'text-yellow-400' :
                      passwordStrength.level === 'good' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ 
                        width: passwordStrength.level === 'weak' ? '20%' :
                               passwordStrength.level === 'medium' ? '40%' :
                               passwordStrength.level === 'good' ? '70%' : '100%'
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {passwordValue && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs text-gray-400 mb-1">Password must contain:</div>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center ${passwordValue.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{passwordValue.length >= 8 ? '✓' : '○'}</span>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${/[a-z]/.test(passwordValue) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{/[a-z]/.test(passwordValue) ? '✓' : '○'}</span>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${/[A-Z]/.test(passwordValue) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{/[A-Z]/.test(passwordValue) ? '✓' : '○'}</span>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${/\d/.test(passwordValue) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{/\d/.test(passwordValue) ? '✓' : '○'}</span>
                      One number
                    </div>
                    <div className={`flex items-center ${/[@$!%*?&]/.test(passwordValue) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{/[@$!%*?&]/.test(passwordValue) ? '✓' : '○'}</span>
                      One special character (@$!%*?&)
                    </div>
                  </div>
                </div>
              )}

              {errors.password && (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded-lg">
                  <span className="text-red-400 text-sm">{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : 'Sign Up'}
              </button>
            </div>
          </form>
 

         

          {/* Login Link */}
          <div className="text-center mt-8 pt-5 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <NavLink 
                to="/login" 
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Login now
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;