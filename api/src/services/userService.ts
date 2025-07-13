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

  // Create new user
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
      INSERT INTO users (id, email, password_hash, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?)
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
        updated_at = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [updates.email, now, userId]);
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