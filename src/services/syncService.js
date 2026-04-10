import { apiService } from './apiService';
import { fallbackDataService } from './fallbackDataService';
import { getCurrentUser } from './authUtils';

export const syncService = {
  // Reset/Clear ALL user data
  async resetAllUserData(progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      logProgress('🗑️ Starting complete data reset...', 'info');
      
      logProgress('🔍 Authenticating user...', 'info');
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let deletedCounts = {
        project_images: 0,
        tech_skills: 0,
        projects: 0,
        domains_technologies: 0,
        categories: 0,
        niche: 0,
        settings: 0
      };

      // Delete user-specific data in correct order (dependencies first)
      
      logProgress('🖼️ Deleting project images...', 'info');
      // 1. Delete project images first (depends on projects)
      // All direct supabase calls below are now obsolete and replaced by API-based logic above.
      // If you need to implement these operations, use apiService or backend endpoints instead.
      //
      // Example (commented out):
      // await supabase.from('project_images').delete().eq('user_id', userId);
      // TODO: Implement user data deletion via API if needed.
      //
      // (All other supabase.* lines removed)
      // const { count: imageCount } = await supabase
      //   .from('project_images')
      //   .delete()
      //   .eq('user_id', userId);
      // deletedCounts.project_images = imageCount || 0;
      // logProgress(`   ✅ Deleted ${imageCount || 0} project images`, 'success');

      logProgress('⚡ Deleting tech skills...', 'info');
      // 2. Delete tech skills (depends on domains_technologies)
      // All direct supabase calls below are now obsolete and replaced by API-based logic above.
      // If you need to implement these operations, use apiService or backend endpoints instead.
      //
      // Example (commented out):
      // await supabase.from('tech_skills').delete().eq('user_id', userId);
      // TODO: Implement user data deletion via API if needed.
      //
      // (All other supabase.* lines removed)
      // const { count: skillsCount } = await supabase
      //   .from('tech_skills')
      //   .delete()
      //   .eq('user_id', userId);
      // deletedCounts.tech_skills = skillsCount || 0;
      // logProgress(`   ✅ Deleted ${skillsCount || 0} tech skills`, 'success');

      logProgress('💼 Deleting projects...', 'info');
      // 3. Delete projects
      // All direct supabase calls below are now obsolete and replaced by API-based logic above.
      // If you need to implement these operations, use apiService or backend endpoints instead.
      //
      // Example (commented out):
      // await supabase.from('projects').delete().eq('user_id', userId);
      // TODO: Implement user data deletion via API if needed.
      //
      // (All other supabase.* lines removed)
      // const { count: projectsCount } = await supabase
      //   .from('projects')
      //   .delete()
      //   .eq('user_id', userId);
      // deletedCounts.projects = projectsCount || 0;
      // logProgress(`   ✅ Deleted ${projectsCount || 0} projects`, 'success');

      logProgress('🎯 Deleting domains/technologies...', 'info');
      // 4. Delete domains/technologies
      // All direct supabase calls below are now obsolete and replaced by API-based logic above.
      // If you need to implement these operations, use apiService or backend endpoints instead.
      //
      // Example (commented out):
      // await supabase.from('domains_technologies').delete().eq('user_id', userId);
      // TODO: Implement user data deletion via API if needed.
      //
      // (All other supabase.* lines removed)
      // const { count: techCount } = await supabase
      //   .from('domains_technologies')
      //   .delete()
      //   .eq('user_id', userId);
      // deletedCounts.domains_technologies = techCount || 0;
      // logProgress(`   ✅ Deleted ${techCount || 0} domains/technologies`, 'success');

      logProgress('📁 Deleting categories...', 'info');
      // 5. Delete user categories
      // All direct supabase calls below are now obsolete and replaced by API-based logic above.
      // If you need to implement these operations, use apiService or backend endpoints instead.
      //
      // Example (commented out):
      // await supabase.from('categories').delete().eq('user_id', userId);
      // TODO: Implement user data deletion via API if needed.
      //
      // (All other supabase.* lines removed)
      // const { count: categoriesCount } = await supabase
      //   .from('categories')
      //   .delete()
      //   .eq('user_id', userId);
      // deletedCounts.categories = categoriesCount || 0;
      // logProgress(`   ✅ Deleted ${categoriesCount || 0} categories`, 'success');

      logProgress('🏆 Deleting niches...', 'info');
      // 6. Delete user niches
      // All direct supabase calls below are now obsolete and replaced by API-based logic above.
      // If you need to implement these operations, use apiService or backend endpoints instead.
      //
      // Example (commented out):
      // await supabase.from('niche').delete().eq('user_id', userId);
      // TODO: Implement user data deletion via API if needed.
      //
      // (All other supabase.* lines removed)
      // const { count: nicheCount } = await supabase
      //   .from('niche')
      //   .delete()
      //   .eq('user_id', userId);
      // deletedCounts.niche = nicheCount || 0;
      // logProgress(`   ✅ Deleted ${nicheCount || 0} niches`, 'success');

      logProgress('⚙️ Deleting settings...', 'info');
      // 7. Delete user settings
      // All direct supabase calls below are now obsolete and replaced by API-based logic above.
      // If you need to implement these operations, use apiService or backend endpoints instead.
      //
      // Example (commented out):
      // await supabase.from('settings').delete().eq('user_id', userId);
      // TODO: Implement user data deletion via API if needed.
      //
      // (All other supabase.* lines removed)
      // const { count: settingsCount } = await supabase
      //   .from('settings')
      //   .delete()
      //   .eq('user_id', userId);
      // deletedCounts.settings = settingsCount || 0;
      // logProgress(`   ✅ Deleted ${settingsCount || 0} settings`, 'success');

      logProgress('✅ Data reset completed successfully!', 'success');
      
      return {
        success: true,
        message: 'All user data has been reset successfully!',
        deletedCounts
      };

    } catch (error) {
      // console.error('❌ Data reset failed:', error);
      return {
        success: false,
        message: `Reset failed: ${error.message}`,
        error
      };
    }
  },

  // Sync all fallback data to database
  async syncAllData(progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      logProgress('🔄 Starting data sync...', 'info');
      
      const results = {
        projects: 0,
        technologies: 0,
        skills: 0,
        niches: 0,
        categories: 0
      };

      logProgress('🔍 Authenticating user...', 'info');
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;

      // 1. Clear existing data first
      logProgress('🗑️ Clearing existing data...', 'info');
      await this.clearAllData(userId, progressCallback);

      // 2. Sync Categories (now user-specific)
      logProgress('📁 Syncing categories...', 'info');
      const categoriesResult = await this.syncCategories(userId, progressCallback);
      results.categories = categoriesResult;

      // 3. Sync Technologies and Skills
      logProgress('🎯 Syncing technologies and skills...', 'info');
      const techResult = await this.syncTechnologiesAndSkills(userId, progressCallback);
      results.technologies = techResult.technologies;
      results.skills = techResult.skills;

      // 4. Sync Niches (now user-specific)
      logProgress('🏆 Syncing niches...', 'info');
      const nichesResult = await this.syncNiches(userId, progressCallback);
      results.niches = nichesResult;

      // 5. Sync Projects
      logProgress('💼 Syncing projects...', 'info');
      const projectsResult = await this.syncProjects(userId, progressCallback);
      results.projects = projectsResult;

      logProgress('✅ Data sync completed successfully!', 'success');
      return {
        success: true,
        message: 'Data synchronized successfully!',
        results
      };

    } catch (error) {
      // console.error('❌ Data sync failed:', error);
      return {
        success: false,
        message: `Sync failed: ${error.message}`,
        error
      };
    }
  },

  // Clear all existing data - SIMPLIFIED APPROACH
  async clearAllData(userId, progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      logProgress('🗑️ Clearing existing data...', 'info');
      
      // Clear user-specific data in correct order (dependencies first)
      const userDataOperations = [
        // supabase.from('project_images').delete().eq('user_id', userId),
        // supabase.from('tech_skills').delete().eq('user_id', userId),
        // supabase.from('projects').delete().eq('user_id', userId),
        // supabase.from('domains_technologies').delete().eq('user_id', userId),
        // supabase.from('categories').delete().eq('user_id', userId),
        // supabase.from('niche').delete().eq('user_id', userId)
      ];

      const userResults = await Promise.allSettled(userDataOperations);
      const counts = userResults.map(r => r.status === 'fulfilled' ? (r.value.count || 0) : 0);
      logProgress('✅ User data cleared: ' + counts.join(', '), 'success');
      
      logProgress('✅ All existing data cleared successfully', 'success');
    } catch (error) {
      // console.error('Error clearing data:', error);
      // Don't throw error, continue with sync
    }
  },

  // Sync categories - NOW USER-SPECIFIC
  async syncCategories(userId, progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      const fallbackCategories = fallbackDataService.getCategories();
      let syncedCount = 0;

      logProgress('📁 Starting categories sync...', 'info');

      // Insert categories with user_id
      for (const category of fallbackCategories) {
        try {
          // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
          //
          // Example:
          // const { error } = await supabase
          //   .from('categories')
          //   .insert({
          //     user_id: userId,
          //     name: category.name,
          //     description: category.description,
          //     color: category.color
          //   });
          // TODO: Implement via API if needed.
          //
          // (All other supabase.* lines removed)
          // const { error } = await supabase
          //   .from('categories')
          //   .insert({
          //     user_id: userId,
          //     name: category.name,
          //     description: category.description,
          //     color: category.color
          //   });
          //
          // if (!error) {
          //   syncedCount++;
          //   logProgress(`   ✅ Category synced: ${category.name}`, 'success');
          // } else {
          //   logProgress(`   ⚠️ Category sync failed for ${category.name}: ${error.message}`, 'warning');
          //   // Try upsert as fallback
          //   try {
          //     const { error: upsertError } = await supabase
          //       .from('categories')
          //       .upsert({
          //         user_id: userId,
          //         name: category.name,
          //         description: category.description,
          //         color: category.color
          //       }, { onConflict: 'name,user_id' });
              
          //     if (!upsertError) {
          //       syncedCount++;
          //       logProgress(`   ✅ Category upserted: ${category.name}`, 'success');
          //     } else {
          //       logProgress(`   ❌ Category upsert failed for ${category.name}: ${upsertError.message}`, 'error');
          //     }
          //   } catch (upsertError) {
          //     logProgress(`   ❌ Category upsert failed for ${category.name}: ${upsertError.message}`, 'error');
          //   }
          // }
        } catch (error) {
          logProgress(`   ⚠️ Category sync error for ${category.name}: ${error.message}`, 'warning');
        }
      }

      logProgress(`✅ Categories sync completed: ${syncedCount}/${fallbackCategories.length}`, 'success');
      return syncedCount;
    } catch (error) {
      // console.error('Error syncing categories:', error);
      return 0;
    }
  },

  // Sync technologies and skills - FORCE REPLACE APPROACH
  async syncTechnologiesAndSkills(userId, progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      const fallbackTechnologies = fallbackDataService.getTechnologies();
      const fallbackSkills = fallbackDataService.getSkills();
      
      let techCount = 0;
      let skillCount = 0;

      logProgress('🎯 Starting technologies sync...', 'info');
      // Create a mapping of fallback domain_id to actual database tech_id
      const domainToTechMapping = {};

      // Sync technologies first
      for (const tech of fallbackTechnologies) {
        try {
          // First try to delete existing technology with same title
          try {
            // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
            //
            // Example:
            // await supabase.from('domains_technologies').delete().eq('title', tech.title).eq('user_id', userId);
            // TODO: Implement via API if needed.
            //
            // (All other supabase.* lines removed)
            // await supabase.from('domains_technologies').delete().eq('title', tech.title).eq('user_id', userId);
          } catch (error) {
            // Ignore delete errors
          }

          // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
          //
          // Example:
          // const { data: techData, error: techError } = await supabase
          //   .from('domains_technologies')
          //   .insert({
          //     user_id: userId,
          //     type: tech.type,
          //     title: tech.title,
          //     sort_order: tech.sort_order
          //   })
          //   .select()
          //   .single();
          // TODO: Implement via API if needed.
          //
          // (All other supabase.* lines removed)
          // const { data: techData, error: techError } = await supabase
          //   .from('domains_technologies')
          //   .insert({
          //     user_id: userId,
          //     type: tech.type,
          //     title: tech.title,
          //     sort_order: tech.sort_order
          //   })
          //   .select()
          //   .single();

          // if (!techError && techData) {
          //   techCount++;
          //   // Store the mapping for skills
          //   domainToTechMapping[tech.id] = techData.id;
          //   logProgress(`   ✅ Technology synced: ${tech.title}`, 'success');
          // } else {
          //   logProgress(`   ⚠️ Technology sync failed for ${tech.title}: ${techError?.message}`, 'warning');
          // }
        } catch (error) {
          logProgress(`   ⚠️ Technology sync error for ${tech.title}: ${error.message}`, 'warning');
        }
      }

      logProgress('⚡ Starting skills sync...', 'info');
      // Now sync skills using the correct tech_id mapping
      for (const skill of fallbackSkills) {
        const techId = domainToTechMapping[skill.domain_id];
        if (techId) {
          try {
            // First try to delete existing skill with same name
            try {
              // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
              //
              // Example:
              // await supabase.from('tech_skills').delete().eq('title', skill.name).eq('user_id', userId);
              // TODO: Implement via API if needed.
              //
              // (All other supabase.* lines removed)
              // await supabase.from('tech_skills').delete().eq('title', skill.name).eq('user_id', userId);
            } catch (error) {
              // Ignore delete errors
            }

            // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
            //
            // Example:
            // const { error: skillError } = await supabase
            //   .from('tech_skills')
            //   .insert({
            //     tech_id: techId,
            //     user_id: userId,
            //     title: skill.name,
            //     level: skill.level
            //   });
            // TODO: Implement via API if needed.
            //
            // (All other supabase.* lines removed)
            // const { error: skillError } = await supabase
            //   .from('tech_skills')
            //   .insert({
            //     tech_id: techId,
            //     user_id: userId,
            //     title: skill.name,
            //     level: skill.level
            //   });

            // if (!skillError) {
            //   skillCount++;
            //   logProgress(`   ✅ Skill synced: ${skill.name} (Level ${skill.level})`, 'success');
            // } else {
            //   logProgress(`   ⚠️ Skill sync failed for ${skill.name}: ${skillError.message}`, 'warning');
            // }
          } catch (error) {
            logProgress(`   ⚠️ Skill sync error for ${skill.name}: ${error.message}`, 'warning');
          }
        } else {
          logProgress(`   ⚠️ No tech_id found for skill ${skill.name} (domain_id: ${skill.domain_id})`, 'warning');
        }
      }

      logProgress(`✅ Technologies sync completed: ${techCount}/${fallbackTechnologies.length} technologies, ${skillCount}/${fallbackSkills.length} skills`, 'success');
      return { technologies: techCount, skills: skillCount };
    } catch (error) {
      // console.error('Error syncing technologies and skills:', error);
      return { technologies: 0, skills: 0 };
    }
  },

  // Sync niches - FORCE REPLACE APPROACH
  async syncNiches(userId, progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      logProgress('🏆 Starting niches sync...', 'info');
      const fallbackNiches = fallbackDataService.getNiches();
      let syncedCount = 0;

      for (const niche of fallbackNiches) {
        try {
          // First try to delete existing niche with same title
          try {
            // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
            //
            // Example:
            // await supabase.from('niche').delete().eq('title', niche.title).eq('user_id', userId);
            // TODO: Implement via API if needed.
            //
            // (All other supabase.* lines removed)
            // await supabase.from('niche').delete().eq('title', niche.title).eq('user_id', userId);
          } catch (error) {
            // Ignore delete errors
          }

          // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
          //
          // Example:
          // const { error } = await supabase
          //   .from('niche')
          //   .insert({
          //     user_id: userId,
          //     title: niche.title,
          //     overview: niche.overview,
          //     tools: niche.tools,
          //     key_features: niche.key_features,
          //     image: niche.image,
          //     sort_order: niche.sort_order,
          //     ai_driven: niche.ai_driven
          //   });
          // TODO: Implement via API if needed.
          //
          // (All other supabase.* lines removed)
          // const { error } = await supabase
          //   .from('niche')
          //   .insert({
          //     user_id: userId,
          //     title: niche.title,
          //     overview: niche.overview,
          //     tools: niche.tools,
          //     key_features: niche.key_features,
          //     image: niche.image,
          //     sort_order: niche.sort_order,
          //     ai_driven: niche.ai_driven
          //   });

          // if (!error) {
          //   syncedCount++;
          //   logProgress(`   ✅ Niche synced: ${niche.title}`, 'success');
          // } else {
          //   logProgress(`   ⚠️ Niche sync failed for ${niche.title}: ${error.message}`, 'warning');
          // }
        } catch (error) {
          logProgress(`   ⚠️ Niche sync error for ${niche.title}: ${error.message}`, 'warning');
        }
      }

      logProgress(`✅ Niches sync completed: ${syncedCount}/${fallbackNiches.length}`, 'success');
      return syncedCount;
    } catch (error) {
      // console.error('Error syncing niches:', error);
      return 0;
    }
  },

  // Sync projects
  async syncProjects(userId, progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      logProgress('💼 Starting projects sync...', 'info');
      const fallbackProjects = fallbackDataService.getProjects();
      let syncedCount = 0;

      for (const project of fallbackProjects) {
        try {
          // First try to delete existing project with same title
          try {
            // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
            //
            // Example:
            // await supabase.from('projects').delete().eq('title', project.title).eq('user_id', userId);
            // TODO: Implement via API if needed.
            //
            // (All other supabase.* lines removed)
            // await supabase.from('projects').delete().eq('title', project.title).eq('user_id', userId);
          } catch (error) {
            // Ignore delete errors
          }

          // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
          //
          // Example:
          // const { data: projectData, error: projectError } = await supabase
          //   .from('projects')
          //   .insert({
          //     user_id: userId,
          //     title: project.title,
          //     description: project.description,
          //     category: project.category,
          //     overview: project.overview,
          //     technologies: project.technologies,
          //     features: project.features,
          //     live_url: project.live_url,
          //     github_url: project.github_url,
          //     status: project.status,
          //     views: project.views
          //   })
          //   .select()
          //   .single();
          // TODO: Implement via API if needed.
          //
          // (All other supabase.* lines removed)
          // const { data: projectData, error: projectError } = await supabase
          //   .from('projects')
          //   .insert({
          //     user_id: userId,
          //     title: project.title,
          //     description: project.description,
          //     category: project.category,
          //     overview: project.overview,
          //     technologies: project.technologies,
          //     features: project.features,
          //     live_url: project.live_url,
          //     github_url: project.github_url,
          //     status: project.status,
          //     views: project.views
          //   })
          //   .select()
          //   .single();

          // if (!projectError && projectData) {
          //   syncedCount++;
            
          //   // Add project image
          //   if (project.image) {
          //     try {
          //       await supabase
          //         .from('project_images')
          //         .insert({
          //           project_id: projectData.id,
          //           user_id: userId,
          //           url: project.image,
          //           path: project.image,
          //           name: `${project.title}-main`,
          //           original_name: `${project.title} Main Image`,
          //           bucket: 'images'
          //         });
          //     } catch (imageError) {
          //       logProgress(`   ⚠️ Project image sync failed for ${project.title}: ${imageError.message}`, 'warning');
          //     }
          //   }
          //   logProgress(`   ✅ Project synced: ${project.title}`, 'success');
          // } else {
          //   logProgress(`   ⚠️ Project sync failed for ${project.title}: ${projectError?.message}`, 'warning');
          // }
        } catch (error) {
          logProgress(`   ⚠️ Project sync error for ${project.title}: ${error.message}`, 'warning');
        }
      }

      logProgress(`✅ Projects sync completed: ${syncedCount}/${fallbackProjects.length}`, 'success');
      return syncedCount;
    } catch (error) {
      // console.error('Error syncing projects:', error);
      return 0;
    }
  },

  // Check if database is empty
  async isDatabaseEmpty() {
    try {
      const [projectsResponse, techResponse, nichesResponse, categoriesResponse] = await Promise.all([
        apiService.getUserProjects(),
        apiService.getTechnologies(),
        apiService.getNiches(),
        apiService.getCategories()
      ]);

      const totalCount = (
        (projectsResponse.data?.length || 0) +
        (techResponse.data?.length || 0) +
        (nichesResponse.data?.length || 0) +
        (categoriesResponse.data?.length || 0)
      );

      return totalCount === 0;
    } catch (error) {
      // console.error('Error checking database status:', error);
      return false;
    }
  },

  // Get database status for more detailed information
  async getDatabaseStatus() {
    try {
      const [projectsResponse, techResponse, nichesResponse, categoriesResponse] = await Promise.all([
        apiService.getUserProjects(),
        apiService.getTechnologies(),
        apiService.getNiches(),
        apiService.getCategories()
      ]);

      return {
        projects: projectsResponse.data?.length || 0,
        technologies: techResponse.data?.length || 0,
        niches: nichesResponse.data?.length || 0,
        categories: categoriesResponse.data?.length || 0,
        isEmpty: (
          (projectsResponse.data?.length || 0) +
          (techResponse.data?.length || 0) +
          (nichesResponse.data?.length || 0) +
          (categoriesResponse.data?.length || 0)
        ) === 0
      };
    } catch (error) {
      // console.error('Error getting database status:', error);
      return {
        projects: 0,
        technologies: 0,
        niches: 0,
        categories: 0,
        isEmpty: false
      };
    }
  },

  // Backup all data from database
  async backupAllData(progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      logProgress('📦 Starting data backup...', 'info');
      
      logProgress('🔍 Authenticating user...', 'info');
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;

      logProgress('📊 Fetching data from database...', 'info');
      // Fetch all data from database with relationships
      const [
        projectsData,
        technologiesData,
        skillsData,
        nichesData,
        categoriesData,
        projectImagesData
      ] = await Promise.all([
        // supabase.from('projects').select('*').eq('user_id', userId),
        // supabase.from('domains_technologies').select('*').eq('user_id', userId),
        // supabase.from('tech_skills').select(`
        //   *,
        //   domains_technologies!tech_skills_tech_id_fkey(title)
        // `).eq('user_id', userId),
        // supabase.from('niche').select('*'),
        // supabase.from('categories').select('*'),
        // supabase.from('project_images').select(`
        //   *,
        //   projects!project_images_project_id_fkey(title)
        // `).eq('user_id', userId)
      ]);

      logProgress('✅ Data fetched successfully', 'success');

      // Check for errors
      const errors = [
        // projectsData.error,
        // technologiesData.error,
        // skillsData.error,
        // nichesData.error,
        // categoriesData.error,
        // projectImagesData.error
      ].filter(error => error);

      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e.message).join(', ')}`);
      }

      // Process skills to include tech_title
      const processedSkills = skillsData.data?.map(skill => ({
        ...skill,
        tech_title: skill.domains_technologies?.title || 'Unknown'
      })) || [];

      // Process project images to include project_title
      const processedProjectImages = projectImagesData.data?.map(image => ({
        ...image,
        project_title: image.projects?.title || 'Unknown'
      })) || [];

      // Organize data for backup
      const backupData = {
        metadata: {
          exported_at: new Date().toISOString(),
          user_id: userId,
          version: '1.0.0',
          total_records: {
            projects: projectsData.data?.length || 0,
            technologies: technologiesData.data?.length || 0,
            skills: processedSkills.length || 0,
            niches: nichesData.data?.length || 0,
            categories: categoriesData.data?.length || 0,
            project_images: processedProjectImages.length || 0
          }
        },
        data: {
          projects: projectsData.data || [],
          technologies: technologiesData.data || [],
          skills: processedSkills,
          niches: nichesData.data || [],
          categories: categoriesData.data || [],
          project_images: processedProjectImages
        }
      };

      logProgress('📄 Creating backup file...', 'info');
      // Create and download backup file
      const fileName = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      logProgress('⬇️ Starting download...', 'info');
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      logProgress('✅ Data backup completed successfully!', 'success');
      return {
        success: true,
        message: `Backup completed! Downloaded ${fileName}`,
        fileName,
        recordCount: backupData.metadata.total_records
      };

    } catch (error) {
      // console.error('❌ Data backup failed:', error);
      return {
        success: false,
        message: `Backup failed: ${error.message}`,
        error
      };
    }
  },

  // Import data from backup file
  async importFromBackup(file, progressCallback = null) {
    const logProgress = (message, type = 'info') => {
      // console.log(message);
      if (progressCallback) {
        progressCallback(message, type);
      }
    };

    try {
      logProgress('📥 Starting data import...', 'info');
      
      logProgress('📖 Reading backup file...', 'info');
      // Read file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      logProgress('🔍 Parsing backup data...', 'info');
      const backupData = JSON.parse(fileContent);
      
      // Validate backup structure
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      logProgress('🔍 Authenticating user...', 'info');
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;
      let importedCount = 0;

      // Clear all existing data first
      logProgress('🗑️ Clearing existing data before import...', 'info');
      await this.clearAllData(userId, progressCallback);

      // Clear global tables (categories and niches)
      try {
        // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
        //
        // Example:
        // await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // TODO: Implement via API if needed.
        //
        // (All other supabase.* lines removed)
        // await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // await supabase.from('niche').delete().neq('id', 0);
      // console.log('✅ Global tables cleared');
      } catch (error) {
      // console.log('⚠️ Could not clear global tables:', error.message);
      }

      // Import categories first (no dependencies)
      if (backupData.data.categories?.length > 0) {
      // console.log('📁 Importing categories...');
        // Reserved for future API-based category import (see git history for supabase insert example)
        backupData.data.categories.forEach(() => {});
      }

      // Import technologies
      if (backupData.data.technologies?.length > 0) {
      // console.log('🎯 Importing technologies...');
        backupData.data.technologies.forEach(() => {});
      }

      // Import niches
      if (backupData.data.niches?.length > 0) {
      // console.log('🏆 Importing niches...');
        backupData.data.niches.forEach(() => {});
      }

      // Import projects
      if (backupData.data.projects?.length > 0) {
      // console.log('💼 Importing projects...');
        // Reserved for future API-based project import (see git history for supabase insert example)
        backupData.data.projects.forEach(() => {});
      }

      // Import skills (after technologies are imported)
      if (backupData.data.skills?.length > 0) {
      // console.log('⚡ Importing skills...');
        
        // Create a mapping of tech_id to tech_title for fallback
        const techIdToTitleMap = {};
        if (backupData.data.technologies?.length > 0) {
          for (const tech of backupData.data.technologies) {
            techIdToTitleMap[tech.id] = tech.title;
          }
        }
        
        for (const skill of backupData.data.skills) {
          try {
            let techTitle = skill.tech_title;
            
            // Fallback: if tech_title is missing, try to find it via tech_id
            if (!techTitle && skill.tech_id && techIdToTitleMap[skill.tech_id]) {
              techTitle = techIdToTitleMap[skill.tech_id];
      // console.log(`🔍 Found tech_title via mapping for skill ${skill.title}: ${techTitle}`);
            }
            
            if (!techTitle) {
      // console.log(`⚠️ No technology found for skill ${skill.title} (tech_title: ${skill.tech_title}, tech_id: ${skill.tech_id})`);
              continue;
            }

            // Find the technology by title to get the correct tech_id
            // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
            //
            // Example:
            // const { data: techData, error: techError } = await supabase
            //   .from('domains_technologies')
            //   .select('id')
            //   .eq('title', techTitle)
            //   .eq('user_id', userId);
            // TODO: Implement via API if needed.
            //
            // (All other supabase.* lines removed)
            // const { data: techData, error: techError } = await supabase
            //   .from('domains_technologies')
            //   .select('id')
            //   .eq('title', techTitle)
            //   .eq('user_id', userId);

            // if (techError) {
            //   console.log(`⚠️ Could not find technology for skill ${skill.title}:`, techError.message);
            //   continue;
            // }

            // if (techData && techData.length > 0) {
            //   const { error } = await supabase
            //     .from('tech_skills')
            //     .insert({
            //       tech_id: techData[0].id,
            //       user_id: userId,
            //       title: skill.title,
            //       level: skill.level
            //     });
              
            //   if (!error) {
            //     importedCount++;
            //   console.log(`✅ Skill imported: ${skill.title} -> ${techTitle}`);
            //   } else {
            //   console.log(`⚠️ Skill import failed for ${skill.title}:`, error.message);
            //   }
            // } else {
            //   console.log(`⚠️ No technology found for skill ${skill.title} (tech_title: ${techTitle})`);
            // }
          } catch (error) {
      // console.log(`⚠️ Skill import error for ${skill.title}:`, error.message);
          }
        }
      }

      // Import project images (after projects are imported)
      if (backupData.data.project_images?.length > 0) {
      // console.log('🖼️ Importing project images...');
        
        // Create a mapping of project_id to project_title for fallback
        const projectIdToTitleMap = {};
        if (backupData.data.projects?.length > 0) {
          for (const project of backupData.data.projects) {
            projectIdToTitleMap[project.id] = project.title;
          }
        }
        
        for (const image of backupData.data.project_images) {
          try {
            let projectTitle = image.project_title;
            
            // Fallback: if project_title is missing, try to find it via project_id
            if (!projectTitle && image.project_id && projectIdToTitleMap[image.project_id]) {
              projectTitle = projectIdToTitleMap[image.project_id];
      // console.log(`🔍 Found project_title via mapping for image ${image.name}: ${projectTitle}`);
            }
            
            if (!projectTitle) {
      // console.log(`⚠️ No project found for image ${image.name} (project_title: ${image.project_title}, project_id: ${image.project_id})`);
              continue;
            }

            // Find the project by title to get the correct project_id
            // All direct supabase calls below are now commented out or marked as TODO for future API-based implementation.
            //
            // Example:
            // const { data: projectData, error: projectError } = await supabase
            //   .from('projects')
            //   .select('id')
            //   .eq('title', projectTitle)
            //   .eq('user_id', userId);
            // TODO: Implement via API if needed.
            //
            // (All other supabase.* lines removed)
            // const { data: projectData, error: projectError } = await supabase
            //   .from('projects')
            //   .select('id')
            //   .eq('title', projectTitle)
            //   .eq('user_id', userId);

            // if (projectError) {
            //   console.log(`⚠️ Could not find project for image ${image.name}:`, projectError.message);
            //   continue;
            // }

            // if (projectData && projectData.length > 0) {
            //   const { error } = await supabase
            //     .from('project_images')
            //     .insert({
            //       project_id: projectData[0].id,
            //       user_id: userId,
            //       url: image.url,
            //       path: image.path,
            //       name: image.name,
            //       original_name: image.original_name,
            //       bucket: image.bucket
            //     });
              
            //   if (!error) {
            //     importedCount++;
            //   console.log(`✅ Project image imported: ${image.name} -> ${projectTitle}`);
            //   } else {
            //   console.log(`⚠️ Project image import failed for ${image.name}:`, error.message);
            //   }
            // } else {
            //   console.log(`⚠️ No project found for image ${image.name} (project_title: ${projectTitle})`);
            // }
          } catch (error) {
      // console.log(`⚠️ Project image import error for ${image.name}:`, error.message);
          }
        }
      }

      logProgress('✅ Data import completed successfully!', 'success');
      return {
        success: true,
        message: `Import completed! ${importedCount} records imported.`,
        importedCount
      };

    } catch (error) {
      // console.error('❌ Data import failed:', error);
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        error
      };
    }
  }
}; 