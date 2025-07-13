// Authentication types
export interface User {
  id: string;
  email: string;
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