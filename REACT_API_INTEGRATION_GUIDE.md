# React API Integration Guide

This guide explains how to integrate the new Next.js API endpoints with your React portfolio application for seamless hybrid operation.

## 🎯 Overview

The API integration provides a gradual migration path from direct Supabase calls to API-based services. This enables:

- **Zero Downtime Migration** - Switch between services without breaking existing functionality
- **Fallback Support** - Automatic fallback to Supabase if API fails
- **Environment-Based Configuration** - Easy switching between development and production modes

## 📁 Service Architecture

### New API Services
```
src/services/
├── apiAuthService.js           # JWT-based authentication
├── apiProjectService.js        # Project CRUD operations
├── apiDashboardService.js      # Dashboard management
├── apiPortfolioService.js      # Public portfolio data
└── serviceAdapter.js           # Seamless service switching
```

### Service Adapter Pattern
The `serviceAdapter.js` provides unified interfaces that automatically choose between Supabase and API services based on environment configuration.

## ⚙️ Configuration

### Environment Variables (.env.local)
```env
# API Integration Settings
REACT_APP_API_URL=http://localhost:3001
REACT_APP_USE_API_SERVICE=false
REACT_APP_ENABLE_HYBRID_MODE=true

# Original Supabase settings (still needed)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

### Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_USE_API_SERVICE` | Use API instead of Supabase | `false` |
| `REACT_APP_ENABLE_HYBRID_MODE` | Enable fallback to Supabase | `true` |
| `REACT_APP_API_URL` | Next.js API server URL | `http://localhost:3001` |

## 🔄 Migration Steps

### Step 1: Start Next.js API Server
```bash
# In project root, start the Next.js API server
npm run dev:api
# or manually: cd to nextjs-api and run `npm run dev`
```

### Step 2: Update Component Imports
Replace direct Supabase service imports with service adapter:

**Before:**
```javascript
import { projectService, metaService } from '../services/supabaseService';
```

**After:**
```javascript
import { projectService, metaService } from '../services/serviceAdapter';
```

### Step 3: Test with Hybrid Mode
1. Keep `REACT_APP_USE_API_SERVICE=false` initially
2. Verify React app still works with Supabase
3. Set `REACT_APP_USE_API_SERVICE=true` to test API
4. Ensure fallback works by stopping API server

### Step 4: Component-by-Component Migration
Update components one at a time to use the service adapter:

```javascript
// Dashboard Component Example
import React, { useState, useEffect } from 'react';
import { projectService } from '../services/serviceAdapter'; // 👈 Use adapter

const Dashboard = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectService.getProjects(); // 👈 Same API
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };
    
    loadProjects();
  }, []);

  // Component logic remains unchanged
  return <div>{/* Your JSX */}</div>;
};
```

## 🔐 Authentication Integration

### Login Component Update
```javascript
import { authService } from '../services/serviceAdapter';

const LoginComponent = () => {
  const handleLogin = async (email, password) => {
    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        // Handle successful login
        console.log('User logged in:', result.user);
      } else {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Rest of component...
};
```

### Auth Context Update
```javascript
import { authService } from '../services/serviceAdapter';

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Rest of provider...
};
```

## 📊 Dashboard Components Integration

### Projects Manager
```javascript
import { projectService } from '../services/serviceAdapter';

const ProjectsManager = () => {
  // Create project
  const handleCreateProject = async (formData) => {
    try {
      const newProject = await projectService.createProject(formData);
      setProjects(prev => [...prev, newProject]);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // Upload images
  const handleImageUpload = async (projectId, files) => {
    try {
      const uploadedImages = await projectService.uploadProjectImages(projectId, files);
      // Update project with new images
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  // Rest of component...
};
```

### Categories Manager
```javascript
import { metaService } from '../services/serviceAdapter';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    try {
      const data = await metaService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      const newCategory = await metaService.addCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Rest of component...
};
```

## 🌐 Public Portfolio Integration

### Portfolio Display Components
```javascript
import { publicPortfolioService } from '../services/serviceAdapter';

const PortfolioGrid = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await publicPortfolioService.getPublishedProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
        // Will automatically fallback to Supabase if ENABLE_HYBRID_MODE=true
      }
    };

    loadProjects();
  }, []);

  // Rest of component...
};
```

## 🔧 Development Workflow

### Local Development Setup
1. **Start React App**: `npm start` (port 3000)
2. **Start Next.js API**: `npm run dev:api` (port 3001)
3. **Test Both Services**: Toggle `REACT_APP_USE_API_SERVICE` flag

### Testing API Integration
```javascript
// Test service switching
import { getServiceMode, switchToApiService } from '../services/serviceAdapter';

console.log('Current service mode:', getServiceMode()); // 'api' or 'supabase'

// Manual service switching (for testing)
switchToApiService();
```

### Debugging API Calls
The service adapter logs all requests for debugging:
```javascript
// Enable debug logging
console.log('🔧 Service Adapter Configuration:', {
  USE_API_SERVICE: process.env.REACT_APP_USE_API_SERVICE,
  ENABLE_HYBRID_MODE: process.env.REACT_APP_ENABLE_HYBRID_MODE,
  API_URL: process.env.REACT_APP_API_URL
});
```

## 🚀 Production Deployment

### Environment Configuration
```env
# Production API settings
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_USE_API_SERVICE=true
REACT_APP_ENABLE_HYBRID_MODE=true
```

### Gradual Migration Strategy
1. **Week 1**: Deploy with `USE_API_SERVICE=false` (Supabase only)
2. **Week 2**: Deploy with `USE_API_SERVICE=true` + `ENABLE_HYBRID_MODE=true`
3. **Week 3**: Monitor API performance and error rates
4. **Week 4**: Full API mode with `ENABLE_HYBRID_MODE=false`

## 🛠️ API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Dashboard (Authenticated)
- `GET/POST /api/dashboard/projects` - Projects CRUD
- `GET/POST /api/dashboard/categories` - Categories CRUD
- `GET/POST /api/dashboard/niches` - Niches CRUD
- `GET/PUT /api/dashboard/settings` - Settings management

### Public Portfolio
- `GET /api/portfolio/projects` - Published projects
- `GET /api/portfolio/settings` - Public settings

## 🔍 Troubleshooting

### Common Issues

1. **API Server Not Running**
   - Error: "Network error" or connection refused
   - Solution: Start Next.js API server on port 3001

2. **Authentication Token Missing**
   - Error: "Authorization required"
   - Solution: Check if user is logged in and token is stored

3. **CORS Issues**
   - Error: "CORS policy" errors
   - Solution: Verify Next.js API CORS configuration

4. **Service Adapter Not Working**
   - Check environment variables are loaded
   - Verify service imports are correct

### Debug Commands
```bash
# Check API server status
curl http://localhost:3001/api/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🎉 Benefits

- **Improved Performance**: API caching and optimized queries
- **Better Security**: JWT-based authentication with proper validation
- **Scalability**: Database connection pooling and error handling
- **Maintainability**: Centralized business logic in API layer
- **Flexibility**: Easy switching between data sources

## 📝 Next Steps

1. Update all dashboard components to use service adapter
2. Implement file upload functionality
3. Add real-time updates with WebSockets
4. Set up production deployment with proper error monitoring
5. Optimize API performance with caching strategies

---

For technical support, refer to the `HYBRID_SETUP_GUIDE.md` for detailed API setup instructions. 