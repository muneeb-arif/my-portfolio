import { executeQuery } from '@/lib/database';
import { DynamicSection, CreateDynamicSectionRequest, UpdateDynamicSectionRequest, DbResult, AccordionItem } from '@/types';

export class DynamicSectionService {
  // Get all sections for a user, ordered by sort_order
  static async getAllSections(userId: string): Promise<DbResult<DynamicSection[]>> {
    const query = `
      SELECT * FROM dynamic_sections 
      WHERE user_id = ? 
      ORDER BY sort_order ASC, created_at ASC
    `;
    
    const result = await executeQuery(query, [userId]);
    if (result.success && result.data && Array.isArray(result.data)) {
      // Parse JSON fields
      const sections = result.data.map((row: any) => this.parseSection(row));
      return { success: true, data: sections as DynamicSection[] };
    }
    return { success: false, error: 'Failed to fetch dynamic sections' };
  }

  // Get single section by ID
  static async getSectionById(sectionId: string): Promise<DbResult<DynamicSection>> {
    const query = 'SELECT * FROM dynamic_sections WHERE id = ?';
    const result = await executeQuery(query, [sectionId]);
    
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const section = this.parseSection(result.data[0]);
      return { success: true, data: section as DynamicSection };
    }
    return { success: false, error: 'Dynamic section not found' };
  }

  // Create new section
  static async createSection(userId: string, section: CreateDynamicSectionRequest): Promise<DbResult<DynamicSection>> {
    // Validate section data
    const validationError = this.validateSection(section);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const sectionId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Parse accordion_items to JSON string
    const accordionItemsJson = section.accordion_items 
      ? JSON.stringify(section.accordion_items) 
      : null;

    // Sanitize HTML content
    const sanitizedContent = section.content ? this.sanitizeHtml(section.content) : null;

    const query = `
      INSERT INTO dynamic_sections (
        id, user_id, section_type, title, subtitle, content, image_url, video_url,
        alignment, position_after, is_visible, sort_order, section_id,
        background_color, background_image_url, padding_top, padding_bottom,
        cta_button_text, cta_button_link, cta_button_target, cta_button_style,
        embed_type, embed_url, embed_code, accordion_items,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      sectionId,
      userId,
      section.section_type,
      section.title || null,
      section.subtitle || null,
      sanitizedContent,
      section.image_url || null,
      section.video_url || null,
      section.alignment || 'center',
      section.position_after || null,
      section.is_visible !== undefined ? section.is_visible : true,
      section.sort_order || 1,
      section.section_id || null,
      section.background_color || null,
      section.background_image_url || null,
      section.padding_top !== undefined ? section.padding_top : 80,
      section.padding_bottom !== undefined ? section.padding_bottom : 80,
      section.cta_button_text || null,
      section.cta_button_link || null,
      section.cta_button_target || '_self',
      section.cta_button_style || 'primary',
      section.embed_type || null,
      section.embed_url || null,
      section.embed_code || null,
      accordionItemsJson,
      now,
      now
    ]);
    
    if (result.success) {
      return this.getSectionById(sectionId);
    }
    return { success: false, error: 'Failed to create dynamic section' };
  }

  // Update section
  static async updateSection(sectionId: string, userId: string, updates: UpdateDynamicSectionRequest): Promise<DbResult<DynamicSection>> {
    // Validate updates
    const validationError = this.validateSection(updates);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.section_type !== undefined) {
      updateFields.push('section_type = ?');
      updateValues.push(updates.section_type);
    }
    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title || null);
    }
    if (updates.subtitle !== undefined) {
      updateFields.push('subtitle = ?');
      updateValues.push(updates.subtitle || null);
    }
    if (updates.content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(updates.content ? this.sanitizeHtml(updates.content) : null);
    }
    if (updates.image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(updates.image_url || null);
    }
    if (updates.video_url !== undefined) {
      updateFields.push('video_url = ?');
      updateValues.push(updates.video_url || null);
    }
    if (updates.alignment !== undefined) {
      updateFields.push('alignment = ?');
      updateValues.push(updates.alignment);
    }
    if (updates.position_after !== undefined) {
      updateFields.push('position_after = ?');
      updateValues.push(updates.position_after || null);
    }
    if (updates.is_visible !== undefined) {
      updateFields.push('is_visible = ?');
      updateValues.push(updates.is_visible);
    }
    if (updates.sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      updateValues.push(updates.sort_order);
    }
    if (updates.section_id !== undefined) {
      updateFields.push('section_id = ?');
      updateValues.push(updates.section_id || null);
    }
    if (updates.background_color !== undefined) {
      updateFields.push('background_color = ?');
      updateValues.push(updates.background_color || null);
    }
    if (updates.background_image_url !== undefined) {
      updateFields.push('background_image_url = ?');
      updateValues.push(updates.background_image_url || null);
    }
    if (updates.padding_top !== undefined) {
      updateFields.push('padding_top = ?');
      updateValues.push(updates.padding_top);
    }
    if (updates.padding_bottom !== undefined) {
      updateFields.push('padding_bottom = ?');
      updateValues.push(updates.padding_bottom);
    }
    if (updates.cta_button_text !== undefined) {
      updateFields.push('cta_button_text = ?');
      updateValues.push(updates.cta_button_text || null);
    }
    if (updates.cta_button_link !== undefined) {
      updateFields.push('cta_button_link = ?');
      updateValues.push(updates.cta_button_link || null);
    }
    if (updates.cta_button_target !== undefined) {
      updateFields.push('cta_button_target = ?');
      updateValues.push(updates.cta_button_target);
    }
    if (updates.cta_button_style !== undefined) {
      updateFields.push('cta_button_style = ?');
      updateValues.push(updates.cta_button_style);
    }
    if (updates.embed_type !== undefined) {
      updateFields.push('embed_type = ?');
      updateValues.push(updates.embed_type || null);
    }
    if (updates.embed_url !== undefined) {
      updateFields.push('embed_url = ?');
      updateValues.push(updates.embed_url || null);
    }
    if (updates.embed_code !== undefined) {
      updateFields.push('embed_code = ?');
      updateValues.push(updates.embed_code || null);
    }
    if (updates.accordion_items !== undefined) {
      updateFields.push('accordion_items = ?');
      updateValues.push(updates.accordion_items ? JSON.stringify(updates.accordion_items) : null);
    }

    if (updateFields.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(sectionId);
    updateValues.push(userId);

    const query = `
      UPDATE dynamic_sections 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await executeQuery(query, updateValues);
    
    if (result.success) {
      return this.getSectionById(sectionId);
    }
    return { success: false, error: 'Failed to update dynamic section' };
  }

  // Delete section
  static async deleteSection(sectionId: string, userId: string): Promise<DbResult<boolean>> {
    try {
      // First, verify the section exists and belongs to the user
      const checkQuery = 'SELECT id FROM dynamic_sections WHERE id = ? AND user_id = ?';
      const checkResult = await executeQuery(checkQuery, [sectionId, userId]);
      
      if (!checkResult.success) {
        return { success: false, error: 'Database error while checking section' };
      }
      
      if (!checkResult.data || (Array.isArray(checkResult.data) && checkResult.data.length === 0)) {
        return { success: false, error: 'Section not found or you do not have permission to delete it' };
      }

      // Update any sections that reference this section in position_after
      const updateQuery = `
        UPDATE dynamic_sections 
        SET position_after = NULL 
        WHERE position_after = ? AND user_id = ?
      `;
      await executeQuery(updateQuery, [sectionId, userId]);

      // Then delete the section
      // Note: We need to use executeQuery which returns [rows], but for DELETE we need affectedRows
      // Since executeQuery only returns rows, we'll check the existence first (above)
      // and if it exists, the delete should work
      const deleteQuery = 'DELETE FROM dynamic_sections WHERE id = ? AND user_id = ?';
      const deleteResult = await executeQuery(deleteQuery, [sectionId, userId]);
      
      if (!deleteResult.success) {
        return { success: false, error: deleteResult.error || 'Failed to delete section' };
      }
      
      // Since we already verified the section exists above, if deleteResult.success is true,
      // the deletion should have worked. The executeQuery function doesn't expose affectedRows,
      // but since we verified existence first, we can trust the deletion succeeded.
      return { success: true, data: true };
    } catch (error) {
      console.error('Delete section error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Reorder sections (bulk update)
  static async reorderSections(userId: string, sections: {id: string, sort_order: number}[]): Promise<DbResult<boolean>> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Update each section's sort_order
    const updatePromises = sections.map(section => {
      const query = `
        UPDATE dynamic_sections 
        SET sort_order = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `;
      return executeQuery(query, [section.sort_order, now, section.id, userId]);
    });

    const results = await Promise.all(updatePromises);
    const allSuccess = results.every(r => r.success);
    
    return { success: allSuccess, data: allSuccess };
  }

  // Get sections list for positioning dropdown
  static async getSectionsForPositioning(userId: string): Promise<DbResult<Array<{id: string, section_id?: string, title: string, type: string}>>> {
    // Get hardcoded section keys
    const hardcodedSections = [
      { id: 'hero', title: 'Hero Section', type: 'hardcoded' },
      { id: 'portfolio', title: 'Portfolio Section', type: 'hardcoded' },
      { id: 'technologies', title: 'Technologies Section', type: 'hardcoded' },
      { id: 'domains', title: 'Domains & Niche Section', type: 'hardcoded' },
      { id: 'projectCycle', title: 'Project Life Cycle', type: 'hardcoded' },
      { id: 'prompts', title: 'Prompts Section', type: 'hardcoded' },
      { id: 'gallery', title: 'Gallery Section', type: 'hardcoded' },
      { id: 'footer', title: 'Footer', type: 'hardcoded' }
    ];

    // Get dynamic sections
    const dynamicResult = await this.getAllSections(userId);
    const dynamicSections = dynamicResult.success && dynamicResult.data
      ? dynamicResult.data.map(s => ({
          id: s.id,
          section_id: s.section_id || undefined,
          title: s.title || `Dynamic Section (${s.section_type})`,
          type: 'dynamic'
        }))
      : [];

    return {
      success: true,
      data: [...hardcodedSections, ...dynamicSections]
    };
  }

  // Validate section data
  static validateSection(section: CreateDynamicSectionRequest | UpdateDynamicSectionRequest): string | null {
    // Title/Subtitle validation
    if (section.title && section.title.length > 500) {
      return 'Title must be 500 characters or less';
    }
    if (section.subtitle && section.subtitle.length > 500) {
      return 'Subtitle must be 500 characters or less';
    }

    // Content validation
    if (section.content && section.content.length > 10000) {
      return 'Content must be 10,000 characters or less';
    }

    // Section type specific validation
    if (section.section_type) {
      switch (section.section_type) {
        case 'title':
        case 'subtitle':
          if (!section.title) {
            return `${section.section_type} type requires a title`;
          }
          break;
        case 'image_text':
        case 'text_image':
          if (!section.image_url) {
            return 'Image + Text sections require an image URL';
          }
          if (!section.content) {
            return 'Image + Text sections require content';
          }
          break;
        case 'image_only':
          if (!section.image_url) {
            return 'Image Only sections require an image URL';
          }
          break;
        case 'video_only':
          if (!section.video_url && !section.embed_url) {
            return 'Video Only sections require a video URL or embed URL';
          }
          break;
        case 'text_only':
          if (!section.content) {
            return 'Text Only sections require content';
          }
          break;
        case 'accordion':
          if (!section.accordion_items || section.accordion_items.length === 0) {
            return 'Accordion sections require at least one accordion item';
          }
          break;
        case 'social_embed':
        case 'map_embed':
          if (!section.embed_url) {
            return `${section.section_type} sections require an embed URL`;
          }
          break;
        case 'custom_html':
          if (!section.embed_code) {
            return 'Custom HTML sections require embed code';
          }
          break;
      }
    }

    // URL validation
    if (section.image_url && !this.isValidUrl(section.image_url)) {
      return 'Image URL must be a valid URL';
    }
    if (section.video_url && !this.isValidUrl(section.video_url)) {
      return 'Video URL must be a valid URL';
    }
    if (section.embed_url && !this.isValidUrl(section.embed_url)) {
      return 'Embed URL must be a valid URL';
    }
    if (section.background_image_url && !this.isValidUrl(section.background_image_url)) {
      return 'Background image URL must be a valid URL';
    }

    // Color validation
    if (section.background_color && !/^#[0-9A-Fa-f]{6}$/.test(section.background_color)) {
      return 'Background color must be a valid hex color (e.g., #F5F1EB)';
    }

    // Padding validation
    if (section.padding_top !== undefined && (section.padding_top < 0 || section.padding_top > 500)) {
      return 'Padding top must be between 0 and 500 pixels';
    }
    if (section.padding_bottom !== undefined && (section.padding_bottom < 0 || section.padding_bottom > 500)) {
      return 'Padding bottom must be between 0 and 500 pixels';
    }

    // Section ID validation
    if (section.section_id && !/^[a-zA-Z0-9_-]+$/.test(section.section_id)) {
      return 'Section ID must contain only letters, numbers, hyphens, and underscores';
    }

    return null;
  }

  // Sanitize HTML content
  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    // For now, allow basic HTML tags but strip script tags
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/on\w+='[^']*'/gi, ''); // Remove event handlers
  }

  // Check if string is valid URL
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Parse section from database row
  static parseSection(row: any): DynamicSection {
    return {
      ...row,
      is_visible: Boolean(row.is_visible),
      padding_top: row.padding_top !== null ? Number(row.padding_top) : 80,
      padding_bottom: row.padding_bottom !== null ? Number(row.padding_bottom) : 80,
      sort_order: Number(row.sort_order),
      accordion_items: row.accordion_items 
        ? (typeof row.accordion_items === 'string' 
            ? JSON.parse(row.accordion_items) 
            : row.accordion_items)
        : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }
}

