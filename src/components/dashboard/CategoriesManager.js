import React, { useState, useEffect } from 'react';
import { metaService } from '../../services/serviceAdapter';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8B4513'
  });

  const predefinedColors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple  
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#6b7280', // Gray
    '#8B4513', // Brown
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316'  // Orange
  ];

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await metaService.getCategories();
      setCategories(data);
    } catch (error) {
      // console.error('Error loading categories:', error);
      alert('Error loading categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when closing
  useEffect(() => {
    if (!showForm && !editingCategory) {
      resetForm();
    }
  }, [showForm, editingCategory]);

  // Load category data when editing
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        description: editingCategory.description || '',
        color: editingCategory.color || '#8B4513'
      });
      setShowForm(true);
    }
  }, [editingCategory]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#8B4513'
    });
    setEditingCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    setLoading(true);
    
    try {
      if (editingCategory) {
        // Update existing category
        await metaService.updateCategory(editingCategory.id, formData);
      } else {
        // Create new category
        await metaService.addCategory(formData);
      }

      // Refresh categories list
      await loadCategories();
      
      // Close form
      setShowForm(false);
      resetForm();
      
      alert(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      // console.error('Error saving category:', error);
      alert(`Error ${editingCategory ? 'updating' : 'creating'} category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await metaService.deleteCategory(categoryId);
      await loadCategories();
      alert('Category deleted successfully!');
    } catch (error) {
      // console.error('Error deleting category:', error);
      alert('Error deleting category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📁 {editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
          <button 
            className="btn-secondary"
            onClick={() => setShowForm(false)}
          >
            ← Back to Categories
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name">Category Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Web Development"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of this category"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Category Color</label>
            <div className="color-picker">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
              <div className="color-presets">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-preset ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
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
              disabled={loading}
            >
              {loading 
                ? 'Saving...' 
                : (editingCategory ? 'Update Category' : 'Create Category')
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
        <h2>📁 Categories Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Category
        </button>
      </div>

      {loading && !showForm ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <div 
                  className="category-color"
                  style={{ backgroundColor: category.color }}
                />
                <h3>{category.name}</h3>
              </div>
              
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
              
              <div className="category-meta">
                <span className="category-created">
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="category-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEditCategory(category)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Categories Yet</h3>
          <p>Create your first category to organize your projects!</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Create First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager; 