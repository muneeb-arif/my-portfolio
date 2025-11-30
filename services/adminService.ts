import { executeQuery } from '@/lib/database';
import { AdminSection, AdminSectionPermission, UserAdminPermissions, DbResult } from '@/types';

export class AdminService {
  // Get all admin sections
  static async getAllAdminSections(): Promise<DbResult<AdminSection[]>> {
    const query = `
      SELECT * FROM admin_sections 
      WHERE is_active = TRUE 
      ORDER BY sort_order ASC
    `;
    
    const result = await executeQuery(query);
    if (result.success && result.data && Array.isArray(result.data)) {
      return { success: true, data: result.data as AdminSection[] };
    }
    return { success: false, error: 'Failed to fetch admin sections' };
  }

  // Get admin sections by user ID
  static async getAdminSectionsByUserId(userId: string): Promise<DbResult<AdminSection[]>> {
    const query = `
      SELECT s.* 
      FROM admin_sections s
      JOIN admin_section_permissions p ON s.id = p.section_id
      WHERE p.user_id = ? AND p.can_access = TRUE AND s.is_active = TRUE
      ORDER BY s.sort_order ASC
    `;
    
    const result = await executeQuery(query, [userId]);
    if (result.success && result.data && Array.isArray(result.data)) {
      return { success: true, data: result.data as AdminSection[] };
    }
    return { success: false, error: 'Failed to fetch user admin sections' };
  }

  // Get user admin permissions
  static async getUserAdminPermissions(userId: string): Promise<DbResult<UserAdminPermissions>> {
    const query = `
      SELECT 
        s.*,
        p.can_access,
        p.can_edit,
        p.can_delete
      FROM admin_sections s
      LEFT JOIN admin_section_permissions p ON s.id = p.section_id AND p.user_id = ?
      WHERE s.is_active = TRUE
      ORDER BY s.sort_order ASC
    `;
    
    const result = await executeQuery(query, [userId]);
    
    if (result.success && result.data && Array.isArray(result.data)) {
      const sections = result.data.map((row: any) => ({
        id: row.id,
        section_key: row.section_key,
        section_name: row.section_name,
        section_description: row.section_description,
        icon: row.icon,
        route_path: row.route_path,
        is_active: row.is_active,
        sort_order: row.sort_order,
        created_at: row.created_at,
        updated_at: row.updated_at
      })) as AdminSection[];

      const permissions = result.data
        .filter((row: any) => row.can_access !== null)
        .map((row: any) => ({
          id: row.permission_id || '',
          user_id: userId,
          section_id: row.id,
          can_access: row.can_access,
          can_edit: row.can_edit,
          can_delete: row.can_delete,
          created_at: row.permission_created_at || new Date(),
          updated_at: row.permission_updated_at || new Date()
        })) as AdminSectionPermission[];

      return { 
        success: true, 
        data: { sections, permissions } as UserAdminPermissions 
      };
    }
    return { success: false, error: 'Failed to fetch user admin permissions' };
  }

  // Check if user has access to a specific admin section
  static async hasSectionAccess(userId: string, sectionKey: string): Promise<DbResult<boolean>> {
    const query = `
      SELECT COUNT(*) as count
      FROM admin_sections s
      JOIN admin_section_permissions p ON s.id = p.section_id
      WHERE p.user_id = ? AND s.section_key = ? AND p.can_access = TRUE AND s.is_active = TRUE
    `;
    
    const result = await executeQuery(query, [userId, sectionKey]);
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const row = result.data[0] as any;
      return { success: true, data: row.count > 0 };
    }
    return { success: false, error: 'Failed to check section access' };
  }

  // Grant admin section permissions to user
  static async grantSectionPermissions(
    userId: string, 
    sectionId: string, 
    permissions: { can_access?: boolean; can_edit?: boolean; can_delete?: boolean }
  ): Promise<DbResult<boolean>> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO admin_section_permissions (id, user_id, section_id, can_access, can_edit, can_delete, created_at, updated_at)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        can_access = VALUES(can_access),
        can_edit = VALUES(can_edit),
        can_delete = VALUES(can_delete),
        updated_at = VALUES(updated_at)
    `;
    
    const result = await executeQuery(query, [
      userId,
      sectionId,
      permissions.can_access || false,
      permissions.can_edit || false,
      permissions.can_delete || false,
      now,
      now
    ]);
    
    return { success: result.success, data: result.success };
  }

  // Revoke admin section permissions from user
  static async revokeSectionPermissions(userId: string, sectionId: string): Promise<DbResult<boolean>> {
    const query = 'DELETE FROM admin_section_permissions WHERE user_id = ? AND section_id = ?';
    const result = await executeQuery(query, [userId, sectionId]);
    return { success: result.success, data: result.success };
  }

  // Get admin section by key
  static async getAdminSectionByKey(sectionKey: string): Promise<DbResult<AdminSection>> {
    const query = 'SELECT * FROM admin_sections WHERE section_key = ? AND is_active = TRUE';
    const result = await executeQuery(query, [sectionKey]);
    
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return { success: true, data: result.data[0] as AdminSection };
    }
    return { success: false, error: 'Admin section not found' };
  }

  // Create new admin section
  static async createAdminSection(section: Omit<AdminSection, 'id' | 'created_at' | 'updated_at'>): Promise<DbResult<AdminSection>> {
    const sectionId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO admin_sections (id, section_key, section_name, section_description, icon, route_path, is_active, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      sectionId,
      section.section_key,
      section.section_name,
      section.section_description,
      section.icon,
      section.route_path,
      section.is_active,
      section.sort_order,
      now,
      now
    ]);
    
    if (result.success) {
      return this.getAdminSectionByKey(section.section_key);
    }
    return { success: false, error: 'Failed to create admin section' };
  }

  // Update admin section
  static async updateAdminSection(sectionId: string, updates: Partial<AdminSection>): Promise<DbResult<AdminSection>> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      UPDATE admin_sections SET 
        section_key = COALESCE(?, section_key),
        section_name = COALESCE(?, section_name),
        section_description = COALESCE(?, section_description),
        icon = COALESCE(?, icon),
        route_path = COALESCE(?, route_path),
        is_active = COALESCE(?, is_active),
        sort_order = COALESCE(?, sort_order),
        updated_at = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [
      updates.section_key,
      updates.section_name,
      updates.section_description,
      updates.icon,
      updates.route_path,
      updates.is_active,
      updates.sort_order,
      now,
      sectionId
    ]);
    
    if (result.success) {
      const sectionResult = await executeQuery('SELECT * FROM admin_sections WHERE id = ?', [sectionId]);
      if (sectionResult.success && sectionResult.data && Array.isArray(sectionResult.data) && sectionResult.data.length > 0) {
        return { success: true, data: sectionResult.data[0] as AdminSection };
      }
    }
    return { success: false, error: 'Failed to update admin section' };
  }

  // Delete admin section
  static async deleteAdminSection(sectionId: string): Promise<DbResult<boolean>> {
    const query = 'DELETE FROM admin_sections WHERE id = ?';
    const result = await executeQuery(query, [sectionId]);
    return { success: result.success, data: result.success };
  }
} 