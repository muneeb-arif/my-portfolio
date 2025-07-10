import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import AutoUpdateDebugPanel from './AutoUpdateDebugPanel';
import './AutomaticUpdateDashboard.css';

const AutomaticUpdateDashboard = () => {
  const [activeTab, setActiveTab] = useState('updates');
  const [automaticCapabilities, setAutomaticCapabilities] = useState([]);
  const [automaticStats, setAutomaticStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update management states
  const [updates, setUpdates] = useState([]);
  const [clients, setClients] = useState([]);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [distributing, setDistributing] = useState(null);
  const [newUpdate, setNewUpdate] = useState({
    version: '',
    title: '',
    description: '',
    release_notes: '',
    package_url: '',
    special_instructions: '',
    channel: 'stable',
    is_critical: false,
    is_active: true
  });

  useEffect(() => {
    loadAutomaticData();
  }, []);

  const loadAutomaticData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAutomaticCapabilities(),
        loadAutomaticStats(),
        loadRecentActivity(),
        loadUpdates(),
        loadClients()
      ]);
    } catch (err) {
      console.error('Failed to load automatic update data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAutomaticCapabilities = async () => {
    const { data, error } = await supabase
      .from('automatic_update_capabilities')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    setAutomaticCapabilities(data || []);
  };

  const loadAutomaticStats = async () => {
    const { data, error } = await supabase.rpc('get_automatic_update_stats', {
      p_days_back: 30
    });

    if (error) throw error;
    setAutomaticStats(data || {});
  };

  const loadRecentActivity = async () => {
    const { data, error } = await supabase
      .from('recent_automatic_activity')
      .select('*')
      .limit(20);

    if (error) throw error;
    setRecentActivity(data || []);
  };

  const loadUpdates = async () => {
    const { data, error } = await supabase
      .from('shared_hosting_updates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUpdates(data || []);
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('shared_hosting_clients')
      .select('*')
      .order('last_seen', { ascending: false });

    if (error) throw error;
    setClients(data || []);
  };

  const createUpdate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);

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

      // Reset form
      setNewUpdate({
        version: '',
        title: '',
        description: '',
        release_notes: '',
        package_url: '',
        special_instructions: '',
        channel: 'stable',
        is_critical: false,
        is_active: true
      });

      // Reload data
      await loadAutomaticData();
      setActiveTab('updates');

      setError(null);
      alert('✅ Update created successfully!');

    } catch (err) {
      console.error('Failed to create update:', err);
      setError('Failed to create update: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleUpdateStatus = async (updateId, currentStatus) => {
    try {
      setUpdating(updateId);
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
    } finally {
      setUpdating(null);
    }
  };

  const handleDistributeUpdate = async (updateId) => {
    try {
      setDistributing(updateId);
      
      // Simulate distribution process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('shared_hosting_updates')
        .update({ 
          pushed_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', updateId);

      if (error) throw error;

      await loadUpdates();
      alert('✅ Update distributed successfully!');
    } catch (err) {
      console.error('Failed to distribute update:', err);
      alert('❌ Failed to distribute update');
    } finally {
      setDistributing(null);
    }
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

  const getCapabilityStatus = (capability) => {
    if (capability.supports_automatic) return 'automatic';
    return 'manual';
  };

  const getActivityIcon = (activity) => {
    switch (activity) {
      case 'auto_update_started': return '🚀';
      case 'auto_update_completed': return '✅';
      case 'auto_update_failed': return '❌';
      case 'download_attempted': return '📥';
      case 'instructions_viewed': return '📋';
      case 'applied_successfully': return '🎉';
      default: return '📝';
    }
  };

  if (loading && automaticCapabilities.length === 0) {
    return (
      <div className="automatic-update-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading theme update manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="automatic-update-dashboard">
      <div className="dashboard-header">
        <h2>🚀 Theme Update Manager</h2>
        <p>Distribute theme updates with automatic server-side installation and manual fallback</p>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
          onClick={() => setActiveTab('updates')}
        >
          📦 Updates List
        </button>
        <button 
          className={`tab ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          ➕ Create Update
        </button>
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'capabilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('capabilities')}
        >
          🚀 Auto Capabilities
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📝 Recent Activity
        </button>
        <button 
          className={`tab ${activeTab === 'debug' ? 'active' : ''}`}
          onClick={() => setActiveTab('debug')}
        >
          🔧 Debug
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'updates' && (
          <div className="updates-tab">
            <div className="updates-header">
              <h3>📦 Manage Updates</h3>
              <p>All theme updates available for distribution</p>
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
                        {update.is_critical && <span className="critical">🚨 Critical</span>}
                        <span className={`status ${update.is_active ? 'active' : 'inactive'}`}>
                          {update.is_active ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="update-details">
                      <p><strong>Description:</strong> {update.description || 'No description'}</p>
                      <p><strong>Created:</strong> {formatDate(update.created_at)}</p>
                      <p><strong>Package:</strong> <a href={update.package_url} target="_blank" rel="noopener noreferrer">Download ZIP</a></p>
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
                      className="btn-update-action"
                      onClick={() => toggleUpdateStatus(update.id, update.is_active)}
                      disabled={updating === update.id}
                    >
                      {updating === update.id ? '🔄' : (update.is_active ? '❌ Deactivate' : '✅ Activate')}
                    </button>
                    {update.is_active && (
                      <button 
                        className="btn-update-action primary"
                        onClick={() => handleDistributeUpdate(update.id)}
                        disabled={distributing === update.id}
                      >
                        {distributing === update.id ? '🔄 Distributing...' : '📤 Distribute'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {updates.length === 0 && (
                <div className="no-updates">
                  <p>📭 No updates created yet</p>
                  <p>Click "Create Update" to create your first theme update package</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="management-tab">
            <div className="create-update-section">
              <h3>🚀 Create New Update</h3>
              <p>Create a new theme update package for distribution to all clients</p>
              
              <form onSubmit={createUpdate} className="update-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="version">Version *</label>
                    <input
                      type="text"
                      id="version"
                      placeholder="e.g., 2.1.0"
                      value={newUpdate.version}
                      onChange={(e) => setNewUpdate({...newUpdate, version: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                      type="text"
                      id="title"
                      placeholder="e.g., Bug fixes and improvements"
                      value={newUpdate.title}
                      onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="channel">Release Channel</label>
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
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      placeholder="Describe what's new in this update..."
                      value={newUpdate.description}
                      onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})}
                      rows="4"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="package_url">Package URL *</label>
                    <input
                      type="url"
                      id="package_url"
                      placeholder="https://example.com/update.zip"
                      value={newUpdate.package_url}
                      onChange={(e) => setNewUpdate({...newUpdate, package_url: e.target.value})}
                      required
                    />
                    <small>URL to the update package ZIP file</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="special_instructions">Special Instructions</label>
                    <textarea
                      id="special_instructions"
                      placeholder="Any special instructions for this update..."
                      value={newUpdate.special_instructions}
                      onChange={(e) => setNewUpdate({...newUpdate, special_instructions: e.target.value})}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUpdate.is_critical}
                        onChange={(e) => setNewUpdate({...newUpdate, is_critical: e.target.checked})}
                      />
                      This is a critical update
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUpdate.is_active}
                        onChange={(e) => setNewUpdate({...newUpdate, is_active: e.target.checked})}
                      />
                      Activate immediately
                    </label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" disabled={creating} className="btn-primary">
                    {creating ? '🔄 Creating...' : '🚀 Create Update'}
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
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card automatic">
                <div className="stat-icon">🚀</div>
                <div className="stat-content">
                  <h3>{automaticStats.clients_supporting_auto || 0}</h3>
                  <p>Auto-Capable Clients</p>
                </div>
              </div>
              <div className="stat-card manual">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>{(automaticStats.clients_with_capability || 0) - (automaticStats.clients_supporting_auto || 0)}</h3>
                  <p>Manual-Only Clients</p>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{automaticStats.success_rate || 0}%</h3>
                  <p>Auto Success Rate</p>
                </div>
              </div>
              <div className="stat-card performance">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <h3>{Math.round((automaticStats.avg_execution_time_ms || 0) / 1000)}s</h3>
                  <p>Avg Update Time</p>
                </div>
              </div>
            </div>

            <div className="capability-summary">
              <h3>📊 Client Capability Summary</h3>
              <div className="capability-chart">
                <div className="chart-bar">
                  <div className="bar-section automatic" 
                       style={{width: `${automaticStats.auto_support_rate || 0}%`}}>
                    <span>{automaticStats.auto_support_rate || 0}% Automatic</span>
                  </div>
                  <div className="bar-section manual" 
                       style={{width: `${100 - (automaticStats.auto_support_rate || 0)}%`}}>
                    <span>{100 - (automaticStats.auto_support_rate || 0)}% Manual</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="recent-updates">
              <h3>🔄 Recent Update Activity</h3>
              <div className="activity-preview">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="activity-item-preview">
                    <div className="activity-icon">{getActivityIcon(activity.activity)}</div>
                    <div className="activity-content">
                      <p><strong>{activity.domain}</strong></p>
                      <p className="activity-description">
                        {activity.activity.replace(/_/g, ' ')} - v{activity.version}
                      </p>
                    </div>
                    <div className="activity-time">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="no-activity">No recent activity</p>
                )}
              </div>
            </div>

            <div className="quick-actions">
              <h3>🚀 Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="action-btn primary"
                  onClick={() => setActiveTab('management')}
                >
                  ➕ Create Update
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => setActiveTab('capabilities')}
                >
                  🚀 View Capabilities
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={loadAutomaticData}
                  disabled={loading}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="capabilities-tab">
            <div className="capabilities-header">
              <h3>🚀 Automatic Update Capabilities</h3>
              <p>Client servers that support automatic server-side updates</p>
            </div>

            <div className="capabilities-list">
              {automaticCapabilities.map(capability => (
                <div key={capability.id} className="capability-item">
                  <div className="capability-info">
                    <div className="capability-main">
                      <h4>{capability.domain}</h4>
                      <div className="capability-meta">
                        <span className={`status ${getCapabilityStatus(capability)}`}>
                          {capability.supports_automatic ? '🚀 Automatic' : '📋 Manual'}
                        </span>
                        {capability.php_version && (
                          <span className="php-version">PHP {capability.php_version}</span>
                        )}
                        <span className="last-check">
                          Checked: {formatDate(capability.last_capability_check)}
                        </span>
                      </div>
                    </div>
                    <div className="capability-details">
                      <p><strong>Client ID:</strong> {capability.client_id}</p>
                      {capability.endpoint_url && (
                        <p><strong>Endpoint:</strong> {capability.endpoint_url}</p>
                      )}
                      {capability.server_info?.screen_resolution && (
                        <p><strong>Resolution:</strong> {capability.server_info.screen_resolution}</p>
                      )}
                      {capability.server_info?.timezone && (
                        <p><strong>Timezone:</strong> {capability.server_info.timezone}</p>
                      )}
                    </div>
                  </div>
                  <div className="capability-actions">
                    {capability.supports_automatic ? (
                      <button className="btn-small success">
                        ✅ Auto Ready
                      </button>
                    ) : (
                      <button className="btn-small manual">
                        📋 Manual Only
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {automaticCapabilities.length === 0 && (
                <div className="no-capabilities">
                  <p>📭 No client capabilities detected yet</p>
                  <p>Capabilities are detected when clients visit their websites</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-tab">
            <div className="activity-header">
              <h3>📝 Recent Update Activity</h3>
              <p>All automatic and manual update activities across clients</p>
            </div>

            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon-large">{getActivityIcon(activity.activity)}</div>
                  <div className="activity-info">
                    <div className="activity-main">
                      <h4>{activity.domain}</h4>
                      <p className="activity-description">
                        {activity.activity.replace(/_/g, ' ')} 
                        {activity.update_title && ` - ${activity.update_title}`}
                        {activity.version && ` (v${activity.version})`}
                      </p>
                    </div>
                    <div className="activity-meta">
                      <span className="timestamp">{formatDate(activity.timestamp)}</span>
                      {activity.execution_time_ms && (
                        <span className="execution-time">
                          ⚡ {Math.round(activity.execution_time_ms / 1000)}s
                        </span>
                      )}
                      <span className={`success-indicator ${activity.success ? 'success' : 'failed'}`}>
                        {activity.success ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="no-activity">
                  <p>📭 No recent activity</p>
                  <p>Activity will appear here when clients perform updates</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="debug-tab">
            <div className="debug-header">
              <h3>🔧 Debug & Troubleshooting</h3>
              <p>Detailed debugging information for automatic update failures</p>
            </div>
            <AutoUpdateDebugPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomaticUpdateDashboard; 