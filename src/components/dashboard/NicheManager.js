import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Loader2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { imageService } from '../../services/imageService';
import { BUCKETS } from '../../config/supabase';
import toastService from '../../services/toastService';
import './NicheManager.css';

const NicheManager = () => {
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNiche, setEditingNiche] = useState(null);
  const [savingNiche, setSavingNiche] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    image: 'default.jpeg',
    title: '',
    overview: '',
    tools: '',
    key_features: '',
    sort_order: 1,
    ai_driven: false
  });

  // Available preset images for niches
  const availableImages = [
    { value: 'default.jpeg', label: 'Default Image' },
    { value: 'web-development.jpeg', label: 'Web Development' },
    { value: 'mobile-development.jpeg', label: 'Mobile Development' },
    { value: 'ai-ml.jpeg', label: 'AI & Machine Learning' },
    { value: 'cloud-computing.jpeg', label: 'Cloud Computing' },
    { value: 'cybersecurity.jpeg', label: 'Cybersecurity' },
    { value: 'data-science.jpeg', label: 'Data Science' },
    { value: 'blockchain.jpeg', label: 'Blockchain' },
    { value: 'devops.jpeg', label: 'DevOps' },
    { value: 'ui-ux.jpeg', label: 'UI/UX Design' }
  ];

  useEffect(() => {
    loadNiches();
  }, []);

  const loadNiches = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNiches();
      if (response.success) {
        setNiches(response.data || []);
      } else {
        console.error('Error loading niches:', response.error);
        setNiches([]);
      }
    } catch (error) {
      console.error('Error loading niches:', error);
      setNiches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Upload image to Supabase storage using existing images bucket
      const imageData = await imageService.uploadImage(file, BUCKETS.IMAGES);
      
      // Update form data with the new image URL
      setFormData({
        ...formData,
        image: imageData.url
      });
    } catch (error) {
      // console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setSavingNiche(true);
      
      if (editingNiche) {
        await apiService.updateNiche(editingNiche.id, formData);
      } else {
        await apiService.createNiche(formData);
      }

      await loadNiches();
      setShowForm(false);
      resetForm();
      
      // Show success toast
      const action = editingNiche ? 'updated' : 'created';
      toastService.success(`Niche ${action} successfully! 🎯`);
      
    } catch (error) {
      console.error('Error saving niche:', error);
      toastService.error(`Error saving niche: ${error.message}`);
    } finally {
      setSavingNiche(false);
    }
  };

  const handleEditNiche = (niche) => {
    setEditingNiche(niche);
    setFormData({
      image: niche.image || 'default.jpeg',
      title: niche.title || '',
      overview: niche.overview || '',
      tools: niche.tools || '',
      key_features: niche.key_features || '',
      sort_order: niche.sort_order || 1,
      ai_driven: niche.ai_driven || false
    });
    setShowForm(true);
  };

  const handleDeleteNiche = async (nicheId) => {
    if (!window.confirm('Are you sure you want to delete this niche?')) {
      return;
    }

    try {
      await apiService.deleteNiche(nicheId);
      await loadNiches();
      
      // Show success toast
      toastService.success('Niche deleted successfully! 🗑️');
    } catch (error) {
      console.error('Error deleting niche:', error);
      toastService.error(`Error deleting niche: ${error.message}`);
    }
  };

  const handleReorder = async (niche, direction) => {
    const currentIndex = niches.findIndex(n => n.id === niche.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= niches.length) return;

    const newNiches = [...niches];
    const temp = newNiches[currentIndex];
    newNiches[currentIndex] = newNiches[newIndex];
    newNiches[newIndex] = temp;

    // Update sort orders
    const updatedNiches = newNiches.map((n, index) => ({
      ...n,
      sort_order: index + 1
    }));

    setNiches(updatedNiches);

    // Update in database
    try {
      await Promise.all(
        updatedNiches.map(niche => 
          apiService.updateNiche(niche.id, { sort_order: niche.sort_order })
        )
      );
      
      // Show success toast
      toastService.success('Niche reordered successfully! 🔄');
    } catch (error) {
      console.error('Error reordering niches:', error);
      toastService.error(`Error reordering niche: ${error.message}`);
      loadNiches(); // Reload on error
    }
  };

  const resetForm = () => {
    setFormData({
      image: 'default.jpeg',
      title: '',
      overview: '',
      tools: '',
      key_features: '',
      sort_order: 1,
      ai_driven: false
    });
    setEditingNiche(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="niche-manager">
        <div className="loading-container">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Loading niches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="niche-manager">
      <div className="section-header">
        <h2>🎯 Domains / Niche</h2>
        <p>Manage your domain expertise and niche areas with detailed information.</p>
      </div>

      <div className="content-area">
        <div className="actions-bar">
          <button
            className="add-btn"
            onClick={() => {
              setShowForm(true);
              setEditingNiche(null);
              setFormData({
                image: 'default.jpeg',
                title: '',
                overview: '',
                tools: '',
                key_features: '',
                sort_order: niches.length + 1,
                ai_driven: false
              });
            }}
          >
            <Plus className="w-4 h-4" />
            Add New Niche
          </button>
        </div>

        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <div className="form-header">
                <h3>{editingNiche ? 'Edit Niche' : 'Add New Niche'}</h3>
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNiche(null);
                    setFormData({
                      image: 'default.jpeg',
                      title: '',
                      overview: '',
                      tools: '',
                      key_features: '',
                      sort_order: 1,
                      ai_driven: false
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="niche-form">
                <div className="form-group">
                  <label>Image:</label>
                  <div className="image-selection">
                    <div className="image-options">
                      <label className="image-option-label">Preset Images:</label>
                      <select
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      >
                        {availableImages.map(image => (
                          <option key={image.value} value={image.value}>{image.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="image-upload">
                      <label className="image-option-label">Or Upload Custom Image:</label>
                      <div className="upload-area">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="file-input"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="upload-button">
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Choose Image
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  <div className="image-preview">
                    <img 
                      src={formData.image.startsWith('http') ? formData.image : `/images/hero-bg.png`}
                      alt="Preview"
                      className="preview-image"
                      onError={(e) => {
                        e.target.src = '/images/hero-bg.png';
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter niche title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Overview:</label>
                  <textarea
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Enter niche overview"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Tools (comma-separated):</label>
                  <input
                    type="text"
                    value={formData.tools}
                    onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                    placeholder="e.g., React, Node.js, Python, AWS"
                  />
                </div>

                <div className="form-group">
                  <label>Key Features:</label>
                  <textarea
                    value={formData.key_features}
                    onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                    placeholder="Enter key features"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Sort Order:</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    placeholder="Enter sort order"
                    required
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.ai_driven}
                      onChange={(e) => setFormData({ ...formData, ai_driven: e.target.checked })}
                    />
                    AI-Driven
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={savingNiche}>
                    {savingNiche ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingNiche ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false);
                      setEditingNiche(null);
                      setFormData({
                        image: 'default.jpeg',
                        title: '',
                        overview: '',
                        tools: '',
                        key_features: '',
                        sort_order: 1,
                        ai_driven: false
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="niches-list">
          {(!niches || niches.length === 0) ? (
            <div className="empty-state">
              <p>No niches added yet. Click "Add New Niche" to get started.</p>
            </div>
          ) : (
            niches.map((niche, index) => (
              <div key={niche.id} className="niche-card">
                <div className="niche-header">
                  <div className="niche-info">
                    <img 
                      src={niche.image.startsWith('http') ? niche.image : `/images/hero-bg.png`}
                      alt={niche.title}
                      className="niche-image"
                      onError={(e) => {
                        e.target.src = '/images/hero-bg.png';
                      }}
                    />
                    <div className="niche-details">
                      <h4>{niche.title}</h4>
                      <p className="niche-overview">{niche.overview}</p>
                      {Boolean(niche.ai_driven) && (
                        <span className="ai-badge">🤖 AI-Driven</span>
                      )}
                    </div>
                  </div>
                  <div className="niche-actions">
                    <button
                      className="reorder-btn"
                      onClick={() => handleReorder(niche, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      className="reorder-btn"
                      onClick={() => handleReorder(niche, 'down')}
                      disabled={index === niches.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditNiche(niche)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteNiche(niche.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {niche.tools && (
                  <div className="niche-tools">
                    <strong>Tools:</strong> {niche.tools}
                  </div>
                )}
                
                {niche.key_features && (
                  <div className="niche-features">
                    <strong>Key Features:</strong>
                    <p>{niche.key_features}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NicheManager; 