import { executeQuery, executeTransaction } from '@/lib/database';
import { Project, ProjectImage, CreateProjectRequest, UpdateProjectRequest, DbResult } from '@/types';

export class ProjectService {
  // Get all projects for a user (dashboard)
  static async getUserProjects(userId: string): Promise<DbResult<Project[]>> {
    const query = `
      SELECT p.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', pi.id,
                 'project_id', pi.project_id,
                 'user_id', pi.user_id,
                 'url', pi.url,
                 'path', pi.path,
                 'name', pi.name,
                 'original_name', pi.original_name,
                 'size', pi.size,
                 'type', pi.type,
                 'bucket', pi.bucket,
                 'order_index', pi.order_index,
                 'created_at', pi.created_at
               )
             ) as project_images
      FROM projects p
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    const result = await executeQuery(query, [userId]);
    
    // Sort project_images by order_index in the frontend
    if (result.success && result.data) {
      const projects = result.data as Project[];
      projects.forEach(project => {
        if (project.project_images && Array.isArray(project.project_images)) {
          project.project_images.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        }
      });
    }
    
    return result;
  }

  // Get published projects for portfolio owner (public)
  static async getPublishedProjects(ownerEmail: string): Promise<DbResult<Project[]>> {
    const query = `
      SELECT p.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', pi.id,
                 'project_id', pi.project_id,
                 'user_id', pi.user_id,
                 'url', pi.url,
                 'path', pi.path,
                 'name', pi.name,
                 'original_name', pi.original_name,
                 'size', pi.size,
                 'type', pi.type,
                 'bucket', pi.bucket,
                 'order_index', pi.order_index,
                 'created_at', pi.created_at
               )
             ) as project_images
      FROM projects p
      LEFT JOIN project_images pi ON p.id = pi.project_id
      INNER JOIN users u ON p.user_id = u.id
      WHERE u.email = ? AND p.status = 'published'
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    const result = await executeQuery(query, [ownerEmail]);
    
    // Sort project_images by order_index in the frontend
    if (result.success && result.data) {
      const projects = result.data as Project[];
      projects.forEach(project => {
        if (project.project_images && Array.isArray(project.project_images)) {
          project.project_images.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        }
      });
    }
    
    return result;
  }

  // Get project by ID
  static async getProjectById(projectId: string, userId: string): Promise<DbResult<Project>> {
    const query = `
      SELECT p.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', pi.id,
                 'project_id', pi.project_id,
                 'user_id', pi.user_id,
                 'url', pi.url,
                 'path', pi.path,
                 'name', pi.name,
                 'original_name', pi.original_name,
                 'size', pi.size,
                 'type', pi.type,
                 'bucket', pi.bucket,
                 'order_index', pi.order_index,
                 'created_at', pi.created_at
               )
             ) as project_images
      FROM projects p
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.id = ? AND p.user_id = ?
      GROUP BY p.id
    `;
    
    const result = await executeQuery(query, [projectId, userId]);
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const project = result.data[0] as Project;
      
      // Sort project_images by order_index
      if (project.project_images && Array.isArray(project.project_images)) {
        project.project_images.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      }
      
      return { success: true, data: project };
    }
    return { success: false, error: 'Project not found' };
  }

  // Create new project
  static async createProject(projectData: CreateProjectRequest, userId: string): Promise<DbResult<Project>> {
    const projectId = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO projects (
        id, user_id, title, description, category, overview, 
        technologies, features, live_url, github_url, status, 
        views, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `;
    
    const params = [
      projectId,
      userId,
      projectData.title,
      projectData.description || null,
      projectData.category || null,
      projectData.overview || null,
      projectData.technologies ? JSON.stringify(projectData.technologies) : null,
      projectData.features ? JSON.stringify(projectData.features) : null,
      projectData.live_url || null,
      projectData.github_url || null,
      projectData.status || 'draft',
      now,
      now
    ];
    
    const result = await executeQuery(query, params);
    if (result.success) {
      return this.getProjectById(projectId, userId);
    }
    return result;
  }

  // Update project
  static async updateProject(projectData: UpdateProjectRequest, userId: string): Promise<DbResult<Project>> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Build dynamic query based on provided fields
    const updateFields: string[] = [];
    const params: any[] = [];
    
    // Only include fields that are not undefined
    if (projectData.title !== undefined) {
      updateFields.push('title = ?');
      params.push(projectData.title);
    }
    
    if (projectData.description !== undefined) {
      updateFields.push('description = ?');
      params.push(projectData.description);
    }
    
    if (projectData.category !== undefined) {
      updateFields.push('category = ?');
      params.push(projectData.category);
    }
    
    if (projectData.overview !== undefined) {
      updateFields.push('overview = ?');
      params.push(projectData.overview);
    }
    
    if (projectData.technologies !== undefined) {
      updateFields.push('technologies = ?');
      params.push(projectData.technologies ? JSON.stringify(projectData.technologies) : null);
    }
    
    if (projectData.features !== undefined) {
      updateFields.push('features = ?');
      params.push(projectData.features ? JSON.stringify(projectData.features) : null);
    }
    
    if (projectData.live_url !== undefined) {
      updateFields.push('live_url = ?');
      params.push(projectData.live_url);
    }
    
    if (projectData.github_url !== undefined) {
      updateFields.push('github_url = ?');
      params.push(projectData.github_url);
    }
    
    if (projectData.status !== undefined) {
      updateFields.push('status = ?');
      params.push(projectData.status);
    }
    
    // Always update the updated_at timestamp
    updateFields.push('updated_at = ?');
    params.push(now);
    
    // Add WHERE clause parameters
    params.push(projectData.id);
    params.push(userId);
    
    const query = `
      UPDATE projects SET
        ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await executeQuery(query, params);
    if (result.success) {
      return this.getProjectById(projectData.id, userId);
    }
    return result;
  }

  // Delete project
  static async deleteProject(projectId: string, userId: string): Promise<DbResult<boolean>> {
    const query = 'DELETE FROM projects WHERE id = ? AND user_id = ?';
    const result = await executeQuery(query, [projectId, userId]);
    return { success: result.success, data: result.success };
  }

  // Increment project views
  static async incrementViews(projectId: string): Promise<DbResult<boolean>> {
    const query = 'UPDATE projects SET views = views + 1 WHERE id = ?';
    const result = await executeQuery(query, [projectId]);
    return { success: result.success, data: result.success };
  }
} 