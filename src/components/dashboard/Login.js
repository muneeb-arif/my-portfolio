import React, { useState } from 'react';
import { useAuth } from '../../services/authContext';
import './Login.css';

const Login = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    domain: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    const { email, password, confirmPassword, fullName, domain } = formData;
    
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setError('Full name is required for registration');
        return false;
      }
      if (!domain.trim()) {
        setError('Domain is required for registration (e.g., http://yourdomain.com)');
        return false;
      }
      if (!domain.includes('://') || !domain.includes('.')) {
        setError('Please provide a valid domain (e.g., http://yourdomain.com)');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const result = await signIn(formData.email, formData.password);
        if (result.success) {
          setSuccess('Welcome back!');
          // No need to call onAuthChange - the context will handle state updates
        } else {
          setError(result.error || 'Failed to sign in');
        }
      } else {
        // Sign up with domain
        const result = await signUp(
          formData.email, 
          formData.password,
          { 
            full_name: formData.fullName,
            domain: formData.domain
          }
        );
        if (result.success) {
          setSuccess('Account created successfully! Your portfolio is now ready.');
          setIsLogin(true);
          setFormData({ email: '', password: '', confirmPassword: '', fullName: '', domain: '' });
        } else {
          setError(result.error || 'Failed to create account');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      // console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(formData.email);
      if (result.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setShowResetForm(false);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'demo123',
      confirmPassword: 'demo123',
      fullName: 'Demo User',
      domain: 'http://demo.example.com'
    });
    setError('');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setShowResetForm(false);
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '', domain: '' });
  };

  // Auth state changes are now handled by the centralized AuthContext

  if (showResetForm) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Reset Password</h1>
            <p>Enter your email to receive a password reset link</p>
          </div>

          <form onSubmit={handlePasswordReset} className="login-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>

            <button 
              type="button" 
              className="link-btn"
              onClick={() => setShowResetForm(false)}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>
            {isLogin 
              ? 'Sign in to access your portfolio dashboard' 
              : 'Join to create and manage your portfolio'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="domain">Your Domain</label>
              <input
                type="url"
                id="domain"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                placeholder="http://yourdomain.com"
                required={!isLogin}
              />
              <small className="form-help">
                This will be your portfolio URL (e.g., http://john.doe.com)
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required={!isLogin}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading 
              ? (isLogin ? 'Signing In...' : 'Creating Account...') 
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>

          <div className="form-actions">
            {isLogin && (
              <button 
                type="button" 
                className="link-btn"
                onClick={() => setShowResetForm(true)}
              >
                Forgot Password?
              </button>
            )}

            <button 
              type="button" 
              className="demo-btn"
              onClick={fillDemoCredentials}
            >
              🚀 Use Demo Credentials
            </button>
          </div>

          <div className="auth-switch">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="link-btn"
                onClick={toggleAuthMode}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 