import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Star, GripVertical, Loader2 } from 'lucide-react';
import { domainsTechnologiesService } from '../../services/supabaseService';
import './DomainsTechnologiesManager.css';

const DomainsTechnologiesManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'technology',
    title: '',
    icon: '',
    sort_order: 1
  });
  
  // Loading states for specific operations
  const [savingItem, setSavingItem] = useState(false);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [reorderingItems, setReorderingItems] = useState(new Set());
  const [addingSkills, setAddingSkills] = useState(new Set());
  const [updatingSkills, setUpdatingSkills] = useState(new Set());
  const [deletingSkills, setDeletingSkills] = useState(new Set());

  // Available icons for selection
  const availableIcons = [
    'Code', 'Layers', 'Database', 'GitBranch', 'Cloud', 'Wrench', 'Link', 'Cpu',
    'ShoppingCart', 'DollarSign', 'GraduationCap', 'Globe', 'MessageCircle', 
    'FileText', 'Image', 'BookOpen', 'Monitor', 'Smartphone', 'Server', 'Shield',
    'Zap', 'Target', 'Users', 'Settings', 'BarChart', 'Calendar', 'Mail', 'Phone'
  ];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await domainsTechnologiesService.getDomainsTechnologies();
      // console.log('Loaded items:', data);
      // console.log('Items with skills:', data.filter(item => item.tech_skills && item.tech_skills.length > 0));
      setItems(data);
    } catch (err) {
      setError('Failed to load items');
      // console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingItem(true);
      if (editingItem) {
        const updatedItem = await domainsTechnologiesService.updateDomainTechnology(editingItem.id, formData);
        setItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      } else {
        const newItem = await domainsTechnologiesService.createDomainTechnology(formData);
        setItems(prev => [...prev, newItem]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ type: 'technology', title: '', icon: '', sort_order: 1 });
    } catch (err) {
      setError('Failed to save item');
      // console.error('Error saving item:', err);
    } finally {
      setSavingItem(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      icon: item.icon || '',
      sort_order: item.sort_order || 1
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setDeletingItems(prev => new Set(prev).add(id));
        await domainsTechnologiesService.deleteDomainTechnology(id);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        setError('Failed to delete item');
      // console.error('Error deleting item:', err);
      } finally {
        setDeletingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handleReorder = async (itemId, newSortOrder) => {
    try {
      setReorderingItems(prev => new Set(prev).add(itemId));
      await domainsTechnologiesService.updateDomainTechnology(itemId, { sort_order: newSortOrder });
      // Update local state instead of reloading
      const updatedItem = await domainsTechnologiesService.getDomainsTechnologies();
      setItems(updatedItem);
    } catch (err) {
      setError('Failed to reorder item');
      // console.error('Error reordering item:', err);
    } finally {
      setReorderingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const moveItem = async (itemId, direction) => {
    const currentItem = items.find(item => item.id === itemId);
    if (!currentItem) return;

    const currentIndex = items.findIndex(item => item.id === itemId);
    let newSortOrder;

    if (direction === 'up' && currentIndex > 0) {
      const prevItem = items[currentIndex - 1];
      newSortOrder = prevItem.sort_order;
      // Update the previous item's sort order
      await domainsTechnologiesService.updateDomainTechnology(prevItem.id, { 
        sort_order: currentItem.sort_order 
      });
    } else if (direction === 'down' && currentIndex < items.length - 1) {
      const nextItem = items[currentIndex + 1];
      newSortOrder = nextItem.sort_order;
      // Update the next item's sort order
      await domainsTechnologiesService.updateDomainTechnology(nextItem.id, { 
        sort_order: currentItem.sort_order 
      });
    } else {
      return; // Can't move further
    }

    // Update the current item's sort order
    await handleReorder(itemId, newSortOrder);
  };

  const handleAddSkill = async (techId, skillData) => {
    try {
      setAddingSkills(prev => new Set(prev).add(techId));
      const newSkill = await domainsTechnologiesService.addSkill(techId, skillData);
      
      // Update local state
      setItems(prev => prev.map(item => {
        if (item.id === techId) {
          return {
            ...item,
            tech_skills: [...(item.tech_skills || []), newSkill]
          };
        }
        return item;
      }));
    } catch (err) {
      setError('Failed to add skill');
      // console.error('Error adding skill:', err);
    } finally {
      setAddingSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(techId);
        return newSet;
      });
    }
  };

  const handleUpdateSkill = async (skillId, updates) => {
    try {
      setUpdatingSkills(prev => new Set(prev).add(skillId));
      const updatedSkill = await domainsTechnologiesService.updateSkill(skillId, updates);
      
      // Update local state
      setItems(prev => prev.map(item => ({
        ...item,
        tech_skills: item.tech_skills?.map(skill => 
          skill.id === skillId ? updatedSkill : skill
        ) || []
      })));
    } catch (err) {
      setError('Failed to update skill');
      // console.error('Error updating skill:', err);
    } finally {
      setUpdatingSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillId);
        return newSet;
      });
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        setDeletingSkills(prev => new Set(prev).add(skillId));
        await domainsTechnologiesService.deleteSkill(skillId);
        
        // Update local state
        setItems(prev => prev.map(item => ({
          ...item,
          tech_skills: item.tech_skills?.filter(skill => skill.id !== skillId) || []
        })));
      } catch (err) {
        setError('Failed to delete skill');
      // console.error('Error deleting skill:', err);
      } finally {
        setDeletingSkills(prev => {
          const newSet = new Set(prev);
          newSet.delete(skillId);
          return newSet;
        });
      }
    }
  };

  const renderSkillLevel = (level) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="domains-technologies-manager">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="domains-technologies-manager">
      <div className="section-header">
        <h2>🎯 Technologies </h2>
        <p>Manage your domains and technology boxes with their associated skills.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Add New Item Button */}
      <div className="add-item-section">
        <button
          className="add-item-btn"
          onClick={() => {
            setShowForm(true);
            setEditingItem(null);
            setFormData({ 
              type: 'technology', 
              title: '', 
              icon: '', 
              sort_order: items.length + 1 
            });
          }}
        >
          <Plus className="w-4 h-4" />
          Add New {formData.type === 'domain' ? 'Domain' : 'Technology Box'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingItem ? 'Edit' : 'Add New'} {formData.type === 'domain' ? 'Domain' : 'Technology Box'}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormData({ type: 'technology', title: '', icon: '', sort_order: 1 });
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="item-form">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter technology box title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Icon:</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  <option value="">Select an icon</option>
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
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

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={savingItem}>
                  {savingItem ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingItem ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({ type: 'technology', title: '', icon: '', sort_order: 1 });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="items-grid">
        {items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <div className="item-info">
                <div className="item-title-row">
                  <span className="sort-order-badge">#{item.sort_order}</span>
                  <h3>{item.title}</h3>
                </div>
                <span className={`type-badge ${item.type}`}>
                  {item.type === 'domain' ? 'Domain' : 'Technology'}
                </span>
              </div>
              <div className="item-actions">
                <div className="reorder-buttons">
                  <button
                    className="reorder-btn"
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="reorder-btn"
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={index === items.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(item)}
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Skills Section (for all items) */}
            <div className="skills-section">
              <h4>Skills</h4>
              {item.tech_skills && item.tech_skills.length > 0 ? (
                <div className="skills-list">
                  {item.tech_skills
                    .sort((a, b) => (b.level || 0) - (a.level || 0)) // Sort by skill level descending
                    .map((skill) => (
                      <div key={skill.id} className="skill-item">
                        <div className="skill-info">
                          <span className="skill-name">{skill.title}</span>
                          {renderSkillLevel(skill.level)}
                        </div>
                        <div className="skill-actions">
                          <button
                            className="edit-skill-btn"
                            onClick={() => {
                              const newLevel = prompt('Enter skill level (1-5):', skill.level);
                              if (newLevel && !isNaN(newLevel) && newLevel >= 1 && newLevel <= 5) {
                                handleUpdateSkill(skill.id, { level: parseFloat(newLevel) });
                              }
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            className="delete-skill-btn"
                            onClick={() => handleDeleteSkill(skill.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-skills">No skills added yet.</p>
              )}
              
              {/* Add Skill Form */}
              <div className="add-skill-form">
                <input
                  type="text"
                  placeholder="Skill name"
                  id={`skill-name-${item.id}`}
                  className="skill-name-input"
                />
                <select
                  id={`skill-level-${item.id}`}
                  className="skill-level-select"
                  defaultValue="3"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button
                  className="add-skill-btn"
                  onClick={() => {
                    const nameInput = document.getElementById(`skill-name-${item.id}`);
                    const levelInput = document.getElementById(`skill-level-${item.id}`);
                    const name = nameInput.value.trim();
                    const level = parseFloat(levelInput.value);
                    
                    if (name) {
                      handleAddSkill(item.id, { title: name, level });
                      nameInput.value = '';
                      levelInput.value = '3';
                    }
                  }}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <p>No {formData.type === 'domain' ? 'domains' : 'technology boxes'} found.</p>
          <p>Click "Add New" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default DomainsTechnologiesManager; 