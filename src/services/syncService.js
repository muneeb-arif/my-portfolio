import { supabase } from '../config/supabase';
import { fallbackDataService } from './fallbackDataService';

export const syncService = {
  // Sync all fallback data to database
  async syncAllData() {
    try {
      console.log('🔄 Starting data sync...');
      
      const results = {
        projects: 0,
        technologies: 0,
        skills: 0,
        niches: 0,
        categories: 0
      };

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;

      // 1. Clear existing data first
      console.log('🗑️ Clearing existing data...');
      await this.clearAllData(userId);

      // 2. Sync Categories
      console.log('📁 Syncing categories...');
      const categoriesResult = await this.syncCategories(userId);
      results.categories = categoriesResult;

      // 3. Sync Technologies and Skills
      console.log('🎯 Syncing technologies and skills...');
      const techResult = await this.syncTechnologiesAndSkills(userId);
      results.technologies = techResult.technologies;
      results.skills = techResult.skills;

      // 4. Sync Niches
      console.log('🏆 Syncing niches...');
      const nichesResult = await this.syncNiches();
      results.niches = nichesResult;

      // 5. Sync Projects
      console.log('💼 Syncing projects...');
      const projectsResult = await this.syncProjects(userId);
      results.projects = projectsResult;

      console.log('✅ Data sync completed successfully!', results);
      return {
        success: true,
        message: 'Data synchronized successfully!',
        results
      };

    } catch (error) {
      console.error('❌ Data sync failed:', error);
      return {
        success: false,
        message: `Sync failed: ${error.message}`,
        error
      };
    }
  },

  // Clear all existing data - SIMPLIFIED APPROACH
  async clearAllData(userId) {
    try {
      console.log('🗑️ Clearing existing data...');
      
      // Clear user-specific data first (these should work with RLS)
      const userDataOperations = [
        supabase.from('project_images').delete().eq('user_id', userId),
        supabase.from('tech_skills').delete().eq('user_id', userId),
        supabase.from('projects').delete().eq('user_id', userId),
        supabase.from('domains_technologies').delete().eq('user_id', userId)
      ];

      const userResults = await Promise.all(userDataOperations);
      console.log('✅ User data cleared:', userResults.map(r => r.count || 0));

      // For global tables (categories and niches), we'll handle them in the sync functions
      // This avoids RLS and UUID issues
      console.log('⚠️ Global tables will be handled during sync (replace approach)');
      
      console.log('✅ All existing data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      // Don't throw error, continue with sync
    }
  },

  // Sync categories - FORCE REPLACE APPROACH
  async syncCategories(userId) {
    try {
      const fallbackCategories = fallbackDataService.getCategories();
      let syncedCount = 0;

      console.log('📁 Starting categories sync...');

      // First, try to delete existing categories by name
      for (const category of fallbackCategories) {
        try {
          const deleteResult = await supabase.from('categories').delete().eq('name', category.name);
          if (deleteResult.count > 0) {
            console.log(`🗑️ Deleted existing category: ${category.name}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not delete category ${category.name}:`, error.message);
        }
      }

      // Then insert new ones
      for (const category of fallbackCategories) {
        try {
          const { error } = await supabase
            .from('categories')
            .insert({
              name: category.name,
              description: category.description,
              color: category.color
            });

          if (!error) {
            syncedCount++;
            console.log(`✅ Category synced: ${category.name}`);
          } else {
            console.log(`⚠️ Category sync failed for ${category.name}:`, error.message);
            // Try upsert as fallback
            try {
              const { error: upsertError } = await supabase
                .from('categories')
                .upsert({
                  name: category.name,
                  description: category.description,
                  color: category.color
                }, { onConflict: 'name' });
              
              if (!upsertError) {
                syncedCount++;
                console.log(`✅ Category upserted: ${category.name}`);
              } else {
                console.log(`❌ Category upsert failed for ${category.name}:`, upsertError.message);
              }
            } catch (upsertError) {
              console.log(`❌ Category upsert failed for ${category.name}:`, upsertError.message);
            }
          }
        } catch (error) {
          console.log(`⚠️ Category sync error for ${category.name}:`, error.message);
        }
      }

      console.log(`📁 Categories sync completed: ${syncedCount}/${fallbackCategories.length}`);
      return syncedCount;
    } catch (error) {
      console.error('Error syncing categories:', error);
      return 0;
    }
  },

  // Sync technologies and skills - FORCE REPLACE APPROACH
  async syncTechnologiesAndSkills(userId) {
    try {
      const fallbackTechnologies = fallbackDataService.getTechnologies();
      const fallbackSkills = fallbackDataService.getSkills();
      
      let techCount = 0;
      let skillCount = 0;

      // Create a mapping of fallback domain_id to actual database tech_id
      const domainToTechMapping = {};

      // Sync technologies first
      for (const tech of fallbackTechnologies) {
        try {
          // First try to delete existing technology with same title
          try {
            await supabase.from('domains_technologies').delete().eq('title', tech.title).eq('user_id', userId);
          } catch (error) {
            // Ignore delete errors
          }

          const { data: techData, error: techError } = await supabase
            .from('domains_technologies')
            .insert({
              user_id: userId,
              type: tech.type,
              title: tech.title,
              sort_order: tech.sort_order
            })
            .select()
            .single();

          if (!techError && techData) {
            techCount++;
            // Store the mapping for skills
            domainToTechMapping[tech.id] = techData.id;
            console.log(`✅ Technology synced: ${tech.title}`);
          } else {
            console.log(`⚠️ Technology sync failed for ${tech.title}:`, techError?.message);
          }
        } catch (error) {
          console.log(`⚠️ Technology sync error for ${tech.title}:`, error.message);
        }
      }

      // Now sync skills using the correct tech_id mapping
      for (const skill of fallbackSkills) {
        const techId = domainToTechMapping[skill.domain_id];
        if (techId) {
          try {
            // First try to delete existing skill with same name
            try {
              await supabase.from('tech_skills').delete().eq('title', skill.name).eq('user_id', userId);
            } catch (error) {
              // Ignore delete errors
            }

            const { error: skillError } = await supabase
              .from('tech_skills')
              .insert({
                tech_id: techId,
                user_id: userId,
                title: skill.name,
                level: skill.level
              });

            if (!skillError) {
              skillCount++;
              console.log(`✅ Skill synced: ${skill.name} (Level ${skill.level})`);
            } else {
              console.log(`⚠️ Skill sync failed for ${skill.name}:`, skillError.message);
            }
          } catch (error) {
            console.log(`⚠️ Skill sync error for ${skill.name}:`, error.message);
          }
        } else {
          console.log(`⚠️ No tech_id found for skill ${skill.name} (domain_id: ${skill.domain_id})`);
        }
      }

      console.log(`🎯 Technologies sync completed: ${techCount}/${fallbackTechnologies.length} technologies, ${skillCount}/${fallbackSkills.length} skills`);
      return { technologies: techCount, skills: skillCount };
    } catch (error) {
      console.error('Error syncing technologies and skills:', error);
      return { technologies: 0, skills: 0 };
    }
  },

  // Sync niches - FORCE REPLACE APPROACH
  async syncNiches() {
    try {
      const fallbackNiches = fallbackDataService.getNiches();
      let syncedCount = 0;

      for (const niche of fallbackNiches) {
        try {
          // First try to delete existing niche with same title
          try {
            await supabase.from('niche').delete().eq('title', niche.title);
          } catch (error) {
            // Ignore delete errors
          }

          const { error } = await supabase
            .from('niche')
            .insert({
              title: niche.title,
              overview: niche.overview,
              tools: niche.tools,
              key_features: niche.key_features,
              image: niche.image,
              sort_order: niche.sort_order,
              ai_driven: niche.ai_driven
            });

          if (!error) {
            syncedCount++;
            console.log(`✅ Niche synced: ${niche.title}`);
          } else {
            console.log(`⚠️ Niche sync failed for ${niche.title}:`, error.message);
          }
        } catch (error) {
          console.log(`⚠️ Niche sync error for ${niche.title}:`, error.message);
        }
      }

      console.log(`🏆 Niches sync completed: ${syncedCount}/${fallbackNiches.length}`);
      return syncedCount;
    } catch (error) {
      console.error('Error syncing niches:', error);
      return 0;
    }
  },

  // Sync projects
  async syncProjects(userId) {
    try {
      const fallbackProjects = fallbackDataService.getProjects();
      let syncedCount = 0;

      for (const project of fallbackProjects) {
        try {
          // First try to delete existing project with same title
          try {
            await supabase.from('projects').delete().eq('title', project.title).eq('user_id', userId);
          } catch (error) {
            // Ignore delete errors
          }

          // Create project
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert({
              user_id: userId,
              title: project.title,
              description: project.description,
              category: project.category,
              overview: project.overview,
              technologies: project.technologies,
              features: project.features,
              live_url: project.live_url,
              github_url: project.github_url,
              status: project.status,
              views: project.views
            })
            .select()
            .single();

          if (!projectError && projectData) {
            syncedCount++;
            
            // Add project image
            if (project.image) {
              try {
                await supabase
                  .from('project_images')
                  .insert({
                    project_id: projectData.id,
                    user_id: userId,
                    url: project.image,
                    path: project.image,
                    name: `${project.title}-main`,
                    original_name: `${project.title} Main Image`,
                    bucket: 'images'
                  });
              } catch (imageError) {
                console.log(`⚠️ Project image sync failed for ${project.title}:`, imageError.message);
              }
            }
            console.log(`✅ Project synced: ${project.title}`);
          } else {
            console.log(`⚠️ Project sync failed for ${project.title}:`, projectError?.message);
          }
        } catch (error) {
          console.log(`⚠️ Project sync error for ${project.title}:`, error.message);
        }
      }

      console.log(`💼 Projects sync completed: ${syncedCount}/${fallbackProjects.length}`);
      return syncedCount;
    } catch (error) {
      console.error('Error syncing projects:', error);
      return 0;
    }
  },

  // Check if database is empty
  async isDatabaseEmpty() {
    try {
      const [projectsCount, techCount, nichesCount, categoriesCount] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('domains_technologies').select('id', { count: 'exact' }),
        supabase.from('niche').select('id', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' })
      ]);

      const totalCount = (
        (projectsCount.count || 0) +
        (techCount.count || 0) +
        (nichesCount.count || 0) +
        (categoriesCount.count || 0)
      );

      return totalCount === 0;
    } catch (error) {
      console.error('Error checking database status:', error);
      return false;
    }
  },

  // Get database status for more detailed information
  async getDatabaseStatus() {
    try {
      const [projectsCount, techCount, nichesCount, categoriesCount] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('domains_technologies').select('id', { count: 'exact' }),
        supabase.from('niche').select('id', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' })
      ]);

      return {
        projects: projectsCount.count || 0,
        technologies: techCount.count || 0,
        niches: nichesCount.count || 0,
        categories: categoriesCount.count || 0,
        isEmpty: (
          (projectsCount.count || 0) +
          (techCount.count || 0) +
          (nichesCount.count || 0) +
          (categoriesCount.count || 0)
        ) === 0
      };
    } catch (error) {
      console.error('Error getting database status:', error);
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
  async backupAllData() {
    try {
      console.log('📦 Starting data backup...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;

      // Fetch all data from database
      const [
        projectsData,
        technologiesData,
        skillsData,
        nichesData,
        categoriesData,
        projectImagesData
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', userId),
        supabase.from('domains_technologies').select('*').eq('user_id', userId),
        supabase.from('tech_skills').select('*').eq('user_id', userId),
        supabase.from('niche').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('project_images').select('*').eq('user_id', userId)
      ]);

      // Check for errors
      const errors = [
        projectsData.error,
        technologiesData.error,
        skillsData.error,
        nichesData.error,
        categoriesData.error,
        projectImagesData.error
      ].filter(error => error);

      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e.message).join(', ')}`);
      }

      // Organize data for backup
      const backupData = {
        metadata: {
          exported_at: new Date().toISOString(),
          user_id: userId,
          version: '1.0.0',
          total_records: {
            projects: projectsData.data?.length || 0,
            technologies: technologiesData.data?.length || 0,
            skills: skillsData.data?.length || 0,
            niches: nichesData.data?.length || 0,
            categories: categoriesData.data?.length || 0,
            project_images: projectImagesData.data?.length || 0
          }
        },
        data: {
          projects: projectsData.data || [],
          technologies: technologiesData.data || [],
          skills: skillsData.data || [],
          niches: nichesData.data || [],
          categories: categoriesData.data || [],
          project_images: projectImagesData.data || []
        }
      };

      // Create and download backup file
      const fileName = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      console.log('✅ Data backup completed successfully!');
      return {
        success: true,
        message: `Backup completed! Downloaded ${fileName}`,
        fileName,
        recordCount: backupData.metadata.total_records
      };

    } catch (error) {
      console.error('❌ Data backup failed:', error);
      return {
        success: false,
        message: `Backup failed: ${error.message}`,
        error
      };
    }
  },

  // Import data from backup file
  async importFromBackup(file) {
    try {
      console.log('📥 Starting data import...');
      
      // Read file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      const backupData = JSON.parse(fileContent);
      
      // Validate backup structure
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;
      let importedCount = 0;

      // Import categories first (no dependencies)
      if (backupData.data.categories?.length > 0) {
        for (const category of backupData.data.categories) {
          const { error } = await supabase
            .from('categories')
            .upsert({
              name: category.name,
              description: category.description,
              color: category.color
            }, { onConflict: 'name' });
          
          if (!error) importedCount++;
        }
      }

      // Import technologies
      if (backupData.data.technologies?.length > 0) {
        for (const tech of backupData.data.technologies) {
          const { error } = await supabase
            .from('domains_technologies')
            .upsert({
              user_id: userId,
              type: tech.type,
              title: tech.title,
              sort_order: tech.sort_order
            }, { onConflict: 'title' });
          
          if (!error) importedCount++;
        }
      }

      // Import niches
      if (backupData.data.niches?.length > 0) {
        for (const niche of backupData.data.niches) {
          const { error } = await supabase
            .from('niche')
            .upsert({
              title: niche.title,
              overview: niche.overview,
              tools: niche.tools,
              key_features: niche.key_features,
              image: niche.image,
              sort_order: niche.sort_order,
              ai_driven: niche.ai_driven
            }, { onConflict: 'title' });
          
          if (!error) importedCount++;
        }
      }

      // Import projects
      if (backupData.data.projects?.length > 0) {
        for (const project of backupData.data.projects) {
          const { error } = await supabase
            .from('projects')
            .upsert({
              user_id: userId,
              title: project.title,
              description: project.description,
              category: project.category,
              overview: project.overview,
              technologies: project.technologies,
              features: project.features,
              live_url: project.live_url,
              github_url: project.github_url,
              status: project.status,
              views: project.views
            }, { onConflict: 'title' });
          
          if (!error) importedCount++;
        }
      }

      console.log('✅ Data import completed successfully!');
      return {
        success: true,
        message: `Import completed! ${importedCount} records imported.`,
        importedCount
      };

    } catch (error) {
      console.error('❌ Data import failed:', error);
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        error
      };
    }
  }
}; 