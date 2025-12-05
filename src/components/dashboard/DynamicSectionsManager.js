import React, { useState, useEffect } from 'react';
import toastService from '../../services/toastService';
import { dynamicSectionService } from '../../services/dynamicSectionService';
import { imageService } from '../../services/imageService';
import MediaSelectionModal from './MediaSelectionModal';
import './DynamicSectionsManager.css';

const DynamicSectionsManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [positioningOptions, setPositioningOptions] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [formData, setFormData] = useState({
    section_type: 'text_only',
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    video_url: '',
    alignment: 'center',
    position_after: '',
    is_visible: true,
    section_id: '',
    background_color: '',
    background_image_url: '',
    padding_top: 80,
    padding_bottom: 80,
    cta_button_text: '',
    cta_button_link: '',
    cta_button_target: '_self',
    cta_button_style: 'primary',
    embed_type: '',
    embed_url: '',
    embed_code: '',
    accordion_items: []
  });
  const [accordionItemTitle, setAccordionItemTitle] = useState('');
  const [accordionItemContent, setAccordionItemContent] = useState('');

  useEffect(() => {
    loadSections();
    loadPositioningOptions();
  }, []);

  useEffect(() => {
    if (editingSection) {
      setFormData({
        section_type: editingSection.section_type || 'text_only',
        title: editingSection.title || '',
        subtitle: editingSection.subtitle || '',
        content: editingSection.content || '',
        image_url: editingSection.image_url || '',
        video_url: editingSection.video_url || '',
        alignment: editingSection.alignment || 'center',
        position_after: editingSection.position_after || '',
        is_visible: editingSection.is_visible !== undefined ? editingSection.is_visible : true,
        section_id: editingSection.section_id || '',
        background_color: editingSection.background_color || '',
        background_image_url: editingSection.background_image_url || '',
        padding_top: editingSection.padding_top || 80,
        padding_bottom: editingSection.padding_bottom || 80,
        cta_button_text: editingSection.cta_button_text || '',
        cta_button_link: editingSection.cta_button_link || '',
        cta_button_target: editingSection.cta_button_target || '_self',
        cta_button_style: editingSection.cta_button_style || 'primary',
        embed_type: editingSection.embed_type || '',
        embed_url: editingSection.embed_url || '',
        embed_code: editingSection.embed_code || '',
        accordion_items: editingSection.accordion_items ? (typeof editingSection.accordion_items === 'string' ? JSON.parse(editingSection.accordion_items) : editingSection.accordion_items) : []
      });
    } else {
      resetForm();
    }
  }, [editingSection]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const result = await dynamicSectionService.listSections();
      if (result.success) {
        setSections(result.data || []);
      } else {
        toastService.error(result.error || 'Failed to load sections');
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      toastService.error('Error loading dynamic sections');
    } finally {
      setLoading(false);
    }
  };

  const loadPositioningOptions = async () => {
    try {
      const result = await dynamicSectionService.getSectionsForPositioning();
      if (result.success) {
        setPositioningOptions(result.data || []);
      }
    } catch (error) {
      console.error('Error loading positioning options:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      section_type: 'text_only',
      title: '',
      subtitle: '',
      content: '',
      image_url: '',
      video_url: '',
      alignment: 'center',
      position_after: '',
      is_visible: true,
      section_id: '', // Will be auto-generated as UUID on submit
      background_color: '',
      background_image_url: '',
      padding_top: 80,
      padding_bottom: 80,
      cta_button_text: '',
      cta_button_link: '',
      cta_button_target: '_self',
      cta_button_style: 'primary',
      embed_type: '',
      embed_url: '',
      embed_code: '',
      accordion_items: []
    });
    setAccordionItemTitle('');
    setAccordionItemContent('');
  };

  // Generate UUID v4 for section_id
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await imageService.uploadImage(file);
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          image_url: result.data.url || result.data.publicUrl
        }));
        toastService.success('Image uploaded successfully!');
      } else {
        toastService.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toastService.error('Error uploading image');
    }
  };

  const handleMediaSelection = (selectedItems) => {
    if (selectedItems.length > 0) {
      const selectedItem = selectedItems[0];
      setFormData(prev => ({
        ...prev,
        image_url: selectedItem.url
      }));
      setShowMediaModal(false);
    }
  };

  const handleAddAccordionItem = () => {
    if (accordionItemTitle.trim() && accordionItemContent.trim()) {
      setFormData(prev => ({
        ...prev,
        accordion_items: [...prev.accordion_items, {
          title: accordionItemTitle.trim(),
          content: accordionItemContent.trim()
        }]
      }));
      setAccordionItemTitle('');
      setAccordionItemContent('');
    }
  };

  const handleRemoveAccordionItem = (index) => {
    setFormData(prev => ({
      ...prev,
      accordion_items: prev.accordion_items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // section_id will be set to database UUID on backend if not provided
      // No need to generate it here - backend will handle it
      const sectionData = {
        ...formData,
        // Only include section_id if user explicitly provided one (for custom anchors)
        // Otherwise, backend will use the database UUID
        accordion_items: formData.accordion_items.length > 0 ? JSON.stringify(formData.accordion_items) : null
      };

      let result;
      if (editingSection) {
        result = await dynamicSectionService.updateSection(editingSection.id, sectionData);
      } else {
        result = await dynamicSectionService.createSection(sectionData);
      }

      if (result.success) {
        toastService.success(`Section ${editingSection ? 'updated' : 'created'} successfully!`);
        await loadSections();
        setShowForm(false);
        setEditingSection(null);
        resetForm();
      } else {
        toastService.error(result.error || 'Failed to save section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      toastService.error('Error saving section');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await dynamicSectionService.deleteSection(sectionId);
      if (result.success) {
        toastService.success('Section deleted successfully!');
        await loadSections();
      } else {
        toastService.error(result.error || 'Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      
      // Provide more helpful error message
      if (error.message && error.message.includes('API server is not available')) {
        toastService.error('Cannot connect to API server. Please check if the API server is running and try again.');
      } else {
        toastService.error(`Error deleting section: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="dynamic-sections-manager">
        <div className="section-header">
          <h2>📝 {editingSection ? 'Edit Section' : 'Add New Section'}</h2>
          <button 
            className="btn-secondary"
            onClick={() => {
              setShowForm(false);
              setEditingSection(null);
              resetForm();
            }}
          >
            ← Back to Sections
          </button>
        </div>

        <form onSubmit={handleSubmit} className="section-form">
          <div className="form-fields-grid">
          {/* Section Type */}
          <div className="form-group">
            <label htmlFor="section_type">Section Type *</label>
            <select
              id="section_type"
              name="section_type"
              value={formData.section_type}
              onChange={handleInputChange}
              required
            >
              <option value="title">Title</option>
              <option value="subtitle">Subtitle</option>
              <option value="image_text">Image + Text</option>
              <option value="text_image">Text + Image</option>
              <option value="image_only">Image Only</option>
              <option value="video_only">Video Only</option>
              <option value="text_only">Text Only</option>
              <option value="accordion">Accordion</option>
              <option value="social_embed">Social Embed</option>
              <option value="map_embed">Map Embed</option>
              <option value="form">Form</option>
              <option value="code_snippet">Code Snippet</option>
              <option value="custom_html">Custom HTML</option>
            </select>
          </div>

          {/* Title */}
          {(formData.section_type === 'title' || formData.section_type === 'subtitle' || 
            formData.section_type === 'image_text' || formData.section_type === 'text_image' ||
            formData.section_type === 'text_only') && (
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter section title"
              />
            </div>
          )}

          {/* Subtitle */}
          {(formData.section_type === 'subtitle' || formData.section_type === 'image_text' || 
            formData.section_type === 'text_image' || formData.section_type === 'text_only') && (
            <div className="form-group">
              <label htmlFor="subtitle">Subtitle</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Enter section subtitle"
              />
            </div>
          )}

          {/* Content */}
          {(formData.section_type === 'image_text' || formData.section_type === 'text_image' ||
            formData.section_type === 'text_only' || formData.section_type === 'code_snippet') && (
            <div className="form-group full-width">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter content (supports HTML)"
                rows="6"
              />
            </div>
          )}

          {/* Image URL */}
          {(formData.section_type === 'image_text' || formData.section_type === 'text_image' ||
            formData.section_type === 'image_only') && (
            <div className="form-group full-width">
              <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter section title"
              />
            </div>
              <label htmlFor="image_url">Image</label>
              <div className="image-upload-section">
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="Image URL or upload below"
                />
                <div className="image-upload-buttons">
                  <label className="btn-upload">
                    📤 Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-choose-media"
                    onClick={() => setShowMediaModal(true)}
                  >
                    📁 Choose from Library
                  </button>
                </div>
                {formData.image_url && (
                  <div className="image-preview">
                    <img src={formData.image_url} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video URL */}
          {formData.section_type === 'video_only' && (
            <div className="form-group">
              <label htmlFor="video_url">Video URL</label>
              <input
                type="url"
                id="video_url"
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
                placeholder="YouTube, Vimeo, or direct video URL"
              />
            </div>
          )}

          {/* Alignment */}
          {(formData.section_type === 'title' || formData.section_type === 'subtitle' ||
            formData.section_type === 'image_text' || formData.section_type === 'text_image' ||
            formData.section_type === 'text_only') && (
            <div className="form-group">
              <label htmlFor="alignment">Alignment</label>
              <select
                id="alignment"
                name="alignment"
                value={formData.alignment}
                onChange={handleInputChange}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          )}

          {/* Accordion Items */}
          {formData.section_type === 'accordion' && (
            <div className="form-group full-width">
              <label>Accordion Items</label>
              <div className="accordion-builder">
                <div className="accordion-inputs">
                  <input
                    type="text"
                    value={accordionItemTitle}
                    onChange={(e) => setAccordionItemTitle(e.target.value)}
                    placeholder="Item title"
                  />
                  <textarea
                    value={accordionItemContent}
                    onChange={(e) => setAccordionItemContent(e.target.value)}
                    placeholder="Item content"
                    rows="3"
                  />
                  <button
                    type="button"
                    className="btn-add-item"
                    onClick={handleAddAccordionItem}
                  >
                    ➕ Add Item
                  </button>
                </div>
                <div className="accordion-items-list">
                  {formData.accordion_items.map((item, index) => (
                    <div key={index} className="accordion-item-preview">
                      <strong>{item.title}</strong>
                      <button
                        type="button"
                        className="btn-remove-item"
                        onClick={() => handleRemoveAccordionItem(index)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Social Embed */}
          {formData.section_type === 'social_embed' && (
            <>
              <div className="form-group">
                <label htmlFor="embed_type">Embed Type</label>
                <select
                  id="embed_type"
                  name="embed_type"
                  value={formData.embed_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select type</option>
                  <option value="facebook_post">Facebook Post</option>
                  <option value="facebook_video">Facebook Video</option>
                  <option value="facebook_page_feed">Facebook Page Feed</option>
                  <option value="instagram_post">Instagram Post</option>
                  <option value="instagram_reel">Instagram Reel</option>
                  <option value="instagram_feed">Instagram Feed</option>
                  <option value="twitter">Twitter</option>
                  <option value="tiktok">TikTok</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="pinterest">Pinterest</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="embed_url">
                  {formData.embed_type === 'facebook_page_feed' 
                    ? 'Facebook Page URL' 
                    : formData.embed_type === 'instagram_feed'
                    ? 'Instagram Username or Embed Code'
                    : 'Embed URL'}
                </label>
                <input
                  type="url"
                  id="embed_url"
                  name="embed_url"
                  value={formData.embed_url}
                  onChange={handleInputChange}
                  placeholder={
                    formData.embed_type === 'facebook_page_feed'
                      ? 'https://www.facebook.com/your-page-name'
                      : formData.embed_type === 'instagram_feed'
                      ? 'Instagram username (e.g., @username) or paste embed code in Custom HTML section'
                      : 'URL of the post/video to embed'
                  }
                />
              </div>
              {formData.embed_type === 'facebook_page_feed' && (
                <div className="form-group">
                  <label className="form-hint" style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    💡 Enter your Facebook Page URL (e.g., https://www.facebook.com/your-page-name). 
                    The feed will display your page's timeline posts.
                  </label>
                </div>
              )}
              {formData.embed_type === 'instagram_feed' && (
                <div className="form-group">
                  <label className="form-hint" style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    💡 For Instagram Feed, you can either:
                    <br />• Enter username (e.g., @username) - we'll try to generate a feed
                    <br />• Or use "Custom HTML" section type and paste embed code from third-party tools like Elfsight, Onstipe, etc.
                  </label>
                </div>
              )}
            </>
          )}

          {/* Map Embed */}
          {formData.section_type === 'map_embed' && (
            <div className="form-group">
              <label htmlFor="embed_url">Google Maps URL</label>
              <input
                type="url"
                id="embed_url"
                name="embed_url"
                value={formData.embed_url}
                onChange={handleInputChange}
                placeholder="Google Maps embed URL"
              />
            </div>
          )}

          {/* Custom HTML / Code Snippet */}
          {(formData.section_type === 'custom_html' || formData.section_type === 'code_snippet') && (
            <div className="form-group full-width">
              <label htmlFor="embed_code">HTML/Code</label>
              <textarea
                id="embed_code"
                name="embed_code"
                value={formData.embed_code}
                onChange={handleInputChange}
                placeholder="Enter HTML or code"
                rows="8"
              />
            </div>
          )}

          {/* Position After */}
          <div className="form-group">
            <label htmlFor="position_after">Position After</label>
            <select
              id="position_after"
              name="position_after"
              value={formData.position_after}
              onChange={handleInputChange}
            >
              <option value="">At the end</option>
              <option value="hero">After Hero</option>
              <option value="portfolio">After Portfolio</option>
              <option value="about">After About</option>
              <option value="contact">After Contact</option>
                {positioningOptions.map(option => {
                  // For dynamic sections, use section_id (UUID) if available, otherwise use id
                  // For hardcoded sections, use id directly
                  const value = option.section_id || option.id;
                  return (
                    <option key={option.id} value={value}>
                      After: {option.title || option.section_id || option.id}
                    </option>
                  );
                })}
            </select>
          </div>

          {/* Visibility */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_visible"
                checked={formData.is_visible}
                onChange={handleInputChange}
              />
              Visible on frontend
            </label>
          </div>

          {/* Section ID - Hidden, auto-generated as UUID */}

          {/* Background Color */}
          <div className="form-group">
            <label htmlFor="background_color">Background Color</label>
            <input
              type="color"
              id="background_color"
              name="background_color"
              value={formData.background_color || '#ffffff'}
              onChange={handleInputChange}
            />
          </div>

          {/* Background Image */}
          <div className="form-group">
            <label htmlFor="background_image_url">Background Image URL</label>
            <input
              type="url"
              id="background_image_url"
              name="background_image_url"
              value={formData.background_image_url}
              onChange={handleInputChange}
              placeholder="Background image URL"
            />
          </div>

          {/* Padding */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="padding_top">Padding Top (px)</label>
              <input
                type="number"
                id="padding_top"
                name="padding_top"
                value={formData.padding_top}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="padding_bottom">Padding Bottom (px)</label>
              <input
                type="number"
                id="padding_bottom"
                name="padding_bottom"
                value={formData.padding_bottom}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="form-group">
            <label htmlFor="cta_button_text">CTA Button Text</label>
            <input
              type="text"
              id="cta_button_text"
              name="cta_button_text"
              value={formData.cta_button_text}
              onChange={handleInputChange}
              placeholder="Button text"
            />
          </div>
          {formData.cta_button_text && (
            <>
              <div className="form-group">
                <label htmlFor="cta_button_link">CTA Button Link</label>
                <input
                  type="text"
                  id="cta_button_link"
                  name="cta_button_link"
                  value={formData.cta_button_link}
                  onChange={handleInputChange}
                  placeholder="URL or anchor link"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cta_button_target">Button Target</label>
                  <select
                    id="cta_button_target"
                    name="cta_button_target"
                    value={formData.cta_button_target}
                    onChange={handleInputChange}
                  >
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cta_button_style">Button Style</label>
                  <select
                    id="cta_button_style"
                    name="cta_button_style"
                    value={formData.cta_button_style}
                    onChange={handleInputChange}
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
              </div>
            </>
          )}

          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingSection(null);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingSection ? 'Update Section' : 'Create Section')}
            </button>
          </div>
        </form>

        <MediaSelectionModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          onSelect={handleMediaSelection}
          allowMultiple={false}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dynamic-sections-manager">
        <div className="section-header">
          <h2>📝 Dynamic Sections</h2>
          <p>Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-sections-manager">
      <div className="section-header">
        <div className="header-content">
          <h2>📝 Dynamic Sections</h2>
          <p>Manage your custom content sections</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setEditingSection(null);
              setShowForm(true);
            }}
          >
            ➕ Add New Section
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="empty-state">
          <p>No dynamic sections yet. Create your first section to get started!</p>
        </div>
      ) : (
        <div className="sections-list">
          {sections.map((section) => (
            <div key={section.id} className="section-card">
              <div className="section-info">
                <h3>{section.title || `Section (${section.section_type})`}</h3>
                <p>Type: {section.section_type} | Position: {section.position_after || 'End'} | {section.is_visible ? '✅ Visible' : '❌ Hidden'}</p>
              </div>
              <div className="section-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingSection(section);
                    setShowForm(true);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(section.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicSectionsManager;


