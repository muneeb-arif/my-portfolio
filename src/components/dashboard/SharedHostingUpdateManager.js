import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
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
    release_notes: '',
    package_url: '',
    special_instructions: '',
    channel: 'stable',
    is_critical: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadClients(),
        loadUpdates(),
        loadStats()
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('shared_hosting_clients')
      .select('*')
      .order('last_seen', { ascending: false });

    if (error) throw error;
    setClients(data || []);
  };

  const loadUpdates = async () => {
    const { data, error } = await supabase
      .from('shared_hosting_updates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUpdates(data || []);
  };

  const loadStats = async () => {
    const { data, error } = await supabase
      .from('shared_hosting_update_stats')
      .select('*');

    if (error) throw error;
    
    // Process stats into summary
    const summary = {
      totalClients: clients.length,
      totalUpdates: updates.length,
      activeUpdates: updates.filter(u => u.is_active).length,
      lastWeekUpdates: updates.filter(u => 
        new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
    
    setStats(summary);
  };

  const createUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate form
      if (!newUpdate.version || !newUpdate.title || !newUpdate.package_url) {
        throw new Error('Please fill in all required fields');
      }

      // Insert new update
      const { data, error } = await supabase
        .from('shared_hosting_updates')
        .insert([{
          ...newUpdate,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Create notifications for clients
      await createNotifications(data.id);

      // Reset form
      setNewUpdate({
        version: '',
        title: '',
        description: '',
        release_notes: '',
        package_url: '',
        special_instructions: '',
        channel: 'stable',
        is_critical: false
      });

      // Reload data
      await loadData();
      setActiveTab('updates');

      alert('✅ Update created successfully! Notifications will be sent to clients.');

    } catch (err) {
      console.error('Failed to create update:', err);
      alert('❌ Failed to create update: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNotifications = async (updateId) => {
    try {
      const { data, error } = await supabase.rpc('create_shared_hosting_notifications', {
        p_update_id: updateId,
        p_notification_type: 'update_available'
      });

      if (error) throw error;
      console.log('Notifications created:', data);
    } catch (err) {
      console.error('Failed to create notifications:', err);
    }
  };

  const toggleUpdateStatus = async (updateId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('shared_hosting_updates')
        .update({ is_active: !currentStatus })
        .eq('id', updateId);

      if (error) throw error;

      await loadUpdates();
      alert(currentStatus ? '✅ Update deactivated' : '✅ Update activated');
    } catch (err) {
      console.error('Failed to toggle update status:', err);
      alert('❌ Failed to update status');
    }
  };

  const generateDownloadLink = (update) => {
    return update.package_url || update.download_url || '#';
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

  const getClientStatus = (client) => {
    const lastSeen = new Date(client.last_seen);
    const now = new Date();
    const diffHours = (now - lastSeen) / (1000 * 60 * 60);
    
    if (diffHours < 24) return 'online';
    if (diffHours < 168) return 'recent'; // 1 week
    return 'offline';
  };

  if (loading && clients.length === 0) {
    return (
      <div className="shared-hosting-update-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading shared hosting update manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-hosting-update-manager">
      <div className="update-manager-header">
        <h2>🏗️ Shared Hosting Update Manager</h2>
        <p>Manage theme updates for cPanel-based client deployments</p>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="update-manager-tabs">
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
          🌐 Clients ({clients.length})
        </button>
        <button 
          className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
          onClick={() => setActiveTab('updates')}
        >
          📦 Updates ({updates.length})
        </button>
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Update
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🌐</div>
                <div className="stat-content">
                  <h3>{stats.totalClients || 0}</h3>
                  <p>Total Clients</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>{stats.totalUpdates || 0}</h3>
                  <p>Total Updates</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{stats.activeUpdates || 0}</h3>
                  <p>Active Updates</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🆕</div>
                <div className="stat-content">
                  <h3>{stats.lastWeekUpdates || 0}</h3>
                  <p>This Week</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>📋 Recent Activity</h3>
              <div className="activity-list">
                {updates.slice(0, 5).map(update => (
                  <div key={update.id} className="activity-item">
                    <div className="activity-icon">
                      {update.is_active ? '✅' : '⏸️'}
                    </div>
                    <div className="activity-content">
                      <p><strong>{update.title}</strong> (v{update.version})</p>
                      <p className="activity-time">{formatDate(update.created_at)}</p>
                    </div>
                    <div className="activity-status">
                      <span className={`status ${update.is_active ? 'active' : 'inactive'}`}>
                        {update.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
                {updates.length === 0 && (
                  <p className="no-activity">No updates created yet</p>
                )}
              </div>
            </div>

            <div className="quick-actions">
              <h3>🚀 Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="action-btn primary"
                  onClick={() => setActiveTab('create')}
                >
                  ➕ Create New Update
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => setActiveTab('clients')}
                >
                  👥 View All Clients
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={loadData}
                  disabled={loading}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="clients-tab">
            <div className="clients-header">
              <h3>🌐 Client Deployments</h3>
              <p>Shared hosting clients using cPanel</p>
            </div>

            <div className="clients-list">
              {clients.map(client => (
                <div key={client.id} className="client-item">
                  <div className="client-info">
                    <div className="client-main">
                      <h4>{client.domain}</h4>
                      <div className="client-meta">
                        <span className={`status ${getClientStatus(client)}`}>
                          {getClientStatus(client) === 'online' ? '🟢' : 
                           getClientStatus(client) === 'recent' ? '🟡' : '🔴'}
                          {getClientStatus(client)}
                        </span>
                        <span className="version">v{client.current_version}</span>
                        <span className="hosting">{client.hosting_provider || 'cPanel'}</span>
                      </div>
                    </div>
                    <div className="client-details">
                      <p><strong>Last Seen:</strong> {formatDate(client.last_seen)}</p>
                      <p><strong>Client ID:</strong> {client.client_id}</p>
                      {client.contact_email && (
                        <p><strong>Contact:</strong> {client.contact_email}</p>
                      )}
                      {client.timezone && (
                        <p><strong>Timezone:</strong> {client.timezone}</p>
                      )}
                    </div>
                  </div>
                  <div className="client-actions">
                    <button 
                      className="btn-small"
                      onClick={() => window.open(`https://${client.domain}`, '_blank')}
                    >
                      🔗 Visit Site
                    </button>
                  </div>
                </div>
              ))}
              {clients.length === 0 && (
                <div className="no-clients">
                  <p>📭 No clients registered yet</p>
                  <p>Clients will appear here automatically when they visit their websites</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="updates-tab">
            <div className="updates-header">
              <h3>📦 Theme Updates</h3>
              <p>Manage update packages for distribution</p>
            </div>

            <div className="updates-list">
              {updates.map(update => (
                <div key={update.id} className="update-item">
                  <div className="update-info">
                    <div className="update-main">
                      <h4>{update.title}</h4>
                      <div className="update-meta">
                        <span className="version">v{update.version}</span>
                        <span className={`channel ${update.channel}`}>{update.channel}</span>
                        <span className={`status ${update.is_active ? 'active' : 'inactive'}`}>
                          {update.is_active ? '✅ Active' : '⏸️ Inactive'}
                        </span>
                        {update.is_critical && <span className="critical">🚨 Critical</span>}
                      </div>
                    </div>
                    <div className="update-details">
                      <p><strong>Description:</strong> {update.description}</p>
                      <p><strong>Created:</strong> {formatDate(update.created_at)}</p>
                      {update.package_size_mb && (
                        <p><strong>Package Size:</strong> {update.package_size_mb} MB</p>
                      )}
                      {update.special_instructions && (
                        <div className="special-instructions">
                          <strong>Special Instructions:</strong>
                          <p>{update.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="update-actions">
                    <button 
                      className="btn-small"
                      onClick={() => window.open(generateDownloadLink(update), '_blank')}
                      disabled={!update.package_url && !update.download_url}
                    >
                      📥 Download
                    </button>
                    <button 
                      className={`btn-small ${update.is_active ? 'danger' : 'success'}`}
                      onClick={() => toggleUpdateStatus(update.id, update.is_active)}
                    >
                      {update.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                  </div>
                </div>
              ))}
              {updates.length === 0 && (
                <div className="no-updates">
                  <p>📭 No updates created yet</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('create')}
                  >
                    ➕ Create First Update
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="create-tab">
            <div className="create-header">
              <h3>➕ Create New Update</h3>
              <p>Create a new theme update package for shared hosting clients</p>
            </div>

            <form onSubmit={createUpdate} className="create-form">
              <div className="form-grid">
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
                  <small>Use semantic versioning (major.minor.patch)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="channel">Channel</label>
                  <select
                    id="channel"
                    value={newUpdate.channel}
                    onChange={(e) => setNewUpdate({...newUpdate, channel: e.target.value})}
                  >
                    <option value="stable">Stable</option>
                    <option value="beta">Beta</option>
                    <option value="alpha">Alpha</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                    placeholder="e.g., Bug Fixes and Performance Improvements"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={newUpdate.description}
                    onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})}
                    placeholder="Brief description of what's new..."
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="package_url">Package URL *</label>
                  <input
                    type="url"
                    id="package_url"
                    value={newUpdate.package_url}
                    onChange={(e) => setNewUpdate({...newUpdate, package_url: e.target.value})}
                    placeholder="https://example.com/updates/v1.2.0.zip"
                    required
                  />
                  <small>Direct download link to the ZIP package</small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="release_notes">Release Notes</label>
                  <textarea
                    id="release_notes"
                    value={newUpdate.release_notes}
                    onChange={(e) => setNewUpdate({...newUpdate, release_notes: e.target.value})}
                    placeholder="- Fixed navigation bug&#10;- Improved mobile responsiveness&#10;- Updated dependencies"
                    rows="4"
                  />
                  <small>Detailed changelog (one item per line)</small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="special_instructions">cPanel Instructions</label>
                  <textarea
                    id="special_instructions"
                    value={newUpdate.special_instructions}
                    onChange={(e) => setNewUpdate({...newUpdate, special_instructions: e.target.value})}
                    placeholder="Special instructions for this update (e.g., backup requirements, file permissions, etc.)"
                    rows="3"
                  />
                  <small>Any special steps needed for this update</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newUpdate.is_critical}
                      onChange={(e) => setNewUpdate({...newUpdate, is_critical: e.target.checked})}
                    />
                    🚨 Critical Update
                  </label>
                  <small>Mark as critical if this update fixes security issues</small>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : '🚀 Create Update'}
                </button>
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => setNewUpdate({
                    version: '',
                    title: '',
                    description: '',
                    release_notes: '',
                    package_url: '',
                    special_instructions: '',
                    channel: 'stable',
                    is_critical: false
                  })}
                >
                  🗑️ Clear Form
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