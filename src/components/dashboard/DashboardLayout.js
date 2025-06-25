import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/supabaseService';
import ProjectsManager from './ProjectsManager';
import CategoriesManager from './CategoriesManager';
import './DashboardLayout.css';
import './ProjectsManager.css';
import './CategoriesManager.css';

const DashboardLayout = ({ user, onSignOut }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    totalViews: 0
  });

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '💼' },
    { id: 'media', label: 'Media Library', icon: '🖼️' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'export', label: 'Import/Export', icon: '📦' }
  ];

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
      
      // Calculate stats
      const published = projectsData.filter(p => p.status === 'published').length;
      const drafts = projectsData.filter(p => p.status === 'draft').length;
      
      setStats({
        totalProjects: projectsData.length,
        publishedProjects: published,
        draftProjects: drafts,
        totalViews: projectsData.reduce((sum, p) => sum + (p.views || 0), 0)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection stats={stats} projects={projects} />;
      case 'projects':
        return <ProjectsManager projects={projects} onProjectsChange={loadDashboardData} />;
      case 'media':
        return <MediaSection />;
      case 'categories':
        return <CategoriesManager />;
      case 'appearance':
        return <AppearanceSection />;
      case 'settings':
        return <SettingsSection user={user} />;
      case 'export':
        return <ExportSection />;
      default:
        return <OverviewSection stats={stats} projects={projects} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <header className="dashboard-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <h1>Portfolio Dashboard</h1>
        <button className="sign-out-btn" onClick={onSignOut}>
          Sign Out
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>📁 Dashboard</h2>
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sign-out-btn-sidebar" onClick={onSignOut}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {renderContent()}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Overview Section Component
const OverviewSection = ({ stats, projects }) => {
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>📊 Dashboard Overview</h2>
        <p>Welcome back! Here's what's happening with your portfolio.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{stats.totalProjects}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.publishedProjects}</h3>
            <p>Published</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.draftProjects}</h3>
            <p>Drafts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <h3>{stats.totalViews}</h3>
            <p>Total Views</p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="recent-projects">
        <h3>Recent Projects</h3>
        {recentProjects.length > 0 ? (
          <div className="projects-list">
            {recentProjects.map(project => (
              <div key={project.id} className="project-item">
                <div className="project-info">
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                  <span className={`status ${project.status}`}>
                    {project.status || 'draft'}
                  </span>
                </div>
                <div className="project-actions">
                  <button className="btn-edit">Edit</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Placeholder components for other sections

const MediaSection = () => (
  <div className="dashboard-section">
    <div className="section-header">
      <h2>🖼️ Media Library</h2>
      <button className="btn-primary">+ Upload Images</button>
    </div>
    <div className="content-placeholder">
      <p>Media library interface will be implemented here</p>
      <p>Features: Upload, organize, and manage all portfolio images</p>
    </div>
  </div>
);



const AppearanceSection = () => (
  <div className="dashboard-section">
    <div className="section-header">
      <h2>🎨 Appearance Settings</h2>
    </div>
    <div className="content-placeholder">
      <p>Appearance customization interface will be implemented here</p>
      <p>Features: Themes, colors, fonts, and layout options</p>
    </div>
  </div>
);

const SettingsSection = ({ user }) => (
  <div className="dashboard-section">
    <div className="section-header">
      <h2>⚙️ Account Settings</h2>
    </div>
    <div className="settings-form">
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={user?.email || ''} disabled />
      </div>
      <div className="form-group">
        <label>Full Name</label>
        <input 
          type="text" 
          value={user?.user_metadata?.full_name || ''} 
          placeholder="Enter your full name" 
        />
      </div>
      <button className="btn-primary">Update Profile</button>
    </div>
  </div>
);

const ExportSection = () => (
  <div className="dashboard-section">
    <div className="section-header">
      <h2>📦 Import & Export</h2>
    </div>
    <div className="export-options">
      <div className="export-card">
        <h3>Export Data</h3>
        <p>Download all your portfolio data as JSON</p>
        <button className="btn-secondary">Download Export</button>
      </div>
      <div className="export-card">
        <h3>Import Data</h3>
        <p>Upload and restore from a previous export</p>
        <button className="btn-secondary">Choose File</button>
      </div>
    </div>
  </div>
);

export default DashboardLayout; 