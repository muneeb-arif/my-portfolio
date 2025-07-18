import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { projectsService } from '../../services/projectsService';
import { syncService } from '../../services/syncService';
import { dashboardService } from '../../services/dashboardService';
import { imageService } from '../../services/imageService';
import { supabase } from '../../config/supabase'; // Keep for storage operations
import { getCurrentUser } from '../../services/authUtils';
import { useSettings } from '../../services/settingsContext';
import { adminService } from '../../services/adminService';
import ProjectsManager from './ProjectsManager';
import PromptsManager from './PromptsManager';
import CategoriesManager from './CategoriesManager';
import DomainsTechnologiesManager from './DomainsTechnologiesManager';
import NicheManager from './NicheManager';
import QueriesManager from './QueriesManager';
import DebugSync from './DebugSync';
import ProgressDisplay from './ProgressDisplay';
import AutomaticUpdateDashboard from './AutomaticUpdateDashboard';
import SharedHostingUpdateManager from './SharedHostingUpdateManager';
import UpdateNotificationBar from './UpdateNotificationBar';
import DashboardMobileNav from './DashboardMobileNav';
import ImagePositioner from './ImagePositioner';
import { applyTheme, themes } from '../../utils/themeUtils';
import './DashboardLayout.css';
import './ProjectsManager.css';
import './CategoriesManager.css';
import './DomainsTechnologiesManager.css';
import './NicheManager.css';

const DashboardLayout = ({ user, onSignOut, successMessage, onClearSuccess }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
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

  // Admin sections state
  const [accessibleSectionKeys, setAccessibleSectionKeys] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSectionsLoaded, setAdminSectionsLoaded] = useState(false);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage && onClearSuccess) {
      const timer = setTimeout(() => {
        onClearSuccess();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, onClearSuccess]);

  // Load admin sections
  useEffect(() => {
    loadAdminSections();
  }, []);

  const loadAdminSections = async () => {
    try {
      const result = await adminService.getAdminSections();
      if (result.success) {
        // Map database section keys (with underscores) to navigation IDs (with hyphens)
        const mappedKeys = (result.data.sections || []).map(s => {
          // Convert section_key to navigation ID format
          switch (s.section_key) {
            case 'backup_files': return 'backup-files';
            case 'theme_updates': return 'theme-updates';
            case 'import_export': return 'export';
            case 'debug_sync': return 'debug';
            default: return s.section_key;
          }
        });
        setAccessibleSectionKeys(mappedKeys);
        setIsAdmin(result.data.sections?.length > 0);
        setAdminSectionsLoaded(true);
        console.log('🔒 Dashboard: Admin sections loaded:', result.data.sections?.length || 0);
        console.log('🔒 Dashboard: Mapped section keys:', mappedKeys);
      } else {
        console.log('🔒 Dashboard: No admin access or failed to load admin sections');
        setAccessibleSectionKeys([]);
        setIsAdmin(false);
        setAdminSectionsLoaded(true);
      }
    } catch (error) {
      console.error('🔒 Dashboard: Error loading admin sections:', error);
      setAccessibleSectionKeys([]);
      setIsAdmin(false);
      setAdminSectionsLoaded(true);
    }
  };

  // Navigation items with admin filtering
  const navItems = useMemo(() => {
    const allNavItems = [
      { id: 'overview', label: 'Overview', icon: '📊', adminOnly: false },
      { id: 'projects', label: 'Projects', icon: '💼', adminOnly: false },
      { id: 'prompts', label: 'Prompts', icon: '💡', adminOnly: false },
      { id: 'queries', label: 'Contact Queries', icon: '📨', adminOnly: false },
      { id: 'domains-technologies', label: 'Technologies', icon: '🎯', adminOnly: false },
      { id: 'niche', label: 'Domains / Niche', icon: '🏆', adminOnly: false },
      { id: 'media', label: 'Media Library', icon: '🖼️', adminOnly: false },
      { id: 'backup-files', label: 'Backup Files', icon: '📦', adminOnly: true },
      { id: 'categories', label: 'Categories', icon: '📁', adminOnly: false },
      { id: 'appearance', label: 'Appearance', icon: '🎨', adminOnly: false },
      { id: 'theme-updates', label: 'Theme Updates', icon: '🚀', adminOnly: true },
      { id: 'settings', label: 'Settings', icon: '⚙️', adminOnly: false },
      { id: 'export', label: 'Import/Export', icon: '📤', adminOnly: true },
      { id: 'debug', label: 'Debug Sync', icon: '🔧', adminOnly: true }
    ];

    // Filter navigation items based on admin permissions
    return allNavItems.filter(item => {
      if (!item.adminOnly) {
        return true; // Show non-admin items to everyone
      }
      
      // For admin-only items, check if user has access
      if (item.adminOnly && isAdmin) {
        // Check if user has access to this specific section
        return accessibleSectionKeys.includes(item.id);
      }
      
      return false; // Hide admin-only items from non-admin users
    });
  }, [isAdmin, accessibleSectionKeys]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    checkDatabaseStatus();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await dashboardService.getDashboardData();
      if (dashboardData.success) {
        // Filter out prompts from projects (only show regular projects)
        const regularProjects = dashboardData.data.projects.filter(p => p.is_prompt !== 1);
        setProjects(regularProjects);
        setStats(dashboardData.data.stats);
      } else {
        // Fallback to individual service calls
        const projectsData = await projectsService.getProjects();
        // Filter out prompts from projects (only show regular projects)
        const regularProjects = projectsData.filter(p => p.is_prompt !== 1);
        setProjects(regularProjects);
        
        // Calculate stats for regular projects only
        const published = regularProjects.filter(p => p.status === 'published').length;
        const drafts = regularProjects.filter(p => p.status === 'draft').length;
        
        setStats({
          totalProjects: regularProjects.length,
          publishedProjects: published,
          draftProjects: drafts,
          totalViews: regularProjects.reduce((sum, p) => sum + (p.views || 0), 0)
        });
      }
      
      // Load prompts (projects with is_prompt = 1)
      const promptsData = await projectsService.getProjects();
      const filteredPrompts = promptsData.filter(p => p.is_prompt === 1);
      setPrompts(filteredPrompts);
    } catch (error) {
      // console.error('Error loading dashboard data:', error);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const status = await dashboardService.getDatabaseStatus();
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

  const handleClearCache = async () => {
    try {
      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
      }
      
      // Clear localStorage
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        if (key.includes('cache') || key.includes('api') || key.includes('portfolio') || key.includes('projects') || key.includes('categories') || key.includes('technologies') || key.includes('niches')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach(key => {
        if (key.includes('cache') || key.includes('api') || key.includes('portfolio')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Cache clearing failed:', error);
    }
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setActiveSection('projects');
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
            onEditProject={handleEditProject}
            onClearCache={handleClearCache}
          />
        );
      case 'projects':
        return <ProjectsManager projects={projects} onProjectsChange={loadDashboardData} editingProject={editingProject} onEditingProjectChange={setEditingProject} />;
      case 'prompts':
        return <PromptsManager prompts={prompts} onPromptsChange={loadDashboardData} editingPrompt={editingPrompt} onEditingPromptChange={setEditingPrompt} />;
      case 'queries':
        return <QueriesManager />;
      case 'domains-technologies':
        return <DomainsTechnologiesManager />;
      case 'niche':
        return <NicheManager />;
      case 'media':
        return <MediaSection />;
      case 'backup-files':
        return <BackupFilesSection />;
      case 'categories':
        return <CategoriesManager />;
      case 'appearance':
        return <AppearanceSection />;
      case 'theme-updates':
        return <SharedHostingUpdateManager />;
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
            onEditProject={handleEditProject}
            onClearCache={handleClearCache}
          />
        );
    }
  };

  // Only render nav after admin sections are loaded
  if (!adminSectionsLoaded) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

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

      {/* Success Message */}
      {successMessage && (
        <div className="success-banner">
          <div className="success-content">
            <span className="success-text">{successMessage}</span>
            <button 
              className="success-close"
              onClick={onClearSuccess}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>📁 Dashboard</h2>
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">
                {user?.user_metadata?.full_name || 'User'}
                {isAdmin && <span className="admin-badge">👑 Admin</span>}
              </p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''} ${item.adminOnly ? 'admin-only' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.adminOnly && <span className="admin-indicator">👑</span>}
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
        {/* Update Notification - Only shown when logged into dashboard */}
        <UpdateNotificationBar />
        
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

      {/* Mobile Bottom Navigation */}
      <DashboardMobileNav
        activeSection={activeSection}
        onNavClick={handleNavClick}
        navItems={navItems}
      />
    </div>
  );
};

// Overview Section Component
const OverviewSection = ({ stats, projects, isDatabaseEmpty, databaseStatus, isSyncing, syncMessage, onSyncData, isBackingUp, backupMessage, onBackupData, importFile, isImporting, importMessage, onFileSelect, onImportData, isResetting, resetMessage, onResetData, onEditProject, onClearCache }) => {
  const recentProjects = projects.slice(0, 5); // Only for overview display

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
                  <button 
                    className="btn-edit"
                    onClick={() => onEditProject(project)}
                  >
                    Edit
                  </button>
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

            <button 
              className="btn-cache"
              onClick={onClearCache}
              style={{ backgroundColor: '#2196f3', color: 'white', borderRadius: '8px', padding: '10px 20px' }}
            >
              🧹 Clear Cache & Reload
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

const MediaSection = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');

  // Load all images from storage
  const loadImages = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current user to fetch their specific images
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use imageService to list user images
      const result = await imageService.listUserImages();
      
      if (result.success) {
        const images = result.data.map(file => ({
          name: file.name,
          fullPath: file.fullPath,
          url: file.url,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          updated_at: file.updated_at,
          isUserFile: true
        }));

        // Sort by creation date (newest first)
        images.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setImages(images);
      } else {
        setError(result.error || 'Failed to load images');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload new image
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError('');

      // Get current user for folder organization
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      for (const file of files) {
        const result = await imageService.uploadImage(file);
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      // Reload images after upload
      await loadImages();
      
      // Clear the input
      event.target.value = '';
      
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Open fullscreen view
  const openFullscreen = (image, index) => {
    setFullscreenImage(image);
    setCurrentImageIndex(index);
  };

  // Close fullscreen view
  const closeFullscreen = () => {
    setFullscreenImage(null);
    setCurrentImageIndex(0);
  };

  // Navigate in fullscreen
  const navigateFullscreen = useCallback((direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % images.length
      : (currentImageIndex - 1 + images.length) % images.length;
    
    setCurrentImageIndex(newIndex);
    setFullscreenImage(images[newIndex]);
  }, [currentImageIndex, images]);

  // Download image
  const downloadImage = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = image.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image');
    }
  };

  // Delete image
  const deleteImage = async (image) => {
    if (!window.confirm(`Are you sure you want to delete ${image.name}?`)) {
      return;
    }

    try {
      const result = await imageService.deleteImage(image.fullPath);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Remove from local state
      setImages(images.filter(img => img.fullPath !== image.fullPath));
      
      // Close fullscreen if this image was open
      if (fullscreenImage && fullscreenImage.fullPath === image.fullPath) {
        closeFullscreen();
      }

    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image: ' + error.message);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load images on component mount
  useEffect(() => {
    loadImages();
  }, []);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!fullscreenImage) return;

      switch (event.key) {
        case 'Escape':
          closeFullscreen();
          break;
        case 'ArrowLeft':
          navigateFullscreen('prev');
          break;
        case 'ArrowRight':
          navigateFullscreen('next');
          break;
        case 'd':
        case 'D':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            downloadImage(fullscreenImage);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, currentImageIndex, images, navigateFullscreen]);

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>🖼️ Media Library</h2>
        <div className="flex gap-2">
          <button 
            className="btn-secondary" 
            onClick={loadImages}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <label className="btn-primary">
            {uploading ? '⏳ Uploading...' : '+ Upload Images'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          color: '#dc2626', 
          background: '#fef2f2', 
          padding: '12px', 
          borderRadius: '8px', 
          margin: '16px 0',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      <div className="media-stats">
        <p>{images.length} images • Total size: {formatFileSize(images.reduce((total, img) => total + img.size, 0))}</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="media-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="media-item skeleton">
                <div className="media-thumbnail skeleton-box"></div>
                <div className="media-info">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="media-grid">
          {images.map((image, index) => (
            <div key={image.fullPath} className="media-item">
              <div 
                className="media-thumbnail"
                onClick={() => openFullscreen(image, index)}
              >
                <img 
                  src={image.url} 
                  alt={image.name}
                  loading="lazy"
                />
                <div className="media-overlay">
                  <button className="overlay-btn">🔍 View</button>
                </div>
              </div>
              <div className="media-info">
                <h4>{image.name}</h4>
                <p>{formatFileSize(image.size)}</p>
                <div className="media-location">
                  {image.isUserFile ? (
                    <span className="location-tag user-folder">📁 Your Images</span>
                  ) : (
                    <span className="location-tag root-folder">🌐 Shared</span>
                  )}
                </div>
                <div className="media-actions">
                  <button 
                    onClick={() => downloadImage(image)}
                    className="action-btn download"
                    title="Download"
                  >
                    📥
                  </button>
                  <button 
                    onClick={() => deleteImage(image)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !loading && (
        <div className="empty-state">
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <h3>No images found</h3>
            <p>Upload some images to get started with your media library</p>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={closeFullscreen}>
          <div className="fullscreen-content" onClick={e => e.stopPropagation()}>
            <div className="fullscreen-header">
              <div className="image-info">
                <h3>{fullscreenImage.name}</h3>
                <p>{currentImageIndex + 1} of {images.length} • {formatFileSize(fullscreenImage.size)}</p>
              </div>
              <div className="fullscreen-actions">
                <button 
                  onClick={() => downloadImage(fullscreenImage)}
                  className="fullscreen-btn download"
                  title="Download (Ctrl+D)"
                >
                  📥 Download
                </button>
                <button 
                  onClick={closeFullscreen}
                  className="fullscreen-btn close"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="fullscreen-image-container">
              <button 
                className="nav-btn prev"
                onClick={() => navigateFullscreen('prev')}
                disabled={images.length <= 1}
                title="Previous (←)"
              >
                ‹
              </button>
              
              <img 
                src={fullscreenImage.url} 
                alt={fullscreenImage.name}
                className="fullscreen-image"
              />
              
              <button 
                className="nav-btn next"
                onClick={() => navigateFullscreen('next')}
                disabled={images.length <= 1}
                title="Next (→)"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppearanceSection = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [logoType, setLogoType] = useState('initials');
  const [logoFile, setLogoFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [whatsappFile, setWhatsappFile] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('sand');
  const [tempHeroUrl, setTempHeroUrl] = useState(null);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(null);

  const defaultSettings = useMemo(() => ({
    logo_type: 'initials',
    logo_initials: 'MA',
    logo_image: '',
    hero_banner_image: '/images/hero-bg.png',
    hero_banner_zoom: 100,
    hero_banner_position_x: 50,
    hero_banner_position_y: 50,
    avatar_image: '/images/profile/avatar.jpeg',
    avatar_zoom: 100,
    avatar_position_x: 50,
    avatar_position_y: 50,
    whatsapp_preview_image: '',
    banner_name: 'Muneeb Arif',
    banner_title: 'Principal Software Engineer',
    banner_tagline: 'I craft dreams, not projects.',
    site_url: 'https://your-domain.com',
    resume_file: '/images/profile/principal-software-engineer-muneeb.resume.pdf',
    show_resume_download: true,
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
      console.log('🔍 Dashboard: Global settings show_resume_download:', settings.show_resume_download);
      
      // Get settings from global context (already loaded)
      const contextSettings = { ...defaultSettings };
      Object.keys(defaultSettings).forEach(key => {
        if (settings[key] !== undefined) {
          contextSettings[key] = settings[key];
        }
      });
      
      console.log('🔍 Dashboard: Final contextSettings show_resume_download:', contextSettings.show_resume_download);
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

  // Cleanup temporary URLs on unmount
  useEffect(() => {
    return () => {
      if (tempHeroUrl) {
        URL.revokeObjectURL(tempHeroUrl);
      }
      if (tempAvatarUrl) {
        URL.revokeObjectURL(tempAvatarUrl);
      }
    };
  }, [tempHeroUrl, tempAvatarUrl]);

  const handleInputChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBannerPositionChange = (x, y) => {
    setLocalSettings(prev => ({ 
      ...prev, 
      hero_banner_position_x: x, 
      hero_banner_position_y: y 
    }));
  };

  const handleAvatarPositionChange = (x, y) => {
    setLocalSettings(prev => ({ 
      ...prev, 
      avatar_position_x: x, 
      avatar_position_y: y 
    }));
  };

  const handleHeroFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroFile(file);
      // Create temporary URL for immediate preview
      const tempUrl = URL.createObjectURL(file);
      setTempHeroUrl(tempUrl);
    }
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create temporary URL for immediate preview
      const tempUrl = URL.createObjectURL(file);
      setTempAvatarUrl(tempUrl);
    }
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

      if (whatsappFile) {
        const whatsappUrl = await uploadFile(whatsappFile, 'images');
        updatedSettings.whatsapp_preview_image = whatsappUrl;
      }

      // Include current theme in settings save
      updatedSettings.theme_name = currentTheme;

      console.log('💾 Dashboard: Saving settings via global context...', Object.keys(updatedSettings));

      // Update settings through global context (NO DIRECT DATABASE CALLS)
      const success = await updateSettings(updatedSettings);
      
      if (success) {
        setMessage('✅ Settings saved successfully!');
        // Clear file inputs and temporary URLs
        setLogoFile(null);
        setHeroFile(null);
        setAvatarFile(null);
        setResumeFile(null);
        setWhatsappFile(null);
        
        // Clean up temporary URLs
        if (tempHeroUrl) {
          URL.revokeObjectURL(tempHeroUrl);
          setTempHeroUrl(null);
        }
        if (tempAvatarUrl) {
          URL.revokeObjectURL(tempAvatarUrl);
          setTempAvatarUrl(null);
        }
        
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
                 <div className="form-group">
                   <label>Site URL</label>
                   <input
                     type="url"
                     value={localSettings.site_url || ''}
                     onChange={(e) => handleInputChange('site_url', e.target.value)}
                     placeholder="https://your-domain.com"
                   />
                   <small className="form-help">Used for social media meta tags and SEO</small>
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
                     onChange={handleHeroFileSelect}
                   />
                   {(localSettings.hero_banner_image || tempHeroUrl) && (
                     <div className="current-banner-image">
                       <img 
                         src={tempHeroUrl || localSettings.hero_banner_image} 
                         alt="Hero Banner" 
                         className="banner-preview-thumb"
                       />
                       <div className="banner-image-info">
                         <p>{tempHeroUrl ? '🆕 New hero banner image (preview)' : '✅ Current hero banner image'}</p>
                         <small>This image appears as the background in your hero section</small>
                       </div>
                     </div>
                   )}
                 </div>
                 <div className="form-group">
                   <label>Banner Zoom ({localSettings.hero_banner_zoom || 100}%)</label>
                   <input
                     type="range"
                     min="50"
                     max="200"
                     value={localSettings.hero_banner_zoom || 100}
                     onChange={(e) => handleInputChange('hero_banner_zoom', parseInt(e.target.value))}
                     className="zoom-slider"
                   />
                   <div className="zoom-labels">
                     <span>50%</span>
                     <span>100%</span>
                     <span>200%</span>
                   </div>
                   <small className="form-help">Adjust image zoom level for better positioning</small>
                 </div>

                 {/* Banner Image Positioner */}
                 {(localSettings.hero_banner_image || tempHeroUrl) && (
                   <div className="form-group">
                     <label>Banner Image Position</label>
                     <ImagePositioner
                       imageUrl={localSettings.hero_banner_image}
                       tempImageUrl={tempHeroUrl}
                       containerWidth={300}
                       containerHeight={200}
                       imageWidth={400}
                       imageHeight={300}
                       positionX={localSettings.hero_banner_position_x || 50}
                       positionY={localSettings.hero_banner_position_y || 50}
                       zoom={localSettings.hero_banner_zoom || 100}
                       onPositionChange={handleBannerPositionChange}
                       title="Hero Banner Position"
                       isCircular={false}
                       previewMode="realistic"
                     />
                     <small className="form-help">Drag the image to position it within the hero section background. This preview shows exactly how your banner will appear.</small>
                   </div>
                 )}
                 
                 {/* WhatsApp Preview Image Upload */}
                 <div className="form-group whatsapp-upload-section">
                   <label>📱 WhatsApp Preview Image</label>
                   <div className="whatsapp-requirements">
                     <div className="requirements-header">
                       <h4>📋 Image Requirements:</h4>
                     </div>
                     <ul className="requirements-list">
                       <li><strong>Dimensions:</strong> 1200x630 pixels (optimal for link previews)</li>
                       <li><strong>File Size:</strong> Must be under 600KB</li>
                       <li><strong>Format:</strong> JPG, PNG, or WebP</li>
                       <li><strong>Aspect Ratio:</strong> 1.91:1 (landscape orientation)</li>
                     </ul>
                     <div className="requirements-note">
                       <p>💡 <strong>Tip:</strong> Use tools like TinyPNG or Squoosh.app to compress your image while maintaining quality.</p>
                     </div>
                   </div>
                   
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => setWhatsappFile(e.target.files[0])}
                     className="whatsapp-file-input"
                   />
                   
                   {localSettings.whatsapp_preview_image && (
                     <div className="current-whatsapp-image">
                       <img 
                         src={localSettings.whatsapp_preview_image} 
                         alt="WhatsApp Preview" 
                         className="whatsapp-preview-thumb"
                       />
                       <div className="whatsapp-image-info">
                         <p>✅ Current WhatsApp preview image</p>
                         <small>This image will appear when your portfolio is shared on WhatsApp, Slack, and other social platforms</small>
                       </div>
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
                     onChange={handleAvatarFileSelect}
                   />
                   {(localSettings.avatar_image || tempAvatarUrl) && (
                     <div className="current-avatar-image">
                       <img 
                         src={tempAvatarUrl || localSettings.avatar_image} 
                         alt="Profile Picture" 
                         className="avatar-preview-thumb"
                       />
                       <div className="avatar-image-info">
                         <p>{tempAvatarUrl ? '🆕 New profile picture (preview)' : '✅ Current profile picture'}</p>
                         <small>This image appears as your profile picture in the hero section</small>
                       </div>
                     </div>
                   )}
                 </div>
                 <div className="form-group">
                   <label>Avatar Zoom ({localSettings.avatar_zoom || 100}%)</label>
                   <input
                     type="range"
                     min="50"
                     max="200"
                     value={localSettings.avatar_zoom || 100}
                     onChange={(e) => handleInputChange('avatar_zoom', parseInt(e.target.value))}
                     className="zoom-slider"
                   />
                   <div className="zoom-labels">
                     <span>50%</span>
                     <span>100%</span>
                     <span>200%</span>
                   </div>
                   <small className="form-help">Adjust avatar zoom level for better cropping</small>
                 </div>

                 {/* Avatar Image Positioner */}
                 {(localSettings.avatar_image || tempAvatarUrl) && (
                   <div className="form-group">
                     <label>Avatar Image Position</label>
                     <ImagePositioner
                       imageUrl={localSettings.avatar_image}
                       tempImageUrl={tempAvatarUrl}
                       containerWidth={200}
                       containerHeight={200}
                       imageWidth={300}
                       imageHeight={300}
                       positionX={localSettings.avatar_position_x || 50}
                       positionY={localSettings.avatar_position_y || 50}
                       zoom={localSettings.avatar_zoom || 100}
                       onPositionChange={handleAvatarPositionChange}
                       title="Profile Picture Position"
                       isCircular={true}
                       previewMode="realistic"
                     />
                     <small className="form-help">Drag the image to position it within the circular profile container. This preview shows exactly how your avatar will appear.</small>
                   </div>
                 )}
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
                 <div className="form-group">
                   <label>
                     <input
                       type="checkbox"
                       checked={localSettings.show_resume_download === undefined ? true : localSettings.show_resume_download}
                       onChange={(e) => handleInputChange('show_resume_download', e.target.checked)}
                       style={{ marginRight: '8px' }}
                     />
                     Show "Download Resume" button on homepage
                   </label>
                   <small className="form-help">Uncheck to hide the resume download button from the homepage banner</small>
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

const SettingsSection = ({ user }) => {
  const { settings, loading, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize local settings from global context
  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      setLocalSettings({
        section_hero_visible: settings.section_hero_visible !== undefined ? settings.section_hero_visible : true,
        section_portfolio_visible: settings.section_portfolio_visible !== undefined ? settings.section_portfolio_visible : true,
        section_technologies_visible: settings.section_technologies_visible !== undefined ? settings.section_technologies_visible : true,
        section_domains_visible: settings.section_domains_visible !== undefined ? settings.section_domains_visible : true,
        section_project_cycle_visible: settings.section_project_cycle_visible !== undefined ? settings.section_project_cycle_visible : true,
        section_prompts_visible: settings.section_prompts_visible !== undefined ? settings.section_prompts_visible : false,
      });
    }
  }, [loading, settings]);

  const handleSectionVisibilityChange = (sectionKey, isVisible) => {
    setLocalSettings(prev => ({
      ...prev,
      [sectionKey]: isVisible
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('Saving settings...');

      const success = await updateSettings(localSettings);
      
      if (success) {
        setMessage('✅ Settings saved successfully!');
      } else {
        setMessage('❌ Error saving settings. Please try again.');
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error saving settings: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>⚙️ Settings</h2>
        <p>Manage your account and homepage section visibility</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`} style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: message.includes('✅') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
        }}>
          {message}
        </div>
      )}

      <div className="settings-form-grid">
        {/* Left Column - Account Settings */}
        <div className="settings-column">
          <div className="settings-group">
            <h3>👤 Account Information</h3>
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
                disabled
              />
              <small className="form-help">Profile updates coming soon</small>
            </div>
          </div>
        </div>

        {/* Right Column - Section Visibility */}
        <div className="settings-column">
          <div className="settings-group">
            <h3>📋 Homepage Section Visibility</h3>
            <p className="form-help" style={{ marginBottom: '16px', color: '#6b7280' }}>
              Control which sections appear on your homepage. Unchecked sections will be hidden from visitors.
            </p>
            
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                Loading settings...
              </div>
            ) : (
              <div className="section-visibility-controls">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={localSettings.section_hero_visible || false}
                      onChange={(e) => handleSectionVisibilityChange('section_hero_visible', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span className="section-title">🎯 Hero Section</span>
                  </label>
                  <small className="form-help">Main banner with your name, title, and introduction</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={localSettings.section_portfolio_visible || false}
                      onChange={(e) => handleSectionVisibilityChange('section_portfolio_visible', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span className="section-title">💼 Portfolio Section</span>
                  </label>
                  <small className="form-help">Showcase of your projects and work</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={localSettings.section_technologies_visible || false}
                      onChange={(e) => handleSectionVisibilityChange('section_technologies_visible', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span className="section-title">🛠️ Technologies Section</span>
                  </label>
                  <small className="form-help">Display of your technical skills and tools</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={localSettings.section_domains_visible || false}
                      onChange={(e) => handleSectionVisibilityChange('section_domains_visible', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span className="section-title">🎯 Domains & Niche Section</span>
                  </label>
                  <small className="form-help">Your expertise areas and specializations</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={localSettings.section_project_cycle_visible || false}
                      onChange={(e) => handleSectionVisibilityChange('section_project_cycle_visible', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span className="section-title">⏱️ Project Lifecycle Section</span>
                  </label>
                  <small className="form-help">Timeline showing your development process</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={localSettings.section_prompts_visible || false}
                      onChange={(e) => handleSectionVisibilityChange('section_prompts_visible', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span className="section-title">💡 Prompts Section</span>
                  </label>
                  <small className="form-help">AI prompts and templates showcase</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn-primary"
          onClick={handleSave}
          disabled={saving || loading}
          style={{ minWidth: '150px' }}
        >
          {saving ? '💾 Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  );
};

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

// Backup Files Section Component
const BackupFilesSection = () => {
  const [backupFiles, setBackupFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Load all backup files from updates storage and database
  const loadBackupFiles = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, try to get backup files from database API
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE}/backup-files`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_token')}`
        }
      });

      let databaseFiles = [];
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          databaseFiles = data.data || [];
        }
      }

      // Also get files from Supabase storage as fallback
      const { data: storageFiles, error } = await supabase.storage
        .from('updates')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.warn('Error loading from Supabase storage:', error);
      }

      // Filter backup files from storage
      const storageBackupFiles = (storageFiles || []).filter(file => 
        file.name.match(/\.(zip|tar|gz|rar|7z)$/i) && 
        !file.name.startsWith('.')
      );

      // Combine database and storage files, prioritizing database entries
      const combinedFiles = [...databaseFiles];
      
      // Add storage files that aren't in database
      storageBackupFiles.forEach(storageFile => {
        const existsInDb = databaseFiles.some(dbFile => dbFile.file_name === storageFile.name);
        if (!existsInDb) {
          const { data: { publicUrl } } = supabase.storage
            .from('updates')
            .getPublicUrl(storageFile.name);
          
          combinedFiles.push({
            id: null,
            file_name: storageFile.name,
            name: storageFile.name, // For compatibility
            url: publicUrl,
            public_url: publicUrl,
            size: storageFile.metadata?.size || 0,
            file_size: storageFile.metadata?.size || 0,
            created_at: storageFile.created_at,
            upload_date: storageFile.created_at,
            updated_at: storageFile.updated_at
          });
        }
      });

      // Sort by upload date (newest first)
      combinedFiles.sort((a, b) => {
        const dateA = new Date(a.upload_date || a.created_at);
        const dateB = new Date(b.upload_date || b.created_at);
        return dateB - dateA;
      });

      setBackupFiles(combinedFiles);
    } catch (error) {
      console.error('Error loading backup files:', error);
      setError('Failed to load backup files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload new backup file
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError('');

      for (const file of files) {
        // Generate unique filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `backup-${timestamp}-${file.name}`;
        
        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('updates')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('updates')
          .getPublicUrl(fileName);

        // Create database entry via API
        const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE}/backup-files`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('api_token')}`
          },
          body: JSON.stringify({
            file_name: fileName,
            file_size: file.size,
            file_type: file.type,
            storage_path: `updates/${fileName}`,
            public_url: publicUrl,
            description: `Backup file uploaded on ${new Date().toLocaleDateString()}`
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to create backup file entry:', errorData);
          // Don't throw error here - file was uploaded successfully, just DB entry failed
        }
      }

      // Reload files after upload
      await loadBackupFiles();
      
      // Clear the input
      event.target.value = '';
      
    } catch (error) {
      console.error('Error uploading backup files:', error);
      setError('Failed to upload backup files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Download backup file
  const downloadFile = async (file) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  // Delete backup file
  const deleteFile = async (file) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name || file.file_name}?`)) {
      return;
    }

    try {
      // Delete from Supabase storage
      const fileName = file.name || file.file_name;
      const { error: storageError } = await supabase.storage
        .from('updates')
        .remove([fileName]);

      if (storageError) {
        console.warn('Error deleting from storage:', storageError);
      }

      // Delete from database if it has an ID
      if (file.id) {
        const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE}/backup-files?id=${file.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('api_token')}`
          }
        });

        if (!response.ok) {
          console.warn('Error deleting from database:', await response.text());
        }
      }

      // Remove from local state
      setBackupFiles(backupFiles.filter(f => 
        (f.name || f.file_name) !== (file.name || file.file_name)
      ));
      
    } catch (error) {
      console.error('Error deleting backup file:', error);
      setError('Failed to delete backup file: ' + error.message);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get file type icon
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'zip': return '📦';
      case 'tar': return '📦';
      case 'gz': return '🗜️';
      case 'rar': return '📦';
      case '7z': return '🗜️';
      default: return '📄';
    }
  };

  // Copy public URL to clipboard
  const copyUrl = async (file) => {
    try {
      await navigator.clipboard.writeText(file.url);
      
      // Show success message
      const originalText = document.querySelector(`[data-file="${file.name}"] .copy-btn`).textContent;
      const copyBtn = document.querySelector(`[data-file="${file.name}"] .copy-btn`);
      copyBtn.textContent = '✅ Copied!';
      copyBtn.style.color = '#16a34a';
      
      // Reset button after 2 seconds
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.color = '';
      }, 2000);
      
    } catch (error) {
      console.error('Error copying URL:', error);
      setError('Failed to copy URL to clipboard');
    }
  };

  // Load files on component mount
  useEffect(() => {
    loadBackupFiles();
  }, []);

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>📦 Backup Files</h2>
        <div className="flex gap-2">
          <button 
            className="btn-secondary" 
            onClick={loadBackupFiles}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <label className="btn-primary">
            {uploading ? '⏳ Uploading...' : '+ Upload Backup'}
            <input
              type="file"
              multiple
              accept=".zip,.tar,.gz,.rar,.7z"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          color: '#dc2626', 
          background: '#fef2f2', 
          padding: '12px', 
          borderRadius: '8px', 
          margin: '16px 0',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      <div className="backup-stats">
        <p>{backupFiles.length} backup files • Total size: {formatFileSize(backupFiles.reduce((total, file) => total + (file.size || file.file_size || 0), 0))}</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="backup-files-list">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="backup-file-item skeleton">
                <div className="file-icon skeleton-box"></div>
                <div className="file-info">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
                <div className="file-actions">
                  <div className="skeleton-box" style={{ width: '80px', height: '32px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="backup-files-list">
          {backupFiles.map((file, index) => {
            const fileName = file.name || file.file_name;
            const fileSize = file.size || file.file_size;
            const fileDate = file.upload_date || file.created_at;
            const fileUrl = file.url || file.public_url;
            
            return (
              <div key={fileName} className="backup-file-item" data-file={fileName}>
                <div className="file-icon">
                  {getFileIcon(fileName)}
                </div>
                <div className="file-info">
                  <h4>{fileName}</h4>
                  <div className="file-meta">
                    <span>{formatFileSize(fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(fileDate)}</span>
                    {file.id && <span>•</span>}
                    {file.id && <span style={{ color: '#16a34a' }}>✓ DB Tracked</span>}
                  </div>
                </div>
                <div className="file-actions">
                  <button 
                    onClick={() => copyUrl({ ...file, url: fileUrl, name: fileName })}
                    className="action-btn copy copy-btn"
                    title="Copy public URL"
                  >
                    📋 Copy URL
                  </button>
                  <button 
                    onClick={() => downloadFile({ ...file, url: fileUrl, name: fileName })}
                    className="action-btn download"
                    title="Download"
                  >
                    📥 Download
                  </button>
                  <button 
                    onClick={() => deleteFile(file)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {backupFiles.length === 0 && !loading && (
        <div className="empty-state">
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3>No backup files found</h3>
            <p>Upload backup files to store and manage your project backups</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout; 