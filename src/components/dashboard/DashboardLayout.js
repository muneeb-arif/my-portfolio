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

  const handleResetData = async () => {
    // Confirm action with user
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL your data including projects, technologies, categories, niches, and settings. This action cannot be undone.\n\nAre you sure you want to continue?'
    );
    
    if (!confirmed) return;

    try {
      setIsResetting(true);
      setResetMessage('🗑️ Resetting all data...');
      
      const result = await syncService.resetAllUserData();
      
      if (result.success) {
        setResetMessage(`✅ ${result.message}`);
        setIsDatabaseEmpty(true);
        
        // Reload dashboard data and status after reset
        setTimeout(() => {
          loadDashboardData();
          checkDatabaseStatus();
          setResetMessage('');
        }, 2000);
      } else {
        setResetMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Reset error:', error);
      setResetMessage(`❌ Reset failed: ${error.message}`);
    } finally {
      setIsResetting(false);
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

            <button 
              className={`btn-reset ${isResetting ? 'resetting' : ''}`}
              onClick={onResetData}
              disabled={isResetting}
              style={{ backgroundColor: '#dc3545', color: 'white' }}
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
  const { getSetting, refreshSettings } = useSettings();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [logoType, setLogoType] = useState('initials');
  const [logoFile, setLogoFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

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
    copyright_text: '© 2024 Muneeb Arif. All rights reserved.'
  }), []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🎨 AppearanceSection: Loading settings...');
      
      // Get settings from context instead of loading separately
      const contextSettings = {};
      Object.keys(defaultSettings).forEach(key => {
        contextSettings[key] = getSetting(key);
      });
      
      console.log('🎨 AppearanceSection: Context settings loaded:', contextSettings);
      setSettings(contextSettings);
      setLogoType(contextSettings.logo_type || 'initials');
      console.log('🎨 AppearanceSection: Settings applied successfully');
    } catch (error) {
      console.error('❌ AppearanceSection: Error loading settings:', error);
      console.log('🔄 AppearanceSection: Using default settings');
      setSettings(defaultSettings);
      setLogoType('initials');
    } finally {
      console.log('✅ AppearanceSection: Loading complete');
      setLoading(false);
    }
  }, [defaultSettings, getSetting]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('Saving settings...');

      // Handle file uploads first
      const updatedSettings = { ...settings };

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

      // Update settings in database
      await settingsService.updateMultipleSettings(updatedSettings);
      
      setSettings(updatedSettings);
      setMessage('✅ Settings saved successfully!');
      
      // Clear file inputs
      setLogoFile(null);
      setHeroFile(null);
      setAvatarFile(null);
      setResumeFile(null);
      
      // Refresh settings in the context
      await refreshSettings();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file, bucket) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="section-header">
          <h2>🎨 Appearance Settings</h2>
        </div>
        <div className="loading-spinner">
          <p>Loading settings...</p>
          <button 
            className="btn-secondary mt-4"
            onClick={() => {
              console.log('🔄 Manual fallback triggered');
              setLoading(false);
              setSettings(defaultSettings);
              setLogoType('initials');
            }}
          >
            🔄 Use Default Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>🎨 Appearance Settings</h2>
        <div className="flex gap-2">
          <button 
            className="btn-secondary" 
            onClick={async () => {
              try {
                console.log('🧪 Testing settings service...');
                const testSettings = await settingsService.getSettings();
                console.log('🧪 Test result:', testSettings);
                setMessage(`🧪 Settings test: ${Object.keys(testSettings).length} settings found`);
              } catch (error) {
                console.error('🧪 Test error:', error);
                setMessage(`🧪 Test error: ${error.message}`);
              }
            }}
          >
            🧪 Test Settings
          </button>
          <button 
            className="btn-secondary" 
            onClick={async () => {
              try {
                await settingsService.updateMultipleSettings(defaultSettings);
                setMessage('✅ Default settings initialized!');
                loadSettings();
              } catch (error) {
                setMessage('❌ Error initializing defaults: ' + error.message);
              }
            }}
          >
            🚀 Initialize Defaults
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={saving}
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

      <div className="appearance-settings">
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
                value={settings.logo_initials || 'MA'}
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
              {settings.logo_image && (
                <div className="current-file">
                  <p>Current: {settings.logo_image.split('/').pop()}</p>
                </div>
              )}
            </div>
          )}
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
            {settings.hero_banner_image && (
              <div className="current-file">
                <p>Current: {settings.hero_banner_image.split('/').pop()}</p>
              </div>
            )}
          </div>
        </div>

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
            {settings.avatar_image && (
              <div className="current-file">
                <p>Current: {settings.avatar_image.split('/').pop()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Banner Content Section */}
        <div className="settings-group">
          <h3>📝 Banner Content</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={settings.banner_name || ''}
              onChange={(e) => handleInputChange('banner_name', e.target.value)}
              placeholder="Muneeb Arif"
            />
          </div>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={settings.banner_title || ''}
              onChange={(e) => handleInputChange('banner_title', e.target.value)}
              placeholder="Principal Software Engineer"
            />
          </div>
          <div className="form-group">
            <label>Tagline</label>
            <textarea
              value={settings.banner_tagline || ''}
              onChange={(e) => handleInputChange('banner_tagline', e.target.value)}
              placeholder="I craft dreams, not projects."
              rows={3}
            />
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
            {settings.resume_file && (
              <div className="current-file">
                <p>Current: {settings.resume_file.split('/').pop()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Social Media Section */}
        <div className="settings-group">
          <h3>🌐 Social Media</h3>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={settings.social_email || ''}
              onChange={(e) => handleInputChange('social_email', e.target.value)}
              placeholder="muneeb@example.com"
            />
          </div>
          <div className="form-group">
            <label>GitHub</label>
            <input
              type="url"
              value={settings.social_github || ''}
              onChange={(e) => handleInputChange('social_github', e.target.value)}
              placeholder="https://github.com/muneebarif"
            />
          </div>
          <div className="form-group">
            <label>Instagram</label>
            <input
              type="url"
              value={settings.social_instagram || ''}
              onChange={(e) => handleInputChange('social_instagram', e.target.value)}
              placeholder="https://instagram.com/username"
            />
          </div>
          <div className="form-group">
            <label>Facebook</label>
            <input
              type="url"
              value={settings.social_facebook || ''}
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
              value={settings.copyright_text || ''}
              onChange={(e) => handleInputChange('copyright_text', e.target.value)}
              placeholder="© 2024 Muneeb Arif. All rights reserved."
            />
          </div>
        </div>
      </div>
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