import { executeQuery } from '@/lib/database';
import { DbResult } from '@/types';

export interface Menu {
  id: string;
  user_id: string;
  menu_type: 'section' | 'contact' | 'start_project' | 'call' | 'social_facebook' | 'social_linkedin' | 'social_github' | 'social_instagram';
  section_id?: string;
  label: string;
  icon?: string;
  link_url?: string;
  sort_order: number;
  is_visible: boolean;
  show_in_header: boolean;
  show_in_footer: boolean;
  show_in_mobile: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMenuRequest {
  menu_type: 'section' | 'contact' | 'start_project' | 'call' | 'social_facebook' | 'social_linkedin' | 'social_github' | 'social_instagram';
  section_id?: string;
  label: string;
  icon?: string;
  link_url?: string;
  sort_order?: number;
  is_visible?: boolean;
  show_in_header?: boolean;
  show_in_footer?: boolean;
  show_in_mobile?: boolean;
}

export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {
  id: string;
}

export class MenuService {
  // Get all menus for a user, ordered by sort_order
  static async getAllMenus(userId: string): Promise<DbResult<Menu[]>> {
    const query = `
      SELECT * FROM menus 
      WHERE user_id = ? 
      ORDER BY sort_order ASC, created_at ASC
    `;
    
    const result = await executeQuery(query, [userId]);
    if (result.success && result.data && Array.isArray(result.data)) {
      const menus = result.data.map((row: any) => this.parseMenu(row));
      return { success: true, data: menus as Menu[] };
    }
    return { success: false, error: 'Failed to fetch menus' };
  }

  // Get menus by location
  static async getMenusByLocation(userId: string, location: 'header' | 'footer' | 'mobile'): Promise<DbResult<Menu[]>> {
    const locationField = location === 'header' ? 'show_in_header' : location === 'footer' ? 'show_in_footer' : 'show_in_mobile';
    const query = `
      SELECT * FROM menus 
      WHERE user_id = ? AND ${locationField} = TRUE AND is_visible = TRUE
      ORDER BY sort_order ASC, created_at ASC
    `;
    
    const result = await executeQuery(query, [userId]);
    if (result.success && result.data && Array.isArray(result.data)) {
      const menus = result.data.map((row: any) => this.parseMenu(row));
      return { success: true, data: menus as Menu[] };
    }
    return { success: false, error: 'Failed to fetch menus' };
  }

  // Get single menu by ID
  static async getMenuById(menuId: string): Promise<DbResult<Menu>> {
    const query = 'SELECT * FROM menus WHERE id = ?';
    const result = await executeQuery(query, [menuId]);
    
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const menu = this.parseMenu(result.data[0]);
      return { success: true, data: menu as Menu };
    }
    return { success: false, error: 'Menu not found' };
  }

  // Create new menu
  static async createMenu(userId: string, menu: CreateMenuRequest): Promise<DbResult<Menu>> {
    const validationError = this.validateMenu(menu);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const menuId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = `
      INSERT INTO menus (
        id, user_id, menu_type, section_id, label, icon, link_url,
        sort_order, is_visible, show_in_header, show_in_footer, show_in_mobile,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      menuId,
      userId,
      menu.menu_type,
      menu.section_id || null,
      menu.label,
      menu.icon || null,
      menu.link_url || null,
      menu.sort_order || 1,
      menu.is_visible !== undefined ? menu.is_visible : true,
      menu.show_in_header !== undefined ? menu.show_in_header : false,
      menu.show_in_footer !== undefined ? menu.show_in_footer : false,
      menu.show_in_mobile !== undefined ? menu.show_in_mobile : false,
      now,
      now
    ]);
    
    if (result.success) {
      return this.getMenuById(menuId);
    }
    return { success: false, error: 'Failed to create menu' };
  }

  // Update menu
  static async updateMenu(userId: string, menuId: string, menu: UpdateMenuRequest): Promise<DbResult<Menu>> {
    // Check if menu exists and belongs to user
    const existingMenu = await this.getMenuById(menuId);
    if (!existingMenu.success || !existingMenu.data) {
      return { success: false, error: 'Menu not found' };
    }

    if (existingMenu.data.user_id !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validationError = menu.menu_type ? this.validateMenu(menu as CreateMenuRequest) : null;
    if (validationError) {
      return { success: false, error: validationError };
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (menu.menu_type !== undefined) updates.push('menu_type = ?'), values.push(menu.menu_type);
    if (menu.section_id !== undefined) updates.push('section_id = ?'), values.push(menu.section_id || null);
    if (menu.label !== undefined) updates.push('label = ?'), values.push(menu.label);
    if (menu.icon !== undefined) updates.push('icon = ?'), values.push(menu.icon || null);
    if (menu.link_url !== undefined) updates.push('link_url = ?'), values.push(menu.link_url || null);
    if (menu.sort_order !== undefined) updates.push('sort_order = ?'), values.push(menu.sort_order);
    if (menu.is_visible !== undefined) updates.push('is_visible = ?'), values.push(menu.is_visible);
    if (menu.show_in_header !== undefined) updates.push('show_in_header = ?'), values.push(menu.show_in_header);
    if (menu.show_in_footer !== undefined) updates.push('show_in_footer = ?'), values.push(menu.show_in_footer);
    if (menu.show_in_mobile !== undefined) updates.push('show_in_mobile = ?'), values.push(menu.show_in_mobile);

    updates.push('updated_at = ?');
    values.push(now);
    values.push(menuId);
    values.push(userId);

    const query = `UPDATE menus SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    
    const result = await executeQuery(query, values);
    
    if (result.success) {
      return this.getMenuById(menuId);
    }
    return { success: false, error: 'Failed to update menu' };
  }

  // Delete menu
  static async deleteMenu(userId: string, menuId: string): Promise<DbResult<boolean>> {
    // Check if menu exists and belongs to user
    const existingMenu = await this.getMenuById(menuId);
    if (!existingMenu.success || !existingMenu.data) {
      return { success: false, error: 'Menu not found' };
    }

    if (existingMenu.data.user_id !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const query = 'DELETE FROM menus WHERE id = ? AND user_id = ?';
    const result = await executeQuery(query, [menuId, userId]);
    
    if (result.success) {
      return { success: true, data: true };
    }
    return { success: false, error: 'Failed to delete menu' };
  }

  // Reorder menus
  static async reorderMenus(userId: string, menus: {id: string, sort_order: number}[]): Promise<DbResult<boolean>> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Update each menu's sort_order
    const updatePromises = menus.map(menu => {
      const query = 'UPDATE menus SET sort_order = ?, updated_at = ? WHERE id = ? AND user_id = ?';
      return executeQuery(query, [menu.sort_order, now, menu.id, userId]);
    });

    const results = await Promise.all(updatePromises);
    const allSuccess = results.every(r => r.success);

    return { success: allSuccess, data: allSuccess };
  }

  // Get sections list for menu dropdown (same as dynamic sections positioning)
  static async getSectionsForMenu(userId: string): Promise<DbResult<Array<{id: string, section_id?: string, title: string, type: string}>>> {
    // Import DynamicSectionService to reuse the same logic
    const { DynamicSectionService } = await import('./dynamicSectionService');
    return DynamicSectionService.getSectionsForPositioning(userId);
  }

  // Validate menu data
  static validateMenu(menu: CreateMenuRequest): string | null {
    if (!menu.menu_type) {
      return 'Menu type is required';
    }

    if (!menu.label || menu.label.trim().length === 0) {
      return 'Label is required';
    }

    if (menu.menu_type === 'section' && !menu.section_id) {
      return 'Section ID is required for section menu type';
    }

    if ((menu.menu_type === 'social_facebook' || menu.menu_type === 'social_linkedin' || 
         menu.menu_type === 'social_github' || menu.menu_type === 'social_instagram') && !menu.link_url) {
      return 'Link URL is required for social menu types';
    }

    return null;
  }

  // Parse menu from database row
  static parseMenu(row: any): Menu {
    return {
      id: row.id,
      user_id: row.user_id,
      menu_type: row.menu_type,
      section_id: row.section_id || undefined,
      label: row.label,
      icon: row.icon || undefined,
      link_url: row.link_url || undefined,
      sort_order: row.sort_order || 1,
      is_visible: row.is_visible !== undefined ? Boolean(row.is_visible) : true,
      show_in_header: row.show_in_header !== undefined ? Boolean(row.show_in_header) : false,
      show_in_footer: row.show_in_footer !== undefined ? Boolean(row.show_in_footer) : false,
      show_in_mobile: row.show_in_mobile !== undefined ? Boolean(row.show_in_mobile) : false,
      created_at: row.created_at ? new Date(row.created_at) : new Date(),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
    };
  }
}

