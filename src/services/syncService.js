import { supabase } from '../config/supabase';
import { fallbackDataService } from './fallbackDataService';

export const syncService = {
  // Reset/Clear ALL user data
  async resetAllUserData() {
    try {
      console.log('🗑️ Starting complete data reset...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;
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
      
      // 1. Delete project images first (depends on projects)
      const { count: imageCount } = await supabase
        .from('project_images')
        .delete()
        .eq('user_id', userId);
      deletedCounts.project_images = imageCount || 0;

      // 2. Delete tech skills (depends on domains_technologies)
      const { count: skillsCount } = await supabase
        .from('tech_skills')
        .delete()
        .eq('user_id', userId);
      deletedCounts.tech_skills = skillsCount || 0;

      // 3. Delete projects
      const { count: projectsCount } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', userId);
      deletedCounts.projects = projectsCount || 0;

      // 4. Delete domains/technologies
      const { count: techCount } = await supabase
        .from('domains_technologies')
        .delete()
        .eq('user_id', userId);
      deletedCounts.domains_technologies = techCount || 0;

      // 5. Delete user categories
      const { count: categoriesCount } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', userId);
      deletedCounts.categories = categoriesCount || 0;

      // 6. Delete user niches
      const { count: nicheCount } = await supabase
        .from('niche')
        .delete()
        .eq('user_id', userId);
      deletedCounts.niche = nicheCount || 0;

      // 7. Delete user settings
      const { count: settingsCount } = await supabase
        .from('settings')
        .delete()
        .eq('user_id', userId);
      deletedCounts.settings = settingsCount || 0;

      console.log('✅ Data reset completed:', deletedCounts);
      
      return {
        success: true,
        message: 'All user data has been reset successfully!',
        deletedCounts
      };

    } catch (error) {
      console.error('❌ Data reset failed:', error);
      return {
        success: false,
        message: `Reset failed: ${error.message}`,
        error
      };
    }
  },

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

      // 2. Sync Categories (now user-specific)
      console.log('📁 Syncing categories...');
      const categoriesResult = await this.syncCategories(userId);
      results.categories = categoriesResult;

      // 3. Sync Technologies and Skills
      console.log('🎯 Syncing technologies and skills...');
      const techResult = await this.syncTechnologiesAndSkills(userId);
      results.technologies = techResult.technologies;
      results.skills = techResult.skills;

      // 4. Sync Niches (now user-specific)
      console.log('🏆 Syncing niches...');
      const nichesResult = await this.syncNiches(userId);
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
      
      // Clear user-specific data in correct order (dependencies first)
      const userDataOperations = [
        supabase.from('project_images').delete().eq('user_id', userId),
        supabase.from('tech_skills').delete().eq('user_id', userId),
        supabase.from('projects').delete().eq('user_id', userId),
        supabase.from('domains_technologies').delete().eq('user_id', userId),
        supabase.from('categories').delete().eq('user_id', userId),
        supabase.from('niche').delete().eq('user_id', userId)
      ];

      const userResults = await Promise.allSettled(userDataOperations);
      console.log('✅ User data cleared:', userResults.map(r => r.status === 'fulfilled' ? (r.value.count || 0) : 0));
      
      console.log('✅ All existing data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      // Don't throw error, continue with sync
    }
  },

  // Sync categories - NOW USER-SPECIFIC
  async syncCategories(userId) {
    try {
      const fallbackCategories = fallbackDataService.getCategories();
      let syncedCount = 0;

      console.log('📁 Starting categories sync...');

      // Insert categories with user_id
      for (const category of fallbackCategories) {
        try {
          const { error } = await supabase
            .from('categories')
            .insert({
              user_id: userId,
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
                  user_id: userId,
                  name: category.name,
                  description: category.description,
                  color: category.color
                }, { onConflict: 'name,user_id' });
              
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
  async syncNiches(userId) {
    try {
      const fallbackNiches = fallbackDataService.getNiches();
      let syncedCount = 0;

      for (const niche of fallbackNiches) {
        try {
          // First try to delete existing niche with same title
          try {
            await supabase.from('niche').delete().eq('title', niche.title).eq('user_id', userId);
          } catch (error) {
            // Ignore delete errors
          }

          const { error } = await supabase
            .from('niche')
            .insert({
              user_id: userId,
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

      // Fetch all data from database with relationships
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
        supabase.from('tech_skills').select(`
          *,
          domains_technologies!tech_skills_tech_id_fkey(title)
        `).eq('user_id', userId),
        supabase.from('niche').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('project_images').select(`
          *,
          projects!project_images_project_id_fkey(title)
        `).eq('user_id', userId)
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

      // Clear all existing data first
      console.log('🗑️ Clearing existing data before import...');
      await this.clearAllData(userId);

      // Clear global tables (categories and niches)
      try {
        await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('niche').delete().neq('id', 0);
        console.log('✅ Global tables cleared');
      } catch (error) {
        console.log('⚠️ Could not clear global tables:', error.message);
      }

      // Import categories first (no dependencies)
      if (backupData.data.categories?.length > 0) {
        console.log('📁 Importing categories...');
        for (const category of backupData.data.categories) {
          const { error } = await supabase
            .from('categories')
            .insert({
              user_id: userId,
              name: category.name,
              description: category.description,
              color: category.color
            });
          
          if (!error) importedCount++;
        }
      }

      // Import technologies
      if (backupData.data.technologies?.length > 0) {
        console.log('🎯 Importing technologies...');
        for (const tech of backupData.data.technologies) {
          const { error } = await supabase
            .from('domains_technologies')
            .insert({
              user_id: userId,
              type: tech.type,
              title: tech.title,
              sort_order: tech.sort_order
            });
          
          if (!error) importedCount++;
        }
      }

      // Import niches
      if (backupData.data.niches?.length > 0) {
        console.log('🏆 Importing niches...');
        for (const niche of backupData.data.niches) {
          const { error } = await supabase
            .from('niche')
            .insert({
              user_id: userId,
              title: niche.title,
              overview: niche.overview,
              tools: niche.tools,
              key_features: niche.key_features,
              image: niche.image,
              sort_order: niche.sort_order,
              ai_driven: niche.ai_driven
            });
          
          if (!error) importedCount++;
        }
      }

      // Import projects
      if (backupData.data.projects?.length > 0) {
        console.log('💼 Importing projects...');
        for (const project of backupData.data.projects) {
          const { error } = await supabase
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
            });
          
          if (!error) importedCount++;
        }
      }

      // Import skills (after technologies are imported)
      if (backupData.data.skills?.length > 0) {
        console.log('⚡ Importing skills...');
        
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
              console.log(`🔍 Found tech_title via mapping for skill ${skill.title}: ${techTitle}`);
            }
            
            if (!techTitle) {
              console.log(`⚠️ No technology found for skill ${skill.title} (tech_title: ${skill.tech_title}, tech_id: ${skill.tech_id})`);
              continue;
            }

            // Find the technology by title to get the correct tech_id
            const { data: techData, error: techError } = await supabase
              .from('domains_technologies')
              .select('id')
              .eq('title', techTitle)
              .eq('user_id', userId);

            if (techError) {
              console.log(`⚠️ Could not find technology for skill ${skill.title}:`, techError.message);
              continue;
            }

            if (techData && techData.length > 0) {
              const { error } = await supabase
                .from('tech_skills')
                .insert({
                  tech_id: techData[0].id,
                  user_id: userId,
                  title: skill.title,
                  level: skill.level
                });
              
              if (!error) {
                importedCount++;
                console.log(`✅ Skill imported: ${skill.title} -> ${techTitle}`);
              } else {
                console.log(`⚠️ Skill import failed for ${skill.title}:`, error.message);
              }
            } else {
              console.log(`⚠️ No technology found for skill ${skill.title} (tech_title: ${techTitle})`);
            }
          } catch (error) {
            console.log(`⚠️ Skill import error for ${skill.title}:`, error.message);
          }
        }
      }

      // Import project images (after projects are imported)
      if (backupData.data.project_images?.length > 0) {
        console.log('🖼️ Importing project images...');
        
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
              console.log(`🔍 Found project_title via mapping for image ${image.name}: ${projectTitle}`);
            }
            
            if (!projectTitle) {
              console.log(`⚠️ No project found for image ${image.name} (project_title: ${image.project_title}, project_id: ${image.project_id})`);
              continue;
            }

            // Find the project by title to get the correct project_id
            const { data: projectData, error: projectError } = await supabase
              .from('projects')
              .select('id')
              .eq('title', projectTitle)
              .eq('user_id', userId);

            if (projectError) {
              console.log(`⚠️ Could not find project for image ${image.name}:`, projectError.message);
              continue;
            }

            if (projectData && projectData.length > 0) {
              const { error } = await supabase
                .from('project_images')
                .insert({
                  project_id: projectData[0].id,
                  user_id: userId,
                  url: image.url,
                  path: image.path,
                  name: image.name,
                  original_name: image.original_name,
                  bucket: image.bucket
                });
              
              if (!error) {
                importedCount++;
                console.log(`✅ Project image imported: ${image.name} -> ${projectTitle}`);
              } else {
                console.log(`⚠️ Project image import failed for ${image.name}:`, error.message);
              }
            } else {
              console.log(`⚠️ No project found for image ${image.name} (project_title: ${projectTitle})`);
            }
          } catch (error) {
            console.log(`⚠️ Project image import error for ${image.name}:`, error.message);
          }
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