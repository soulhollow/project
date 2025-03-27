import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Mail, Lock, ArrowLeft } from 'lucide-react';

const validatePassword = (password: string) => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
};

const AuthPage = () => {
  const navigate = useNavigate();
  const [showUserType, setShowUserType] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (userType: 'freelancer' | 'customer') => {
    setError(null);
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_freelancer: userType === 'freelancer'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        throw signUpError;
      }
      
      if (data.user) {
        navigate('/for-you');
      }
    } catch (error: any) {
      console.error('Error during sign up:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        if (signInError.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (signInError.message.includes('Invalid')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw signInError;
      }
      
      if (data.user) {
        navigate('/for-you');
      }
    } catch (error: any) {
      console.error('Error during sign in:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showUserType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Choose Your Path
              </h2>
              <p className="text-gray-600">
                Select how you'd like to use FreelanceLocal
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleSignUp('freelancer')}
                disabled={isLoading}
                className="w-full bg-white border-2 border-blue-600 p-6 rounded-xl hover:bg-blue-50 transition group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Freelancer</h3>
                    <p className="text-gray-600 text-sm">Offer your services to local clients</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSignUp('customer')}
                disabled={isLoading}
                className="w-full bg-white border-2 border-blue-600 p-6 rounded-xl hover:bg-blue-50 transition group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Customer</h3>
                    <p className="text-gray-600 text-sm">Find and hire local talent</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowUserType(false)}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full text-gray-600 hover:text-gray-900 mt-6 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              FreelanceLocal
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Create an account to get started' : 'Welcome back'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {isSignUp ? (
                <button
                  onClick={() => setShowUserType(true)}
                  disabled={isLoading || !email || !password}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoading || !email || !password}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              )}

              <div className="text-center">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;