import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing REACT_APP_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table names
export const TABLES = {
  PROJECTS: 'projects',
  CATEGORIES: 'categories',
  TECHNOLOGIES: 'technologies',
  SETTINGS: 'settings',
  IMAGES: 'project_images'
};

// Storage buckets
export const BUCKETS = {
  IMAGES: 'images',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents'
};

export default supabase; 