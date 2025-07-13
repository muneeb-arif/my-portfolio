// API Service Demonstration
// This file shows practical examples of using the new API services

import { apiAuthService } from './apiAuthService';
import { apiProjectService } from './apiProjectService';
import { apiDashboardService } from './apiDashboardService';
import { apiPortfolioService } from './apiPortfolioService';

// ================ AUTHENTICATION EXAMPLES ================

export const authDemo = {
  // Login example
  async loginUser(email, password) {
    try {
      console.log('🔐 Attempting login...');
      const result = await apiAuthService.signIn(email, password);
      
      if (result.success) {
        console.log('✅ Login successful:', result.user);
        return result.user;
      } else {
        console.error('❌ Login failed:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      throw error;
    }
  },

  // Registration example
  async registerUser(email, password, userData = {}) {
    try {
      console.log('📝 Attempting registration...');
      const result = await apiAuthService.signUp(email, password, userData);
      
      if (result.success) {
        console.log('✅ Registration successful:', result.user);
        return result.user;
      } else {
        console.error('❌ Registration failed:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('🚨 Registration error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const result = await apiAuthService.getCurrentUser();
      
      if (result.data.user) {
        console.log('👤 Current user:', result.data.user);
        return result.data.user;
      } else {
        console.log('👤 No user logged in');
        return null;
      }
    } catch (error) {
      console.error('🚨 Get user error:', error);
      return null;
    }
  },

  // Logout
  async logoutUser() {
    try {
      console.log('🚪 Logging out...');
      const result = await apiAuthService.signOut();
      
      if (result.success) {
        console.log('✅ Logout successful');
        return true;
      }
    } catch (error) {
      console.error('🚨 Logout error:', error);
      return false;
    }
  }
};

// ================ PROJECT MANAGEMENT EXAMPLES ================

export const projectDemo = {
  // Create a sample project
  async createSampleProject() {
    try {
      console.log('📁 Creating sample project...');
      
      const projectData = {
        title: 'Sample Portfolio Website',
        description: 'A modern portfolio website built with React and Node.js',
        overview: 'This project demonstrates modern web development practices with a focus on user experience and performance.',
        category: 'Web Development',
        status: 'published',
        technologies: ['React', 'Node.js', 'MySQL', 'Tailwind CSS'],
        features: [
          'Responsive design',
          'Dark mode support',
          'SEO optimized',
          'Fast loading'
        ],
        live_url: 'https://example.com',
        github_url: 'https://github.com/user/project'
      };

      const newProject = await apiProjectService.createProject(projectData);
      console.log('✅ Project created successfully:', newProject);
      return newProject;
    } catch (error) {
      console.error('🚨 Error creating project:', error);
      throw error;
    }
  },

  // Get all projects
  async getAllProjects() {
    try {
      console.log('📋 Fetching all projects...');
      const projects = await apiProjectService.getProjects();
      console.log(`✅ Found ${projects.length} projects:`, projects);
      return projects;
    } catch (error) {
      console.error('🚨 Error fetching projects:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(projectId, updates) {
    try {
      console.log('📝 Updating project...', projectId);
      const updatedProject = await apiProjectService.updateProject(projectId, updates);
      console.log('✅ Project updated successfully:', updatedProject);
      return updatedProject;
    } catch (error) {
      console.error('🚨 Error updating project:', error);
      throw error;
    }
  },

  // Upload project images
  async uploadProjectImages(projectId, files) {
    try {
      console.log('🖼️ Uploading project images...', files.length);
      const uploadedImages = await apiProjectService.uploadProjectImages(projectId, files);
      console.log('✅ Images uploaded successfully:', uploadedImages);
      return uploadedImages;
    } catch (error) {
      console.error('🚨 Error uploading images:', error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(projectId) {
    try {
      console.log('🗑️ Deleting project...', projectId);
      const result = await apiProjectService.deleteProject(projectId);
      console.log('✅ Project deleted successfully');
      return result;
    } catch (error) {
      console.error('🚨 Error deleting project:', error);
      throw error;
    }
  }
};

// ================ DASHBOARD MANAGEMENT EXAMPLES ================

export const dashboardDemo = {
  // Categories management
  async manageCategories() {
    try {
      console.log('📁 Managing categories...');
      
      // Get existing categories
      const categories = await apiDashboardService.getCategories();
      console.log('Current categories:', categories);

      // Create new category
      const newCategory = await apiDashboardService.addCategory({
        name: 'Machine Learning',
        description: 'AI and ML projects',
        color: '#10b981'
      });
      console.log('✅ Category created:', newCategory);

      // Update category
      const updatedCategory = await apiDashboardService.updateCategory(newCategory.id, {
        description: 'Advanced AI and Machine Learning projects'
      });
      console.log('✅ Category updated:', updatedCategory);

      return { categories, newCategory, updatedCategory };
    } catch (error) {
      console.error('🚨 Error managing categories:', error);
      throw error;
    }
  },

  // Domains & Technologies management
  async manageDomainsTechnologies() {
    try {
      console.log('⚙️ Managing domains & technologies...');
      
      // Create domain
      const newDomain = await apiDashboardService.createDomainTechnology({
        type: 'domain',
        title: 'Artificial Intelligence',
        icon: 'Brain',
        sort_order: 1
      });
      console.log('✅ Domain created:', newDomain);

      // Create technology
      const newTechnology = await apiDashboardService.createDomainTechnology({
        type: 'technology',
        title: 'TensorFlow',
        icon: 'Cpu',
        sort_order: 1
      });
      console.log('✅ Technology created:', newTechnology);

      // Add skill to technology
      const newSkill = await apiDashboardService.addSkill(newTechnology.id, {
        name: 'Neural Networks',
        level: 'intermediate',
        years_experience: 2
      });
      console.log('✅ Skill added:', newSkill);

      return { newDomain, newTechnology, newSkill };
    } catch (error) {
      console.error('🚨 Error managing domains/technologies:', error);
      throw error;
    }
  },

  // Niches management
  async manageNiches() {
    try {
      console.log('🎯 Managing niches...');
      
      const newNiche = await apiDashboardService.createNiche({
        image: 'ai-ml.jpeg',
        title: 'AI Development',
        overview: 'Cutting-edge artificial intelligence solutions',
        tools: 'Python, TensorFlow, PyTorch, Jupyter',
        key_features: 'Deep Learning, Computer Vision, NLP',
        sort_order: 1,
        ai_driven: true
      });
      console.log('✅ Niche created:', newNiche);

      return newNiche;
    } catch (error) {
      console.error('🚨 Error managing niches:', error);
      throw error;
    }
  },

  // Settings management
  async manageSettings() {
    try {
      console.log('⚙️ Managing settings...');
      
      // Update individual setting
      const result1 = await apiDashboardService.updateSetting('primaryColor', '#3b82f6');
      console.log('✅ Setting updated:', result1);

      // Update multiple settings
      const result2 = await apiDashboardService.updateMultipleSettings({
        siteName: 'My Portfolio',
        tagline: 'Full-Stack Developer',
        showProjects: true,
        theme: 'dark'
      });
      console.log('✅ Multiple settings updated:', result2);

      // Get all settings
      const allSettings = await apiDashboardService.getSettings();
      console.log('📋 All settings:', allSettings);

      return { allSettings };
    } catch (error) {
      console.error('🚨 Error managing settings:', error);
      throw error;
    }
  }
};

// ================ PUBLIC PORTFOLIO EXAMPLES ================

export const portfolioDemo = {
  // Get public portfolio data
  async getPublicPortfolio() {
    try {
      console.log('🌐 Fetching public portfolio data...');
      
      const portfolioData = await apiPortfolioService.getAllPortfolioData();
      console.log('✅ Portfolio data loaded:', {
        projects: portfolioData.projects.length,
        categories: portfolioData.categories.length,
        niches: portfolioData.niches.length,
        settings: Object.keys(portfolioData.settings).length
      });

      return portfolioData;
    } catch (error) {
      console.error('🚨 Error fetching portfolio data:', error);
      throw error;
    }
  },

  // Get filtered projects
  async getWebDevelopmentProjects() {
    try {
      console.log('🔍 Fetching web development projects...');
      const projects = await apiPortfolioService.getProjectsByCategory('Web Development');
      console.log(`✅ Found ${projects.length} web development projects`);
      return projects;
    } catch (error) {
      console.error('🚨 Error fetching filtered projects:', error);
      throw error;
    }
  },

  // Submit contact form
  async submitContactForm() {
    try {
      console.log('📧 Submitting contact form...');
      
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Tech Corp',
        subject: 'Project Inquiry',
        message: 'I would like to discuss a potential project.',
        inquiry_type: 'project',
        budget: '$5,000 - $10,000',
        timeline: '2-3 months'
      };

      const result = await apiPortfolioService.submitContactForm(formData);
      
      if (result.success) {
        console.log('✅ Contact form submitted successfully');
        return result.data;
      } else {
        console.error('❌ Contact form submission failed:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('🚨 Error submitting contact form:', error);
      throw error;
    }
  }
};

// ================ COMPLETE DEMO WORKFLOW ================

export const completeDemo = async () => {
  try {
    console.log('🚀 Starting complete API service demonstration...\n');

    // 1. Authentication
    console.log('=== AUTHENTICATION DEMO ===');
    const user = await authDemo.getCurrentUser();
    
    if (!user) {
      console.log('No user logged in, please login first');
      return;
    }

    // 2. Project Management
    console.log('\n=== PROJECT MANAGEMENT DEMO ===');
    const project = await projectDemo.createSampleProject();
    const projects = await projectDemo.getAllProjects();
    
    // 3. Dashboard Management
    console.log('\n=== DASHBOARD MANAGEMENT DEMO ===');
    await dashboardDemo.manageCategories();
    await dashboardDemo.manageDomainsTechnologies();
    await dashboardDemo.manageNiches();
    await dashboardDemo.manageSettings();

    // 4. Public Portfolio
    console.log('\n=== PUBLIC PORTFOLIO DEMO ===');
    await portfolioDemo.getPublicPortfolio();
    await portfolioDemo.getWebDevelopmentProjects();

    console.log('\n🎉 Complete demo finished successfully!');
    
    return {
      message: 'Demo completed successfully',
      projectsCreated: 1,
      user: user
    };

  } catch (error) {
    console.error('🚨 Demo failed:', error);
    throw error;
  }
};

// Export all demos
export default {
  authDemo,
  projectDemo,
  dashboardDemo,
  portfolioDemo,
  completeDemo
}; 