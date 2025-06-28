import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { projectService, settingsService } from '../../services/supabaseService';
import { syncService } from '../../services/syncService';
import { supabase } from '../../config/supabase';
import { useSettings } from '../../services/settingsContext';
import ProjectsManager from './ProjectsManager';
import CategoriesManager from './CategoriesManager';
import DomainsTechnologiesManager from './DomainsTechnologiesManager';
import NicheManager from './NicheManager';
import DebugSync from './DebugSync';
import ProgressDisplay from './ProgressDisplay';
import { applyTheme, getCurrentTheme, themes, saveThemeToSettings } from '../../utils/themeUtils';
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
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [stats, setStats] = useState({
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    totalViews: 0
  });

  // Progress display state
  const [progressDisplay, setProgressDisplay] = useState({
    isVisible: false,
    title: '',
    messages: [],
    isComplete: false
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
      // console.error('Error loading dashboard data:', error);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const status = await syncService.getDatabaseStatus();
      setDatabaseStatus(status);
      setIsDatabaseEmpty(status.isEmpty);
    } catch (error) {
      // console.error('Error checking database status:', error);
    }
  };

  const handleSyncData = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage('🔄 Syncing data...');

      // Initialize progress display
      setProgressDisplay({
        isVisible: true,
        title: '🔄 Syncing Data',
        messages: [],
        isComplete: false
      });

      const progressCallback = (message, type = 'info') => {
        setProgressDisplay(prev => ({
          ...prev,
          messages: [...prev.messages, {
            text: message,
            type: type,
            timestamp: new Date().toISOString()
          }]
        }));
      };
      
      const result = await syncService.syncAllData(progressCallback);
      
      if (result.success) {
        setSyncMessage(`✅ ${result.message}`);
        setIsDatabaseEmpty(false);
        
        // Mark progress as complete
        setProgressDisplay(prev => ({
          ...prev,
          isComplete: true
        }));

        // Reload dashboard data and status after sync
        setTimeout(() => {
          loadDashboardData();
          checkDatabaseStatus();
          setSyncMessage('');
        }, 2000);
      } else {
        setSyncMessage(`❌ ${result.message}`);
        setProgressDisplay(prev => ({
          ...prev,
          isComplete: true,
          messages: [...prev.messages, {
            text: `❌ ${result.message}`,
            type: 'error',
            timestamp: new Date().toISOString()
          }]
        }));
      }
    } catch (error) {
      // console.error('Sync error:', error);
      setSyncMessage(`❌ Sync failed: ${error.message}`);
      setProgressDisplay(prev => ({
        ...prev,
        isComplete: true,
        messages: [...prev.messages, {
          text: `❌ Sync failed: ${error.message}`,
          type: 'error',
          timestamp: new Date().toISOString()
        }]
      }));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackupData = async () => {
    try {
      setIsBackingUp(true);
      setBackupMessage('📦 Creating backup...');

      // Initialize progress display
      setProgressDisplay({
        isVisible: true,
        title: '📦 Creating Backup',
        messages: [],
        isComplete: false
      });

      const progressCallback = (message, type = 'info') => {
        setProgressDisplay(prev => ({
          ...prev,
          messages: [...prev.messages, {
            text: message,
            type: type,
            timestamp: new Date().toISOString()
          }]
        }));
      };
      
      const result = await syncService.backupAllData(progressCallback);
      
      if (result.success) {
        setBackupMessage(`✅ ${result.message}`);
        setProgressDisplay(prev => ({
          ...prev,
          isComplete: true
        }));
        setTimeout(() => {
          setBackupMessage('');
        }, 3000);
      } else {
        setBackupMessage(`❌ ${result.message}`);
        setProgressDisplay(prev => ({
          ...prev,
          isComplete: true,
          messages: [...prev.messages, {
            text: `❌ ${result.message}`,
            type: 'error',
            timestamp: new Date().toISOString()
          }]
        }));
      }
    } catch (error) {
      // console.error('Backup error:', error);
      setBackupMessage(`❌ Backup failed: ${error.message}`);
      setProgressDisplay(prev => ({
        ...prev,
        isComplete: true,
        messages: [...prev.messages, {
          text: `❌ Backup failed: ${error.message}`,
          type: 'error',
          timestamp: new Date().toISOString()
        }]
      }));
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

      // Initialize progress display
      setProgressDisplay({
        isVisible: true,
        title: '📥 Importing Data',
        messages: [],
        isComplete: false
      });

      const progressCallback = (message, type = 'info') => {
        setProgressDisplay(prev => ({
          ...prev,
          messages: [...prev.messages, {
            text: message,
            type: type,
            timestamp: new Date().toISOString()
          }]
        }));
      };
      
      const result = await syncService.importFromBackup(importFile, progressCallback);
      
      if (result.success) {
        setImportMessage(`✅ ${result.message}`);
        setImportFile(null);
        
        // Mark progress as complete
        setProgressDisplay(prev => ({
          ...prev,
          isComplete: true
        }));
        
        // Reload dashboard data and status after import
        setTimeout(() => {
          loadDashboardData();
          checkDatabaseStatus();
          setImportMessage('');
        }, 2000);
      } else {
        setImportMessage(`❌ ${result.message}`);
        setProgressDisplay(prev => ({
          ...prev,
          isComplete: true,
          messages: [...prev.messages, {
            text: `❌ ${result.message}`,
            type: 'error',
            timestamp: new Date().toISOString()
          }]
        }));
      }
    } catch (error) {
      // console.error('Import error:', error);
      setImportMessage(`❌ Import failed: ${error.message}`);
      setProgressDisplay(prev => ({
        ...prev,
        isComplete: true,
        messages: [...prev.messages, {
          text: `❌ Import failed: ${error.message}`,
          type: 'error',
          timestamp: new Date().toISOString()
        }]
      }));
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetData = async () => {
    // Confirm action with user
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL your data including projects, technologies, categories, niches, and settings. This action cannot be undone.\n\nAre you sure you want to continue?'
    );
    
    if (!confirmed) return;

    try {
      setIsResetting(true);
      setResetMessage('🗑️ Resetting all data...');

      // Initialize progress display
      setProgressDisplay({
        isVisible: true,
        title: '🗑️ Resetting Data',
        messages: [],
        isComplete: false
      });

      const progressCallback = (message, type = 'info') => {
        setProgressDisplay(prev => ({
          ...prev,
          messages: [...prev.messages, {
            text: message,
            type: type,
            timestamp: new Date().toISOString()
          }]
        }));
      };
      
      const result = await syncService.resetAllUserData(progressCallback);
      
      if (result.success) {
        setResetMessage(`✅ ${result.message}`);
        setIsDatabaseEmpty(true);
        
        // Mark progress as complete
        setProgressDisplay(prev => ({
          ...prev,
          isComplete: true
        }));
        
        // Reload dashboard data and status after reset
        setTimeout(() => {
          loadDashboardData();
          checkDatabaseStatus();
          setResetMessage('');
        }, 2000);
      } else {
        setResetMessage(`❌ ${result.message}`);
        setProgressDisplay(prev => ({
          ...prev,
          isComplete: true,
          messages: [...prev.messages, {
            text: `❌ ${result.message}`,
            type: 'error',
            timestamp: new Date().toISOString()
          }]
        }));
      }
    } catch (error) {
      // console.error('Reset error:', error);
      setResetMessage(`❌ Reset failed: ${error.message}`);
      setProgressDisplay(prev => ({
        ...prev,
        isComplete: true,
        messages: [...prev.messages, {
          text: `❌ Reset failed: ${error.message}`,
          type: 'error',
          timestamp: new Date().toISOString()
        }]
      }));
    } finally {
      setIsResetting(false);
    }
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const closeProgressDisplay = () => {
    setProgressDisplay({
      isVisible: false,
      title: '',
      messages: [],
      isComplete: false
    });
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
            isResetting={isResetting}
            resetMessage={resetMessage}
            onResetData={handleResetData}
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
            isResetting={isResetting}
            resetMessage={resetMessage}
            onResetData={handleResetData}
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

      {/* Progress Display Modal */}
      <ProgressDisplay
        isVisible={progressDisplay.isVisible}
        title={progressDisplay.title}
        messages={progressDisplay.messages}
        isComplete={progressDisplay.isComplete}
        onClose={closeProgressDisplay}
      />
    </div>
  );
};

// Overview Section Component
const OverviewSection = ({ stats, projects, isDatabaseEmpty, databaseStatus, isSyncing, syncMessage, onSyncData, isBackingUp, backupMessage, onBackupData, importFile, isImporting, importMessage, onFileSelect, onImportData, isResetting, resetMessage, onResetData }) => {
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
      {/* {!isDatabaseEmpty && (
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
      )} */}

      {/* Stats Cards */}
      {/* <div className="stats-grid">
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
      </div> */}

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

            <button 
              className={`btn-reset px-4 ${isResetting ? 'resetting' : ''}`}
              onClick={onResetData}
              disabled={isResetting}
              style={{ backgroundColor: '#dc3545', color: 'white', borderRadius: '8px' }}
            >
              {isResetting ? '🗑️ Resetting...' : '🗑️ Reset All Data'}
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

      {/* Reset Message Display */}
      {resetMessage && (
        <div className="reset-message-container">
          <p className="reset-message">{resetMessage}</p>
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

const AppearanceSection = () => {
  const { settings, loading, updateSettings, refreshSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [logoType, setLogoType] = useState('initials');
  const [logoFile, setLogoFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('sand');

  const defaultSettings = useMemo(() => ({
    logo_type: 'initials',
    logo_initials: 'MA',
    logo_image: '',
    hero_banner_image: '/images/hero-bg.png',
    avatar_image: '/images/profile/avatar.jpeg',
    banner_name: 'Muneeb Arif',
    banner_title: 'Principal Software Engineer',
    banner_tagline: 'I craft dreams, not projects.',
    resume_file: '/images/profile/principal-software-engineer-muneeb.resume.pdf',
    social_email: 'muneeb@example.com',
    social_github: 'https://github.com/muneebarif',
    social_instagram: '',
    social_facebook: '',
    copyright_text: '© 2024 Muneeb Arif. All rights reserved.',
    theme_name: 'sand'
  }), []);

  // Load settings from global context (NO DATABASE CALLS)
  const loadLocalSettings = useCallback(() => {
    try {
      console.log('🎨 Dashboard: Loading settings from global context...');
      
      // Get settings from global context (already loaded)
      const contextSettings = { ...defaultSettings };
      Object.keys(defaultSettings).forEach(key => {
        if (settings[key] !== undefined) {
          contextSettings[key] = settings[key];
        }
      });
      
      console.log('🎨 Dashboard: Settings loaded from context:', {
        settingsCount: Object.keys(contextSettings).length,
        hasTheme: !!contextSettings.theme_name,
        hasBannerName: !!contextSettings.banner_name
      });
      
      setLocalSettings(contextSettings);
      setLogoType(contextSettings.logo_type || 'initials');
      setCurrentTheme(contextSettings.theme_name || 'sand');
      
      console.log('✅ Dashboard: Local settings applied successfully');
    } catch (error) {
      console.error('❌ Dashboard: Error loading local settings:', error);
      setLocalSettings(defaultSettings);
      setLogoType('initials');
      setCurrentTheme('sand');
    }
  }, [settings, defaultSettings]);

  // Load settings when global settings change
  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      loadLocalSettings();
    }
  }, [loading, settings, loadLocalSettings]);

  const handleInputChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = async (themeName) => {
    try {
      console.log('🎨 Dashboard: Changing theme to:', themeName);
      
      // Apply theme immediately for instant feedback
      applyTheme(themeName);
      setCurrentTheme(themeName);
      
      // Update through global settings context (no direct database calls)
      const success = await updateSettings({ theme_name: themeName });
      
      if (success) {
        setMessage(`✅ Theme saved: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}!`);
        // Local settings will update automatically via useEffect when global settings change
      } else {
        setMessage(`⚠️ Theme applied locally: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} (save failed)`);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Dashboard: Error changing theme:', error);
      setMessage(`❌ Error changing theme: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const uploadFile = async (file, folder) => {
    try {
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(folder)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      // console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('Saving settings...');

      // Handle file uploads first
      const updatedSettings = { ...localSettings };

      if (logoFile && logoType === 'image') {
        const logoUrl = await uploadFile(logoFile, 'images');
        updatedSettings.logo_image = logoUrl;
      }

      if (heroFile) {
        const heroUrl = await uploadFile(heroFile, 'images');
        updatedSettings.hero_banner_image = heroUrl;
      }

      if (avatarFile) {
        const avatarUrl = await uploadFile(avatarFile, 'images');
        updatedSettings.avatar_image = avatarUrl;
      }

      if (resumeFile) {
        const resumeUrl = await uploadFile(resumeFile, 'images');
        updatedSettings.resume_file = resumeUrl;
      }

      // Include current theme in settings save
      updatedSettings.theme_name = currentTheme;

      console.log('💾 Dashboard: Saving settings via global context...', Object.keys(updatedSettings));

      // Update settings through global context (NO DIRECT DATABASE CALLS)
      const success = await updateSettings(updatedSettings);
      
      if (success) {
        setMessage('✅ Settings saved successfully!');
        // Clear file inputs
        setLogoFile(null);
        setHeroFile(null);
        setAvatarFile(null);
        setResumeFile(null);
        
        console.log('✅ Dashboard: Settings saved successfully');
      } else {
        setMessage('❌ Error saving settings. Please try again.');
        console.error('❌ Dashboard: Failed to save settings');
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Dashboard: Error saving settings:', error);
      setMessage('❌ Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const testGlobalSettings = () => {
    console.log('🧪 Dashboard: Testing global settings...');
    console.log('  - Global settings object:', settings);
    console.log('  - Loading state:', loading);
    console.log('  - Settings count:', Object.keys(settings).length);
    console.log('  - Has banner_name:', !!settings.banner_name);
    console.log('  - Has theme_name:', !!settings.theme_name);
    setMessage(`🧪 Global settings test: ${Object.keys(settings).length} settings loaded`);
    setTimeout(() => setMessage(''), 3000);
  };

  const initializeDefaults = async () => {
    try {
      console.log('🚀 Dashboard: Initializing default settings...');
      const success = await updateSettings(defaultSettings);
      if (success) {
        setMessage('✅ Default settings initialized!');
        console.log('✅ Dashboard: Default settings initialized');
      } else {
        setMessage('❌ Error initializing defaults');
        console.error('❌ Dashboard: Failed to initialize defaults');
      }
    } catch (error) {
      console.error('❌ Dashboard: Error initializing defaults:', error);
      setMessage('❌ Error initializing defaults: ' + error.message);
    }
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>🎨 Appearance Settings</h2>
        <div className="flex gap-2">
          <button 
            className="btn-secondary" 
            onClick={testGlobalSettings}
          >
            🧪 Test Global Settings
          </button>
          <button 
            className="btn-secondary" 
            onClick={initializeDefaults}
          >
            🚀 Initialize Defaults
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading settings from global context...</p>
        </div>
      ) : (
        <>
          {/* Theme Selection - Full Width */}
          <div className="settings-group theme-selection-section">
            <h3>🎨 Choose Your Theme</h3>
            <div className="theme-grid-enhanced">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  className={`theme-card ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => handleThemeChange(key)}
                  style={{
                    background: `linear-gradient(135deg, ${theme['--color-primary']}, ${theme['--color-secondary']})`,
                    border: currentTheme === key ? `3px solid ${theme['--color-accent'] || theme['--color-secondary']}` : '3px solid transparent',
                    boxShadow: currentTheme === key ? `0 8px 25px ${theme['--color-primary']}40` : '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="theme-preview">
                    <div className="theme-colors">
                      <div className="color-dot" style={{ backgroundColor: theme['--color-primary'] }}></div>
                      <div className="color-dot" style={{ backgroundColor: theme['--color-secondary'] }}></div>
                      <div className="color-dot" style={{ backgroundColor: theme['--color-accent'] || theme['--color-text'] }}></div>
                    </div>
                    <span className="theme-name">{theme.name}</span>
                    {currentTheme === key && (
                      <div className="active-indicator">✓ Active</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

                     {/* Two Column Layout */}
           <div className="settings-form-grid">
             {/* Left Column */}
             <div className="settings-column">
               {/* Logo Section */}
               <div className="settings-group">
                 <h3>🏷️ Logo</h3>
                 <div className="form-group">
                   <label>Logo Type</label>
                   <select 
                     value={logoType} 
                     onChange={(e) => {
                       setLogoType(e.target.value);
                       handleInputChange('logo_type', e.target.value);
                     }}
                   >
                     <option value="initials">Text Initials</option>
                     <option value="image">Logo Image</option>
                   </select>
                 </div>

                 {logoType === 'initials' ? (
                   <div className="form-group">
                     <label>Logo Initials</label>
                     <input
                       type="text"
                       value={localSettings.logo_initials || 'MA'}
                       onChange={(e) => handleInputChange('logo_initials', e.target.value)}
                       placeholder="MA"
                       maxLength={4}
                     />
                   </div>
                 ) : (
                   <div className="form-group">
                     <label>Logo Image</label>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={(e) => setLogoFile(e.target.files[0])}
                     />
                     {localSettings.logo_image && (
                       <div className="current-file">
                         <p>Current: {localSettings.logo_image.split('/').pop()}</p>
                       </div>
                     )}
                   </div>
                 )}
               </div>

               {/* Banner Content Section */}
               <div className="settings-group">
                 <h3>📝 Banner Content</h3>
                 <div className="form-group">
                   <label>Name</label>
                   <input
                     type="text"
                     value={localSettings.banner_name || ''}
                     onChange={(e) => handleInputChange('banner_name', e.target.value)}
                     placeholder="Your Name"
                   />
                 </div>
                 <div className="form-group">
                   <label>Title</label>
                   <input
                     type="text"
                     value={localSettings.banner_title || ''}
                     onChange={(e) => handleInputChange('banner_title', e.target.value)}
                     placeholder="Your Professional Title"
                   />
                 </div>
                 <div className="form-group">
                   <label>Tagline</label>
                   <textarea
                     value={localSettings.banner_tagline || ''}
                     onChange={(e) => handleInputChange('banner_tagline', e.target.value)}
                     placeholder="Your tagline or description"
                     rows={3}
                   />
                 </div>
               </div>

               {/* Hero Banner Section */}
               <div className="settings-group">
                 <h3>🖼️ Hero Banner</h3>
                 <div className="form-group">
                   <label>Banner Image</label>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => setHeroFile(e.target.files[0])}
                   />
                   {localSettings.hero_banner_image && (
                     <div className="current-file">
                       <p>Current: {localSettings.hero_banner_image.split('/').pop()}</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>

             {/* Right Column */}
             <div className="settings-column">
               {/* Avatar Section */}
               <div className="settings-group">
                 <h3>👤 Avatar</h3>
                 <div className="form-group">
                   <label>Profile Picture</label>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => setAvatarFile(e.target.files[0])}
                   />
                   {localSettings.avatar_image && (
                     <div className="current-file">
                       <p>Current: {localSettings.avatar_image.split('/').pop()}</p>
                     </div>
                   )}
                 </div>
               </div>

               {/* Resume Section */}
               <div className="settings-group">
                 <h3>📄 Resume</h3>
                 <div className="form-group">
                   <label>Resume PDF</label>
                   <input
                     type="file"
                     accept=".pdf"
                     onChange={(e) => setResumeFile(e.target.files[0])}
                   />
                   {localSettings.resume_file && (
                     <div className="current-file">
                       <p>Current: {localSettings.resume_file.split('/').pop()}</p>
                     </div>
                   )}
                 </div>
               </div>

               {/* Social Links Section */}
               <div className="settings-group">
                 <h3>🔗 Social Links</h3>
                 <div className="form-group">
                   <label>Email</label>
                   <input
                     type="email"
                     value={localSettings.social_email || ''}
                     onChange={(e) => handleInputChange('social_email', e.target.value)}
                     placeholder="your@email.com"
                   />
                 </div>
                 <div className="form-group">
                   <label>GitHub URL</label>
                   <input
                     type="url"
                     value={localSettings.social_github || ''}
                     onChange={(e) => handleInputChange('social_github', e.target.value)}
                     placeholder="https://github.com/username"
                   />
                 </div>
                 <div className="form-group">
                   <label>Instagram URL</label>
                   <input
                     type="url"
                     value={localSettings.social_instagram || ''}
                     onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                     placeholder="https://instagram.com/username"
                   />
                 </div>
                 <div className="form-group">
                   <label>Facebook URL</label>
                   <input
                     type="url"
                     value={localSettings.social_facebook || ''}
                     onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                     placeholder="https://facebook.com/username"
                   />
                 </div>
               </div>

               {/* Footer Section */}
               <div className="settings-group">
                 <h3>📄 Footer</h3>
                 <div className="form-group">
                   <label>Copyright Text</label>
                   <input
                     type="text"
                     value={localSettings.copyright_text || ''}
                     onChange={(e) => handleInputChange('copyright_text', e.target.value)}
                     placeholder="© 2024 Your Name. All rights reserved."
                   />
                 </div>
               </div>
             </div>
           </div>
         </>
      )}
    </div>
  );
};

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