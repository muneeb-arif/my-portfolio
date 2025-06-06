import React, { useState, useEffect } from 'react';
import { X, Building, Users, FileText, Palette, Settings, Shield, Calendar, Target, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const ClientOnboardingForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    communicationChannel: 'Email',
    businessDescription: '',
    targetCustomer: '',
    uniqueValue: '',
    problemSolving: '',
    coreFeatures: '',
    existingSystem: '',
    technicalConstraints: '',
    competitors: '',
    brandGuide: '',
    colorPreferences: '',
    toneOfVoice: 'Corporate',
    paymentGateways: '',
    integrations: '',
    adminControl: '',
    gdprCompliance: false,
    termsPrivacy: false,
    launchDate: '',
    budgetRange: '',
    postMvpFeatures: '',
    longTermGoals: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'companyName':
        if (!value.trim()) {
          error = 'Company name is required';
        } else if (value.trim().length < 2) {
          error = 'Company name must be at least 2 characters';
        }
        break;

      case 'contactPerson':
        if (!value.trim()) {
          error = 'Contact person is required';
        } else if (value.trim().length < 2) {
          error = 'Contact person must be at least 2 characters';
        }
        break;

      case 'businessDescription':
        if (!value.trim()) {
          error = 'Business description is required';
        } else if (value.trim().length < 20) {
          error = 'Business description must be at least 20 characters';
        }
        break;

      case 'targetCustomer':
        if (!value.trim()) {
          error = 'Target customer information is required';
        } else if (value.trim().length < 15) {
          error = 'Target customer description must be at least 15 characters';
        }
        break;

      case 'problemSolving':
        if (!value.trim()) {
          error = 'Problem description is required';
        } else if (value.trim().length < 20) {
          error = 'Problem description must be at least 20 characters';
        }
        break;

      case 'coreFeatures':
        if (!value.trim()) {
          error = 'Core features are required';
        } else if (value.trim().length < 15) {
          error = 'Core features description must be at least 15 characters';
        }
        break;

      case 'budgetRange':
        if (!value.trim()) {
          error = 'Budget range is required for project planning';
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return error;
  };

  const validateForm = () => {
    const requiredFields = [
      'companyName', 
      'contactPerson', 
      'businessDescription', 
      'targetCustomer', 
      'problemSolving', 
      'coreFeatures',
      'budgetRange'
    ];
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all required fields as touched
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    // Validate form before submission
    if (!validateForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields with sufficient detail before submitting.',
        icon: 'error',
        confirmButtonColor: '#B8936A',
        confirmButtonText: 'Fix Errors',
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'rounded-full px-6 py-3 font-semibold'
        }
      });
      return;
    }
    
    // Show SweetAlert2 success notification
    Swal.fire({
      title: 'Questionnaire Submitted! 🎉',
      text: "Thank you for providing detailed project information. I'll review your requirements and get back to you with a detailed proposal within 48 hours.",
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#B8936A',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Perfect, Thanks!',
      cancelButtonText: 'Submit Another Form',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full px-6 py-3 font-semibold',
        cancelButton: 'rounded-full px-6 py-3 font-semibold'
      },
      showCloseButton: true,
      backdrop: `
        rgba(0,0,0,0.6)
        left top
        no-repeat
      `
    }).then((result) => {
      if (result.isConfirmed) {
        onClose(); // Close the main form
      }
      // If cancelled, keep the form open for another submission
    });
    
    // Reset form
    setFormData({
      companyName: '',
      contactPerson: '',
      communicationChannel: 'Email',
      businessDescription: '',
      targetCustomer: '',
      uniqueValue: '',
      problemSolving: '',
      coreFeatures: '',
      existingSystem: '',
      technicalConstraints: '',
      competitors: '',
      brandGuide: '',
      colorPreferences: '',
      toneOfVoice: 'Corporate',
      paymentGateways: '',
      integrations: '',
      adminControl: '',
      gdprCompliance: false,
      termsPrivacy: false,
      launchDate: '',
      budgetRange: '',
      postMvpFeatures: '',
      longTermGoals: ''
    });
    setErrors({});
    setTouched({});
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getInputClassName = (field) => {
    const baseClass = "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200";
    const hasError = errors[field] && touched[field];
    
    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
    }
    
    return `${baseClass} border-gray-200`;
  };

  const getTextareaClassName = (field) => {
    const baseClass = "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent resize-none transition-all duration-200";
    const hasError = errors[field] && touched[field];
    
    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
    }
    
    return `${baseClass} border-gray-200`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-custom bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
        {/* Sticky Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Client Onboarding Questionnaire</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Close form"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-600 mt-2 text-sm">Fill this out during your client discovery call</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Company Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Company Info</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    onBlur={() => handleBlur('companyName')}
                    className={`${getInputClassName('companyName')} focus:ring-blue-500`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && touched.companyName && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.companyName}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Point of Contact *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    onBlur={() => handleBlur('contactPerson')}
                    className={`${getInputClassName('contactPerson')} focus:ring-blue-500`}
                    placeholder="Contact person name"
                  />
                  {errors.contactPerson && touched.contactPerson && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.contactPerson}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Communication Channel</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Email', 'Slack', 'WhatsApp', 'Other'].map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="communicationChannel"
                          value={option}
                          checked={formData.communicationChannel === option}
                          onChange={(e) => handleInputChange('communicationChannel', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: About Your Business */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">About Your Business</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What does your company do? *
                  </label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    onBlur={() => handleBlur('businessDescription')}
                    rows={3}
                    className={`${getTextareaClassName('businessDescription')} focus:ring-green-500`}
                    placeholder="Describe your business..."
                  />
                  {errors.businessDescription && touched.businessDescription && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.businessDescription}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who is your target customer? *
                  </label>
                  <textarea
                    value={formData.targetCustomer}
                    onChange={(e) => handleInputChange('targetCustomer', e.target.value)}
                    onBlur={() => handleBlur('targetCustomer')}
                    rows={3}
                    className={`${getTextareaClassName('targetCustomer')} focus:ring-green-500`}
                    placeholder="Describe your target audience..."
                  />
                  {errors.targetCustomer && touched.targetCustomer && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.targetCustomer}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What makes your business unique?</label>
                  <textarea
                    value={formData.uniqueValue}
                    onChange={(e) => handleInputChange('uniqueValue', e.target.value)}
                    rows={3}
                    className={`${getTextareaClassName('uniqueValue')} focus:ring-green-500`}
                    placeholder="Your unique value proposition..."
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Project Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">Project Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What problem are we solving? *
                  </label>
                  <textarea
                    value={formData.problemSolving}
                    onChange={(e) => handleInputChange('problemSolving', e.target.value)}
                    onBlur={() => handleBlur('problemSolving')}
                    rows={3}
                    className={`${getTextareaClassName('problemSolving')} focus:ring-purple-500`}
                    placeholder="Describe the main problem..."
                  />
                  {errors.problemSolving && touched.problemSolving && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.problemSolving}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired core features? *
                  </label>
                  <textarea
                    value={formData.coreFeatures}
                    onChange={(e) => handleInputChange('coreFeatures', e.target.value)}
                    onBlur={() => handleBlur('coreFeatures')}
                    rows={3}
                    className={`${getTextareaClassName('coreFeatures')} focus:ring-purple-500`}
                    placeholder="List key features needed..."
                  />
                  {errors.coreFeatures && touched.coreFeatures && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.coreFeatures}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any existing system or website?</label>
                  <textarea
                    value={formData.existingSystem}
                    onChange={(e) => handleInputChange('existingSystem', e.target.value)}
                    rows={2}
                    className={`${getTextareaClassName('existingSystem')} focus:ring-purple-500`}
                    placeholder="Current systems in use..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technical constraints (if any)?</label>
                  <textarea
                    value={formData.technicalConstraints}
                    onChange={(e) => handleInputChange('technicalConstraints', e.target.value)}
                    rows={2}
                    className={`${getTextareaClassName('technicalConstraints')} focus:ring-purple-500`}
                    placeholder="Any technical limitations..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Competitors you admire?</label>
                  <input
                    type="text"
                    value={formData.competitors}
                    onChange={(e) => handleInputChange('competitors', e.target.value)}
                    className={`${getInputClassName('competitors')} focus:ring-purple-500`}
                    placeholder="Company names or websites"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Design & Branding */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-pink-600" />
                <h3 className="text-xl font-bold text-gray-800">Design & Branding</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Do you have a logo & brand guide?</label>
                  <input
                    type="text"
                    value={formData.brandGuide}
                    onChange={(e) => handleInputChange('brandGuide', e.target.value)}
                    className={`${getInputClassName('brandGuide')} focus:ring-pink-500`}
                    placeholder="Yes/No or provide details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color preferences?</label>
                  <input
                    type="text"
                    value={formData.colorPreferences}
                    onChange={(e) => handleInputChange('colorPreferences', e.target.value)}
                    className={`${getInputClassName('colorPreferences')} focus:ring-pink-500`}
                    placeholder="Preferred colors or hex codes"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tone of voice</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Playful', 'Corporate', 'Minimal', 'Bold'].map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="toneOfVoice"
                          value={option}
                          checked={formData.toneOfVoice === option}
                          onChange={(e) => handleInputChange('toneOfVoice', e.target.value)}
                          className="text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Functional Requirements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Functional Requirements</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred payment gateways?</label>
                  <input
                    type="text"
                    value={formData.paymentGateways}
                    onChange={(e) => handleInputChange('paymentGateways', e.target.value)}
                    className={`${getInputClassName('paymentGateways')} focus:ring-orange-500`}
                    placeholder="Stripe, PayPal, Razorpay, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any specific integrations?</label>
                  <input
                    type="text"
                    value={formData.integrations}
                    onChange={(e) => handleInputChange('integrations', e.target.value)}
                    className={`${getInputClassName('integrations')} focus:ring-orange-500`}
                    placeholder="CRM, Email tools, Analytics, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin control expectations?</label>
                  <input
                    type="text"
                    value={formData.adminControl}
                    onChange={(e) => handleInputChange('adminControl', e.target.value)}
                    className={`${getInputClassName('adminControl')} focus:ring-orange-500`}
                    placeholder="What should admins be able to control?"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Legal & Compliance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-gray-800">Legal & Compliance</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="gdpr"
                    checked={formData.gdprCompliance}
                    onChange={(e) => handleInputChange('gdprCompliance', e.target.checked)}
                    className="text-red-600 focus:ring-red-500 rounded"
                  />
                  <label htmlFor="gdpr" className="text-sm font-medium text-gray-700">GDPR compliance required?</label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.termsPrivacy}
                    onChange={(e) => handleInputChange('termsPrivacy', e.target.checked)}
                    className="text-red-600 focus:ring-red-500 rounded"
                  />
                  <label htmlFor="terms" className="text-sm font-medium text-gray-700">Terms & Privacy links available?</label>
                </div>
              </div>
            </div>

            {/* Section 7: Timeline & Budget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-800">Timeline & Budget</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ideal launch date?</label>
                  <input
                    type="date"
                    value={formData.launchDate}
                    onChange={(e) => handleInputChange('launchDate', e.target.value)}
                    className={`${getInputClassName('launchDate')} focus:ring-indigo-500`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget range? *
                  </label>
                  <input
                    type="text"
                    value={formData.budgetRange}
                    onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                    onBlur={() => handleBlur('budgetRange')}
                    className={`${getInputClassName('budgetRange')} focus:ring-indigo-500`}
                    placeholder="$5k-10k, $10k-25k, etc."
                  />
                  {errors.budgetRange && touched.budgetRange && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.budgetRange}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 8: Future Vision */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-teal-600" />
                <h3 className="text-xl font-bold text-gray-800">Future Vision</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post-MVP features planned?</label>
                  <textarea
                    value={formData.postMvpFeatures}
                    onChange={(e) => handleInputChange('postMvpFeatures', e.target.value)}
                    rows={3}
                    className={`${getTextareaClassName('postMvpFeatures')} focus:ring-teal-500`}
                    placeholder="Features for future releases..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Long-term product goals?</label>
                  <textarea
                    value={formData.longTermGoals}
                    onChange={(e) => handleInputChange('longTermGoals', e.target.value)}
                    rows={3}
                    className={`${getTextareaClassName('longTermGoals')} focus:ring-teal-500`}
                    placeholder="Vision for the product in 2-3 years..."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Footer with Submit Button */}
        <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="w-full bg-sand-dark text-white font-semibold py-4 rounded-full hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
          >
            Submit Questionnaire
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientOnboardingForm; 