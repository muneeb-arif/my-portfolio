import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { automaticUpdateService } from '../../services/automaticUpdateService';

const UpdateNotificationBar = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const [progressDisplay, setProgressDisplay] = useState({
    isVisible: false,
    currentStep: '',
    messages: [],
    progress: 0
  });

  useEffect(() => {
    checkForUpdates();
    
    // Check for updates every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      // Get the latest active update using local API
      const result = await apiService.getSharedHostingUpdates({
        is_active: true,
        limit: 1,
        order: 'created_at DESC'
      });

      if (!result.success) {
        console.warn('Failed to check for updates:', result.error);
        return;
      }

      const updates = result.data || [];
      if (updates.length === 0) {
        setIsVisible(false);
        return;
      }

      const latestUpdate = updates[0];
      const currentVersion = localStorage.getItem('theme_version') || '1.0.0';
      
      // Check if this is a newer version (no dismiss option anymore)
      const hasNewerUpdate = isVersionNewer(latestUpdate.version, currentVersion);
      
      if (hasNewerUpdate) {
        setUpdateInfo(latestUpdate);
        setIsVisible(true);
        console.log('🆕 Update available:', latestUpdate.version);
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.warn('Error checking for updates:', error);
    }
  };

  const isVersionNewer = (newVersion, currentVersion) => {
    const parseVersion = (version) => {
      return version.split('.').map(num => parseInt(num, 10));
    };

    const newParts = parseVersion(newVersion);
    const currentParts = parseVersion(currentVersion);

    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (newPart > currentPart) return true;
      if (newPart < currentPart) return false;
    }

    return false;
  };

  const handleApplyUpdate = async () => {
    const startTime = Date.now();
    const debugData = {
      startTime,
      updateInfo: {
        id: updateInfo.id,
        version: updateInfo.version,
        title: updateInfo.title,
        packageUrl: updateInfo.package_url ? 'PROVIDED' : 'MISSING'
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      localStorage: {
        automaticUpdatesSupported: localStorage.getItem('automatic_updates_supported'),
        clientId: localStorage.getItem('auto_update_client_id'),
        currentVersion: localStorage.getItem('theme_version')
      }
    };

    console.log('🚀 [UpdateNotificationBar] Starting update process', debugData);

    try {
      setIsApplyingUpdate(true);
      setProgressDisplay({
        isVisible: true,
        currentStep: 'Initializing update...',
        messages: ['🚀 Starting automatic update process'],
        progress: 0
      });
      
      // Store debug info in localStorage
      localStorage.setItem('last_update_attempt', JSON.stringify({
        ...debugData,
        status: 'started'
      }));
      
      // Skip the redundant checkSupport() call since applyUpdate() does it internally
      console.log('🔄 [UpdateNotificationBar] Starting automatic update');
      setProgressDisplay(prev => ({
        ...prev,
        currentStep: 'Preparing automatic update...',
        messages: [...prev.messages, '🔄 Preparing automatic update'],
        progress: 20
      }));

      const updateStart = Date.now();
      
      let stepCount = 0;
      const result = await automaticUpdateService.applyUpdate(updateInfo, {
        createBackup: true,
        progressCallback: (message, type) => {
          stepCount++;
          const stepTime = Date.now();
          console.log(`[UpdateProgress:${stepCount}] ${type}: ${message}`, {
            stepNumber: stepCount,
            stepTime,
            elapsedTotal: stepTime - startTime
          });
          
          setProgressDisplay(prev => ({
            ...prev,
            currentStep: message,
            messages: [...prev.messages, `${type === 'info' ? '🔄' : type === 'success' ? '✅' : '❌'} ${message}`],
            progress: Math.min(prev.progress + 8, 90)
          }));
        }
      });

      const updateDuration = Date.now() - updateStart;
      console.log('📊 [UpdateNotificationBar] Update process completed', {
        success: result.success,
        duration: `${updateDuration}ms`,
        totalSteps: stepCount,
        hasDebugReport: !!result.debugReport
      });

      if (result.success) {
        console.log('🎉 [UpdateNotificationBar] Update successful');
        setProgressDisplay(prev => ({
          ...prev,
          currentStep: 'Update completed successfully!',
          messages: [...prev.messages, '🎉 Update applied successfully!', '🔄 Preparing to reload...'],
          progress: 100
        }));

        // Store success in localStorage
        localStorage.setItem('last_update_attempt', JSON.stringify({
          ...debugData,
          status: 'completed',
          updateDuration,
          stepCount,
          filesUpdated: result.filesUpdated,
          backupCreated: result.backupCreated
        }));

        // Update successful
        localStorage.setItem('theme_version', updateInfo.version);
        setIsVisible(false);
        
        // Show success and reload
        setTimeout(() => {
          alert('🎉 Update applied successfully! Reloading page...');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }, 2000);
      } else {
        console.error('❌ [UpdateNotificationBar] Update failed', {
          error: result.error,
          debugReport: result.debugReport
        });
        
        // Store debug report if available
        if (result.debugReport) {
          localStorage.setItem('last_update_debug_report', JSON.stringify(result.debugReport));
        }
        
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      const errorTime = Date.now();
      const totalDuration = errorTime - startTime;
      
      console.error('❌ [UpdateNotificationBar] Update process failed', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        totalDuration: `${totalDuration}ms`,
        updateInfo: debugData.updateInfo
      });
      
      // Store comprehensive error information
      const errorData = {
        ...debugData,
        status: 'failed',
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        totalDuration,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('last_update_attempt', JSON.stringify(errorData));
      localStorage.setItem('last_update_error', JSON.stringify(errorData));
      
      setProgressDisplay(prev => ({
        ...prev,
        currentStep: 'Update failed',
        messages: [...prev.messages, `❌ Auto-update failed: ${error.message}`, '💡 Please try manual update instead'],
        progress: 100
      }));
      
      // Export debug logs for troubleshooting
      try {
        automaticUpdateService.exportDebugLogs();
        console.log('📁 [UpdateNotificationBar] Debug logs exported for troubleshooting');
      } catch (exportError) {
        console.warn('⚠️ [UpdateNotificationBar] Failed to export debug logs:', exportError);
      }
      
      setTimeout(() => {
        const debugHint = '\n\n🔧 Debug Info:\n' +
          `- Check browser console for detailed logs\n` +
          `- Check localStorage key "last_update_error" for error details\n` +
          `- Debug logs have been exported to downloads`;
          
        alert(`❌ Auto-update failed: ${error.message}\n\nTry the manual update instead.${debugHint}`);
        setProgressDisplay({ isVisible: false, currentStep: '', messages: [], progress: 0 });
      }, 3000);
    } finally {
      setIsApplyingUpdate(false);
    }
  };

  const handleManualUpdate = () => {
    if (updateInfo.download_url || updateInfo.package_url) {
      // Open download link
      window.open(updateInfo.download_url || updateInfo.package_url, '_blank');
      
      // Show instructions
      alert(`📦 Manual Update Required

Update: ${updateInfo.title}
Version: ${updateInfo.version}

Steps:
1. Download will start automatically
2. Go to your cPanel File Manager
3. Upload the ZIP file to public_html
4. Extract and overwrite files
5. Test your website

Mark as applied when done.`);
    } else {
      alert(`📦 Update Available: ${updateInfo.title}\n\nPlease contact support to get the update package.`);
    }
  };

  const handleMarkApplied = () => {
    // Mark the update as applied locally
    localStorage.setItem('theme_version', updateInfo.version);
    setIsVisible(false);
    
    // Show confirmation
    alert('✅ Update marked as applied. If you need to apply it again, clear your browser cache.');
  };

  if (!isVisible || !updateInfo) {
    return null;
  }

  return (
    <div className="update-notification-bar">
      <div className="update-content">
        <div className="update-header">
          <div className="update-icon">🚀</div>
          <div className="update-text">
            <strong>Website Update Available!</strong>
            <p>Version {updateInfo.version}: {updateInfo.title}</p>
            <p className="update-description">{updateInfo.description}</p>
          </div>
          <div className="update-badge">
            NEW
          </div>
        </div>
        
        {progressDisplay.isVisible && (
          <div className="progress-display">
            <div className="progress-header">
              <h4>🔄 Update in Progress</h4>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressDisplay.progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{progressDisplay.progress}%</span>
            </div>
            <div className="current-step">
              <strong>{progressDisplay.currentStep}</strong>
            </div>
            <div className="progress-messages">
              {progressDisplay.messages.slice(-3).map((message, index) => (
                <div key={index} className="progress-message">
                  {message}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="update-actions">
          <button 
            className="btn-auto-update primary"
            onClick={handleApplyUpdate}
            disabled={isApplyingUpdate}
          >
            {isApplyingUpdate ? '⏳ Updating...' : '🚀 Auto Update Now'}
          </button>
          <button 
            className="btn-manual-update"
            onClick={handleManualUpdate}
            disabled={isApplyingUpdate}
          >
            📥 Manual Update
          </button>
          <button 
            className="btn-mark-applied"
            onClick={handleMarkApplied}
            disabled={isApplyingUpdate}
          >
            ✅ Mark as Applied
          </button>
        </div>
        
        <div className="update-details">
          <p className="update-note text-white">
            💡 <strong>Note:</strong> This notification will remain visible until the update is applied or marked as applied.
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .update-notification-bar {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 20px;
          margin-bottom: 24px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .update-notification-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .update-content {
          position: relative;
          z-index: 1;
        }
        
        .update-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .update-icon {
          font-size: 32px;
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .update-text {
          flex: 1;
        }
        
        .update-text strong {
          display: block;
          margin-bottom: 6px;
          font-size: 1.2rem;
          font-weight: 700;
        }
        
        .update-text p {
          margin: 4px 0;
          opacity: 0.95;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .update-description {
          color: rgba(255, 255, 255, 0.9);
          font-style: italic;
        }
        
        .update-badge {
          background: #ef4444;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
          60% { transform: translateY(-2px); }
        }

        .progress-display {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
        }

        .progress-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .progress-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .progress-text {
          font-size: 0.9rem;
          font-weight: 600;
          min-width: 40px;
        }

        .current-step {
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: #f1f5f9;
        }

        .progress-messages {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .progress-message {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.9);
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          border-left: 3px solid #10b981;
        }
        
        .update-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          justify-content: center;
        }
        
        .update-actions button {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }

        .update-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-auto-update.primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-auto-update.primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        
        .btn-manual-update, .btn-mark-applied {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .btn-manual-update:hover:not(:disabled), .btn-mark-applied:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
        }
        
        .update-details {
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          border-left: 4px solid rgba(255, 255, 255, 0.3);
        }
        
        .update-note {
          margin: 0;
          font-size: 0.9rem;
          color: white !important;
          font-weight: 700;
          opacity: 1;
          line-height: 1.4;
        }
        
        @media (max-width: 768px) {
          .update-notification-bar {
            padding: 16px;
          }
          
          .update-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
          }
          
          .update-actions {
            flex-direction: row;
            justify-content: center;
            gap: 8px;
          }
          
          .update-actions button {
            flex: 1;
            min-width: 0;
            padding: 10px 16px;
          }
          
          .progress-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
        }
        
        @media (max-width: 480px) {
          .update-actions {
            flex-direction: column;
          }
          
          .update-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdateNotificationBar; 