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
    
    const query = `
      UPDATE projects SET
        title = COALESCE(?, title),
        description = ?,
        category = ?,
        overview = ?,
        technologies = ?,
        features = ?,
        live_url = ?,
        github_url = ?,
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `;
    
    const params = [
      projectData.title,
      projectData.description || null,
      projectData.category || null,
      projectData.overview || null,
      projectData.technologies ? JSON.stringify(projectData.technologies) : null,
      projectData.features ? JSON.stringify(projectData.features) : null,
      projectData.live_url || null,
      projectData.github_url || null,
      projectData.status,
      now,
      projectData.id,
      userId
    ];
    
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