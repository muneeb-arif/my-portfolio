import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if environment variables are missing
const isEnvMissing = !supabaseUrl || !supabaseAnonKey;

// Create Supabase client with fallback for missing env vars
let supabase;

if (isEnvMissing) {
  // Create a dummy client that will fail gracefully
  supabase = createClient('https://dummy.supabase.co', 'dummy-key');
  
  // Add a flag to indicate missing environment variables
  supabase.isEnvMissing = true;
} else {
  // Create normal Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  supabase.isEnvMissing = false;
}

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
  DOCUMENTS: 'documents',
  DOMAINS: 'domains'
};

// Export a function to check if environment variables are missing
export const checkEnvMissing = () => isEnvMissing;

export { supabase };
export default supabase; 