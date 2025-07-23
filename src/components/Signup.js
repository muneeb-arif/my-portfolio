import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { colorSchemes } from '../services/colorSchemes';
import { apiService } from '../services/apiService';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1: User registration
    email: '',
    password: '',
    subdomain: '',
    
    // Step 2: Color theme
    theme: 'sand',
    
    // Step 3: Site settings
    siteName: '',
    siteTitle: '',
    siteTagline: '',
    
    // Step 4: Homepage sections visibility
    sectionHeroVisible: true,
    sectionPortfolioVisible: true,
    sectionTechnologiesVisible: true,
    sectionDomainsVisible: true,
    sectionProjectCycleVisible: true,
    sectionPromptsVisible: false
  });

  // User data after registration
  const [userData, setUserData] = useState(null);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // Validate step 1
  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.subdomain) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Validate subdomain format
    const subdomainRegex = /^[a-zA-Z0-9-]+$/;
    if (!subdomainRegex.test(formData.subdomain)) {
      setError('Subdomain can only contain letters, numbers, and hyphens');
      return false;
    }
    
    if (formData.subdomain.length < 3 || formData.subdomain.length > 20) {
      setError('Subdomain must be between 3 and 20 characters');
      return false;
    }
    
    return true;
  };

  // Handle step 1 submission (user registration)
  const handleStep1Submit = async () => {
    if (!validateStep1()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Register user with subdomain using apiService directly
      const response = await apiService.register(formData.email, formData.password, {
        subdomain: formData.subdomain
      });
      
      if (response.success) {
        setUserData(response.user);
        
        // Set the token for authenticated requests
        if (response.token) {
          apiService.setToken(response.token);
        }
        
        setSuccess('Account created successfully!');
        setCurrentStep(2);
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle step 2 submission (color theme)
  const handleStep2Submit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Save color theme to settings
      const settingsData = {
        theme_name: formData.theme,
        theme_color: colorSchemes[formData.theme]?.colors?.primary || '#B8936A'
      };
      
      const response = await apiService.updateSettings(settingsData);
      
      if (response.success) {
        setSuccess('Color theme saved!');
        setCurrentStep(3);
      } else {
        setError('Failed to save color theme');
      }
    } catch (err) {
      setError('Failed to save color theme');
    } finally {
      setLoading(false);
    }
  };

  // Handle step 3 submission (site settings)
  const handleStep3Submit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Save site settings
      const settingsData = {
        site_name: formData.siteName,
        banner_name: formData.siteTitle,
        banner_tagline: formData.siteTagline
      };
      
      const response = await apiService.updateSettings(settingsData);
      
      if (response.success) {
        setSuccess('Site settings saved!');
        setCurrentStep(4);
      } else {
        setError('Failed to save site settings');
      }
    } catch (err) {
      setError('Failed to save site settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle step 4 submission (homepage sections)
  const handleStep4Submit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Save homepage section visibility settings
      const settingsData = {
        section_hero_visible: formData.sectionHeroVisible,
        section_portfolio_visible: formData.sectionPortfolioVisible,
        section_technologies_visible: formData.sectionTechnologiesVisible,
        section_domains_visible: formData.sectionDomainsVisible,
        section_project_cycle_visible: formData.sectionProjectCycleVisible,
        section_prompts_visible: formData.sectionPromptsVisible
      };
      
      const response = await apiService.updateSettings(settingsData);
      
      if (response.success) {
        setSuccess('Setup completed successfully! Your portfolio is ready!');
        
        // Redirect to the new subdomain in a new tab
        const subdomainUrl = `https://${formData.subdomain}.theexpertways.com/`;
        window.open(subdomainUrl, '_blank');
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError('Failed to complete setup');
      }
    } catch (err) {
      setError('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    switch (currentStep) {
      case 1:
        handleStep1Submit();
        break;
      case 2:
        handleStep2Submit();
        break;
      case 3:
        handleStep3Submit();
        break;
      case 4:
        handleStep4Submit();
        break;
      default:
        break;
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
      setSuccess('');
    }
  };

  // Get available color schemes
  const availableThemes = Object.keys(colorSchemes).map(key => ({
    id: key,
    ...colorSchemes[key]
  }));

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="signup-step">
            <h3>Create Your Account</h3>
            <p>Let's get started with your portfolio setup</p>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subdomain">Subdomain *</label>
              <div className="subdomain-input">
                <input
                  type="text"
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase())}
                  placeholder="yourname"
                  required
                />
                <span className="subdomain-suffix">.theexpertways.com</span>
              </div>
              <small>Your portfolio will be available at: <strong>https://{formData.subdomain || 'yourname'}.theexpertways.com/</strong></small>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="signup-step">
            <h3>Choose Your Color Theme</h3>
            <p>Select a color scheme that matches your style</p>
            
            <div className="theme-grid">
              {availableThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-option ${formData.theme === theme.id ? 'selected' : ''}`}
                  onClick={() => handleInputChange('theme', theme.id)}
                >
                  <div 
                    className="theme-preview"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                    }}
                  ></div>
                  <div className="theme-info">
                    <h4>{theme.name}</h4>
                    <p>{theme.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="signup-step">
            <h3>Customize Your Site</h3>
            <p>Add your personal information (all fields are optional)</p>
            
            <div className="form-group">
              <label htmlFor="siteName">Site Name</label>
              <input
                type="text"
                id="siteName"
                value={formData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="e.g., My Portfolio"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="siteTitle">Your Name</label>
              <input
                type="text"
                id="siteTitle"
                value={formData.siteTitle}
                onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="siteTagline">Tagline</label>
              <textarea
                id="siteTagline"
                value={formData.siteTagline}
                onChange={(e) => handleInputChange('siteTagline', e.target.value)}
                placeholder="e.g., Full-stack developer passionate about creating amazing web experiences"
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="signup-step">
            <h3>Homepage Sections</h3>
            <p>Choose which sections to display on your homepage</p>
            
            <div className="sections-grid">
              <div className="section-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sectionHeroVisible}
                    onChange={(e) => handleInputChange('sectionHeroVisible', e.target.checked)}
                  />
                  <span className="section-title">🎯 Hero Section</span>
                </label>
                <small>Main banner with your name, title, and introduction</small>
              </div>
              
              <div className="section-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sectionPortfolioVisible}
                    onChange={(e) => handleInputChange('sectionPortfolioVisible', e.target.checked)}
                  />
                  <span className="section-title">💼 Portfolio Section</span>
                </label>
                <small>Showcase of your projects and work</small>
              </div>
              
              <div className="section-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sectionTechnologiesVisible}
                    onChange={(e) => handleInputChange('sectionTechnologiesVisible', e.target.checked)}
                  />
                  <span className="section-title">🛠️ Technologies Section</span>
                </label>
                <small>Display of your technical skills and tools</small>
              </div>
              
              <div className="section-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sectionDomainsVisible}
                    onChange={(e) => handleInputChange('sectionDomainsVisible', e.target.checked)}
                  />
                  <span className="section-title">🎯 Domains & Niche Section</span>
                </label>
                <small>Your expertise areas and specializations</small>
              </div>
              
              <div className="section-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sectionProjectCycleVisible}
                    onChange={(e) => handleInputChange('sectionProjectCycleVisible', e.target.checked)}
                  />
                  <span className="section-title">⏱️ Project Lifecycle Section</span>
                </label>
                <small>Timeline showing your development process</small>
              </div>
              
              <div className="section-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sectionPromptsVisible}
                    onChange={(e) => handleInputChange('sectionPromptsVisible', e.target.checked)}
                  />
                  <span className="section-title">💡 Prompts Section</span>
                </label>
                <small>AI prompts and templates showcase</small>
              </div>
            </div>
            
            <div className="dashboard-info">
              <div className="info-card">
                <h4>🎛️ Manage Your Portfolio</h4>
                <p>After setup, you can modify all these settings and more from your dashboard at:</p>
                <div className="dashboard-url">
                  <strong>https://{formData.subdomain}.theexpertways.com/dashboard</strong>
                </div>
                <ul>
                  <li>📝 Update your personal information</li>
                  <li>🎨 Change colors and themes</li>
                  <li>📁 Add and manage projects</li>
                  <li>🛠️ Customize technologies and skills</li>
                  <li>⚙️ Configure all portfolio settings</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Let's get started</h1>
          <p>Create your portfolio in just a few steps</p>
          
          {/* Sign in to dashboard button */}
          {/* <div className="signup-signin-section">
            <p>Already have an account?</p>
            <button
              type="button"
              className="btn-signin-dashboard"
              onClick={() => navigate('/dashboard')}
            >
              🔐 Sign in to Dashboard
            </button>
          </div> */}
        </div>

        {/* Progress indicator */}
        <div className="progress-indicator">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Account'}
                {step === 2 && 'Theme'}
                {step === 3 && 'Content'}
                {step === 4 && 'Sections'}
              </div>
            </div>
          ))}
        </div>

        {/* Error and success messages */}
        {error && (
          <div className="message error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="message success">
            {success}
          </div>
        )}

        {/* Step content */}
        <div className="signup-content">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="signup-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrevious}
              disabled={loading}
            >
              ← Previous
            </button>
          )}
          
          <button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? 'Processing...' : currentStep === 4 ? 'Complete Setup & Launch Portfolio' : 'Next →'}
          </button>
        </div>

        {/* Login link */}
        <div className="signup-footer">
          <div className="signup-footer-content">
            <p>Already have an account?</p>
            <button
              type="button"
              className="btn-signin-footer"
              onClick={() => navigate('/dashboard')}
            >
              🔐 Sign in to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 