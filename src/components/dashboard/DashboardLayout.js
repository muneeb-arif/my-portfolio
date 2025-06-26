import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/supabaseService';
import { syncService } from '../../services/syncService';
import ProjectsManager from './ProjectsManager';
import CategoriesManager from './CategoriesManager';
import DomainsTechnologiesManager from './DomainsTechnologiesManager';
import NicheManager from './NicheManager';
import DebugSync from './DebugSync';
import './DashboardLayout.css';
import './ProjectsManager.css';
import './CategoriesManager.css';
import './DomainsTechnologiesManager.css';
import './NicheManager.css';

const DashboardLayout = ({ user, onSignOut }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState({
    projects: 0,
    technologies: 0,
    niches: 0,
    categories: 0,
    isEmpty: false
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
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
    { id: 'domains-technologies', label: 'Technologies', icon: '🎯' },
    { id: 'niche', label: 'Domains / Niche', icon: '🏆' },
    { id: 'media', label: 'Media Library', icon: '🖼️' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'export', label: 'Import/Export', icon: '📦' },
    { id: 'debug', label: 'Debug Sync', icon: '🔧' }
  ];

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    checkDatabaseStatus();
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

  const checkDatabaseStatus = async () => {
    try {
      const status = await syncService.getDatabaseStatus();
      setDatabaseStatus(status);
      setIsDatabaseEmpty(status.isEmpty);
    } catch (error) {
      console.error('Error checking database status:', error);
    }
  };

  const handleSyncData = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage('🔄 Syncing data...');
      
      const result = await syncService.syncAllData();
      
      if (result.success) {
        setSyncMessage(`✅ ${result.message}`);
        setIsDatabaseEmpty(false);
        
        // Reload dashboard data and status after sync
        setTimeout(() => {
          loadDashboardData();
          checkDatabaseStatus();
          setSyncMessage('');
        }, 2000);
      } else {
        setSyncMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage(`❌ Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackupData = async () => {
    try {
      setIsBackingUp(true);
      setBackupMessage('📦 Creating backup...');
      
      const result = await syncService.backupAllData();
      
      if (result.success) {
        setBackupMessage(`✅ ${result.message}`);
        setTimeout(() => {
          setBackupMessage('');
        }, 3000);
      } else {
        setBackupMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Backup error:', error);
      setBackupMessage(`❌ Backup failed: ${error.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
      setImportMessage('');
    } else {
      setImportMessage('❌ Please select a valid JSON backup file');
      setImportFile(null);
    }
  };

  const handleImportData = async () => {
    if (!importFile) {
      setImportMessage('❌ Please select a backup file first');
      return;
    }

    try {
      setIsImporting(true);
      setImportMessage('📥 Importing data...');
      
      const result = await syncService.importFromBackup(importFile);
      
      if (result.success) {
        setImportMessage(`✅ ${result.message}`);
        setImportFile(null);
        
        // Reload dashboard data and status after import
        setTimeout(() => {
          loadDashboardData();
          checkDatabaseStatus();
          setImportMessage('');
        }, 2000);
      } else {
        setImportMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportMessage(`❌ Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection 
            stats={stats} 
            projects={projects} 
            isDatabaseEmpty={isDatabaseEmpty}
            databaseStatus={databaseStatus}
            isSyncing={isSyncing}
            syncMessage={syncMessage}
            onSyncData={handleSyncData}
            isBackingUp={isBackingUp}
            backupMessage={backupMessage}
            onBackupData={handleBackupData}
            importFile={importFile}
            isImporting={isImporting}
            importMessage={importMessage}
            onFileSelect={handleFileSelect}
            onImportData={handleImportData}
          />
        );
      case 'projects':
        return <ProjectsManager projects={projects} onProjectsChange={loadDashboardData} />;
      case 'domains-technologies':
        return <DomainsTechnologiesManager />;
      case 'niche':
        return <NicheManager />;
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
      case 'debug':
        return <DebugSync />;
      default:
        return (
          <OverviewSection 
            stats={stats} 
            projects={projects} 
            isDatabaseEmpty={isDatabaseEmpty}
            databaseStatus={databaseStatus}
            isSyncing={isSyncing}
            syncMessage={syncMessage}
            onSyncData={handleSyncData}
            isBackingUp={isBackingUp}
            backupMessage={backupMessage}
            onBackupData={handleBackupData}
            importFile={importFile}
            isImporting={isImporting}
            importMessage={importMessage}
            onFileSelect={handleFileSelect}
            onImportData={handleImportData}
          />
        );
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
const OverviewSection = ({ stats, projects, isDatabaseEmpty, databaseStatus, isSyncing, syncMessage, onSyncData, isBackingUp, backupMessage, onBackupData, importFile, isImporting, importMessage, onFileSelect, onImportData }) => {
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>📊 Dashboard Overview</h2>
        <p>Welcome back! Here's what's happening with your portfolio.</p>
      </div>

      {/* Database Empty State */}
      {isDatabaseEmpty && (
        <div className="empty-database-alert">
          <div className="alert-content">
            <h3>🚀 Welcome to Your Portfolio Dashboard!</h3>
            <p>Your database is empty. Click the sync button below to populate it with sample data including:</p>
            <ul>
              <li>📁 Sample project categories</li>
              <li>🎯 Technology domains and skills</li>
              <li>🏆 Domain expertise areas</li>
              <li>💼 Sample projects with Unsplash images</li>
            </ul>
            <button 
              className={`btn-sync-primary ${isSyncing ? 'syncing' : ''}`}
              onClick={onSyncData}
              disabled={isSyncing}
            >
              {isSyncing ? '🔄 Syncing...' : '🚀 Sync Sample Data'}
            </button>
            {syncMessage && (
              <p className="sync-message">{syncMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Database Status Overview */}
      {!isDatabaseEmpty && (
        <div className="database-status-overview">
          <h3>📊 Database Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-icon">💼</span>
              <span className="status-label">Projects</span>
              <span className="status-count">{databaseStatus.projects}</span>
            </div>
            <div className="status-item">
              <span className="status-icon">🎯</span>
              <span className="status-label">Technologies</span>
              <span className="status-count">{databaseStatus.technologies}</span>
            </div>
            <div className="status-item">
              <span className="status-icon">🏆</span>
              <span className="status-label">Niches</span>
              <span className="status-count">{databaseStatus.niches}</span>
            </div>
            <div className="status-item">
              <span className="status-icon">📁</span>
              <span className="status-label">Categories</span>
              <span className="status-count">{databaseStatus.categories}</span>
            </div>
          </div>
        </div>
      )}

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
            <p>No projects yet. {!isDatabaseEmpty && 'Create your first project to get started!'}</p>
          </div>
        )}
      </div>

      {/* Sync Section (only show if not empty and no sync message) */}
      {!isDatabaseEmpty && !syncMessage && (
        <div className="sync-section">
          <h3>🔄 Data Management</h3>
          <p>Need to reset, sync, backup, or import your data?</p>
          
          <div className="data-management-buttons">
            <button 
              className={`btn-sync ${isSyncing ? 'syncing' : ''}`}
              onClick={onSyncData}
              disabled={isSyncing}
            >
              {isSyncing ? '🔄 Syncing...' : '🔄 Reset & Sync Data'}
            </button>
            
            <button 
              className={`btn-backup ${isBackingUp ? 'backing-up' : ''}`}
              onClick={onBackupData}
              disabled={isBackingUp}
            >
              {isBackingUp ? '📦 Backing up...' : '📦 Backup Data'}
            </button>
          </div>

          <div className="sync-warning">
            <p>⚠️ <strong>Warning:</strong> The "Reset & Sync" button will delete all existing data and replace it with sample data.</p>
          </div>

          {/* Import Section */}
          <div className="import-section">
            <h4>📥 Import from Backup</h4>
            <div className="import-controls">
              <input
                type="file"
                accept=".json"
                onChange={onFileSelect}
                className="file-input"
                id="backup-file-input"
                disabled={isImporting}
              />
              <label htmlFor="backup-file-input" className="file-input-label">
                {importFile ? `📁 ${importFile.name}` : '📁 Choose Backup File'}
              </label>
              <button 
                className={`btn-import ${isImporting ? 'importing' : ''}`}
                onClick={onImportData}
                disabled={!importFile || isImporting}
              >
                {isImporting ? '📥 Importing...' : '📥 Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Message Display */}
      {syncMessage && (
        <div className="sync-message-container">
          <p className="sync-message">{syncMessage}</p>
        </div>
      )}

      {/* Backup Message Display */}
      {backupMessage && (
        <div className="backup-message-container">
          <p className="backup-message">{backupMessage}</p>
        </div>
      )}

      {/* Import Message Display */}
      {importMessage && (
        <div className="import-message-container">
          <p className="import-message">{importMessage}</p>
        </div>
      )}
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