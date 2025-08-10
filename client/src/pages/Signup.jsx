import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);
      const userData = response.data;
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      navigate(formData.role === 'startup' ? '/startup-form' : '/investor-form');
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400 && err.response.data?.message?.toLowerCase().includes('already')) {
          setError('Email already registered');
        } else {
          setError(err.response.data?.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className='text-2xl font-semibold'>Sign Up</h2>

      {error && (
        <div className='mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm'>
          {error}
        </div>
      )}

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
        <input
          name='fullName'
          type='text'
          value={formData.fullName}
          onChange={handleChange}
          placeholder='Full Name'
          className='p-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 bg-white'
          required
        />
        <input
          name='email'
          type='email'
          value={formData.email}
          onChange={handleChange}
          placeholder='Email Address'
          className='p-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 bg-white'
          required
        />
        <div className="relative">
          <input
            name='password'
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder='Password (min 6 characters)'
            minLength={6}
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
        <select
          name='role'
          value={formData.role}
          onChange={handleChange}
          required
          className='p-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 bg-white'
        >
          <option value='' disabled>Select your role</option>
          <option value='startup'>Startup</option>
          <option value='investor'>Investor</option>
        </select>

        <button 
          type='submit' 
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md flex justify-center items-center'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className='flex items-center gap-2 text-sm text-gray-400 mt-2'>
        <input 
          type='checkbox' 
          id='terms' 
          required 
          className='w-4 h-4'
        />
        <label htmlFor='terms'>
          I agree to the <span className='text-violet-400 cursor-pointer'>Terms of Service</span> and <span className='text-violet-400 cursor-pointer'>Privacy Policy</span>
        </label>
      </div>

      <div className='text-sm text-gray-300 mt-4 text-center'>
        <p>
          Already have an account?{' '}
          <span
            className='text-violet-400 cursor-pointer underline'
            onClick={() => navigate('/login')}
          >
            Login here
          </span>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;