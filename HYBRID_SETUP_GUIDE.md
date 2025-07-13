# 🔄 Hybrid Setup Guide: React Frontend + Next.js API

This guide will help you set up the **Next.js API backend** alongside your **existing React frontend** for a smooth, zero-downtime migration.

## 📋 Quick Overview

- **React Frontend**: Continues running on `localhost:3000`
- **Next.js API**: New backend on `localhost:3001`
- **Database**: Shared MySQL database (existing data)
- **Migration**: Gradual transition with full rollback capability

---

## 🚀 Step 1: Install Next.js API Dependencies

```bash
# Navigate to the Next.js API directory
cd nextjs-api

# Install dependencies
npm install

# Install additional packages if needed
npm install @types/cors
```

---

## 🔧 Step 2: Configure Environment Variables

Create `.env.local` in the `nextjs-api` directory:

```bash
# In nextjs-api/.env.local
# Database Configuration (MySQL)
MYSQL_HOST=localhost
MYSQL_PORT=8889
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=portfolio

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000

# API Configuration
API_PORT=3001

# Portfolio Configuration
PORTFOLIO_OWNER_EMAIL=muneebarif11@gmail.com

# Node Environment
NODE_ENV=development
```

**📝 Environment Variables Setup:**
```bash
cd nextjs-api
echo "MYSQL_HOST=localhost
MYSQL_PORT=8889
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=portfolio
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
API_PORT=3001
PORTFOLIO_OWNER_EMAIL=muneebarif11@gmail.com
NODE_ENV=development" > .env.local
```

---

## 🔌 Step 3: Test Database Connection

```bash
# From nextjs-api directory
node -e "
const { testConnection } = require('./lib/database.js');
testConnection().then(result => {
  console.log('Database test:', result);
}).catch(err => {
  console.error('Database error:', err);
});
"
```

---

## 🏃‍♂️ Step 4: Start Next.js API Server

```bash
# Terminal 1: Start Next.js API (from nextjs-api directory)
cd nextjs-api
npm run dev

# Should show: "ready - started server on 0.0.0.0:3001"
```

```bash
# Terminal 2: Keep React app running (from main portfolio directory)  
cd ..
npm start

# Should show: "compiled successfully" on localhost:3000
```

---

## 🧪 Step 5: Test API Endpoints

Test the API endpoints to ensure they're working:

### **Test Settings API:**
```bash
curl http://localhost:3001/api/portfolio/settings
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "banner_name": "Muneeb Arif",
      "banner_title": "Principal Software Engineer",
      "theme_name": "sand",
      // ... other settings
    },
    "user": {
      "id": "user-id",
      "email": "muneebarif11@gmail.com"
    }
  }
}
```

### **Test Projects API:**
```bash
curl http://localhost:3001/api/portfolio/projects
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      // Array of projects with images
    ],
    "categories": [
      // Array of categories
    ],
    "totalProjects": 43
  }
}
```

### **Test Login API:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"muneebarif11@gmail.com","password":"your-password"}'
```

---

## 🔗 Step 6: Update React Services

Now update your React app to use the new API endpoints. Here's how:

### **Update Portfolio Service:**

**File:** `src/services/portfolioService.js`

```javascript
// Add this at the top
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Update the existing methods:
const portfolioService = {
  // Existing methods...
  
  // NEW: API-based methods
  async getProjectsFromAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      return data.data.projects; // Return projects array
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to existing method
      return this.getProjects();
    }
  },

  async getSettingsFromAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      return data.data.settings; // Return settings object
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to existing method
      return this.getSettings();
    }
  },

  // Update existing methods to use API first, fallback to current implementation
  async getProjects() {
    try {
      return await this.getProjectsFromAPI();
    } catch (error) {
      // Fallback to existing implementation
      return this.getProjectsOriginal();
    }
  }
};
```

### **Update Auth Service:**

**File:** `src/services/authService.js` (create if doesn't exist)

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthService {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('auth_token');
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  getUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new AuthService();
```

---

## 🧪 Step 7: Test Hybrid Setup

### **Test Settings in React App:**
1. Open your React app: `http://localhost:3000`
2. Open browser console
3. Run: 
```javascript
fetch('http://localhost:3001/api/portfolio/settings')
  .then(r => r.json())
  .then(data => console.log('API Settings:', data));
```

### **Test Projects in React App:**
```javascript
fetch('http://localhost:3001/api/portfolio/projects')
  .then(r => r.json())
  .then(data => console.log('API Projects:', data));
```

---

## 🔄 Step 8: Gradual Migration Strategy

### **Phase 1: Test API (Current)**
- ✅ Next.js API running alongside React
- ✅ Database connection working
- ✅ Basic endpoints responding

### **Phase 2: Switch One Service**
```javascript
// In your React components, replace:
const projects = await portfolioService.getProjects(); // Old way

// With:
const projects = await portfolioService.getProjectsFromAPI(); // New way
```

### **Phase 3: Full API Integration**
- Update all React services to use Next.js API
- Remove old database connection logic from React
- Test all functionality

### **Phase 4: Authentication Migration**
- Implement JWT-based auth in React dashboard
- Replace existing auth with Next.js auth endpoints
- Test dashboard login/logout

---

## 🚨 Troubleshooting

### **CORS Issues:**
If you see CORS errors in browser console:
```bash
# Check Next.js API is running with CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3001/api/portfolio/settings
```

### **Database Connection Issues:**
```bash
# Test MySQL connection from Next.js API directory
cd nextjs-api
node -e "require('dotenv').config({path:'.env.local'}); console.log('Env loaded:', process.env.MYSQL_HOST);"
```

### **Port Conflicts:**
```bash
# Check what's running on ports
lsof -i :3000  # React app
lsof -i :3001  # Next.js API
```

### **Environment Variables Not Loading:**
```bash
# Verify .env.local exists and is readable
cd nextjs-api
ls -la .env.local
cat .env.local
```

---

## 📊 Success Indicators

✅ **API Server Running**: `http://localhost:3001` responds  
✅ **React App Running**: `http://localhost:3000` loads normally  
✅ **Database Connected**: Settings API returns real data  
✅ **CORS Working**: No CORS errors in browser console  
✅ **Projects Loading**: Projects API returns your actual projects  

---

## 🎯 Next Steps

1. **Test Current Setup**: Verify all endpoints work
2. **Update One Component**: Start with a simple component using API
3. **Gradual Migration**: Move service by service to API
4. **Dashboard Integration**: Implement auth and admin features
5. **Production Deployment**: Configure for production

---

## 🔙 Rollback Plan

If anything goes wrong:
1. **Stop Next.js API**: `Ctrl+C` in the API terminal
2. **React App Continues**: Your React app continues working normally
3. **No Data Loss**: All data remains in MySQL
4. **Zero Downtime**: Users experience no interruption

---

**🎉 Ready to start? Run the installation commands and test the endpoints!** 