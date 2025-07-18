import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './SharedHostingUpdateManager.css';

const SharedHostingUpdateManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [newUpdate, setNewUpdate] = useState({
    version: '',
    title: '',
    description: '',
    files: [{ url: '' }], // Start with one file by default
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading shared hosting updates data...');
      console.log('🔍 API base URL:', apiService.baseUrl);
      console.log('🔍 API available:', apiService.isApiServerAvailable());

      // Load updates
      const updatesResult = await apiService.getSharedHostingUpdates({
        order: 'created_at DESC'
      });

      console.log('🔍 Updates result:', updatesResult);

      if (updatesResult.success) {
        setUpdates(updatesResult.data || []);
      } else {
        setError('Failed to load updates: ' + updatesResult.error);
      }

      // Load stats
      const statsResult = await apiService.getSharedHostingUpdates({
        is_active: true
      });

      console.log('🔍 Stats result:', statsResult);

      if (statsResult.success) {
        const activeUpdates = statsResult.data || [];
        setStats({
          totalUpdates: updates.length,
          activeUpdates: activeUpdates.length,
          latestVersion: activeUpdates.length > 0 ? activeUpdates[0].version : '1.0.0'
        });
      }

    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      // Validate form
      if (!newUpdate.version || !newUpdate.title || !newUpdate.description) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate that the file has a URL (compulsory)
      if (!newUpdate.files[0] || !newUpdate.files[0].url) {
        setError('File URL is required');
        return;
      }

      console.log('Creating update with data:', newUpdate);

      const result = await apiService.createSharedHostingUpdate(newUpdate);

      if (result.success) {
        // Reset form
        setNewUpdate({
          version: '',
          title: '',
          description: '',
          files: [{ url: '' }], // Reset to one file
          is_active: true
        });

        // Reload data
        await loadData();
        setActiveTab('updates');
        
        alert('✅ Update created successfully!');
      } else {
        setError('Failed to create update: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to create update:', err);
      setError('Failed to create update: ' + err.message);
    }
  };

  const toggleUpdateStatus = async (updateId, currentStatus) => {
    try {
      const result = await apiService.updateSharedHostingUpdate(updateId, {
        is_active: !currentStatus
      });

      if (result.success) {
        await loadData();
        alert(currentStatus ? '✅ Update deactivated' : '✅ Update activated');
      } else {
        setError('Failed to update status: ' + result.error);
      }
    } catch (err) {
      console.error('Failed to toggle update status:', err);
      setError('Failed to update status: ' + err.message);
    }
  };

  const deleteUpdate = async (updateId) => {
    if (!window.confirm('Are you sure you want to delete this update?')) {
      return;
    }

    try {
      const result = await apiService.deleteSharedHostingUpdate(updateId);

      if (result.success) {
        await loadData();
        alert('✅ Update deleted successfully');
      } else {
        setError('Failed to delete update: ' + result.error);
      }
    } catch (err) {
      console.error('Failed to delete update:', err);
      setError('Failed to delete update: ' + err.message);
    }
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
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="shared-hosting-update-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading shared hosting update manager...</p>
      </div>
    );
  }

  return (
    <div className="shared-hosting-update-manager">
      <div className="manager-header">
        <h2>🚀 Shared Hosting Update Manager</h2>
        <p>Manage theme updates for shared hosting environments (cPanel)</p>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
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
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Updates</h3>
                <div className="stat-value">{stats.totalUpdates || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Active Updates</h3>
                <div className="stat-value">{stats.activeUpdates || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Latest Version</h3>
                <div className="stat-value">{stats.latestVersion || '1.0.0'}</div>
              </div>
            </div>

            <div className="recent-updates">
              <h3>Recent Updates</h3>
              {updates.slice(0, 5).map(update => (
                <div key={update.id} className="update-item">
                  <div className="update-info">
                    <h4>{update.title}</h4>
                    <p>v{update.version} • {formatDate(update.created_at)}</p>
                  </div>
                  <div className="update-status">
                    <span className={`status ${update.is_active ? 'active' : 'inactive'}`}>
                      {update.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="updates-tab">
            <div className="updates-header">
              <h3>All Updates</h3>
              <button 
                className="btn-create-update"
                onClick={() => setActiveTab('create')}
              >
                + Create Update
              </button>
            </div>
            
            <div className="updates-list">
              {updates.map(update => (
                <div key={update.id} className="update-card">
                  <div className="update-header">
                    <div className="update-title">{update.title}</div>
                    <div className="update-version">v{update.version}</div>
                  </div>
                  
                  <div className="update-description">
                    {update.description}
                  </div>
                  
                  <div className="update-meta">
                    <span>Created: {formatDate(update.created_at)}</span>
                    <span className={`status ${update.is_active ? 'active' : 'inactive'}`}>
                      {update.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="update-actions">
                    <button
                      onClick={() => toggleUpdateStatus(update.id, update.is_active)}
                      className={`btn-toggle ${update.is_active ? 'deactivate' : 'activate'}`}
                    >
                      {update.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteUpdate(update.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="create-tab">
            <div className="create-header">
              <h3>➕ Create New Update</h3>
              <p>Create a new theme update package for your clients</p>
            </div>
            
            <form onSubmit={createUpdate} className="create-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="version">Version *</label>
                  <input
                    type="text"
                    id="version"
                    value={newUpdate.version}
                    onChange={(e) => setNewUpdate({...newUpdate, version: e.target.value})}
                    placeholder="e.g., 1.2.0"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="is_active">Status</label>
                  <select
                    id="is_active"
                    value={newUpdate.is_active ? '1' : '0'}
                    onChange={(e) => setNewUpdate({...newUpdate, is_active: e.target.value === '1'})}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                  placeholder="e.g., Performance Improvements"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={newUpdate.description}
                  onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})}
                  placeholder="Describe what's new in this update..."
                  rows="4"
                  required
                />
              </div>
              
                            <div className="form-group">
                <label>Update File URL *</label>
                <div className="files-section">
                  <input
                    type="url"
                    placeholder="File URL (required)"
                    value={newUpdate.files[0]?.url || ''}
                    onChange={(e) => updateFile(0, 'url', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-create-update-submit">
                  📦 Create Update
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('updates')}
                  className="btn-secondary"
                >
                  📋 View Updates
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedHostingUpdateManager; 