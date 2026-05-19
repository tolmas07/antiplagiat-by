import { query } from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  is_premium: boolean;
  premium_expires_at?: Date;
  checks_today: number;
  last_check_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async create(email: string, passwordHash: string): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING *`,
      [email, passwordHash]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async updatePremiumStatus(
    userId: string,
    isPremium: boolean,
    expiresAt?: Date
  ): Promise<void> {
    await query(
      `UPDATE users
       SET is_premium = $1, premium_expires_at = $2
       WHERE id = $3`,
      [isPremium, expiresAt, userId]
    );
  }

  static async incrementCheckCount(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `UPDATE users
       SET checks_today = CASE
         WHEN last_check_date = $1 THEN checks_today + 1
         ELSE 1
       END,
       last_check_date = $1
       WHERE id = $2
       RETURNING checks_today`,
      [today, userId]
    );

    return result.rows[0].checks_today;
  }

  static async getCheckCount(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT checks_today
       FROM users
       WHERE id = $1 AND last_check_date = $2`,
      [userId, today]
    );

    return result.rows[0]?.checks_today || 0;
  }
}
