import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { themeUpdateService } from '../../services/themeUpdateService';
import { apiService } from '../../services/apiService';
import './ThemeUpdateManager.css';

const ThemeUpdateManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [updateStats, setUpdateStats] = useState({
    totalClients: 0,
    activeUpdates: 0,
    pendingUpdates: 0,
    successRate: 0
  });
  const [clients, setClients] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isCreatingUpdate, setIsCreatingUpdate] = useState(false);
  
  // New update form state
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    version: '',
    channel: 'stable',
    files: [],
    isActive: true
  });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load update stats
      await loadUpdateStats();
      
      // Load clients
      await loadClients();
      
      // Load updates
      await loadUpdates();
      
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      setMessage('❌ Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUpdateStats = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('theme_clients')
        .select('*');

      if (clientsError) throw clientsError;

      // Use apiService to get active updates
      const result = await apiService.getThemeUpdates({ is_active: true });
      
      let activeUpdates = 0;
      if (result.success) {
        activeUpdates = result.data?.length || 0;
      }

      const { data: logsData, error: logsError } = await supabase
        .from('theme_update_logs')
        .select('*')
        .order('applied_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Calculate stats
      const totalClients = clientsData?.length || 0;
      const successfulUpdates = logsData?.filter(log => log.status === 'success').length || 0;
      const totalUpdateAttempts = logsData?.length || 0;
      const successRate = totalUpdateAttempts > 0 ? (successfulUpdates / totalUpdateAttempts) * 100 : 0;

      setUpdateStats({
        totalClients,
        activeUpdates,
        pendingUpdates: totalClients * activeUpdates,
        successRate: Math.round(successRate)
      });

    } catch (error) {
      console.error('❌ Failed to load update stats:', error);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('theme_clients')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error('❌ Failed to load clients:', error);
    }
  };

  const loadUpdates = async () => {
    try {
      console.log('🔍 [ThemeUpdateManager] Loading updates...');
      console.log('🔍 [ThemeUpdateManager] Using apiService...');
      
      // Use apiService instead of direct fetch
      const result = await apiService.getThemeUpdates();
      
      console.log('🔍 [ThemeUpdateManager] API result:', result);
      
      if (result.success) {
        console.log('🔍 [ThemeUpdateManager] Loaded updates:', result.data);
        console.log('🔍 [ThemeUpdateManager] Updates count:', result.data?.length || 0);
        setUpdates(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load updates');
      }
    } catch (error) {
      console.error('❌ Failed to load updates:', error);
      console.error('❌ Error details:', error.message);
    }
  };

  const handleCreateUpdate = async () => {
    try {
      setIsCreatingUpdate(true);
      setMessage('🔄 Creating update...');

      // Validate form
      if (!newUpdate.title || !newUpdate.version || !newUpdate.description) {
        setMessage('❌ Please fill in all required fields');
        return;
      }

      // Create the update using apiService
      const result = await apiService.createThemeUpdate({
        title: newUpdate.title,
        description: newUpdate.description,
        version: newUpdate.version,
        channel: newUpdate.channel,
        files: newUpdate.files,
        is_active: newUpdate.isActive
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create update');
      }

      setMessage('✅ Update created successfully!');
      
      // Reset form
      setNewUpdate({
        title: '',
        description: '',
        version: '',
        channel: 'stable',
        files: [],
        isActive: true
      });

      // Reload data
      await loadDashboardData();
      
      // Switch to updates tab
      setActiveTab('updates');

    } catch (error) {
      console.error('❌ Failed to create update:', error);
      setMessage('❌ Failed to create update: ' + error.message);
    } finally {
      setIsCreatingUpdate(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDeactivateUpdate = async (updateId) => {
    try {
      // Use apiService instead of direct fetch
      const result = await apiService.updateThemeUpdate(updateId, { is_active: false });

      if (!result.success) {
        throw new Error(result.error || 'Failed to deactivate update');
      }

      setMessage('✅ Update deactivated successfully');
      
      // Trigger refresh of UpdateNotificationBar
      localStorage.setItem('update_status_changed', Date.now().toString());
      window.dispatchEvent(new Event('updateStatusChanged'));
      
      await loadDashboardData();
    } catch (error) {
      console.error('❌ Failed to deactivate update:', error);
      setMessage('❌ Failed to deactivate update: ' + error.message);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePushUpdate = async (updateId) => {
    try {
      setMessage('🔄 Pushing update to all clients...');
      
      // Use apiService to reactivate the update
      const result = await apiService.updateThemeUpdate(updateId, { 
        is_active: true
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to push update');
      }

      setMessage('✅ Update pushed to all clients!');
      await loadDashboardData();
    } catch (error) {
      console.error('❌ Failed to push update:', error);
      setMessage('❌ Failed to push update: ' + error.message);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const addFileToUpdate = () => {
    setNewUpdate(prev => ({
      ...prev,
      files: [...prev.files, { path: '', url: '', type: 'css' }]
    }));
  };

  const removeFileFromUpdate = (index) => {
    setNewUpdate(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const updateFile = (index, field, value) => {
    setNewUpdate(prev => ({
      ...prev,
      files: prev.files.map((file, i) => 
        i === index ? { ...file, [field]: value } : file
      )
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'failed': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getUpdateStatusStats = (update) => {
    // Since we're using the API, theme_update_logs might not be available
    // For now, return basic stats based on the update data
    const logs = update.theme_update_logs || [];
    const total = logs.length;
    const success = logs.filter(log => log.status === 'success').length;
    const failed = logs.filter(log => log.status === 'failed').length;
    const pending = clients.length - total;
    
    // If no logs available, show basic stats
    if (total === 0) {
      return { 
        total: 0, 
        success: update.success_count || 0, 
        failed: update.failure_count || 0, 
        pending: clients.length 
      };
    }
    
    return { total, success, failed, pending };
  };

  const renderOverview = () => (
    <div className="update-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{updateStats.totalClients}</div>
            <div className="stat-label">Active Clients</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{updateStats.activeUpdates}</div>
            <div className="stat-label">Active Updates</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{updateStats.pendingUpdates}</div>
            <div className="stat-label">Pending Updates</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{updateStats.successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {updates.slice(0, 5).map(update => (
            <div key={update.id} className="activity-item">
              <div className="activity-icon">📦</div>
              <div className="activity-content">
                <div className="activity-title">{update.title}</div>
                <div className="activity-meta">
                  v{update.version} • {formatDate(update.created_at)}
                </div>
              </div>
              <div className="activity-status">
                {update.is_active ? (
                  <span className="status-badge active">Active</span>
                ) : (
                  <span className="status-badge inactive">Inactive</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="clients-section">
      <div className="section-header">
        <h3>Client Deployments</h3>
        <button 
          className="btn-refresh"
          onClick={loadClients}
          disabled={isLoading}
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="clients-grid">
        {clients.map(client => (
          <div key={client.id} className="client-card">
            <div className="client-header">
              <div className="client-domain">{client.domain}</div>
              <div className="client-version">v{client.current_version}</div>
            </div>
            
            <div className="client-details">
              <div className="client-detail">
                <span className="detail-label">Client ID:</span>
                <span className="detail-value">{client.client_id}</span>
              </div>
              
              <div className="client-detail">
                <span className="detail-label">Channel:</span>
                <span className="detail-value">{client.update_channel}</span>
              </div>
              
              <div className="client-detail">
                <span className="detail-label">Last Seen:</span>
                <span className="detail-value">{formatDate(client.last_seen)}</span>
              </div>
              
              <div className="client-detail">
                <span className="detail-label">Timezone:</span>
                <span className="detail-value">{client.timezone}</span>
              </div>
            </div>
            
            <div className="client-status">
              <span className={`status-indicator ${
                new Date() - new Date(client.last_seen) < 24 * 60 * 60 * 1000 ? 'online' : 'offline'
              }`}>
                {new Date() - new Date(client.last_seen) < 24 * 60 * 60 * 1000 ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUpdates = () => {
    console.log('🔍 [ThemeUpdateManager] Rendering updates, count:', updates.length);
    console.log('🔍 [ThemeUpdateManager] Updates data:', updates);
    
    return (
      <div className="updates-section">
        <div className="section-header">
          <h3>Theme Updates</h3>
          <button 
            className="btn-create-update"
            onClick={() => setActiveTab('create')}
          >
            + Create Update
          </button>
        </div>
        
        <div className="updates-list">
          {updates.length === 0 ? (
            <div className="no-updates">
              <p>No theme updates found.</p>
            </div>
          ) : (
            updates.map(update => {
              const stats = getUpdateStatusStats(update);
              return (
                <div key={update.id} className="update-card">
                  <div className="update-header">
                    <div className="update-title">{update.title}</div>
                    <div className="update-version">v{update.version}</div>
                    <div className="update-channel">{update.channel}</div>
                  </div>
                  
                  <div className="update-description">
                    {update.description}
                  </div>
                  
                  <div className="update-stats">
                    <div className="stat-item">
                      <span className="stat-count success">{stats.success}</span>
                      <span className="stat-label">Success</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-count failed">{stats.failed}</span>
                      <span className="stat-label">Failed</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-count pending">{stats.pending}</span>
                      <span className="stat-label">Pending</span>
                    </div>
                  </div>
                  
                  <div className="update-meta">
                    <span>Created: {formatDate(update.created_at)}</span>
                    {update.pushed_at && (
                      <span>Pushed: {formatDate(update.pushed_at)}</span>
                    )}
                  </div>
                  
                  <div className="update-actions">
                    {update.is_active ? (
                      <>
                        <button 
                          className="btn-push"
                          onClick={() => handlePushUpdate(update.id)}
                        >
                          📤 Push to All
                        </button>
                        <button 
                          className="btn-deactivate"
                          onClick={() => handleDeactivateUpdate(update.id)}
                        >
                          ⏸️ Deactivate
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn-activate"
                        onClick={() => handlePushUpdate(update.id)}
                      >
                        ▶️ Activate
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderCreateUpdate = () => (
    <div className="create-update-section">
      <div className="section-header">
        <h3>Create New Update</h3>
        <button 
          className="btn-back"
          onClick={() => setActiveTab('updates')}
        >
          ← Back to Updates
        </button>
      </div>
      
      <div className="create-update-form">
        <div className="form-group">
          <label htmlFor="title">Update Title *</label>
          <input
            type="text"
            id="title"
            value={newUpdate.title}
            onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Bug fixes and performance improvements"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="version">Version *</label>
          <input
            type="text"
            id="version"
            value={newUpdate.version}
            onChange={(e) => setNewUpdate(prev => ({ ...prev, version: e.target.value }))}
            placeholder="e.g., 1.0.1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="channel">Update Channel</label>
          <select
            id="channel"
            value={newUpdate.channel}
            onChange={(e) => setNewUpdate(prev => ({ ...prev, channel: e.target.value }))}
          >
            <option value="stable">Stable</option>
            <option value="beta">Beta</option>
            <option value="alpha">Alpha</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={newUpdate.description}
            onChange={(e) => setNewUpdate(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what's new in this update..."
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label>Update Files</label>
          <div className="files-section">
            {newUpdate.files.map((file, index) => (
              <div key={index} className="file-item">
                <input
                  type="text"
                  placeholder="File path (e.g., styles/main.css)"
                  value={file.path}
                  onChange={(e) => updateFile(index, 'path', e.target.value)}
                />
                <input
                  type="url"
                  placeholder="File URL"
                  value={file.url}
                  onChange={(e) => updateFile(index, 'url', e.target.value)}
                />
                <select
                  value={file.type}
                  onChange={(e) => updateFile(index, 'type', e.target.value)}
                >
                  <option value="css">CSS</option>
                  <option value="js">JavaScript</option>
                  <option value="config">Config</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeFileFromUpdate(index)}
                  className="btn-remove-file"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFileToUpdate}
              className="btn-add-file"
            >
              + Add File
            </button>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCreateUpdate}
            disabled={isCreatingUpdate}
            className="btn-create-update-submit"
          >
            {isCreatingUpdate ? '🔄 Creating...' : '📦 Create Update'}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="theme-update-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading theme update manager...</p>
      </div>
    );
  }

  return (
    <div className="theme-update-manager">
      <div className="manager-header">
        <h2>🚀 Theme Update Manager</h2>
        <p>Manage and distribute theme updates to all client deployments</p>
      </div>
      
      {message && (
        <div className={`message ${message.startsWith('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <div className="manager-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          👥 Clients
        </button>
        <button
          className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
          onClick={() => setActiveTab('updates')}
        >
          📦 Updates
        </button>
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Update
        </button>
      </div>
      
      <div className="manager-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'clients' && renderClients()}
        {activeTab === 'updates' && renderUpdates()}
        {activeTab === 'create' && renderCreateUpdate()}
      </div>
    </div>
  );
};

export default ThemeUpdateManager; 