import { executeQuery } from '@/lib/database';
import { User, AuthRequest, DbResult } from '@/types';
import { hashPassword, comparePassword } from '@/utils/auth';

export class UserService {
  // Get user by email
  static async getUserByEmail(email: string): Promise<DbResult<User>> {
    const query = 'SELECT * FROM users WHERE email = ?';
    const result = await executeQuery(query, [email]);
    
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return { success: true, data: result.data[0] as User };
    }
    return { success: false, error: 'User not found' };
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<DbResult<User>> {
    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await executeQuery(query, [userId]);
    
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return { success: true, data: result.data[0] as User };
    }
    return { success: false, error: 'User not found' };
  }

  // Create new user with domain and initial portfolio setup
  static async createUserWithDomain(email: string, password: string, fullName: string, domain: string): Promise<DbResult<User>> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser.success) {
      return { success: false, error: 'User already exists' };
    }

    // Check if domain already exists
    const existingDomain = await this.getDomainByName(domain);
    if (existingDomain.success) {
      return { success: false, error: 'Domain already exists' };
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    try {
      // 1. Create user
      const userQuery = `
        INSERT INTO users (id, email, password_hash, name, full_name, email_verified, is_admin, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)
      `;
      
      const userResult = await executeQuery(userQuery, [userId, email, hashedPassword, fullName.split(' ')[0] || fullName, fullName, now, now]);
      if (!userResult.success) {
        return { success: false, error: userResult.error || 'Failed to create user' };
      }

      // 2. Create domain
      const domainQuery = `
        INSERT INTO domains (user_id, name, status, created_at, updated_at) 
        VALUES (?, ?, 1, ?, ?)
      `;
      
      const domainResult = await executeQuery(domainQuery, [userId, domain, now, now]);
      if (!domainResult.success) {
        return { success: false, error: domainResult.error || 'Failed to create domain' };
      }

      // 3. Create default settings
      const defaultSettings = [
        { key: 'banner_name', value: fullName },
        { key: 'banner_title', value: 'Software Engineer' },
        { key: 'banner_tagline', value: 'I craft dreams, not projects.' },
        { key: 'theme_name', value: 'purple' },
        { key: 'section_hero_visible', value: 'true' },
        { key: 'section_portfolio_visible', value: 'true' },
        { key: 'section_technologies_visible', value: 'true' },
        { key: 'section_domains_visible', value: 'true' },
        { key: 'section_project_cycle_visible', value: 'true' },
        { key: 'social_email', value: email },
        { key: 'copyright_text', value: `© 2025 ${fullName}. All rights reserved.` }
      ];

      for (const setting of defaultSettings) {
        const settingId = crypto.randomUUID();
        const settingsQuery = `
          INSERT INTO settings (id, user_id, setting_key, setting_value, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const settingsResult = await executeQuery(settingsQuery, [settingId, userId, setting.key, setting.value, now, now]);
        if (!settingsResult.success) {
          console.warn(`Failed to create setting: ${setting.key}`);
        }
      }

      // 4. Create default categories
      const defaultCategories = [
        'Web Development',
        'Mobile Development', 
        'UI/UX Design',
        'E-commerce',
        'SaaS Platform'
      ];

      for (const categoryName of defaultCategories) {
        const categoryQuery = `
          INSERT INTO categories (user_id, name, status, created_at, updated_at) 
          VALUES (?, ?, 1, ?, ?)
        `;
        
        const categoryResult = await executeQuery(categoryQuery, [userId, categoryName, now, now]);
        if (!categoryResult.success) {
          console.warn(`Failed to create default category: ${categoryName}`);
        }
      }

      // 5. Create default technologies
      const defaultTechnologies = [
        'React',
        'Node.js',
        'Laravel',
        'Vue.js',
        'MySQL',
        'MongoDB',
        'AWS',
        'Docker'
      ];

      for (const techName of defaultTechnologies) {
        const techQuery = `
          INSERT INTO technologies (user_id, name, status, created_at, updated_at) 
          VALUES (?, ?, 1, ?, ?)
        `;
        
        const techResult = await executeQuery(techQuery, [userId, techName, now, now]);
        if (!techResult.success) {
          console.warn(`Failed to create default technology: ${techName}`);
        }
      }

      // 6. Create default niches
      const defaultNiches = [
        'E-commerce',
        'Healthcare',
        'Education',
        'Finance',
        'Real Estate'
      ];

      for (const nicheName of defaultNiches) {
        const nicheQuery = `
          INSERT INTO niches (user_id, name, status, created_at, updated_at) 
          VALUES (?, ?, 1, ?, ?)
        `;
        
        const nicheResult = await executeQuery(nicheQuery, [userId, nicheName, now, now]);
        if (!nicheResult.success) {
          console.warn(`Failed to create default niche: ${nicheName}`);
        }
      }
      
      // Return the created user
      return this.getUserById(userId);
      
    } catch (error) {
      console.error('Error creating user with domain:', error);
      return { success: false, error: 'Failed to create user and setup portfolio' };
    }
  }

  // Get domain by name
  static async getDomainByName(domainName: string): Promise<DbResult<any>> {
    const query = 'SELECT * FROM domains WHERE name = ?';
    const result = await executeQuery(query, [domainName]);
    
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    return { success: false, error: 'Domain not found' };
  }

  // Create new user with subdomain
  static async createUserWithSubdomain(email: string, password: string, subdomain: string): Promise<DbResult<User>> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser.success) {
      return { success: false, error: 'User already exists' };
    }

    // Check if subdomain already exists
    const domainName = `https://${subdomain}.theexpertways.com/`;
    const existingDomain = await this.getDomainByName(domainName);
    if (existingDomain.success) {
      return { success: false, error: 'Subdomain already exists' };
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    try {
      // 1. Create user
      const userQuery = `
        INSERT INTO users (id, email, password_hash, name, full_name, email_verified, is_admin, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)
      `;
      
      const userName = email.split('@')[0]; // Use email prefix as name
      const userResult = await executeQuery(userQuery, [userId, email, hashedPassword, userName, userName, now, now]);
      if (!userResult.success) {
        return { success: false, error: userResult.error || 'Failed to create user' };
      }

      // 2. Create domain
      const domainQuery = `
        INSERT INTO domains (user_id, name, status, created_at, updated_at) 
        VALUES (?, ?, 1, ?, ?)
      `;
      
      const domainResult = await executeQuery(domainQuery, [userId, domainName, now, now]);
      if (!domainResult.success) {
        return { success: false, error: domainResult.error || 'Failed to create domain' };
      }

      // 3. Create default settings
      const defaultSettings = [
        { key: 'banner_name', value: userName },
        { key: 'banner_title', value: 'Software Engineer' },
        { key: 'banner_tagline', value: 'I craft dreams, not projects.' },
        { key: 'theme_name', value: 'sand' },
        { key: 'section_hero_visible', value: 'true' },
        { key: 'section_portfolio_visible', value: 'true' },
        { key: 'section_technologies_visible', value: 'true' },
        { key: 'section_domains_visible', value: 'true' },
        { key: 'section_project_cycle_visible', value: 'true' },
        { key: 'section_prompts_visible', value: 'false' },
        { key: 'social_email', value: email },
        { key: 'copyright_text', value: `© 2025 ${userName}. All rights reserved.` }
      ];

      for (const setting of defaultSettings) {
        const settingId = crypto.randomUUID();
        const settingsQuery = `
          INSERT INTO settings (id, user_id, setting_key, setting_value, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const settingsResult = await executeQuery(settingsQuery, [settingId, userId, setting.key, setting.value, now, now]);
        if (!settingsResult.success) {
          console.warn(`Failed to create setting: ${setting.key}`);
        }
      }

      // 4. Create default categories
      const defaultCategories = [
        'Web Development',
        'Mobile Development', 
        'UI/UX Design',
        'E-commerce',
        'SaaS Platform'
      ];

      for (const categoryName of defaultCategories) {
        const categoryId = crypto.randomUUID();
        const categoryQuery = `
          INSERT INTO categories (id, user_id, name, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        const categoryResult = await executeQuery(categoryQuery, [categoryId, userId, categoryName, now, now]);
        if (!categoryResult.success) {
          console.warn(`Failed to create default category: ${categoryName}`);
        }
      }

      // 5. Create default technologies
      const defaultTechnologies = [
        'React',
        'Node.js',
        'Laravel',
        'Vue.js',
        'MySQL',
        'MongoDB',
        'AWS',
        'Docker'
      ];

      for (const techName of defaultTechnologies) {
        const techId = crypto.randomUUID();
        const techQuery = `
          INSERT INTO domains_technologies (id, user_id, type, title, sort_order, created_at, updated_at) 
          VALUES (?, ?, 'technology', ?, ?, ?, ?)
        `;
        
        const techResult = await executeQuery(techQuery, [techId, userId, techName, 1, now, now]);
        if (!techResult.success) {
          console.warn(`Failed to create default technology: ${techName}`);
        }
      }

      // 6. Create default niches
      const defaultNiches = [
        'E-commerce',
        'Healthcare',
        'Education',
        'Finance',
        'Real Estate'
      ];

      for (const nicheName of defaultNiches) {
        const nicheId = crypto.randomUUID();
        const nicheQuery = `
          INSERT INTO niche (id, user_id, name, sort_order, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const nicheResult = await executeQuery(nicheQuery, [nicheId, userId, nicheName, 1, now, now]);
        if (!nicheResult.success) {
          console.warn(`Failed to create default niche: ${nicheName}`);
        }
      }
      
      // Return the created user
      return this.getUserById(userId);
      
    } catch (error) {
      console.error('Error creating user with subdomain:', error);
      return { success: false, error: 'Failed to create user and setup portfolio' };
    }
  }

  // Create new user (legacy method - kept for backward compatibility)
  static async createUser(email: string, password: string): Promise<DbResult<User>> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser.success) {
      return { success: false, error: 'User already exists' };
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO users (id, email, password_hash, email_verified, is_admin, created_at, updated_at) 
      VALUES (?, ?, ?, 1, 0, ?, ?)
    `;
    
    const result = await executeQuery(query, [userId, email, hashedPassword, now, now]);
    if (result.success) {
      return this.getUserById(userId);
    }
    return { success: false, error: result.error || 'Failed to create user' };
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string): Promise<DbResult<User>> {
    const userResult = await this.getUserByEmail(email);
    if (!userResult.success) {
      return { success: false, error: 'Invalid credentials' };
    }

    const user = userResult.data as User & { password_hash: string };
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;
    return { success: true, data: userWithoutPassword as User };
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<User>): Promise<DbResult<User>> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const query = `
      UPDATE users SET 
        email = COALESCE(?, email),
        name = COALESCE(?, name),
        full_name = COALESCE(?, full_name),
        is_admin = COALESCE(?, is_admin),
        updated_at = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [updates.email, updates.name, updates.full_name, updates.is_admin, now, userId]);
    if (result.success) {
      return this.getUserById(userId);
    }
    return { success: false, error: result.error || 'Failed to update user' };
  }

  // Update password for user
  static async updatePassword(email: string, hashedPassword: string): Promise<DbResult<boolean>> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const query = `
      UPDATE users SET 
        password_hash = ?,
        updated_at = ?
      WHERE email = ?
    `;
    
    const result = await executeQuery(query, [hashedPassword, now, email]);
    if (result.success) {
      return { success: true, data: true };
    }
    return { success: false, error: result.error || 'Failed to update password' };
  }

  // Delete user
  static async deleteUser(userId: string): Promise<DbResult<boolean>> {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await executeQuery(query, [userId]);
    return { success: result.success, data: result.success };
  }
} 