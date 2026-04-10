import { getCurrentUser } from './authUtils';
import { apiService } from './apiService';

export async function saveContactQuery(formData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const res = await apiService.createContactQuery({
      form_type: 'contact',
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      company: formData.company || null,
      subject: formData.subject,
      message: formData.message,
      budget: formData.budget || null,
      timeline: formData.timeline || null,
      inquiry_type: formData.inquiryType || 'General Inquiry',
      status: 'new',
      priority: 'medium',
    });

    if (!res.success) {
      throw new Error(res.error || 'Failed to save');
    }
    return { success: true, data: res.data };
  } catch (error) {
    console.error('saveContactQuery:', error);
    return { success: false, error: error.message };
  }
}

export async function saveOnboardingQuery(formData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const res = await apiService.createContactQuery({
      form_type: 'onboarding',
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      communicationChannel: formData.communicationChannel,
      businessDescription: formData.businessDescription,
      targetCustomer: formData.targetCustomer,
      uniqueValue: formData.uniqueValue,
      problemSolving: formData.problemSolving,
      coreFeatures: formData.coreFeatures,
      existingSystem: formData.existingSystem,
      technicalConstraints: formData.technicalConstraints,
      competitors: formData.competitors,
      brandGuide: formData.brandGuide,
      colorPreferences: formData.colorPreferences,
      toneOfVoice: formData.toneOfVoice,
      paymentGateways: formData.paymentGateways,
      integrations: formData.integrations,
      adminControl: formData.adminControl,
      gdprCompliance: formData.gdprCompliance,
      termsPrivacy: formData.termsPrivacy,
      launchDate: formData.launchDate || null,
      budgetRange: formData.budgetRange,
      postMvpFeatures: formData.postMvpFeatures,
      longTermGoals: formData.longTermGoals,
      status: 'new',
      priority: 'high',
    });

    if (!res.success) {
      throw new Error(res.error || 'Failed to save');
    }
    return { success: true, data: res.data };
  } catch (error) {
    console.error('saveOnboardingQuery:', error);
    return { success: false, error: error.message };
  }
}
