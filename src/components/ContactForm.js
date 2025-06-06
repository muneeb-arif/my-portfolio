import React, { useState, useEffect } from 'react';
import { X, Mail, User, Building, Phone, MessageSquare, Tag } from 'lucide-react';

const ContactForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: 'General Inquiry',
    subject: '',
    message: '',
    budget: '',
    timeline: ''
  });

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create email content
    const emailSubject = formData.subject || `${formData.inquiryType} - ${formData.name}`;
    const emailBody = `
Hi Muneeb,

I'm interested in discussing a project with you.

Contact Details:
• Name: ${formData.name}
• Email: ${formData.email}
• Phone: ${formData.phone || 'Not provided'}
• Company: ${formData.company || 'Not provided'}

Project Information:
• Inquiry Type: ${formData.inquiryType}
• Subject: ${formData.subject}
• Budget Range: ${formData.budget || 'To be discussed'}
• Timeline: ${formData.timeline || 'Flexible'}

Message:
${formData.message}

Looking forward to hearing from you!

Best regards,
${formData.name}
    `.trim();

    // Open email client with pre-filled content
    const mailtoLink = `mailto:muneeb.arif@example.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;

    // Show success message and close form
    alert('Email client opened with your message. Thank you for reaching out!');
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      inquiryType: 'General Inquiry',
      subject: '',
      message: '',
      budget: '',
      timeline: ''
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-custom bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
        {/* Header - Sticky Top */}
        <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sand-light rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-sand-dark" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Get In Touch</h2>
                <p className="text-gray-600 text-sm">Let's discuss your project</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Close contact form"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-sand-dark" />
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200"
                    placeholder="Your company name"
                  />
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-sand-dark" />
                <h3 className="text-lg font-semibold text-gray-800">Project Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type *
                  </label>
                  <select
                    required
                    value={formData.inquiryType}
                    onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Web Development">Web Development</option>
                    <option value="E-commerce Solution">E-commerce Solution</option>
                    <option value="API Development">API Development</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Maintenance/Support">Maintenance/Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select budget range</option>
                    <option value="Under $5k">Under $5,000</option>
                    <option value="$5k - $10k">$5,000 - $10,000</option>
                    <option value="$10k - $25k">$10,000 - $25,000</option>
                    <option value="$25k - $50k">$25,000 - $50,000</option>
                    <option value="$50k+">$50,000+</option>
                    <option value="To be discussed">To be discussed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select timeline</option>
                    <option value="ASAP">ASAP</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6+ months">6+ months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200"
                    placeholder="Brief subject of your inquiry"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-sand-dark" />
                <h3 className="text-lg font-semibold text-gray-800">Project Details</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sand-dark focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Please describe your project, goals, requirements, or any specific questions you have. The more details you provide, the better I can assist you."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons - Sticky Bottom */}
        <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full text-center hover:bg-gray-50 transform hover:scale-105 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-sand-dark text-white font-semibold rounded-full text-center hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm; 