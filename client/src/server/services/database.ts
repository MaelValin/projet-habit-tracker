import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import { 
  User, 
  Habit, 
  HabitEntry, 
  CreateHabitData, 
  UpdateHabitData,
  CreateHabitEntryData,
  UpdateHabitEntryData,
  HabitStats,
  DashboardStats
} from '../../shared/types';

// Fonction utilitaire pour désactiver le cache
function disableCache() {
  noStore();
}

// Services pour les utilisateurs
export class UserService {
  static async findById(id: string): Promise<User | null> {
    disableCache();
    try {
      const { rows } = await sql`
        SELECT id, email, name, created_at as "createdAt", updated_at as "updatedAt"
        FROM users 
        WHERE id = ${id}
      `;
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    disableCache();
    try {
      const { rows } = await sql`
        SELECT id, email, name, created_at as "createdAt", updated_at as "updatedAt"
        FROM users 
        WHERE email = ${email}
      `;
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur par email:', error);
      throw error;
    }
  }

  static async findByEmailWithPassword(email: string): Promise<(User & { password_hash: string }) | null> {
    disableCache();
    try {
      const { rows } = await sql`
        SELECT id, email, name, password_hash, created_at as "createdAt", updated_at as "updatedAt"
        FROM users 
        WHERE email = ${email}
      `;
      return rows.length > 0 ? rows[0] as (User & { password_hash: string }) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur avec mot de passe:', error);
      throw error;
    }
  }

  static async create(email: string, name: string, passwordHash: string): Promise<User> {
    try {
      const { rows } = await sql`
        INSERT INTO users (email, name, password_hash)
        VALUES (${email}, ${name}, ${passwordHash})
        RETURNING id, email, name, created_at as "createdAt", updated_at as "updatedAt"
      `;
      return rows[0] as User;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }
}

// Services pour les habitudes
export class HabitService {
  static async getByUserId(userId: string, search?: string): Promise<Habit[]> {
    disableCache();
    try {
      let query;
      if (search) {
        query = sql`
          SELECT id, user_id as "userId", name, description, color, 
                 created_at as "createdAt", updated_at as "updatedAt"
          FROM habits 
          WHERE user_id = ${userId} 
            AND (name ILIKE ${'%' + search + '%'} OR description ILIKE ${'%' + search + '%'})
          ORDER BY created_at DESC
        `;
      } else {
        query = sql`
          SELECT id, user_id as "userId", name, description, color, 
                 created_at as "createdAt", updated_at as "updatedAt"
          FROM habits 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
      }

      const { rows } = await query;
      return rows as Habit[];
    } catch (error) {
      console.error('Erreur lors de la récupération des habitudes:', error);
      throw error;
    }
  }

  static async getById(id: string, userId: string): Promise<Habit | null> {
    disableCache();
    try {
      const { rows } = await sql`
        SELECT id, user_id as "userId", name, description, color, 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM habits 
        WHERE id = ${id} AND user_id = ${userId}
      `;
      return rows.length > 0 ? rows[0] as Habit : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'habitude:', error);
      throw error;
    }
  }

  static async create(userId: string, data: CreateHabitData): Promise<Habit> {
    try {
      const { rows } = await sql`
        INSERT INTO habits (user_id, name, description, color)
        VALUES (${userId}, ${data.name}, ${data.description || null}, ${data.color || '#3B82F6'})
        RETURNING id, user_id as "userId", name, description, color, 
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      return rows[0] as Habit;
    } catch (error) {
      console.error('Erreur lors de la création de l\'habitude:', error);
      throw error;
    }
  }

  static async update(id: string, userId: string, data: UpdateHabitData): Promise<Habit | null> {
    try {
      const { rows } = await sql`
        UPDATE habits 
        SET name = COALESCE(${data.name}, name),
            description = COALESCE(${data.description}, description),
            color = COALESCE(${data.color}, color),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id, user_id as "userId", name, description, color, 
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      return rows.length > 0 ? rows[0] as Habit : null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'habitude:', error);
      throw error;
    }
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    try {
      const { rowCount } = await sql`
        DELETE FROM habits 
        WHERE id = ${id} AND user_id = ${userId}
      `;
      return (rowCount || 0) > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'habitude:', error);
      throw error;
    }
  }
}

// Services pour les entrées d'habitudes
export class HabitEntryService {
  static async getByHabitId(habitId: string, dateFrom?: string, dateTo?: string): Promise<HabitEntry[]> {
    disableCache();
    try {
      let query;
      if (dateFrom && dateTo) {
        query = sql`
          SELECT id, habit_id as "habitId", date, completed, notes, created_at as "createdAt"
          FROM habit_entries 
          WHERE habit_id = ${habitId} AND date >= ${dateFrom} AND date <= ${dateTo}
          ORDER BY date DESC
        `;
      } else if (dateFrom) {
        query = sql`
          SELECT id, habit_id as "habitId", date, completed, notes, created_at as "createdAt"
          FROM habit_entries 
          WHERE habit_id = ${habitId} AND date >= ${dateFrom}
          ORDER BY date DESC
        `;
      } else {
        query = sql`
          SELECT id, habit_id as "habitId", date, completed, notes, created_at as "createdAt"
          FROM habit_entries 
          WHERE habit_id = ${habitId}
          ORDER BY date DESC
          LIMIT 30
        `;
      }

      const { rows } = await query;
      return rows as HabitEntry[];
    } catch (error) {
      console.error('Erreur lors de la récupération des entrées:', error);
      throw error;
    }
  }

  static async getByDate(habitId: string, date: string): Promise<HabitEntry | null> {
    disableCache();
    try {
      const { rows } = await sql`
        SELECT id, habit_id as "habitId", date, completed, notes, created_at as "createdAt"
        FROM habit_entries 
        WHERE habit_id = ${habitId} AND date = ${date}
      `;
      return rows.length > 0 ? rows[0] as HabitEntry : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entrée:', error);
      throw error;
    }
  }

  static async upsert(data: CreateHabitEntryData): Promise<HabitEntry> {
    try {
      const { rows } = await sql`
        INSERT INTO habit_entries (habit_id, date, completed, notes)
        VALUES (${data.habitId}, ${data.date}, ${data.completed}, ${data.notes || null})
        ON CONFLICT (habit_id, date) 
        DO UPDATE SET 
          completed = EXCLUDED.completed, 
          notes = EXCLUDED.notes
        RETURNING id, habit_id as "habitId", date, completed, notes, created_at as "createdAt"
      `;
      return rows[0] as HabitEntry;
    } catch (error) {
      console.error('Erreur lors de la création/mise à jour de l\'entrée:', error);
      throw error;
    }
  }

  static async getTodayEntries(userId: string): Promise<(HabitEntry & { habitName: string })[]> {
    disableCache();
    const today = new Date().toISOString().split('T')[0];
    try {
      const { rows } = await sql`
        SELECT 
          he.id, 
          he.habit_id as "habitId", 
          he.date, 
          he.completed, 
          he.notes,
          he.created_at as "createdAt",
          h.name as "habitName"
        FROM habits h
        LEFT JOIN habit_entries he ON h.id = he.habit_id AND he.date = ${today}
        WHERE h.user_id = ${userId}
        ORDER BY h.created_at DESC
      `;
      return rows as (HabitEntry & { habitName: string })[];
    } catch (error) {
      console.error('Erreur lors de la récupération des entrées du jour:', error);
      throw error;
    }
  }
}

// Services pour les statistiques
export class StatsService {
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    disableCache();
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [habitsResult, todayResult, weeklyResult, monthlyResult] = await Promise.all([
        sql`SELECT COUNT(*) as total FROM habits WHERE user_id = ${userId}`,
        sql`
          SELECT 
            COUNT(h.id) as total_today,
            COUNT(CASE WHEN he.completed = true THEN 1 END) as completed_today
          FROM habits h
          LEFT JOIN habit_entries he ON h.id = he.habit_id AND he.date = ${today}
          WHERE h.user_id = ${userId}
        `,
        sql`
          SELECT 
            COUNT(*) as total_entries,
            COUNT(CASE WHEN completed = true THEN 1 END) as completed_entries
          FROM habit_entries he
          JOIN habits h ON he.habit_id = h.id
          WHERE h.user_id = ${userId} AND he.date >= ${weekAgo}
        `,
        sql`
          SELECT 
            COUNT(*) as total_entries,
            COUNT(CASE WHEN completed = true THEN 1 END) as completed_entries
          FROM habit_entries he
          JOIN habits h ON he.habit_id = h.id
          WHERE h.user_id = ${userId} AND he.date >= ${monthAgo}
        `
      ]);

      const habits = habitsResult.rows[0];
      const today_stats = todayResult.rows[0];
      const weekly = weeklyResult.rows[0];
      const monthly = monthlyResult.rows[0];

      return {
        totalHabits: parseInt(habits.total as string) || 0,
        todayCompleted: parseInt(today_stats.completed_today as string) || 0,
        todayTotal: parseInt(today_stats.total_today as string) || 0,
        weeklyCompletionRate: weekly.total_entries > 0 ? (parseInt(weekly.completed_entries as string) / parseInt(weekly.total_entries as string)) * 100 : 0,
        monthlyCompletionRate: monthly.total_entries > 0 ? (parseInt(monthly.completed_entries as string) / parseInt(monthly.total_entries as string)) * 100 : 0,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques du tableau de bord:', error);
      throw error;
    }
  }

  static async getHabitStats(habitId: string): Promise<HabitStats | null> {
    disableCache();
    try {
      const [habitResult, entriesResult] = await Promise.all([
        sql`SELECT name FROM habits WHERE id = ${habitId}`,
        sql`
          SELECT 
            COUNT(*) as total_days,
            COUNT(CASE WHEN completed = true THEN 1 END) as completed_days
          FROM habit_entries 
          WHERE habit_id = ${habitId}
        `
      ]);

      if (habitResult.rows.length === 0) return null;

      const habit = habitResult.rows[0];
      const entries = entriesResult.rows[0];

      const totalDays = parseInt(entries.total_days as string) || 0;
      const completedDays = parseInt(entries.completed_days as string) || 0;

      // Calcul simplifié du streak actuel
      const streakResult = await sql`
        SELECT COUNT(*) as current_streak
        FROM habit_entries 
        WHERE habit_id = ${habitId} 
          AND completed = true 
          AND date <= CURRENT_DATE
          AND date >= (
            SELECT COALESCE(MAX(date), CURRENT_DATE - INTERVAL '365 days') 
            FROM habit_entries 
            WHERE habit_id = ${habitId} AND completed = false AND date < CURRENT_DATE
          )
      `;

      const currentStreak = parseInt(streakResult.rows[0].current_streak as string) || 0;

      return {
        habitId,
        habitName: habit.name as string,
        totalDays,
        completedDays,
        streak: currentStreak,
        longestStreak: currentStreak, // Simplification pour l'instant
        completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }
}