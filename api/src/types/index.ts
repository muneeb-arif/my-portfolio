// Authentication types
export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  email_verified?: number;
  is_admin?: number;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Admin Section types
export interface AdminSection {
  id: string;
  section_key: string;
  section_name: string;
  section_description?: string;
  icon?: string;
  route_path?: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface AdminSectionPermission {
  id: string;
  user_id: string;
  section_id: string;
  can_access: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserAdminPermissions {
  sections: AdminSection[];
  permissions: AdminSectionPermission[];
}

// Project types
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  overview?: string;
  technologies?: string[];
  features?: string[];
  live_url?: string;
  github_url?: string;
  status: 'draft' | 'published';
  views: number;
  created_at: Date;
  updated_at: Date;
  project_images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  user_id: string;
  url: string;
  path: string;
  name: string;
  original_name?: string;
  size?: number;
  type?: string;
  bucket?: string;
  order_index?: number;
  created_at: Date;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  category?: string;
  overview?: string;
  technologies?: string[];
  features?: string[];
  live_url?: string;
  github_url?: string;
  status?: 'draft' | 'published';
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Database result types
export interface DbResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
} 