import { supabase } from '../config/supabase';

// ================ PUBLIC PORTFOLIO OPERATIONS ================
// These functions fetch data for the public portfolio (no authentication required)

export const portfolioService = {
  // Get all published projects for public display
  async getPublishedProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (*)
        `)
        .eq('status', 'published') // Only published projects
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching published projects:', error);
        // Return empty array on error so frontend doesn't break
        return [];
      }

      // Transform data to match existing frontend format
      return data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category || 'Web Development',
        image: project.project_images?.[0]?.url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&crop=center',
        buttonText: 'View Details',
        details: {
          overview: project.overview || project.description,
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          features: Array.isArray(project.features) ? project.features : [],
          liveUrl: project.live_url || '#',
          githubUrl: project.github_url || '#',
          images: project.project_images?.map(img => ({
            url: img.url,
            caption: img.original_name || 'Project Image'
          })) || []
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching published projects:', error);
      return []; // Return empty array on error
    }
  },

  // Get published projects by category
  async getPublishedProjectsByCategory(category) {
    try {
      if (category === 'All') {
        return await this.getPublishedProjects();
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (*)
        `)
        .eq('status', 'published')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects by category:', error);
        return [];
      }

      return data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category || 'Web Development',
        image: project.project_images?.[0]?.url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&crop=center',
        buttonText: 'View Details',
        details: {
          overview: project.overview || project.description,
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          features: Array.isArray(project.features) ? project.features : [],
          liveUrl: project.live_url || '#',
          githubUrl: project.github_url || '#',
          images: project.project_images?.map(img => ({
            url: img.url,
            caption: img.original_name || 'Project Image'
          })) || []
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching projects by category:', error);
      return [];
    }
  },

  // Get available categories from the categories table
  async getAvailableCategories() {
    try {
      // First try to get categories from the categories table
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories table:', categoriesError);
        // On error, just return 'All' - don't create fake categories
        return ['All'];
      }

      if (categoriesData && categoriesData.length > 0) {
        const categoryNames = categoriesData.map(cat => cat.name);
        return ['All', ...categoryNames];
      }

      // If no categories in table, just return 'All'
      console.log('📁 No categories found in database');
      return ['All'];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['All']; // Only show 'All' on error
    }
  },

  // Note: Removed fallback categories function - now returns only actual database data
};

export default portfolioService; 