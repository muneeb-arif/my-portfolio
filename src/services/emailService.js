import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAIL_CONFIG = {
  SERVICE_ID: 'service_your_service_id', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_your_template_id', // Replace with your EmailJS template ID
  PUBLIC_KEY: 'your_public_key', // Replace with your EmailJS public key
};

// Initialize EmailJS with your public key
emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);

/**
 * Send contact form email using EmailJS
 * @param {Object} formData - The contact form data
 * @returns {Promise<Object>} - Result object with success/error
 */
export const sendContactEmail = async (formData) => {
  try {
    console.log('📧 Sending contact email via EmailJS...');
    
    // Prepare template parameters
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone || 'Not provided',
      company: formData.company || 'Not provided',
      inquiry_type: formData.inquiryType || 'General Inquiry',
      subject: formData.subject,
      message: formData.message,
      budget: formData.budget || 'To be discussed',
      timeline: formData.timeline || 'Flexible',
      to_name: 'Muneeb Arif', // Your name
      reply_to: formData.email,
    };

    // Send email using EmailJS
    const result = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAIL_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Email sent successfully:', result);
    return {
      success: true,
      message: 'Email sent successfully',
      data: result
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
      details: error
    };
  }
};

/**
 * Send onboarding form email using EmailJS
 * @param {Object} formData - The onboarding form data
 * @returns {Promise<Object>} - Result object with success/error
 */
export const sendOnboardingEmail = async (formData) => {
  try {
    console.log('📧 Sending onboarding email via EmailJS...');
    
    // Prepare template parameters for onboarding
    const templateParams = {
      company_name: formData.companyName,
      contact_person: formData.contactPerson,
      communication_channel: formData.communicationChannel,
      business_description: formData.businessDescription,
      target_customer: formData.targetCustomer,
      unique_value: formData.uniqueValue || 'Not specified',
      problem_solving: formData.problemSolving,
      core_features: formData.coreFeatures,
      existing_system: formData.existingSystem || 'None',
      budget_range: formData.budgetRange,
      launch_date: formData.launchDate || 'Flexible',
      brand_guide: formData.brandGuide || 'Not provided',
      color_preferences: formData.colorPreferences || 'Not specified',
      tone_of_voice: formData.toneOfVoice,
      to_name: 'Muneeb Arif',
      reply_to: formData.contactPerson, // Use contact person as reply-to
    };

    // Send email using EmailJS (you can use the same template or create a separate one)
    const result = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      'template_onboarding_id', // Create a separate template for onboarding
      templateParams,
      EMAIL_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Onboarding email sent successfully:', result);
    return {
      success: true,
      message: 'Onboarding email sent successfully',
      data: result
    };

  } catch (error) {
    console.error('❌ Error sending onboarding email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send onboarding email',
      details: error
    };
  }
};

/**
 * Test email configuration
 * @returns {Promise<Object>} - Test result
 */
export const testEmailConfig = async () => {
  try {
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Email Configuration',
      message: 'This is a test email to verify EmailJS configuration.',
      inquiryType: 'Testing',
    };

    const result = await sendContactEmail(testData);
    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Email configuration test failed',
      details: error
    };
  }
}; 