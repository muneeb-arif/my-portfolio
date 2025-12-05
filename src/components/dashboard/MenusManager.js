import React, { useState, useEffect } from 'react';
import toastService from '../../services/toastService';
import { menuService } from '../../services/menuService';
import './MenusManager.css';

const MenusManager = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [locationFilter, setLocationFilter] = useState('all'); // 'all', 'header', 'footer', 'mobile'
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [formData, setFormData] = useState({
    menu_type: 'section',
    section_id: '',
    label: '',
    icon: '',
    link_url: '',
    sort_order: 1,
    is_visible: true,
    show_in_header: false,
    show_in_footer: false,
    show_in_mobile: false
  });

  useEffect(() => {
    loadMenus();
    loadSectionOptions();
  }, []);

  useEffect(() => {
    if (editingMenu) {
      setFormData({
        menu_type: editingMenu.menu_type || 'section',
        section_id: editingMenu.section_id || '',
        label: editingMenu.label || '',
        icon: editingMenu.icon || '',
        link_url: editingMenu.link_url || '',
        sort_order: editingMenu.sort_order || 1,
        is_visible: editingMenu.is_visible !== undefined ? editingMenu.is_visible : true,
        show_in_header: editingMenu.show_in_header !== undefined ? editingMenu.show_in_header : false,
        show_in_footer: editingMenu.show_in_footer !== undefined ? editingMenu.show_in_footer : false,
        show_in_mobile: editingMenu.show_in_mobile !== undefined ? editingMenu.show_in_mobile : false
      });
    } else {
      resetForm();
    }
  }, [editingMenu]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const result = await menuService.listMenus();
      if (result.success) {
        setMenus(result.data || []);
      } else {
        toastService.error(result.error || 'Failed to load menus');
      }
    } catch (error) {
      console.error('Error loading menus:', error);
      toastService.error('Error loading menus');
    } finally {
      setLoading(false);
    }
  };

  const loadSectionOptions = async () => {
    try {
      const result = await menuService.getSectionsForMenu();
      if (result.success) {
        const options = result.data || [];
        console.log('Loaded section options:', options);
        setSectionOptions(options);
      } else {
        console.error('Failed to load section options:', result.error);
        toastService.error(result.error || 'Failed to load sections');
      }
    } catch (error) {
      console.error('Error loading section options:', error);
      toastService.error('Error loading section options');
    }
  };

  const resetForm = () => {
    setFormData({
      menu_type: 'section',
      section_id: '',
      label: '',
      icon: '',
      link_url: '',
      sort_order: menus.length + 1,
      is_visible: true,
      show_in_header: false,
      show_in_footer: false,
      show_in_mobile: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const menuData = { ...formData };
      
      // Clear section_id if menu_type is not 'section'
      if (menuData.menu_type !== 'section') {
        menuData.section_id = '';
      }

      let result;
      if (editingMenu) {
        result = await menuService.updateMenu(editingMenu.id, menuData);
      } else {
        result = await menuService.createMenu(menuData);
      }

      if (result.success) {
        toastService.success(`Menu ${editingMenu ? 'updated' : 'created'} successfully!`);
        await loadMenus();
        setShowForm(false);
        setEditingMenu(null);
        resetForm();
      } else {
        toastService.error(result.error || 'Failed to save menu');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      toastService.error('Error saving menu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await menuService.deleteMenu(menuId);
      if (result.success) {
        toastService.success('Menu deleted successfully!');
        await loadMenus();
      } else {
        toastService.error(result.error || 'Failed to delete menu');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toastService.error('Error deleting menu');
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const filteredMenus = getFilteredMenus();
    const draggedItem = filteredMenus[draggedIndex];
    const newMenus = [...filteredMenus];
    newMenus.splice(draggedIndex, 1);
    newMenus.splice(dropIndex, 0, draggedItem);
    
    // Update sort_order based on new position
    // We need to update all menus, not just filtered ones
    const allMenuIds = menus.map(m => m.id);
    const reorderedIds = newMenus.map(m => m.id);
    
    // Create mapping of new positions
    const updatedMenus = menus.map((menu) => {
      const newIndex = reorderedIds.indexOf(menu.id);
      if (newIndex !== -1) {
        // Menu is in filtered list, use new position
        return {
          id: menu.id,
          sort_order: newIndex + 1
        };
      }
      // Menu not in filtered list, keep original sort_order
      return {
        id: menu.id,
        sort_order: menu.sort_order
      };
    });

    // Update all menus with new sort orders
    await handleReorder(updatedMenus);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleReorder = async (reorderedMenus) => {
    try {
      const result = await menuService.reorderMenus(reorderedMenus);
      if (result.success) {
        await loadMenus();
      } else {
        toastService.error('Failed to reorder menus');
      }
    } catch (error) {
      console.error('Error reordering menus:', error);
      toastService.error('Error reordering menus');
    }
  };

  const getFilteredMenus = () => {
    if (locationFilter === 'all') {
      return menus;
    }
    const locationField = locationFilter === 'header' ? 'show_in_header' : 
                         locationFilter === 'footer' ? 'show_in_footer' : 'show_in_mobile';
    return menus.filter(menu => menu[locationField]);
  };

  const getMenuTypeLabel = (type) => {
    const labels = {
      'section': 'Section',
      'contact': 'Contact',
      'start_project': 'Start Project',
      'call': 'Call',
      'social_facebook': 'Facebook',
      'social_linkedin': 'LinkedIn',
      'social_github': 'GitHub',
      'social_instagram': 'Instagram'
    };
    return labels[type] || type;
  };

  const getLocationBadges = (menu) => {
    const locations = [];
    if (menu.show_in_header) locations.push('Header');
    if (menu.show_in_footer) locations.push('Footer');
    if (menu.show_in_mobile) locations.push('Mobile');
    return locations.length > 0 ? locations.join(', ') : 'None';
  };

  if (showForm) {
    return (
      <div className="menus-manager">
        <div className="section-header">
          <h2>🔗 {editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          <button 
            className="btn-secondary"
            onClick={() => {
              setShowForm(false);
              setEditingMenu(null);
              resetForm();
            }}
          >
            ← Back to Menus
          </button>
        </div>

        <form onSubmit={handleSubmit} className="section-form">
          <div className="form-fields-grid">
            {/* Menu Type */}
            <div className="form-group">
              <label htmlFor="menu_type">Menu Type *</label>
              <select
                id="menu_type"
                name="menu_type"
                value={formData.menu_type}
                onChange={handleInputChange}
                required
              >
                <option value="section">Section</option>
                <option value="contact">Contact</option>
                <option value="start_project">Start Project</option>
                <option value="call">Call</option>
                <option value="social_facebook">Facebook</option>
                <option value="social_linkedin">LinkedIn</option>
                <option value="social_github">GitHub</option>
                <option value="social_instagram">Instagram</option>
              </select>
            </div>

            {/* Section ID - Only show for section type */}
            {formData.menu_type === 'section' && (
              <div className="form-group">
                <label htmlFor="section_id">Section *</label>
                <select
                  id="section_id"
                  name="section_id"
                  value={formData.section_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a section</option>
                  {sectionOptions.length === 0 ? (
                    <option value="" disabled>Loading sections...</option>
                  ) : (
                    sectionOptions.map(option => {
                      // For dynamic sections, use section_id (UUID) if available, otherwise use id
                      // For hardcoded sections, use id directly
                      const value = option.section_id || option.id;
                      return (
                        <option key={option.id} value={value}>
                          {option.title} ({option.type === 'hardcoded' ? 'Hardcoded' : 'Dynamic'})
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            )}

            {/* Label */}
            <div className="form-group">
              <label htmlFor="label">Label *</label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="Enter menu label"
                required
              />
            </div>

            {/* Icon */}
            <div className="form-group">
              <label htmlFor="icon">Icon (Optional)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="e.g., 📊, 🏠, or select from suggestions"
                  style={{ flex: 1 }}
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({ ...prev, icon: e.target.value }));
                      e.target.value = ''; // Reset dropdown
                    }
                  }}
                  style={{ width: 'auto', padding: '8px' }}
                  title="Select an icon"
                >
                  <option value="">Choose icon...</option>
                  <optgroup label="Common">
                    <option value="🏠">🏠 Home</option>
                    <option value="📊">📊 Portfolio</option>
                    <option value="💼">💼 Work</option>
                    <option value="📧">📧 Contact</option>
                    <option value="📱">📱 Mobile</option>
                    <option value="🔗">🔗 Link</option>
                    <option value="⭐">⭐ Star</option>
                    <option value="🎯">🎯 Target</option>
                  </optgroup>
                  <optgroup label="Navigation">
                    <option value="🏡">🏡 Home</option>
                    <option value="📋">📋 About</option>
                    <option value="🛠️">🛠️ Services</option>
                    <option value="📞">📞 Phone</option>
                    <option value="✉️">✉️ Email</option>
                    <option value="📍">📍 Location</option>
                    <option value="🔍">🔍 Search</option>
                    <option value="☰">☰ Menu</option>
                  </optgroup>
                  <optgroup label="Social">
                    <option value="📘">📘 Facebook</option>
                    <option value="💼">💼 LinkedIn</option>
                    <option value="🐙">🐙 GitHub</option>
                    <option value="📷">📷 Instagram</option>
                    <option value="🐦">🐦 Twitter</option>
                    <option value="▶️">▶️ YouTube</option>
                  </optgroup>
                  <optgroup label="Actions">
                    <option value="➕">➕ Add</option>
                    <option value="✏️">✏️ Edit</option>
                    <option value="🗑️">🗑️ Delete</option>
                    <option value="💾">💾 Save</option>
                    <option value="📤">📤 Send</option>
                    <option value="⬇️">⬇️ Download</option>
                    <option value="⬆️">⬆️ Upload</option>
                  </optgroup>
                  <optgroup label="Status">
                    <option value="✅">✅ Check</option>
                    <option value="❌">❌ Close</option>
                    <option value="⚠️">⚠️ Warning</option>
                    <option value="ℹ️">ℹ️ Info</option>
                    <option value="💡">💡 Idea</option>
                    <option value="🔥">🔥 Hot</option>
                    <option value="⭐">⭐ Favorite</option>
                  </optgroup>
                </select>
              </div>
              <small className="form-help">Emoji or icon identifier. You can type directly or select from suggestions.</small>
            </div>

            {/* Link URL - For social links */}
            {(formData.menu_type === 'social_facebook' || 
              formData.menu_type === 'social_linkedin' || 
              formData.menu_type === 'social_github' || 
              formData.menu_type === 'social_instagram') && (
              <div className="form-group">
                <label htmlFor="link_url">Link URL *</label>
                <input
                  type="url"
                  id="link_url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  required
                />
              </div>
            )}

            {/* Sort Order */}
            <div className="form-group">
              <label htmlFor="sort_order">Sort Order</label>
              <input
                type="number"
                id="sort_order"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                min="1"
              />
              <small className="form-help">Lower numbers appear first. You can also drag to reorder.</small>
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
                Visible
              </label>
              <small className="form-help">Uncheck to hide this menu item</small>
            </div>

            {/* Location Checkboxes */}
            <div className="form-group">
              <label>Show In:</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="show_in_header"
                    checked={formData.show_in_header}
                    onChange={handleInputChange}
                  />
                  Header
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="show_in_footer"
                    checked={formData.show_in_footer}
                    onChange={handleInputChange}
                  />
                  Footer
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="show_in_mobile"
                    checked={formData.show_in_mobile}
                    onChange={handleInputChange}
                  />
                  Mobile Nav
                </label>
              </div>
              <small className="form-help">Select where this menu item should appear</small>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingMenu(null);
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
              {loading ? 'Saving...' : (editingMenu ? 'Update Menu' : 'Create Menu')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (loading && menus.length === 0) {
    return (
      <div className="menus-manager">
        <div className="section-header">
          <h2>🔗 Menus</h2>
          <p>Loading menus...</p>
        </div>
      </div>
    );
  }

  const filteredMenus = getFilteredMenus();

  return (
    <div className="menus-manager">
      <div className="section-header">
        <div className="header-content">
          <h2>🔗 Menus</h2>
          <p>Manage your navigation menu items</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setEditingMenu(null);
              setShowForm(true);
            }}
          >
            ➕ Add New Menu Item
          </button>
        </div>
      </div>

      {/* Location Filter */}
      <div className="filter-bar">
        <label>Filter by location:</label>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Locations</option>
          <option value="header">Header</option>
          <option value="footer">Footer</option>
          <option value="mobile">Mobile Nav</option>
        </select>
      </div>

      {filteredMenus.length === 0 ? (
        <div className="empty-state">
          <p>No menu items yet. Create your first menu item to get started!</p>
        </div>
      ) : (
        <div className="menus-list">
          {filteredMenus.map((menu, index) => (
            <div
              key={menu.id}
              className={`menu-card ${draggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="menu-drag-handle">⋮⋮</div>
              <div className="menu-info">
                <h3>{menu.label || getMenuTypeLabel(menu.menu_type)}</h3>
                <p>
                  Type: {getMenuTypeLabel(menu.menu_type)} | 
                  {menu.menu_type === 'section' && menu.section_id && ` Section: ${menu.section_id} |`}
                  {' '}Locations: {getLocationBadges(menu)} | 
                  {' '}Sort: {menu.sort_order} | 
                  {' '}{menu.is_visible ? '✅ Visible' : '❌ Hidden'}
                </p>
              </div>
              <div className="menu-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingMenu(menu);
                    setShowForm(true);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(menu.id)}
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

export default MenusManager;

