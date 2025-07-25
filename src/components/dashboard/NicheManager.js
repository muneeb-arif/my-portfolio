import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2, ArrowUp, ArrowDown, Upload, Image as ImageIcon } from 'lucide-react';
import { nicheService, imageService } from '../../services/supabaseService';
import { BUCKETS } from '../../config/supabase';
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
      const data = await nicheService.getNiches();
      setNiches(data);
    } catch (error) {
      // console.error('Error loading niches:', error);
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
    try {
      setSavingNiche(true);
      
      // Convert tools string to comma-separated format
      const processedData = {
        ...formData,
        tools: formData.tools.trim()
      };

      if (editingNiche) {
        const updatedNiche = await nicheService.updateNiche(editingNiche.id, processedData);
        setNiches(niches.map(niche => 
          niche.id === editingNiche.id ? updatedNiche : niche
        ));
      } else {
        const newNiche = await nicheService.createNiche(processedData);
        setNiches([...niches, newNiche]);
      }

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
    } catch (error) {
      // console.error('Error saving niche:', error);
    } finally {
      setSavingNiche(false);
    }
  };

  const handleEdit = (niche) => {
    setEditingNiche(niche);
    setFormData({
      image: niche.image,
      title: niche.title,
      overview: niche.overview || '',
      tools: niche.tools || '',
      key_features: niche.key_features || '',
      sort_order: niche.sort_order,
      ai_driven: niche.ai_driven
    });
    setShowForm(true);
  };

  const handleDelete = async (niche) => {
    if (window.confirm(`Are you sure you want to delete "${niche.title}"?`)) {
      try {
        await nicheService.deleteNiche(niche.id);
        setNiches(niches.filter(n => n.id !== niche.id));
      } catch (error) {
      // console.error('Error deleting niche:', error);
      }
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
          nicheService.updateNiche(niche.id, { sort_order: niche.sort_order })
        )
      );
    } catch (error) {
      // console.error('Error reordering niches:', error);
      loadNiches(); // Reload on error
    }
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
                      src={formData.image.startsWith('http') ? formData.image : `/images/domains/${formData.image}`}
                      alt="Preview"
                      className="preview-image"
                      onError={(e) => {
                        e.target.src = '/images/domains/default.jpeg';
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
          {niches.length === 0 ? (
            <div className="empty-state">
              <p>No niches added yet. Click "Add New Niche" to get started.</p>
            </div>
          ) : (
            niches.map((niche, index) => (
              <div key={niche.id} className="niche-card">
                <div className="niche-header">
                  <div className="niche-info">
                    <img 
                      src={niche.image.startsWith('http') ? niche.image : `/images/domains/${niche.image}`}
                      alt={niche.title}
                      className="niche-image"
                      onError={(e) => {
                        e.target.src = '/images/domains/default.jpeg';
                      }}
                    />
                    <div className="niche-details">
                      <h4>{niche.title}</h4>
                      <p className="niche-overview">{niche.overview}</p>
                      {niche.ai_driven && (
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
                      onClick={() => handleEdit(niche)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(niche)}
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