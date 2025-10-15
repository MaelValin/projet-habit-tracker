import { sql } from '@vercel/postgres';
import { Habit, HabitEntry, UserProfile, Achievement, Quest, UserQuest } from './habit-definitions';

// Configuration de la base de données
export const db = {
  // Users
  async createUser(email: string, hashedPassword: string, name: string): Promise<UserProfile> {
    const result = await sql`
      INSERT INTO users (id, email, password, name, level, total_xp, joined_at, settings)
      VALUES (gen_random_uuid(), ${email}, ${hashedPassword}, ${name}, 1, 0, NOW(), 
        '{"timezone": "UTC", "notifications": {"daily": true, "weekly": true, "achievements": true}, "theme": "system"}'::jsonb)
      RETURNING id, name, email, level, total_xp, joined_at, settings
    `;
    
    const user = result.rows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      level: user.level,
      totalXP: user.total_xp,
      joinedAt: user.joined_at,
      settings: user.settings
    };
  },

  async getUserByEmail(email: string) {
    const result = await sql`
      SELECT id, email, password, name, level, total_xp, joined_at, settings, avatar
      FROM users 
      WHERE email = ${email}
    `;
    return result.rows[0];
  },

  async getUserById(id: string): Promise<UserProfile | null> {
    const result = await sql`
      SELECT id, name, email, level, total_xp, joined_at, settings, avatar
      FROM users 
      WHERE id = ${id}
    `;
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      level: user.level,
      totalXP: user.total_xp,
      joinedAt: user.joined_at,
      settings: user.settings,
      avatar: user.avatar
    };
  },

  // Habits
  async createHabit(userId: string, habitData: {
    title: string;
    description?: string;
    category: string;
    frequency: string;
    targetCount: number;
  }): Promise<Habit> {
    const result = await sql`
      INSERT INTO habits (id, user_id, title, description, category, frequency, target_count, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${userId}, ${habitData.title}, ${habitData.description || ''}, 
        ${habitData.category}, ${habitData.frequency}, ${habitData.targetCount}, true, NOW(), NOW())
      RETURNING *
    `;
    
    const habit = result.rows[0];
    return {
      id: habit.id,
      userId: habit.user_id,
      title: habit.title,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      targetCount: habit.target_count,
      isActive: habit.is_active,
      createdAt: habit.created_at,
      updatedAt: habit.updated_at
    };
  },

  async getHabitsByUserId(userId: string): Promise<Habit[]> {
    const result = await sql`
      SELECT * FROM habits 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
    
    return result.rows.map(habit => ({
      id: habit.id,
      userId: habit.user_id,
      title: habit.title,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      targetCount: habit.target_count,
      isActive: habit.is_active,
      createdAt: habit.created_at,
      updatedAt: habit.updated_at
    }));
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'userId')
      .map(key => {
        const dbKey = key === 'userId' ? 'user_id' : 
                     key === 'targetCount' ? 'target_count' :
                     key === 'isActive' ? 'is_active' :
                     key === 'createdAt' ? 'created_at' :
                     key === 'updatedAt' ? 'updated_at' : key;
        return `${dbKey} = $${Object.keys(updates).indexOf(key) + 2}`;
      })
      .join(', ');

    const values = [habitId, ...Object.values(updates).filter((_, index) => 
      Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'userId'
    ), new Date()];

    const result = await sql.query(
      `UPDATE habits SET ${setClause}, updated_at = $${values.length} WHERE id = $1 RETURNING *`,
      values
    );
    
    const habit = result.rows[0];
    return {
      id: habit.id,
      userId: habit.user_id,
      title: habit.title,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      targetCount: habit.target_count,
      isActive: habit.is_active,
      createdAt: habit.created_at,
      updatedAt: habit.updated_at
    };
  },

  async deleteHabit(habitId: string): Promise<void> {
    await sql`DELETE FROM habits WHERE id = ${habitId}`;
  },

  // Habit Entries
  async createHabitEntry(entryData: {
    habitId: string;
    userId: string;
    completed: boolean;
    notes?: string;
    value?: number;
  }): Promise<HabitEntry> {
    const result = await sql`
      INSERT INTO habit_entries (id, habit_id, user_id, completed, completed_at, notes, value)
      VALUES (gen_random_uuid(), ${entryData.habitId}, ${entryData.userId}, 
        ${entryData.completed}, NOW(), ${entryData.notes || ''}, ${entryData.value || 0})
      RETURNING *
    `;
    
    const entry = result.rows[0];
    return {
      id: entry.id,
      habitId: entry.habit_id,
      userId: entry.user_id,
      completed: entry.completed,
      completedAt: entry.completed_at,
      notes: entry.notes,
      value: entry.value
    };
  },

  async getHabitEntriesByDate(userId: string, date: string): Promise<HabitEntry[]> {
    const result = await sql`
      SELECT * FROM habit_entries 
      WHERE user_id = ${userId} 
      AND DATE(completed_at) = ${date}
      ORDER BY completed_at DESC
    `;
    
    return result.rows.map(entry => ({
      id: entry.id,
      habitId: entry.habit_id,
      userId: entry.user_id,
      completed: entry.completed,
      completedAt: entry.completed_at,
      notes: entry.notes,
      value: entry.value
    }));
  },

  async getHabitEntriesByHabitId(habitId: string, limit: number = 30): Promise<HabitEntry[]> {
    const result = await sql`
      SELECT * FROM habit_entries 
      WHERE habit_id = ${habitId}
      ORDER BY completed_at DESC
      LIMIT ${limit}
    `;
    
    return result.rows.map(entry => ({
      id: entry.id,
      habitId: entry.habit_id,
      userId: entry.user_id,
      completed: entry.completed,
      completedAt: entry.completed_at,
      notes: entry.notes,
      value: entry.value
    }));
  },

  // Dashboard data
  async getDashboardData(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const [habits, todayEntries, achievements] = await Promise.all([
      this.getHabitsByUserId(userId),
      this.getHabitEntriesByDate(userId, today),
      this.getAchievementsByUserId(userId)
    ]);

    const stats = {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.isActive).length,
      completedToday: todayEntries.filter(e => e.completed).length,
      currentStreak: 0 // TODO: Calculate streak
    };

    return {
      habits,
      todayEntries,
      stats,
      achievements,
      activeQuests: [] // TODO: Implement quests
    };
  },

  // Achievements
  async getAchievementsByUserId(userId: string): Promise<Achievement[]> {
    const result = await sql`
      SELECT * FROM achievements 
      WHERE user_id = ${userId}
      ORDER BY unlocked_at DESC
    `;
    
    return result.rows.map(achievement => ({
      id: achievement.id,
      userId: achievement.user_id,
      type: achievement.type,
      title: achievement.title,
      description: achievement.description,
      unlockedAt: achievement.unlocked_at,
      habitId: achievement.habit_id
    }));
  }
};