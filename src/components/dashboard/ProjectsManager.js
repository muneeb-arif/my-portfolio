import React, { useState, useEffect } from 'react';
import { projectService, imageService, metaService } from '../../services/supabaseService';

const ProjectsManager = ({ projects, onProjectsChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
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

  // Load categories from database
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await metaService.getCategories();
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
    
    // Create preview URLs
    const previews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      original_name: file.name,
      isNew: true
    }));
    
    setSelectedImages(prev => [...prev, ...previews]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      const removedImage = newImages[index];
      
      // Clean up blob URL
      if (removedImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(removedImage.url);
        
        // Also remove from imageFiles array if it's a new image
        if (removedImage.isNew) {
          setImageFiles(prevFiles => {
            return prevFiles.filter(file => file !== removedImage.file);
          });
        }
      }
      
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a project title');
      return;
    }

    setLoading(true);
    
    try {
      let projectData;
      
      if (editingProject) {
        // Update existing project
        projectData = await projectService.updateProject(editingProject.id, formData);
      } else {
        // Create new project
        projectData = await projectService.createProject(formData);
      }

      // Upload new images if any
      if (imageFiles.length > 0) {
        setUploadingImages(true);
      // console.log(`📤 Uploading ${imageFiles.length} images for project ${projectData.id}`);
        
        let uploadedCount = 0;
        let failedCount = 0;
        
        for (const file of imageFiles) {
          try {
      // console.log(`📤 Uploading: ${file.name}`);
            const result = await imageService.uploadProjectImage(projectData.id, file);
      // console.log(`✅ Uploaded: ${file.name}`, result);
            uploadedCount++;
          } catch (error) {
      // console.error(`❌ Failed to upload ${file.name}:`, error);
            failedCount++;
          }
        }
        
      // console.log(`📊 Upload complete: ${uploadedCount} success, ${failedCount} failed`);
        
        if (failedCount > 0) {
          alert(`Warning: ${failedCount} out of ${imageFiles.length} images failed to upload. Please try again.`);
        }
        
        setUploadingImages(false);
      }

      // Refresh projects list
      await onProjectsChange();
      
      // Close form
      setShowForm(false);
      resetForm();
      
      alert(`Project ${editingProject ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      // console.error('Error saving project:', error);
      alert(`Error ${editingProject ? 'updating' : 'creating'} project: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      await onProjectsChange();
      alert('Project deleted successfully!');
    } catch (error) {
      // console.error('Error deleting project:', error);
      alert('Error deleting project: ' + error.message);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await projectService.updateProject(projectId, { status: newStatus });
      await onProjectsChange();
    } catch (error) {
      // console.error('Error updating project status:', error);
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
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
            />
            <div className="images-preview">
              {selectedImages.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={image.url} alt={`Preview ${index}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => handleRemoveImage(index)}
                  >×</button>
                </div>
              ))}
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
                : (editingProject ? 'Update Project' : 'Create Project')
              }
            </button>
          </div>
        </form>
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
    </div>
  );
};

export default ProjectsManager; 