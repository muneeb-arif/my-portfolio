import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import { getCurrentUser } from '../../services/authUtils';

const DebugSync = () => {
  const [logs, setLogs] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const testCategoriesSync = async () => {
    setIsTesting(true);
    setLogs([]);
    
    try {
      addLog('🧪 Starting categories sync test...', 'info');
      
      // Test 1: Check current categories
      addLog('📋 Test 1: Checking current categories...', 'info');
      const { data: currentCategories, error: selectError } = await supabase
        .from('categories')
        .select('*');
      
      if (selectError) {
        addLog(`❌ Error selecting categories: ${selectError.message}`, 'error');
        return;
      }
      
      addLog(`Current categories count: ${currentCategories?.length || 0}`, 'success');
      currentCategories?.forEach(cat => addLog(`- ${cat.name}`, 'info'));
      
      // Test 2: Try to delete a specific category
      addLog('🗑️ Test 2: Trying to delete "Web Development" category...', 'info');
      const { data: deleteResult, error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('name', 'Web Development');
      
      if (deleteError) {
        addLog(`❌ Error deleting category: ${deleteError.message}`, 'error');
        addLog(`Error details: ${JSON.stringify(deleteError)}`, 'error');
      } else {
        addLog(`✅ Delete successful: ${deleteResult?.length || 0} rows affected`, 'success');
      }
      
      // Test 3: Try to insert a new category
      addLog('➕ Test 3: Trying to insert a test category...', 'info');
      const { data: insertResult, error: insertError } = await supabase
        .from('categories')
        .insert({
          name: 'Test Category Debug',
          description: 'Test Description',
          color: '#ff0000'
        })
        .select();
      
      if (insertError) {
        addLog(`❌ Error inserting category: ${insertError.message}`, 'error');
        addLog(`Error details: ${JSON.stringify(insertError)}`, 'error');
      } else {
        addLog(`✅ Insert successful: ${insertResult?.length || 0} rows inserted`, 'success');
      }
      
      // Test 4: Check authentication
      addLog('🔐 Test 4: Checking authentication...', 'info');
      const user = await getCurrentUser();
      
      if (user) {
        addLog(`✅ Authenticated as: ${user.email}`, 'success');
      } else {
        addLog('⚠️ Not authenticated', 'warning');
      }
      
      // Test 5: Check table structure
      addLog('📊 Test 5: Checking table structure...', 'info');
      const { data: tableInfo, error: tableError } = await supabase
        .from('categories')
        .select('id, name, description, color')
        .limit(1);
      
      if (tableError) {
        addLog(`❌ Table structure error: ${tableError.message}`, 'error');
      } else {
        addLog('✅ Table structure check passed', 'success');
      }
      
    } catch (error) {
      addLog(`❌ Test failed: ${error.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const clearAllCache = async () => {
    setIsTesting(true);
    setLogs([]);
    
    try {
      addLog('🧹 Starting cache clearing process...', 'info');
      
      // Clear browser cache for API responses
      addLog('🌐 Clearing browser cache...', 'info');
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          addLog(`🗑️ Deleted cache: ${cacheName}`, 'success');
        }
      }
      
      // Clear localStorage
      addLog('💾 Clearing localStorage...', 'info');
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        if (key.includes('cache') || key.includes('api') || key.includes('portfolio')) {
          localStorage.removeItem(key);
          addLog(`🗑️ Removed localStorage key: ${key}`, 'success');
        }
      });
      
      // Clear sessionStorage
      addLog('💾 Clearing sessionStorage...', 'info');
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach(key => {
        if (key.includes('cache') || key.includes('api') || key.includes('portfolio')) {
          sessionStorage.removeItem(key);
          addLog(`🗑️ Removed sessionStorage key: ${key}`, 'success');
        }
      });
      
      // Force reload the page to clear any in-memory cache
      addLog('🔄 Reloading page to clear in-memory cache...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      addLog(`❌ Cache clearing failed: ${error.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const clearApiCache = async () => {
    setIsTesting(true);
    setLogs([]);
    
    try {
      addLog('🌐 Clearing API cache...', 'info');
      
      // Clear any cached API responses
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('api') || cacheName.includes('portfolio')) {
            await caches.delete(cacheName);
            addLog(`🗑️ Deleted API cache: ${cacheName}`, 'success');
          }
        }
      }
      
      // Clear localStorage API-related items
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        if (key.includes('api') || key.includes('portfolio') || key.includes('projects') || key.includes('categories') || key.includes('technologies') || key.includes('niches')) {
          localStorage.removeItem(key);
          addLog(`🗑️ Removed API localStorage key: ${key}`, 'success');
        }
      });
      
      addLog('✅ API cache cleared successfully', 'success');
      addLog('💡 Refresh the page to see the latest data', 'info');
      
    } catch (error) {
      addLog(`❌ API cache clearing failed: ${error.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="debug-sync">
      <h3>🔧 Debug Categories Sync</h3>
      <p>This will test the categories sync functionality step by step.</p>
      
      <div className="debug-controls">
        <button 
          onClick={testCategoriesSync} 
          disabled={isTesting}
          className="btn-debug"
        >
          {isTesting ? '🧪 Testing...' : '🧪 Run Debug Test'}
        </button>
        
        <button 
          onClick={clearLogs} 
          className="btn-clear"
        >
          🗑️ Clear Logs
        </button>
      </div>

      <div className="cache-controls">
        <h4>🧹 Cache Management</h4>
        <p>Clear various types of cache that might be causing issues:</p>
        
        <div className="cache-buttons">
          <button 
            onClick={clearApiCache} 
            disabled={isTesting}
            className="btn-cache-api"
          >
            🌐 Clear API Cache
          </button>
          
          <button 
            onClick={clearAllCache} 
            disabled={isTesting}
            className="btn-cache-all"
          >
            🧹 Clear All Cache & Reload
          </button>
        </div>
        
        <div className="cache-info">
          <p><strong>API Cache:</strong> Clears cached API responses and localStorage data</p>
          <p><strong>All Cache:</strong> Clears everything and reloads the page</p>
        </div>
      </div>
      
      <div className="debug-logs">
        <h4>Test Results:</h4>
        {logs.length === 0 ? (
          <p>No logs yet. Click "Run Debug Test" to start.</p>
        ) : (
          <div className="log-container">
            {logs.map((log, index) => (
              <div key={index} className={`log-entry log-${log.type}`}>
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .debug-sync {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .debug-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .btn-debug {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .btn-debug:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .btn-clear {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .cache-controls {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .cache-buttons {
          display: flex;
          gap: 10px;
          margin: 15px 0;
          flex-wrap: wrap;
        }
        
        .btn-cache-api {
          background: #2196f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .btn-cache-api:hover {
          background: #1976d2;
        }
        
        .btn-cache-all {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .btn-cache-all:hover {
          background: #d32f2f;
        }
        
        .btn-cache-api:disabled,
        .btn-cache-all:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .cache-info {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 15px;
          margin-top: 15px;
        }
        
        .cache-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .debug-logs {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 15px;
        }
        
        .log-container {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .log-entry {
          padding: 5px 0;
          border-bottom: 1px solid #f1f3f4;
          font-family: monospace;
          font-size: 12px;
        }
        
        .log-time {
          color: #6c757d;
          margin-right: 10px;
        }
        
        .log-info {
          color: #0d6efd;
        }
        
        .log-success {
          color: #198754;
        }
        
        .log-warning {
          color: #fd7e14;
        }
        
        .log-error {
          color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default DebugSync; 