import React, { useState, useEffect } from 'react';
import { projectsService } from '../../services/projectsService';
import { categoriesService } from '../../services/categoriesService';
import { imageService } from '../../services/imageService';
import { useAuth } from '../../services/authContext';
import MediaSelectionModal from './MediaSelectionModal';
import toastService from '../../services/toastService';
import './PromptsManager.css';

const PromptsManager = ({ prompts, onPromptsChange, editingPrompt: externalEditingPrompt, onEditingPromptChange }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    status: 'draft',
    live_url: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Load categories from database
  useEffect(() => {
    loadCategories();
  }, []);

  // Reset to first page when prompts change
  useEffect(() => {
    setCurrentPage(1);
  }, [prompts]);

  // Sync with external editing prompt
  useEffect(() => {
    if (externalEditingPrompt) {
      setEditingPrompt(externalEditingPrompt);
      setShowForm(true);
      populateForm(externalEditingPrompt);
    }
  }, [externalEditingPrompt]);

  const loadCategories = async () => {
    try {
      const result = await categoriesService.getCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const populateForm = (prompt) => {
    setFormData({
      title: prompt.title || '',
      description: prompt.description || '',
      category: prompt.category || 'Web Development',
      status: prompt.status || 'draft',
      live_url: prompt.details?.liveUrl || prompt.live_url || ''
    });
    
    // Load existing images - check both data structures
    let existingImages = [];
    
    // Check for project_images (from API)
    if (prompt.project_images && prompt.project_images.length > 0) {
      existingImages = prompt.project_images.map((img, index) => ({
        url: img.url,
        name: img.name || img.original_name || `image_${index + 1}`,
        original_name: img.original_name || img.name || `image_${index + 1}`,
        size: img.size || 0,
        type: img.type || 'image/jpeg',
        order_index: img.order_index || index + 1,
        isExisting: true
      }));
    }
    // Fallback to details.images (legacy structure)
    else if (prompt.details?.images && prompt.details.images.length > 0) {
      existingImages = prompt.details.images.map((img, index) => ({
        ...img,
        order_index: index + 1,
        isExisting: true
      }));
    }
    
    setSelectedImages(existingImages);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Web Development',
      status: 'draft',
      live_url: ''
    });
    setSelectedImages([]);
    setImageFiles([]);
    setImageUploadProgress([]);
    setEditingPrompt(null);
    if (onEditingPromptChange) {
      onEditingPromptChange(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageFiles(prev => {
      const newImageFiles = [...prev, ...files];
      
      // Process files after updating imageFiles state
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            url: e.target.result,
            name: file.name,
            original_name: file.name,
            size: file.size,
            type: file.type,
            isNew: true,
            order_index: selectedImages.length + index + 1
          };
          
          setSelectedImages(prev => [...prev, newImage]);
          
          // Initialize progress for this image
          setImageUploadProgress(prev => [...prev, {
            fileName: file.name,
            progress: 0,
            status: 'pending'
          }]);
        };
        reader.readAsDataURL(file);
      });
      
      return newImageFiles;
    });
  };

  const handleMediaSelection = (selectedItems) => {
    const mediaImages = selectedItems.map((item, index) => ({
      ...item,
      isFromMedia: true,
      order_index: selectedImages.length + index + 1
    }));
    
    setSelectedImages(prev => [...prev, ...mediaImages]);
    setShowMediaModal(false);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...selectedImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // Update order_index for all images
    newImages.forEach((image, index) => {
      image.order_index = index + 1;
    });

    setSelectedImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };



  const handleChooseMedia = () => {
    setShowMediaModal(true);
  };

  const handleCloseMediaModal = () => {
    setShowMediaModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promptData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        is_prompt: 1, // Mark as prompt
        details: {
          liveUrl: formData.live_url,
          images: selectedImages
        }
      };

      let result;
      if (editingPrompt) {
        result = await projectsService.updateProject(editingPrompt.id, promptData);
      } else {
        result = await projectsService.createProject(promptData);
      }

      if (result) {
        const savedPrompt = result;
        
        console.log('🔍 Debug: Image upload state:', {
          imageFilesLength: imageFiles.length,
          selectedImagesLength: selectedImages.length,
          savedPromptId: savedPrompt?.id,
          imageFileNames: imageFiles.map(f => f.name),
          selectedImageNames: selectedImages.map(img => img.original_name)
        });

        // Upload images after prompt is created/updated (same as ProjectsManager)
        if (imageFiles.length > 0 && savedPrompt && savedPrompt.id) {
          setUploadingImages(true);
          const uploadedImages = [];
          
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const progressIndex = imageUploadProgress.findIndex(p => p.fileName === file.name);
            
            if (progressIndex !== -1) {
              // Update progress to uploading
              setImageUploadProgress(prev => prev.map((p, idx) => 
                idx === progressIndex ? { ...p, status: 'uploading', progress: 0 } : p
              ));
            }
            
            console.log(`🔄 Uploading image ${i + 1}/${imageFiles.length}: ${file.name}`);
            
            try {
              const imageData = await imageService.uploadProjectImage(savedPrompt.id, file);
              if (!imageData.success) {
                throw new Error(`Failed to upload image ${file.name}: ${imageData.error}`);
              }
              uploadedImages.push(imageData.data);
              
              if (progressIndex !== -1) {
                // Update progress to completed
                setImageUploadProgress(prev => prev.map((p, idx) => 
                  idx === progressIndex ? { ...p, status: 'completed', progress: 100 } : p
                ));
              }
              
              console.log(`✅ Uploaded image: ${file.name}`, imageData.data);
            } catch (error) {
              console.error('Error uploading image:', error);
              if (progressIndex !== -1) {
                // Update progress to failed
                setImageUploadProgress(prev => prev.map((p, idx) => 
                  idx === progressIndex ? { ...p, status: 'failed', error: error.message } : p
                ));
              }
              throw error;
            }
          }
          
          setUploadingImages(false);
          
          // Replace blob URLs with actual Supabase URLs in selectedImages
          setSelectedImages(prev => {
            const updatedImages = [...prev];
            
            // For each uploaded image, find the corresponding blob URL and replace it
            uploadedImages.forEach((uploadedImg, index) => {
              const blobImageIndex = updatedImages.findIndex(img => 
                img.isNew && img.original_name === uploadedImg.original_name
              );
              
              if (blobImageIndex !== -1) {
                // Replace blob URL with Supabase URL
                updatedImages[blobImageIndex] = {
                  ...uploadedImg,
                  isNew: false, // These are now saved images
                  isFromMedia: false // Not from media library
                };
                
                // Clean up the blob URL
                if (updatedImages[blobImageIndex].url && updatedImages[blobImageIndex].url.startsWith('blob:')) {
                  URL.revokeObjectURL(updatedImages[blobImageIndex].url);
                }
                
                console.log(`🔄 Replaced blob URL with Supabase URL for: ${uploadedImg.original_name}`);
              } else {
                console.log(`❌ Could not find matching selected image for uploaded image: ${uploadedImg.original_name}`);
              }
            });
            
            return updatedImages;
          });
          
          // Show success toast for image uploads
          if (uploadedImages.length > 0) {
            const imageText = uploadedImages.length === 1 ? 'image' : 'images';
            toastService.success(`${uploadedImages.length} ${imageText} uploaded successfully! 📸`);
          }
        }

        // Note: Images are already uploaded and linked to the prompt
        // No need to call updatePromptImages as it would cause base64 overflow issues
        // The imageService.uploadProjectImage already handles metadata saving
        console.log('✅ Images already uploaded and linked to prompt - skipping metadata update');

        toastService.success(editingPrompt ? 'Prompt updated successfully!' : 'Prompt created successfully!');
        setShowForm(false);
        resetForm();
        
        if (onPromptsChange) {
          onPromptsChange();
        }
      } else {
        toastService.error(result.error || 'Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toastService.error('Failed to save prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setShowForm(true);
    populateForm(prompt);
    if (onEditingPromptChange) {
      onEditingPromptChange(prompt);
    }
  };

  const handleDelete = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      const result = await projectsService.deleteProject(promptId);
      if (result) {
        toastService.success('Prompt deleted successfully!');
        if (onPromptsChange) {
          onPromptsChange();
        }
      } else {
        toastService.error(result.error || 'Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toastService.error('Failed to delete prompt');
    }
  };

  const handleStatusChange = async (promptId, newStatus) => {
    try {
      const result = await projectsService.updateProject(promptId, { status: newStatus });
      if (result.success) {
        toastService.success(`Prompt ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
        if (onPromptsChange) {
          onPromptsChange();
        }
      } else {
        toastService.error(result.error || 'Failed to update prompt status');
      }
    } catch (error) {
      console.error('Error updating prompt status:', error);
      toastService.error('Failed to update prompt status');
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(prompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrompts = prompts.slice(startIndex, endIndex);

  if (showForm) {
    return (
      <div className="prompts-manager">
        <div className="form-header">
          <h2>{editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}</h2>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="form-group">
            <label htmlFor="title">Prompt Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter prompt title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Prompt Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Enter prompt description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="live_url">Live URL (Optional)</label>
            <input
              type="url"
              id="live_url"
              name="live_url"
              value={formData.live_url}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="images">Prompt Images</label>
            {selectedImages.length > 1 && (
              <p className="form-help" style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                💡 Tip: Drag images by the ⋮⋮ handle to reorder them
              </p>
            )}
            
            <div className="image-upload-options">
              <div className="upload-option">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="images" className="btn-upload">
                  📤 Upload New Images
                </label>
              </div>
              
              <div className="upload-option-divider">
                <span>OR</span>
              </div>
              
              <div className="upload-option">
                <button
                  type="button"
                  className="btn-choose-media"
                  onClick={handleChooseMedia}
                >
                  📁 Choose from Media
                </button>
              </div>
            </div>
            
            <div className="images-preview">
              {selectedImages.map((image, index) => {
                const safeImage = {
                  ...image,
                  isNew: image.isNew || false,
                  isFromMedia: image.isFromMedia || false,
                  url: image.url || '',
                  name: image.name || image.original_name || `image_${index + 1}`,
                  original_name: image.original_name || image.name || `image_${index + 1}`,
                  size: image.size || 0,
                  type: image.type || 'image/jpeg',
                  order_index: image.order_index || index + 1
                };
                
                const progressEntry = safeImage.isNew 
                  ? imageUploadProgress.find(p => p.fileName === safeImage.name)
                  : null;
                
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;
                
                return (
                  <div
                    key={index}
                    className={`image-preview ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="image-container">
                      <img src={safeImage.url} alt={safeImage.name} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                        title="Remove image"
                      >
                        ✕
                      </button>
                      
                      {/* Drag handle */}
                      <div className="drag-handle">⋮⋮</div>
                      
                      {/* Upload progress */}
                      {progressEntry && (
                        <div className={`upload-status ${progressEntry.status}`}>
                          <div className="file-name">{safeImage.name}</div>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${progressEntry.progress}%` }}
                              />
                            </div>
                            <span className="progress-text">{progressEntry.progress}%</span>
                          </div>
                          <div className="status-indicator">
                            <span className="status-text">
                              {progressEntry.status === 'pending' && '⏳ Pending'}
                              {progressEntry.status === 'uploading' && '📤 Uploading'}
                              {progressEntry.status === 'completed' && '✅ Completed'}
                              {progressEntry.status === 'failed' && '❌ Failed'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Existing image indicator */}
                      {safeImage.isExisting && (
                        <div className="upload-status status-existing">
                          <div className="file-name">{safeImage.name}</div>
                          <div className="status-indicator">
                            <span className="status-text">📁 Existing</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Media image indicator */}
                      {safeImage.isFromMedia && (
                        <div className="upload-status status-existing">
                          <div className="file-name">{safeImage.name}</div>
                          <div className="status-indicator">
                            <span className="status-text">📁 From Media</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || uploadingImages}
            >
              {loading || uploadingImages 
                ? (uploadingImages ? 'Uploading Images...' : 'Saving...') 
                : (editingPrompt ? 'Update Prompt' : 'Create Prompt')
              }
            </button>
          </div>
        </form>
        
        <MediaSelectionModal
          isOpen={showMediaModal}
          onClose={handleCloseMediaModal}
          onSelect={handleMediaSelection}
          allowMultiple={true}
        />
      </div>
    );
  }

  return (
    <div className="prompts-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>Prompts</h2>
          <p>Manage your AI prompts and templates</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Create Prompt
        </button>
      </div>

      {prompts.length > 0 ? (
        <>
          <div className="prompts-grid">
            {currentPrompts.map(prompt => (
              <div key={prompt.id} className="prompt-card">
                <div className="prompt-image">
                  <img 
                    src={prompt.image || '/images/hero-bg.png'} 
                    alt={prompt.title}
                    onError={(e) => {
                      e.target.src = '/images/hero-bg.png';
                    }}
                  />
                  <div className="prompt-overlay">
                    <div className="prompt-actions">
                      <button
                        className="overlay-btn"
                        onClick={() => handleEdit(prompt)}
                      >
                        Edit
                      </button>
                      <button
                        className="overlay-btn delete"
                        onClick={() => handleDelete(prompt.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              
              <div className="prompt-info">
                <h4>{prompt.title}</h4>
                <p className="prompt-category">{prompt.category}</p>
                <p className="prompt-description">
                  {prompt.description?.length > 100 
                    ? `${prompt.description.substring(0, 100)}...` 
                    : prompt.description
                  }
                </p>
                
                <div className="prompt-status">
                  <span className={`status-badge ${prompt.status}`}>
                    {prompt.status === 'published' ? '✅ Published' : '📝 Draft'}
                  </span>
                  <button
                    className="status-toggle"
                    onClick={() => handleStatusChange(
                      prompt.id, 
                      prompt.status === 'published' ? 'draft' : 'published'
                    )}
                  >
                    {prompt.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={goToFirstPage} 
                disabled={currentPage === 1}
                title="First Page"
              >
                ⏮️
              </button>
              <button 
                className="pagination-btn"
                onClick={goToPrevPage} 
                disabled={currentPage === 1}
                title="Previous Page"
              >
                ◀️
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="pagination-btn"
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                title="Next Page"
              >
                ▶️
              </button>
              <button 
                className="pagination-btn"
                onClick={goToLastPage} 
                disabled={currentPage === totalPages}
                title="Last Page"
              >
                ⏭️
              </button>
            </div>
            
            <div className="pagination-summary">
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        )}
      </>
    ) : (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3>No Prompts Yet</h3>
          <p>Create your first prompt to get started!</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Create First Prompt
          </button>
        </div>
      )}

      <MediaSelectionModal
        isOpen={showMediaModal}
        onClose={handleCloseMediaModal}
        onSelect={handleMediaSelection}
        allowMultiple={true}
      />
    </div>
  );
};

export default PromptsManager; 