import React, { useState, useEffect } from 'react';
import { projectsService } from '../../services/projectsService';
import { categoriesService } from '../../services/categoriesService';
import { imageService } from '../../services/imageService';
import { getCurrentUser } from '../../services/authUtils';
import MediaSelectionModal from './MediaSelectionModal';
import './ProjectsManager.css';

const ProjectsManager = ({ projects, onProjectsChange, editingProject: externalEditingProject, onEditingProjectChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  // New state for tracking individual image upload progress
  const [imageUploadProgress, setImageUploadProgress] = useState([]);
  // Media selection modal state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    overview: '',
    category: 'Web Development',
    status: 'draft',
    technologies: [],
    features: [],
    live_url: '',
    github_url: ''
  });
  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
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

  // Handle external editing project from Overview page
  useEffect(() => {
    if (externalEditingProject) {
      setEditingProject(externalEditingProject);
      if (onEditingProjectChange) {
        onEditingProjectChange(null); // Clear the external state to prevent re-triggering
      }
    }
  }, [externalEditingProject, onEditingProjectChange]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoriesService.getCategories();
      // Extract just the names for the dropdown
      const categoryNames = categoriesData.map(cat => cat.name || cat);
      if (categoryNames.length > 0) {
        setCategories(categoryNames);
      } else {
        // If no categories exist, provide basic default for the dropdown
        setCategories(['Web Development']);
      // console.log('📁 No categories found, using basic default for dropdown');
      }
    } catch (error) {
      // console.error('Error loading categories:', error);
      // On error, provide basic default for the dropdown to work
      setCategories(['Web Development']);
    }
  };

  // Reset form when closing
  useEffect(() => {
    if (!showForm && !editingProject) {
      resetForm();
    }
  }, [showForm, editingProject]);

  // Load project data when editing
  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title || '',
        description: editingProject.description || '',
        overview: editingProject.overview || '',
        category: editingProject.category || 'Web Development',
        status: editingProject.status || 'draft',
        technologies: editingProject.technologies || [],
        features: editingProject.features || [],
        live_url: editingProject.live_url || '',
        github_url: editingProject.github_url || ''
      });
      setSelectedImages(editingProject.project_images || []);
      setShowForm(true);
    }
  }, [editingProject]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      overview: '',
      category: 'Web Development',
      status: 'draft',
      technologies: [],
      features: [],
      live_url: '',
      github_url: ''
    });
    setTechInput('');
    setFeatureInput('');
    setSelectedImages([]);
    setImageFiles([]);
    setImageUploadProgress([]);
    setEditingProject(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Add new files to existing imageFiles array
    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs and initialize upload progress
    const previews = files.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      original_name: file.name,
      isNew: true,
      uploadIndex: imageFiles.length + index // Track which progress entry this belongs to
    }));
    
    // Initialize progress tracking for new files
    const progressEntries = files.map((file, index) => ({
      fileName: file.name,
      status: 'pending', // pending, uploading, completed, failed
      progress: 0,
      error: null,
      fileIndex: imageFiles.length + index
    }));
    
    setSelectedImages(prev => [...prev, ...previews]);
    setImageUploadProgress(prev => [...prev, ...progressEntries]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      const removedImage = newImages[index];
      
      // Clean up blob URL
      if (removedImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(removedImage.url);
        
        // Also remove from imageFiles array and progress tracking if it's a new image
        if (removedImage.isNew) {
          setImageFiles(prevFiles => {
            return prevFiles.filter(file => file !== removedImage.file);
          });
          
          // Remove from progress tracking
          setImageUploadProgress(prevProgress => {
            return prevProgress.filter(progress => progress.fileIndex !== removedImage.uploadIndex);
          });
        }
      }
      
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Helper function to update progress for a specific file
  const updateImageProgress = (fileIndex, updates) => {
    setImageUploadProgress(prev => 
      prev.map(progress => 
        progress.fileIndex === fileIndex 
          ? { ...progress, ...updates }
          : progress
      )
    );
  };

  // Handle media selection from existing library
  const handleMediaSelection = (selectedMediaImages) => {
    // Add selected media images to the selectedImages array
    setSelectedImages(prev => [...prev, ...selectedMediaImages]);
  };

  // Helper function to manage project images in database
  const updateProjectImages = async (projectId, currentImages) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch current images from DB
      const dbResult = await imageService.getProjectImages(projectId);
      if (!dbResult.success) throw new Error(dbResult.error);
      const dbImages = dbResult.data || [];

      // Compare arrays (by url, name, order_index)
      const isSame =
        dbImages.length === currentImages.length &&
        dbImages.every((img, i) =>
          img.url === currentImages[i].url &&
          img.name === currentImages[i].name &&
          (img.order_index || i + 1) === (currentImages[i].order_index || i + 1)
        );

      if (isSame) {
        // No change, skip update
        return true;
      }

      // First, delete all existing project images for this project
      const deleteResult = await imageService.deleteProjectImages(projectId);
      if (!deleteResult.success) {
        console.error('Error deleting existing project images:', deleteResult.error);
        // Don't throw here, continue with adding new images
      }

      // Then, add all current images to the database in the exact order they appear
      if (currentImages.length > 0) {
        for (let i = 0; i < currentImages.length; i++) {
          const image = currentImages[i];
          
          const imageData = {
            url: image.url,
            path: image.fullPath || image.url, // Use fullPath if available, otherwise url
            name: image.name || image.original_name,
            original_name: image.original_name || image.name,
            size: image.size,
            type: image.type,
            bucket: 'images', // Default bucket for project images
            order_index: i + 1 // Preserve the user's selected order
          };

          const result = await imageService.saveImageMetadata(projectId, imageData);
          if (!result.success) {
            console.error('Error inserting project image:', result.error);
            throw new Error(`Failed to save project images: ${result.error}`);
          }
        }

        console.log(`✅ Successfully updated ${currentImages.length} project images`);
      }

      return true;
    } catch (error) {
      console.error('Error updating project images:', error);
      throw error;
    }
  };

  // Open media selection modal
  const handleChooseMedia = () => {
    setShowMediaModal(true);
  };

  // Close media selection modal
  const handleCloseMediaModal = () => {
    setShowMediaModal(false);
  };

  // Drag and drop handlers for image reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    // Only clear dragOverIndex if we're leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Create new array with reordered items
    const newSelectedImages = [...selectedImages];
    const draggedItem = newSelectedImages[draggedIndex];
    
    // Remove dragged item from original position
    newSelectedImages.splice(draggedIndex, 1);
    
    // Insert dragged item at new position
    newSelectedImages.splice(dropIndex, 0, draggedItem);
    
    // Update state
    setSelectedImages(newSelectedImages);
    setDraggedIndex(null);
    setDragOverIndex(null);

    console.log(`✅ Image reordered: moved from position ${draggedIndex} to ${dropIndex}`);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a project title');
      return;
    }

    try {
      setLoading(true);
      let projectData;

      // Upload images first if there are new ones
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const uploadedImages = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const progressIndex = imageUploadProgress.findIndex(p => p.fileName === file.name);
          
          if (progressIndex !== -1) {
            updateImageProgress(progressIndex, { status: 'uploading', progress: 0 });
          }
          
          try {
            const imageData = await imageService.uploadProjectImage(file);
            uploadedImages.push(imageData);
            
            if (progressIndex !== -1) {
              updateImageProgress(progressIndex, { status: 'completed', progress: 100 });
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            if (progressIndex !== -1) {
              updateImageProgress(progressIndex, { status: 'failed', error: error.message });
            }
            throw error;
          }
        }
        
        setUploadingImages(false);
        
        // Add uploaded images to selected images
        setSelectedImages(prev => [...prev, ...uploadedImages]);
      }

      // Create or update project
      if (editingProject) {
        projectData = await projectsService.updateProject(editingProject.id, formData);
      } else {
        projectData = await projectsService.createProject(formData);
      }

      // Update project images in database
      if (projectData && projectData.id) {
        await updateProjectImages(projectData.id, selectedImages);
      }

      // Refresh projects list
      if (onProjectsChange) {
        onProjectsChange();
      }

      // Reset form
      resetForm();
      setShowForm(false);
      
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project: ' + error.message);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      setLoading(true);
      await projectsService.deleteProject(projectId);
      
      // Refresh projects list
      if (onProjectsChange) {
        onProjectsChange();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await projectsService.updateProject(projectId, { status: newStatus });
      
      // Refresh projects list
      if (onProjectsChange) {
        onProjectsChange();
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Error updating project status: ' + error.message);
    }
  };

  if (showForm) {
    return (
      <div className="dashboard-section">
        <div className="section-header">
          <h2>💼 {editingProject ? 'Edit Project' : 'Add New Project'}</h2>
          <button 
            className="btn-secondary"
            onClick={() => setShowForm(false)}
          >
            ← Back to Projects
          </button>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Project Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter project title"
                required
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Short Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description for project cards"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="overview">Detailed Overview</label>
            <textarea
              id="overview"
              name="overview"
              value={formData.overview}
              onChange={handleInputChange}
              placeholder="Detailed project description"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="live_url">Live URL</label>
              <input
                type="url"
                id="live_url"
                name="live_url"
                value={formData.live_url}
                onChange={handleInputChange}
                placeholder="https://your-project.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="github_url">GitHub URL</label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>

          {/* Technologies */}
          <div className="form-group">
            <label>Technologies Used</label>
            <div className="tag-input">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Enter technology"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
              />
              <button type="button" onClick={handleAddTechnology}>Add</button>
            </div>
            <div className="tags-list">
              {formData.technologies.map((tech, index) => (
                <span key={index} className="tag">
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(tech)}
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="form-group">
            <label>Key Features</label>
            <div className="tag-input">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Enter feature"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              />
              <button type="button" onClick={handleAddFeature}>Add</button>
            </div>
            <div className="tags-list">
              {formData.features.map((feature, index) => (
                <span key={index} className="tag">
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feature)}
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="images">Project Images</label>
            {selectedImages.length > 1 && (
              <p className="form-help" style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                💡 Tip: Drag images by the ⋮⋮ handle to reorder them
              </p>
            )}
            
            {/* Image upload options */}
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
                // Find the corresponding progress entry for new images
                const progressEntry = image.isNew 
                  ? imageUploadProgress.find(p => p.fileIndex === image.uploadIndex)
                  : null;
                
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;
                
                return (
                  <div 
                    key={index} 
                    className={`image-preview ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="image-container">
                      <div className="drag-handle" title="Drag to reorder">
                        ⋮⋮
                      </div>
                      <img src={image.url} alt={`Preview ${index}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => handleRemoveImage(index)}
                      >×</button>
                    </div>
                    
                    {/* Show progress and status for new images */}
                    {image.isNew && progressEntry && (
                      <div className="upload-status">
                        {/* Progress bar */}
                        {progressEntry.status === 'uploading' && (
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${progressEntry.progress}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">{progressEntry.progress}%</span>
                          </div>
                        )}
                        
                        {/* Status indicators */}
                        <div className={`status-indicator status-${progressEntry.status}`}>
                          {progressEntry.status === 'pending' && (
                            <span className="status-text">⏳ Waiting...</span>
                          )}
                          {progressEntry.status === 'uploading' && (
                            <span className="status-text">📤 Uploading...</span>
                          )}
                          {progressEntry.status === 'completed' && (
                            <span className="status-text">✅ Uploaded</span>
                          )}
                          {progressEntry.status === 'failed' && (
                            <span className="status-text">❌ Failed</span>
                          )}
                        </div>
                        
                        {/* Error details */}
                        {progressEntry.status === 'failed' && progressEntry.error && (
                          <div className="error-details">
                            <strong>Error:</strong> {progressEntry.error}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Status for images from media library */}
                    {image.isFromMedia && (
                      <div className="upload-status">
                        <div className="status-indicator status-from-media">
                          <span className="status-text">📁 From Media</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Simple label for existing images */}
                    {!image.isNew && !image.isFromMedia && (
                      <div className="upload-status">
                        <div className="status-indicator status-existing">
                          <span className="status-text">💾 Saved</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Upload summary */}
            {uploadingImages && imageUploadProgress.length > 0 && (
              <div className="upload-summary">
                <div className="summary-stats">
                  {imageUploadProgress.filter(p => p.status === 'completed').length} completed, {' '}
                  {imageUploadProgress.filter(p => p.status === 'uploading').length} uploading, {' '}
                  {imageUploadProgress.filter(p => p.status === 'failed').length} failed, {' '}
                  {imageUploadProgress.filter(p => p.status === 'pending').length} pending
                </div>
              </div>
            )}
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
                : (editingProject ? 'Update Project' : 'Create Project')
              }
            </button>
          </div>
        </form>
        
        {/* Media Selection Modal */}
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
    <div className="dashboard-section">
      <div className="section-header">
        <h2>💼 Projects Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Project
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="projects-table">
          <div className="table-header">
            <span>Project</span>
            <span>Category</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          
          {projects.map(project => (
            <div key={project.id} className="table-row">
              <div className="project-info">
                <h4>{project.title}</h4>
                <p>{project.description}</p>
              </div>
              <div className="project-category">
                <span className="category-tag">{project.category}</span>
              </div>
              <div className="project-status">
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project.id, e.target.value)}
                  className={`status-select ${project.status}`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="project-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEditProject(project)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Projects Yet</h3>
          <p>Create your first project to get started with your portfolio!</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Create First Project
          </button>
        </div>
      )}
      
      {/* Media Selection Modal */}
      <MediaSelectionModal
        isOpen={showMediaModal}
        onClose={handleCloseMediaModal}
        onSelect={handleMediaSelection}
        allowMultiple={true}
      />

    </div>
  );
};

export default ProjectsManager; 