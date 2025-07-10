import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { getCurrentUser } from '../../services/authUtils';
import './MediaSelectionModal.css';

const MediaSelectionModal = ({ isOpen, onClose, onSelect, allowMultiple = false }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);

  // Load media items when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMediaItems();
    }
  }, [isOpen]);

  const loadMediaItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const allImageFiles = [];
      
      // 1. Fetch images from user's specific folder (where project images are stored)
      try {
        const { data: userFiles, error: userError } = await supabase.storage
          .from('images')
          .list(user.id, {
            limit: 1000,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (!userError && userFiles) {
          // Add user folder prefix to file names and mark as user files
          const userImageFiles = userFiles
            .filter(file => 
              file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && 
              !file.name.startsWith('.')
            )
            .map(file => ({
              ...file,
              fullPath: `${user.id}/${file.name}`,
              isUserFile: true
            }));
          
          allImageFiles.push(...userImageFiles);
        }
      } catch (userFolderError) {
        console.log('No user folder found or error accessing it:', userFolderError.message);
      }
      
      // 2. Fetch images from root folder (legacy images)
      try {
        const { data: rootFiles, error: rootError } = await supabase.storage
          .from('images')
          .list('', {
            limit: 1000,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (!rootError && rootFiles) {
          const rootImageFiles = rootFiles
            .filter(file => 
              file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && 
              !file.name.startsWith('.') &&
              file.name !== user.id // Exclude the user folder itself
            )
            .map(file => ({
              ...file,
              fullPath: file.name,
              isUserFile: false
            }));
          
          allImageFiles.push(...rootImageFiles);
        }
      } catch (rootFolderError) {
        console.log('Error accessing root folder:', rootFolderError.message);
      }

      if (allImageFiles.length === 0) {
        setMediaItems([]);
        return;
      }

      // Generate public URLs and create image objects
      const imagesWithUrls = allImageFiles.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(file.fullPath);
        
        return {
          id: file.id || file.name,
          name: file.name,
          fullPath: file.fullPath,
          url: publicUrl,
          original_name: file.name,
          created_at: file.created_at,
          size: file.metadata?.size || 0,
          isUserFile: file.isUserFile,
          isFromMedia: true
        };
      });

      // Sort by creation date (newest first)
      imagesWithUrls.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setMediaItems(imagesWithUrls);
    } catch (error) {
      console.error('Error loading media items:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (allowMultiple) {
      setSelectedItems(prev => {
        const isSelected = prev.find(selected => selected.id === item.id);
        if (isSelected) {
          return prev.filter(selected => selected.id !== item.id);
        } else {
          return [...prev, item];
        }
      });
    } else {
      setSelectedItems([item]);
    }
  };

  const handleConfirmSelection = () => {
    onSelect(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedItems([]);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="media-modal-overlay" onClick={handleCancel}>
      <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="media-modal-header">
          <h3>📁 Choose from Media Library</h3>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>

        <div className="media-modal-body">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading media items...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={loadMediaItems}>Try Again</button>
            </div>
          )}

          {!loading && !error && mediaItems.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📷</div>
              <h4>No Media Items Found</h4>
              <p>Upload some images first to use them in your projects.</p>
            </div>
          )}

          {!loading && !error && mediaItems.length > 0 && (
            <div className="media-grid">
              {mediaItems.map(item => (
                <div
                  key={item.id}
                  className={`media-item ${selectedItems.find(s => s.id === item.id) ? 'selected' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <img src={item.url} alt={item.name} />
                  <div className="media-item-overlay">
                    <div className="media-item-name">{item.name}</div>
                    {selectedItems.find(s => s.id === item.id) && (
                      <div className="selection-indicator">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="media-modal-footer">
          <div className="selection-info">
            {selectedItems.length > 0 && (
              <span>{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</span>
            )}
          </div>
          
          <div className="modal-actions">
            <button className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={handleConfirmSelection}
              disabled={selectedItems.length === 0}
            >
              Add Selected ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaSelectionModal; 