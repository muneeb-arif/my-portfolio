/**
 * Legacy named exports only. The app uses REACT_APP_API_URL + JWT; no Supabase client.
 */
export { BUCKETS } from './storage';

export const TABLES = {
  PROJECTS: 'projects',
  CATEGORIES: 'categories',
  TECHNOLOGIES: 'technologies',
  SETTINGS: 'settings',
  IMAGES: 'project_images',
};

export { checkEnvMissing } from './env';
