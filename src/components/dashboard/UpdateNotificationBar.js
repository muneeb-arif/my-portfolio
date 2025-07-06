import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { automaticUpdateService } from '../../services/automaticUpdateService';

const UpdateNotificationBar = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);

  useEffect(() => {
    checkForUpdates();
    
    // Check for updates every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      // Get the latest active update
      const { data: updates, error } = await supabase
        .from('shared_hosting_updates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Failed to check for updates:', error);
        return;
      }

      if (!updates || updates.length === 0) {
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
    try {
      setIsApplyingUpdate(true);
      
      // Check if automatic updates are supported
      const isSupported = await automaticUpdateService.checkSupport();
      
      if (isSupported) {
        // Trigger automatic update
        const result = await automaticUpdateService.applyUpdate(updateInfo, {
          createBackup: true,
          progressCallback: (message, type) => {
            console.log(`${type}: ${message}`);
          }
        });

        if (result.success) {
          // Update successful
          localStorage.setItem('theme_version', updateInfo.version);
          setIsVisible(false);
          
          // Show success and reload
          alert('🎉 Update applied successfully! Reloading page...');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error(result.error || 'Update failed');
        }
      } else {
        // Fallback to manual update
        handleManualUpdate();
      }
    } catch (error) {
      console.error('Failed to apply update:', error);
      alert(`❌ Auto-update failed: ${error.message}\n\nTry the manual update instead.`);
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
          <div className="update-icon" style={{ flexDirection: 'row' }}>🚀</div>
          <div className="update-text">
            <strong>Website Update Available!</strong>
            <p>Version {updateInfo.version}: {updateInfo.title}</p>
            <p className="update-description">{updateInfo.description}</p>
          </div>
          <div className="update-badge">
            NEW
          </div>
        </div>
        
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
          >
            📥 Manual Update
          </button>
          <button 
            className="btn-mark-applied"
            onClick={handleMarkApplied}
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
        
        .btn-auto-update:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-manual-update, .btn-mark-applied {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .btn-manual-update:hover, .btn-mark-applied:hover {
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
            justify-content: center;
            gap: 8px;
          }
          
          .update-actions button {
            flex: 1;
            min-width: 0;
            padding: 10px 16px;
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