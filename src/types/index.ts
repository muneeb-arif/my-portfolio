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
  is_prompt?: number;
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
  is_prompt?: number;
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

// Dynamic Section types
export type SectionType = 'title' | 'subtitle' | 'image_text' | 'text_image' | 'image_only' | 'video_only' | 'text_only' | 'accordion' | 'social_embed' | 'map_embed' | 'form' | 'code_snippet' | 'custom_html';
export type Alignment = 'left' | 'right' | 'center';
export type EmbedType = 'facebook_post' | 'facebook_video' | 'instagram_post' | 'instagram_reel' | 'twitter' | 'tiktok' | 'linkedin' | 'pinterest' | 'youtube' | 'vimeo' | 'spotify' | 'soundcloud' | 'calendly' | 'google_maps' | 'custom';
export type CTAButtonTarget = '_self' | '_blank';
export type CTAButtonStyle = 'primary' | 'secondary' | 'outline';

export interface AccordionItem {
  title: string;
  content: string;
}

export interface DynamicSection {
  id: string;
  user_id: string;
  section_type: SectionType;
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  alignment: Alignment;
  position_after?: string;
  is_visible: boolean;
  sort_order: number;
  section_id?: string;
  background_color?: string;
  background_image_url?: string;
  padding_top: number;
  padding_bottom: number;
  cta_button_text?: string;
  cta_button_link?: string;
  cta_button_target: CTAButtonTarget;
  cta_button_style: CTAButtonStyle;
  embed_type?: EmbedType;
  embed_url?: string;
  embed_code?: string;
  accordion_items?: AccordionItem[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateDynamicSectionRequest {
  section_type: SectionType;
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  alignment?: Alignment;
  position_after?: string;
  is_visible?: boolean;
  sort_order?: number;
  section_id?: string;
  background_color?: string;
  background_image_url?: string;
  padding_top?: number;
  padding_bottom?: number;
  cta_button_text?: string;
  cta_button_link?: string;
  cta_button_target?: CTAButtonTarget;
  cta_button_style?: CTAButtonStyle;
  embed_type?: EmbedType;
  embed_url?: string;
  embed_code?: string;
  accordion_items?: AccordionItem[];
}

export interface UpdateDynamicSectionRequest extends Partial<CreateDynamicSectionRequest> {
  id: string;
} 