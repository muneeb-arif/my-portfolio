import React, { useState, useEffect } from 'react';
import { automaticUpdateService } from '../../services/automaticUpdateService';

/**
 * Server Log Viewer Service
 */
class ServerLogService {
  constructor() {
    this.apiKey = 'sk_update_2024_portfolio_secure_key_255d78d54885303d0fc7564b88b70527';
    this.endpoint = window.location.origin + '/log-viewer.php';
  }

  async makeRequest(action, params = {}) {
    try {
      const requestData = {
        api_key: this.apiKey,
        action,
        ...params
      };

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Server request failed');
      }

      return result;
    } catch (error) {
      console.error('Server log request failed:', error);
      throw error;
    }
  }

  async listLogs() {
    return await this.makeRequest('list_logs');
  }

  async readLog(logType, options = {}) {
    return await this.makeRequest('read_log', {
      log_type: logType,
      start_line: options.startLine || 0,
      max_lines: options.maxLines || 100,
      tail: options.tail || false
    });
  }

  async clearLog(logType) {
    return await this.makeRequest('clear_log', { log_type: logType });
  }

  async getLogStats() {
    return await this.makeRequest('log_stats');
  }
}

const AutoUpdateDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [serverLogs, setServerLogs] = useState({});
  const [serverLogStats, setServerLogStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeServerLogTab, setActiveServerLogTab] = useState('update');
  const [loading, setLoading] = useState(false);
  const [serverLogService] = useState(new ServerLogService());

  useEffect(() => {
    loadDebugInfo();
    loadServerLogs();
  }, []);

  const loadDebugInfo = () => {
    setLoading(true);
    try {
      const lastAttempt = localStorage.getItem('last_update_attempt');
      const lastError = localStorage.getItem('last_update_error');
      const debugLogs = localStorage.getItem('auto_update_debug_logs');
      const lastSession = localStorage.getItem('auto_update_last_session');
      const debugReport = localStorage.getItem('last_update_debug_report');

      const serviceDebugInfo = automaticUpdateService.getDebugLogs();

      setDebugInfo({
        lastAttempt: lastAttempt ? JSON.parse(lastAttempt) : null,
        lastError: lastError ? JSON.parse(lastError) : null,
        debugLogs: debugLogs ? JSON.parse(debugLogs) : [],
        lastSession,
        debugReport: debugReport ? JSON.parse(debugReport) : null,
        serviceDebugInfo,
        localStorage: {
          automaticUpdatesSupported: localStorage.getItem('automatic_updates_supported'),
          automaticUpdatesEnabled: localStorage.getItem('automatic_updates_enabled'),
          clientId: localStorage.getItem('auto_update_client_id'),
          themeVersion: localStorage.getItem('theme_version')
        },
        systemInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          language: navigator.language
        }
      });
    } catch (error) {
      console.error('Failed to load debug info:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadServerLogs = async () => {
    try {
      console.log('🔍 [AutoUpdateDebugPanel] Loading server logs');
      
      // Get log statistics first
      const statsResult = await serverLogService.getLogStats();
      setServerLogStats(statsResult.stats);
      
      // Load recent entries from each log type
      const logTypes = ['update', 'debug', 'steps'];
      const logs = {};
      
      for (const logType of logTypes) {
        try {
          const logResult = await serverLogService.readLog(logType, {
            tail: true,
            maxLines: 50
          });
          logs[logType] = logResult;
        } catch (error) {
          console.warn(`Failed to load ${logType} log:`, error);
          logs[logType] = {
            success: false,
            error: error.message,
            log_type: logType,
            content: []
          };
        }
      }
      
      setServerLogs(logs);
      console.log('✅ [AutoUpdateDebugPanel] Server logs loaded', { logs, stats: statsResult.stats });
      
    } catch (error) {
      console.error('❌ [AutoUpdateDebugPanel] Failed to load server logs:', error);
      setServerLogs({
        error: error.message,
        available: false
      });
    }
  };

  const refreshServerLog = async (logType) => {
    try {
      console.log(`🔄 [AutoUpdateDebugPanel] Refreshing ${logType} log`);
      const logResult = await serverLogService.readLog(logType, {
        tail: true,
        maxLines: 100
      });
      
      setServerLogs(prev => ({
        ...prev,
        [logType]: logResult
      }));
      
      // Also refresh stats
      const statsResult = await serverLogService.getLogStats();
      setServerLogStats(statsResult.stats);
      
    } catch (error) {
      console.error(`❌ Failed to refresh ${logType} log:`, error);
      alert(`Failed to refresh ${logType} log: ${error.message}`);
    }
  };

  const clearServerLog = async (logType) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to clear the ${logType} log? This will create a backup first.`)) {
      return;
    }
    
    try {
      console.log(`🗑️ [AutoUpdateDebugPanel] Clearing ${logType} log`);
      await serverLogService.clearLog(logType);
      
      // Refresh the log after clearing
      await refreshServerLog(logType);
      
      alert(`✅ ${logType} log cleared successfully (backup created)`);
      
    } catch (error) {
      console.error(`❌ Failed to clear ${logType} log:`, error);
      alert(`Failed to clear ${logType} log: ${error.message}`);
    }
  };

  const exportServerLog = (logType) => {
    const logData = serverLogs[logType];
    if (!logData || !logData.content) {
      alert('No log data to export');
      return;
    }
    
    const exportData = {
      logType,
      timestamp: new Date().toISOString(),
      ...logData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-${logType}-log-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearDebugInfo = () => {
    localStorage.removeItem('last_update_attempt');
    localStorage.removeItem('last_update_error');
    localStorage.removeItem('last_update_debug_report');
    automaticUpdateService.clearDebugLogs();
    loadDebugInfo();
    alert('✅ Debug information cleared');
  };

  const exportAllDebugInfo = () => {
    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-update-debug-complete-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 Copied to clipboard');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('📋 Copied to clipboard');
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="debug-panel loading">
        <div className="loading-spinner"></div>
        <p>Loading debug information...</p>
      </div>
    );
  }

  if (!debugInfo) {
    return (
      <div className="debug-panel error">
        <p>❌ Failed to load debug information</p>
        <button onClick={loadDebugInfo}>🔄 Retry</button>
      </div>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🔧 Auto Update Debug Panel</h3>
        <div className="debug-actions">
          <button onClick={loadDebugInfo} className="btn-refresh">🔄 Refresh</button>
          <button onClick={exportAllDebugInfo} className="btn-export">📁 Export All</button>
          <button onClick={() => automaticUpdateService.exportDebugLogs()} className="btn-export">📋 Export Service Logs</button>
          <button onClick={clearDebugInfo} className="btn-clear">🗑️ Clear</button>
        </div>
      </div>

      <div className="debug-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'last-attempt' ? 'active' : ''}`}
          onClick={() => setActiveTab('last-attempt')}
        >
          🚀 Last Attempt
        </button>
        <button 
          className={`tab ${activeTab === 'errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          ❌ Errors
        </button>
        <button 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs
        </button>
        <button 
          className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          🖥️ System
        </button>
        <button 
          className={`tab ${activeTab === 'server-logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('server-logs')}
        >
          🗄️ Server Logs
        </button>
      </div>

      <div className="debug-content">
        {activeTab === 'overview' && (
          <div className="debug-section">
            <h4>System Status</h4>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Automatic Updates:</span>
                <span className={`status ${debugInfo.localStorage.automaticUpdatesSupported === 'true' ? 'supported' : 'unsupported'}`}>
                  {debugInfo.localStorage.automaticUpdatesSupported === 'true' ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Client ID:</span>
                <span className="value">{debugInfo.localStorage.clientId || 'Not Set'}</span>
              </div>
              <div className="status-item">
                <span className="label">Current Version:</span>
                <span className="value">{debugInfo.localStorage.themeVersion || 'Unknown'}</span>
              </div>
              <div className="status-item">
                <span className="label">Last Session:</span>
                <span className="value">{debugInfo.lastSession || 'None'}</span>
              </div>
              <div className="status-item">
                <span className="label">Debug Logs:</span>
                <span className="value">{debugInfo.debugLogs.length} entries</span>
              </div>
              <div className="status-item">
                <span className="label">Network Status:</span>
                <span className={`status ${debugInfo.systemInfo.onLine ? 'online' : 'offline'}`}>
                  {debugInfo.systemInfo.onLine ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>

            {debugInfo.lastAttempt && (
              <div className="last-attempt-summary">
                <h4>Last Update Attempt</h4>
                <div className="attempt-info">
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${debugInfo.lastAttempt.status}`}>
                      {debugInfo.lastAttempt.status}
                    </span>
                  </p>
                  <p><strong>Version:</strong> {debugInfo.lastAttempt.updateInfo?.version}</p>
                  <p><strong>Time:</strong> {formatTimestamp(debugInfo.lastAttempt.startTime)}</p>
                  {debugInfo.lastAttempt.totalDuration && (
                    <p><strong>Duration:</strong> {formatDuration(debugInfo.lastAttempt.totalDuration)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'last-attempt' && (
          <div className="debug-section">
            <h4>Last Update Attempt Details</h4>
            {debugInfo.lastAttempt ? (
              <div className="json-viewer">
                <div className="json-header">
                  <span>Last attempt data:</span>
                  <button onClick={() => copyToClipboard(JSON.stringify(debugInfo.lastAttempt, null, 2))}>
                    📋 Copy
                  </button>
                </div>
                <pre>{JSON.stringify(debugInfo.lastAttempt, null, 2)}</pre>
              </div>
            ) : (
              <p className="no-data">No update attempts recorded</p>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="debug-section">
            <h4>Error Information</h4>
            {debugInfo.lastError ? (
              <div className="error-details">
                <div className="error-summary">
                  <h5>Last Error</h5>
                  <p><strong>Message:</strong> {debugInfo.lastError.error?.message}</p>
                  <p><strong>Time:</strong> {formatTimestamp(debugInfo.lastError.timestamp)}</p>
                  <p><strong>Duration:</strong> {formatDuration(debugInfo.lastError.totalDuration)}</p>
                </div>
                <div className="json-viewer">
                  <div className="json-header">
                    <span>Full error data:</span>
                    <button onClick={() => copyToClipboard(JSON.stringify(debugInfo.lastError, null, 2))}>
                      📋 Copy
                    </button>
                  </div>
                  <pre>{JSON.stringify(debugInfo.lastError, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <p className="no-data">No errors recorded</p>
            )}

            {debugInfo.debugReport && (
              <div className="debug-report">
                <h5>Service Debug Report</h5>
                <div className="json-viewer">
                  <div className="json-header">
                    <span>Debug report data:</span>
                    <button onClick={() => copyToClipboard(JSON.stringify(debugInfo.debugReport, null, 2))}>
                      📋 Copy
                    </button>
                  </div>
                  <pre>{JSON.stringify(debugInfo.debugReport, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="debug-section">
            <h4>Debug Logs ({debugInfo.debugLogs.length} entries)</h4>
            {debugInfo.debugLogs.length > 0 ? (
              <div className="logs-container">
                <div className="logs-header">
                  <span>Recent debug logs:</span>
                  <button onClick={() => copyToClipboard(JSON.stringify(debugInfo.debugLogs, null, 2))}>
                    📋 Copy All
                  </button>
                </div>
                <div className="logs-list">
                  {debugInfo.debugLogs.slice(-20).reverse().map((log, index) => (
                    <div key={index} className={`log-entry ${log.level}`}>
                      <div className="log-header">
                        <span className="timestamp">{formatTimestamp(log.timestamp)}</span>
                        <span className="level">{log.level}</span>
                        <span className="step">{log.step}</span>
                      </div>
                      <div className="log-message">{log.message}</div>
                      {log.data && (
                        <details className="log-data">
                          <summary>View Data</summary>
                          <pre>{JSON.stringify(log.data, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-data">No debug logs available</p>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="debug-section">
            <h4>System Information</h4>
            <div className="system-info">
              <div className="info-group">
                <h5>Browser</h5>
                <p><strong>User Agent:</strong> {debugInfo.systemInfo.userAgent}</p>
                <p><strong>Language:</strong> {debugInfo.systemInfo.language}</p>
                <p><strong>Cookies Enabled:</strong> {debugInfo.systemInfo.cookieEnabled ? 'Yes' : 'No'}</p>
                <p><strong>Online Status:</strong> {debugInfo.systemInfo.onLine ? 'Online' : 'Offline'}</p>
              </div>
              
              <div className="info-group">
                <h5>LocalStorage</h5>
                <div className="json-viewer">
                  <pre>{JSON.stringify(debugInfo.localStorage, null, 2)}</pre>
                </div>
              </div>

              <div className="info-group">
                <h5>Service Debug Info</h5>
                {debugInfo.serviceDebugInfo && (
                  <div className="json-viewer">
                    <div className="json-header">
                      <span>Service logs and system info:</span>
                      <button onClick={() => copyToClipboard(JSON.stringify(debugInfo.serviceDebugInfo, null, 2))}>
                        📋 Copy
                      </button>
                    </div>
                    <pre>{JSON.stringify(debugInfo.serviceDebugInfo, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'server-logs' && (
          <div className="debug-section">
            <div className="server-logs-header">
              <h4>🗄️ Server-Side Logs</h4>
              <div className="server-log-actions">
                <button onClick={loadServerLogs} className="btn-refresh">
                  🔄 Refresh All
                </button>
                {serverLogStats && (
                  <span className="log-stats">
                    Total Size: {serverLogStats.total_size_human} | 
                    Files: {serverLogStats.logs.filter(l => l.exists).length}/{serverLogStats.total_logs}
                  </span>
                )}
              </div>
            </div>

            {serverLogs.error ? (
              <div className="server-logs-error">
                <h5>❌ Server Logs Not Available</h5>
                <p><strong>Error:</strong> {serverLogs.error}</p>
                <p>This could mean:</p>
                <ul>
                  <li>The log-viewer.php endpoint is not accessible</li>
                  <li>Server logs haven't been created yet</li>
                  <li>Permissions issue accessing log files</li>
                  <li>API key mismatch between services</li>
                </ul>
                <button onClick={loadServerLogs} className="btn-retry">
                  🔄 Retry Connection
                </button>
              </div>
            ) : (
              <>
                <div className="server-log-tabs">
                  <button 
                    className={`server-log-tab ${activeServerLogTab === 'update' ? 'active' : ''}`}
                    onClick={() => setActiveServerLogTab('update')}
                  >
                    📝 Update Log
                    {serverLogStats?.logs.find(l => l.type === 'update')?.recent_entries > 0 && (
                      <span className="recent-badge">{serverLogStats.logs.find(l => l.type === 'update').recent_entries}</span>
                    )}
                  </button>
                  <button 
                    className={`server-log-tab ${activeServerLogTab === 'debug' ? 'active' : ''}`}
                    onClick={() => setActiveServerLogTab('debug')}
                  >
                    🔍 Debug Log
                    {serverLogStats?.logs.find(l => l.type === 'debug')?.recent_entries > 0 && (
                      <span className="recent-badge">{serverLogStats.logs.find(l => l.type === 'debug').recent_entries}</span>
                    )}
                  </button>
                  <button 
                    className={`server-log-tab ${activeServerLogTab === 'steps' ? 'active' : ''}`}
                    onClick={() => setActiveServerLogTab('steps')}
                  >
                    🚶 Steps Log
                    {serverLogStats?.logs.find(l => l.type === 'steps')?.recent_entries > 0 && (
                      <span className="recent-badge">{serverLogStats.logs.find(l => l.type === 'steps').recent_entries}</span>
                    )}
                  </button>
                </div>

                <div className="server-log-content">
                  {serverLogs[activeServerLogTab] ? (
                    <div className="server-log-viewer">
                      <div className="log-header">
                        <div className="log-info">
                          <h5>{activeServerLogTab.charAt(0).toUpperCase() + activeServerLogTab.slice(1)} Log</h5>
                          {serverLogs[activeServerLogTab].total_lines !== undefined && (
                            <span className="log-meta">
                              Showing recent {serverLogs[activeServerLogTab].returned_lines || 0} of {serverLogs[activeServerLogTab].total_lines} lines
                              {serverLogs[activeServerLogTab].file_size && (
                                <> | Size: {(serverLogs[activeServerLogTab].file_size / 1024).toFixed(1)}KB</>
                              )}
                              {serverLogs[activeServerLogTab].last_modified && (
                                <> | Modified: {serverLogs[activeServerLogTab].last_modified}</>
                              )}
                            </span>
                          )}
                        </div>
                        <div className="log-actions">
                          <button 
                            onClick={() => refreshServerLog(activeServerLogTab)}
                            className="btn-refresh-single"
                          >
                            🔄 Refresh
                          </button>
                          <button 
                            onClick={() => exportServerLog(activeServerLogTab)}
                            className="btn-export-single"
                          >
                            📁 Export
                          </button>
                          <button 
                            onClick={() => clearServerLog(activeServerLogTab)}
                            className="btn-clear-single"
                          >
                            🗑️ Clear
                          </button>
                        </div>
                      </div>

                      {serverLogs[activeServerLogTab].error ? (
                        <div className="log-error">
                          <p>❌ Error loading {activeServerLogTab} log: {serverLogs[activeServerLogTab].error}</p>
                        </div>
                      ) : serverLogs[activeServerLogTab].content && serverLogs[activeServerLogTab].content.length > 0 ? (
                        <div className="log-entries">
                          {serverLogs[activeServerLogTab].content.map((entry, index) => (
                            <div key={index} className={`log-entry server-log-${activeServerLogTab}`}>
                              <div className="log-entry-header">
                                <span className="line-number">#{entry.line_number}</span>
                                {entry.timestamp && (
                                  <span className="timestamp">{entry.timestamp}</span>
                                )}
                              </div>
                              <div className="log-entry-content">
                                {entry.parsed_data ? (
                                  <details className="parsed-log-data">
                                    <summary className="log-summary">
                                      {entry.parsed_data.step || entry.parsed_data.status || 'Server Log Entry'}
                                      {entry.parsed_data.message && ` - ${entry.parsed_data.message}`}
                                    </summary>
                                    <pre className="parsed-json">
                                      {JSON.stringify(entry.parsed_data, null, 2)}
                                    </pre>
                                  </details>
                                ) : (
                                  <div className="raw-log-content">{entry.content}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-log-data">
                          <p>📭 No {activeServerLogTab} log entries yet</p>
                          <p>Log entries will appear here when the auto-update system runs</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="loading-log">
                      <div className="loading-spinner"></div>
                      <p>Loading {activeServerLogTab} log...</p>
                    </div>
                  )}
                </div>

                {serverLogStats && (
                  <div className="server-log-stats">
                    <h5>📊 Log Statistics</h5>
                    <div className="stats-grid">
                      {serverLogStats.logs.map((logStat, index) => (
                        <div key={index} className={`stat-item ${logStat.exists ? 'exists' : 'missing'}`}>
                          <div className="stat-label">
                            {logStat.type} log
                            {!logStat.exists && <span className="missing-indicator"> (not created)</span>}
                          </div>
                          <div className="stat-values">
                            {logStat.exists ? (
                              <>
                                <span>Size: {logStat.size_human}</span>
                                {logStat.recent_entries > 0 && (
                                  <span>Recent: {logStat.recent_entries} entries</span>
                                )}
                                <span>Modified: {logStat.last_modified}</span>
                              </>
                            ) : (
                              <span>No log file yet</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .debug-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .debug-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .debug-actions {
          display: flex;
          gap: 10px;
        }

        .debug-actions button {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .debug-actions button:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-clear {
          background: #fee2e2 !important;
          border-color: #fca5a5 !important;
          color: #dc2626 !important;
        }

        .btn-export {
          background: #eff6ff !important;
          border-color: #dbeafe !important;
          color: #1d4ed8 !important;
        }

        .debug-tabs {
          display: flex;
          gap: 2px;
          margin-bottom: 20px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }

        .debug-tabs .tab {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }

        .debug-tabs .tab.active {
          background: white;
          color: #1f2937;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .debug-tabs .tab:hover:not(.active) {
          color: #374151;
          background: rgba(255,255,255,0.5);
        }

        .debug-content {
          min-height: 400px;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #e5e7eb;
        }

        .status-item .label {
          font-weight: 500;
          color: #374151;
        }

        .status-item .value {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .status-item .status.supported {
          color: #059669;
        }

        .status-item .status.unsupported {
          color: #dc2626;
        }

        .status-item .status.online {
          color: #059669;
        }

        .status-item .status.offline {
          color: #dc2626;
        }

        .last-attempt-summary {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-top: 20px;
        }

        .last-attempt-summary h4 {
          margin: 0 0 12px 0;
          color: #1e293b;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          margin-left: 8px;
        }

        .status-badge.completed {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.failed {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-badge.started {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .json-viewer {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .json-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #e2e8f0;
          border-bottom: 1px solid #cbd5e1;
          font-weight: 500;
          color: #475569;
        }

        .json-viewer pre {
          margin: 0;
          padding: 16px;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.8rem;
          line-height: 1.4;
          color: #1e293b;
        }

        .logs-container {
          max-height: 600px;
          overflow-y: auto;
        }

        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .log-entry {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .log-entry.error {
          border-left: 4px solid #dc2626;
        }

        .log-entry.warn {
          border-left: 4px solid #f59e0b;
        }

        .log-entry.success {
          border-left: 4px solid #059669;
        }

        .log-entry.info {
          border-left: 4px solid #3b82f6;
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.8rem;
        }

        .log-header .timestamp {
          color: #6b7280;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .log-header .level {
          padding: 2px 6px;
          border-radius: 4px;
          background: #e5e7eb;
          color: #374151;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.7rem;
        }

        .log-header .step {
          color: #4b5563;
          font-weight: 500;
        }

        .log-message {
          padding: 12px;
          color: #1f2937;
        }

        .log-data {
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .log-data summary {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .log-data pre {
          margin: 0;
          padding: 12px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.75rem;
          color: #374151;
        }

        .no-data {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 40px;
        }

        .info-group {
          margin-bottom: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .info-group h5 {
          margin: 0 0 12px 0;
          color: #1e293b;
        }

        .info-group p {
          margin: 6px 0;
          font-size: 0.9rem;
          color: #475569;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          text-align: center;
          color: #dc2626;
          padding: 40px;
        }

        /* Server Logs Styles */
        .server-logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .server-log-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .log-stats {
          font-size: 0.85rem;
          color: #6b7280;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .server-logs-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 20px;
          color: #dc2626;
        }

        .server-logs-error h5 {
          margin: 0 0 10px 0;
        }

        .server-logs-error ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .btn-retry {
          margin-top: 15px;
          padding: 8px 16px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .server-log-tabs {
          display: flex;
          gap: 2px;
          margin-bottom: 20px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }

        .server-log-tab {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
          position: relative;
        }

        .server-log-tab.active {
          background: white;
          color: #1f2937;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .server-log-tab:hover:not(.active) {
          color: #374151;
          background: rgba(255,255,255,0.5);
        }

        .recent-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          font-size: 0.7rem;
          padding: 2px 6px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .server-log-viewer {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .log-info h5 {
          margin: 0 0 4px 0;
          color: #1f2937;
        }

        .log-meta {
          font-size: 0.8rem;
          color: #6b7280;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .log-actions {
          display: flex;
          gap: 8px;
        }

        .log-actions button {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .log-actions button:hover {
          background: #f9fafb;
        }

        .btn-clear-single {
          background: #fee2e2 !important;
          border-color: #fca5a5 !important;
          color: #dc2626 !important;
        }

        .log-entries {
          max-height: 500px;
          overflow-y: auto;
        }

        .log-entry {
          border-bottom: 1px solid #f3f4f6;
          padding: 12px 16px;
        }

        .log-entry:last-child {
          border-bottom: none;
        }

        .log-entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .line-number {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.8rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .timestamp {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .log-entry-content {
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .parsed-log-data {
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .log-summary {
          padding: 8px 12px;
          background: #f8fafc;
          cursor: pointer;
          font-weight: 500;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .parsed-json {
          margin: 0;
          padding: 12px;
          background: #fafafa;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.75rem;
          overflow-x: auto;
        }

        .raw-log-content {
          font-family: 'Monaco', 'Menlo', monospace;
          white-space: pre-wrap;
          color: #374151;
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .server-log-update .raw-log-content {
          border-left: 4px solid #3b82f6;
        }

        .server-log-debug .raw-log-content {
          border-left: 4px solid #10b981;
        }

        .server-log-steps .raw-log-content {
          border-left: 4px solid #f59e0b;
        }

        .no-log-data {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .loading-log {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          color: #6b7280;
        }

        .server-log-stats {
          margin-top: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .server-log-stats h5 {
          margin: 0 0 12px 0;
          color: #1e293b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .stat-item {
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .stat-item.exists {
          border-left: 4px solid #10b981;
        }

        .stat-item.missing {
          border-left: 4px solid #6b7280;
          opacity: 0.7;
        }

        .stat-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .missing-indicator {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: normal;
        }

        .stat-values {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-values span {
          font-size: 0.8rem;
          color: #6b7280;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .log-error {
          padding: 20px;
          background: #fef2f2;
          color: #dc2626;
          text-align: center;
        }

        @media (max-width: 768px) {
          .debug-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .debug-actions {
            justify-content: center;
          }

          .debug-tabs {
            flex-direction: column;
            gap: 2px;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .json-header {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }

          .server-logs-header {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }

          .server-log-actions {
            justify-content: center;
            flex-wrap: wrap;
          }

          .server-log-tabs {
            flex-direction: column;
            gap: 2px;
          }

          .log-header {
            flex-direction: column;
            gap: 10px;
          }

          .log-actions {
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AutoUpdateDebugPanel; 