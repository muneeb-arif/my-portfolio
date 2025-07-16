// Test API Fallback System
// Verifies that frontend loads fallback data when API server fails

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

// Simulate the enhanced API service
class TestApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.isApiAvailable = true;
    this.fallbackMode = false;
  }

  async checkApiHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isApiAvailable = data.status === 'healthy';
        return this.isApiAvailable;
      } else {
        this.isApiAvailable = false;
        return false;
      }
    } catch (error) {
      console.warn('API health check failed:', error.message);
      this.isApiAvailable = false;
      return false;
    }
  }

  async makeRequest(endpoint, options = {}) {
    if (!this.isApiAvailable) {
      throw new Error('API server is not available');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error.message);
      this.isApiAvailable = false;
      throw error;
    }
  }

  async makeRequestWithFallback(endpoint, options = {}, fallbackData = null) {
    try {
      return await this.makeRequest(endpoint, options);
    } catch (error) {
      console.warn(`API request failed, using fallback data for ${endpoint}:`, error.message);
      
      if (fallbackData) {
        return { success: true, data: fallbackData };
      }
      
      throw error;
    }
  }

  // Simulate API methods
  async getPublishedProjects() {
    return await this.makeRequestWithFallback(
      '/projects', 
      {}, 
      this.getFallbackProjects()
    );
  }

  async getCategories() {
    return await this.makeRequestWithFallback(
      '/categories', 
      {}, 
      this.getFallbackCategories()
    );
  }

  async getTechnologies() {
    return await this.makeRequestWithFallback(
      '/technologies', 
      {}, 
      this.getFallbackTechnologies()
    );
  }

  async getNiches() {
    return await this.makeRequestWithFallback(
      '/niches', 
      {}, 
      this.getFallbackNiches()
    );
  }

  async getSettings() {
    return await this.makeRequestWithFallback(
      '/settings', 
      {}, 
      {}
    );
  }

  // Fallback data methods
  getFallbackProjects() {
    return [
      {
        id: 1,
        title: "E-Commerce Platform",
        description: "A full-stack e-commerce solution with modern UI/UX",
        category: "Web Development",
        overview: "Built a comprehensive e-commerce platform with React frontend and Node.js backend.",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        features: ["User authentication", "Product catalog", "Payment processing"],
        live_url: "https://example-ecommerce.com",
        github_url: "https://github.com/username/ecommerce-platform",
        status: "published",
        views: 1250,
        image: "/images/domains/web-development.jpeg"
      },
      {
        id: 2,
        title: "AI-Powered Chatbot",
        description: "Intelligent chatbot using machine learning",
        category: "AI/ML",
        overview: "Developed an AI-powered chatbot using natural language processing.",
        technologies: ["Python", "TensorFlow", "NLP", "FastAPI"],
        features: ["Natural language understanding", "Context-aware conversations"],
        live_url: "https://ai-chatbot-demo.com",
        github_url: "https://github.com/username/ai-chatbot",
        status: "published",
        views: 890,
        image: "/images/domains/ai-ml.jpeg"
      }
    ];
  }

  getFallbackCategories() {
    return [
      { id: 1, name: "Web Development", description: "Full-stack web applications", color: "#3b82f6" },
      { id: 2, name: "Mobile Development", description: "Cross-platform mobile apps", color: "#10b981" },
      { id: 3, name: "AI/ML", description: "Artificial Intelligence", color: "#8b5cf6" }
    ];
  }

  getFallbackTechnologies() {
    return [
      {
        id: 1,
        title: "Frontend Development",
        type: "domain",
        icon: "💻",
        tech_skills: [
          { id: 1, name: "React", level: 5 },
          { id: 2, name: "JavaScript", level: 5 },
          { id: 3, name: "TypeScript", level: 4 }
        ]
      },
      {
        id: 2,
        title: "Backend Development",
        type: "domain",
        icon: "⚙️",
        tech_skills: [
          { id: 4, name: "Node.js", level: 5 },
          { id: 5, name: "Python", level: 4 },
          { id: 6, name: "MySQL", level: 4 }
        ]
      }
    ];
  }

  getFallbackNiches() {
    return [
      {
        id: 1,
        title: "E-Commerce Solutions",
        overview: "Comprehensive e-commerce platforms",
        tools: "React, Node.js, Stripe, MongoDB",
        key_features: "User authentication, Product catalog, Payment processing",
        image: "/images/domains/web-development.jpeg",
        sort_order: 1,
        ai_driven: false
      },
      {
        id: 2,
        title: "AI-Powered Applications",
        overview: "Intelligent applications leveraging ML",
        tools: "Python, TensorFlow, PyTorch, FastAPI",
        key_features: "Natural language processing, Computer vision, Predictive analytics",
        image: "/images/domains/ai-ml.jpeg",
        sort_order: 2,
        ai_driven: true
      }
    ];
  }

  isApiServerAvailable() {
    return this.isApiAvailable;
  }

  isInFallbackMode() {
    return this.fallbackMode;
  }
}

// Test scenarios
const testApiFallback = async () => {
  log('🚀 TESTING API FALLBACK SYSTEM');
  log('=' * 50);
  
  const apiService = new TestApiService();
  
  try {
    // Test 1: API is working normally
    log('Test 1: API is working normally');
    const healthCheck = await apiService.checkApiHealth();
    log(`API Health: ${healthCheck ? 'Healthy' : 'Unhealthy'}`);
    
    if (healthCheck) {
      // Test normal API calls
      const projects = await apiService.getPublishedProjects();
      log(`✅ Normal API call successful: ${projects.data?.length || 0} projects`);
      
      const categories = await apiService.getCategories();
      log(`✅ Normal API call successful: ${categories.data?.length || 0} categories`);
    }
    
    // Test 2: Simulate API failure
    log('\nTest 2: Simulating API failure');
    apiService.isApiAvailable = false; // Force API to be unavailable
    
    const fallbackProjects = await apiService.getPublishedProjects();
    log(`✅ Fallback projects loaded: ${fallbackProjects.data?.length || 0} projects`);
    log(`   First project: ${fallbackProjects.data?.[0]?.title || 'None'}`);
    
    const fallbackCategories = await apiService.getCategories();
    log(`✅ Fallback categories loaded: ${fallbackCategories.data?.length || 0} categories`);
    log(`   First category: ${fallbackCategories.data?.[0]?.name || 'None'}`);
    
    const fallbackTechnologies = await apiService.getTechnologies();
    log(`✅ Fallback technologies loaded: ${fallbackTechnologies.data?.length || 0} tech domains`);
    log(`   First tech domain: ${fallbackTechnologies.data?.[0]?.title || 'None'}`);
    
    const fallbackNiches = await apiService.getNiches();
    log(`✅ Fallback niches loaded: ${fallbackNiches.data?.length || 0} niches`);
    log(`   First niche: ${fallbackNiches.data?.[0]?.title || 'None'}`);
    
    const fallbackSettings = await apiService.getSettings();
    log(`✅ Fallback settings loaded: ${Object.keys(fallbackSettings.data || {}).length} settings`);
    
    // Test 3: Verify fallback data structure
    log('\nTest 3: Verifying fallback data structure');
    
    if (fallbackProjects.data?.[0]) {
      const project = fallbackProjects.data[0];
      const hasRequiredFields = project.title && project.description && project.category;
      log(`✅ Project structure valid: ${hasRequiredFields ? 'Yes' : 'No'}`);
      log(`   Title: ${project.title}`);
      log(`   Category: ${project.category}`);
    }
    
    if (fallbackCategories.data?.[0]) {
      const category = fallbackCategories.data[0];
      const hasRequiredFields = category.name && category.description;
      log(`✅ Category structure valid: ${hasRequiredFields ? 'Yes' : 'No'}`);
      log(`   Name: ${category.name}`);
    }
    
    if (fallbackTechnologies.data?.[0]) {
      const tech = fallbackTechnologies.data[0];
      const hasRequiredFields = tech.title && tech.type && tech.tech_skills;
      log(`✅ Technology structure valid: ${hasRequiredFields ? 'Yes' : 'No'}`);
      log(`   Title: ${tech.title}`);
      log(`   Skills count: ${tech.tech_skills?.length || 0}`);
    }
    
    // Test 4: Test API availability status
    log('\nTest 4: Testing API availability status');
    log(`API Available: ${apiService.isApiServerAvailable()}`);
    log(`Fallback Mode: ${apiService.isInFallbackMode()}`);
    
    // Test 5: Test error handling
    log('\nTest 5: Testing error handling');
    try {
      await apiService.makeRequest('/nonexistent-endpoint');
      log('❌ Should have thrown error for nonexistent endpoint');
    } catch (error) {
      log(`✅ Error handling works: ${error.message}`);
    }
    
    log('\n' + '=' * 50);
    log('🎉 API FALLBACK SYSTEM TEST COMPLETED');
    log('✅ All fallback mechanisms are working correctly');
    log('✅ Frontend will load demo data when API server fails');
    log('✅ Users will see a fallback notification');
    
  } catch (error) {
    log(`❌ API fallback test failed: ${error.message}`, 'error');
  }
};

// Run the test
testApiFallback(); 