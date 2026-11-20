import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  // Hardcoded Google Client ID
  const GOOGLE_CLIENT_ID = '234645810155-l657kinkpo3nv1hq21v8ug3120fl968d.apps.googleusercontent.com';

  useEffect(() => {
    // Load Google SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
      initializeGoogleSignIn();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      setTimeout(initializeGoogleSignIn, 100);
      return;
    }

    const container = document.getElementById('googleSignInContainer');
    if (!container) {
      setTimeout(initializeGoogleSignIn, 100);
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });
      
      window.google.accounts.id.renderButton(
        container,
        { 
          theme: 'outline', 
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: '100%'
        }
      );
    } catch (err) {
      console.error('Google Sign-In initialization error:', err);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      const user = response.data;
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (user.token) {
        localStorage.setItem('token', user.token);
      }
      
      if (!user.hasFilledForm) {
        navigate(user.role === 'startup' ? '/startup-form' : '/investor-form');
      } else {
        navigate(user.role === 'startup' ? '/startup-dashboard' : '/investor-dashboard');
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid email or password!');
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError('');

    try {
      const authResponse = await axios.post('http://localhost:5000/api/google-auth', {
        token: response.credential
      });

      const user = authResponse.data;
      // If user is new or has default role, show role modal
      if (!user.hasFilledForm && (!user.role || user.role === 'investor')) {
        setGoogleUser(user);
        setShowRoleModal(true);
      } else {
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (!user.hasFilledForm) {
          navigate(user.role === 'startup' ? '/startup-form' : '/investor-form');
        } else {
          navigate(user.role === 'startup' ? '/startup-dashboard' : '/investor-dashboard');
        }
      }
    } catch (err) {
      setError('Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole || !googleUser) return;
    setIsLoading(true);
    setError('');
    try {
      const updateResponse = await axios.post('http://localhost:5000/api/update-role', {
        email: googleUser.email,
        role: selectedRole
      });
      const updatedUser = updateResponse.data;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setShowRoleModal(false);
      if (!updatedUser.hasFilledForm) {
        navigate(updatedUser.role === 'startup' ? '/startup-form' : '/investor-form');
      } else {
        navigate(updatedUser.role === 'startup' ? '/startup-dashboard' : '/investor-dashboard');
      }
    } catch (err) {
      setError('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={showRoleModal ? 'filter blur-sm pointer-events-none transition duration-300' : 'transition duration-300'}>
        <h2 className='text-2xl font-semibold mb-6'>Login</h2>

        {error && (
          <div className='mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 mb-4'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address
            </label>
            <input
              id='email'
              name='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              className='w-full p-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 bg-white'
              required
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
              Password
            </label>
            <div className="relative">
              <input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                className='w-full p-2 pr-10 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 bg-white'
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type='submit' 
            className='w-full py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md flex justify-center items-center'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In Button */}
        <div id="googleSignInContainer" className="w-full"></div>

        <div className='text-sm text-center text-gray-600'>
          Don't have an account?{' '}
          <span
            className='text-violet-500 cursor-pointer font-medium'
            onClick={() => navigate('/register')}
          >
            Sign up
          </span>
        </div>
      </div>

      {/* Role selection modal for Google sign-in */}
      {showRoleModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-sm">
          <div className="p-6 rounded-xl shadow-2xl w-80 bg-white/40 backdrop-blur-lg border border-white/30">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Your Role</h3>
            <form onSubmit={handleRoleSubmit} className="flex flex-col gap-4">
              <select
                name='role'
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                required
                className='p-2 border border-gray-300 rounded-md text-gray-800 bg-white/60 backdrop-blur'
              >
                <option value='' disabled>Select your role</option>
                <option value='startup'>Startup</option>
                <option value='investor'>Investor</option>
              </select>
              <button
                type="submit"
                className="py-2 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md"
                disabled={isLoading || !selectedRole}
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default LoginPage;