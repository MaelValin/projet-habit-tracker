import { sql } from '@vercel/postgres';
import type { 
  User, 
  Habit, 
  HabitInstance, 
  XPLog, 
  Quest,
  UserSettings,
  CharacterClass,
  UserStats,
  CalendarDay,
  CreateHabitDTO,
  UpdateHabitDTO 
} from './types';

// Configuration de la base de données
export async function createTables() {
  try {
    // Lire et exécuter le schéma SQL
    const schemaFile = await import('./schema.sql');
    await sql.query(schemaFile.default);
    console.log('Tables créées avec succès');
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
    throw error;
  }
}

// Users
export async function createUser(userData: {
  email: string;
  name: string;
  passwordHash?: string;
}): Promise<User> {
  const { rows } = await sql`
    INSERT INTO users (email, name, password_hash)
    VALUES (${userData.email}, ${userData.name}, ${userData.passwordHash || null})
    RETURNING *
  `;
  return mapRowToUser(rows[0]);
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT * FROM users WHERE id = ${id}
  `;
  return rows[0] ? mapRowToUser(rows[0]) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return rows[0] ? mapRowToUser(rows[0]) : null;
}

export async function updateUserXP(userId: string, xpToAdd: number): Promise<User> {
  const { rows } = await sql`
    UPDATE users 
    SET current_xp = current_xp + ${xpToAdd},
        total_xp = total_xp + ${xpToAdd}
    WHERE id = ${userId}
    RETURNING *
  `;
  return mapRowToUser(rows[0]);
}

export async function updateUserLevel(userId: string, newLevel: number): Promise<User> {
  const { rows } = await sql`
    UPDATE users 
    SET level = ${newLevel}, current_xp = 0
    WHERE id = ${userId}
    RETURNING *
  `;
  return mapRowToUser(rows[0]);
}

// Habits
export async function createHabit(userId: string, habitData: CreateHabitDTO): Promise<Habit> {
  const xpReward = getXPRewardForDifficulty(habitData.difficulty);
  
  const { rows } = await sql`
    INSERT INTO habits (user_id, name, description, category, frequency, target_count, xp_reward, difficulty)
    VALUES (${userId}, ${habitData.name}, ${habitData.description || null}, 
            ${habitData.category}, ${habitData.frequency}, ${habitData.targetCount}, 
            ${xpReward}, ${habitData.difficulty})
    RETURNING *
  `;
  return mapRowToHabit(rows[0]);
}

export async function getUserHabits(userId: string, activeOnly = true): Promise<Habit[]> {
  const query = activeOnly 
    ? sql`SELECT * FROM habits WHERE user_id = ${userId} AND is_active = true ORDER BY created_at DESC`
    : sql`SELECT * FROM habits WHERE user_id = ${userId} ORDER BY created_at DESC`;
    
  const { rows } = await query;
  return rows.map(mapRowToHabit);
}

export async function getHabitById(habitId: string): Promise<Habit | null> {
  const { rows } = await sql`
    SELECT * FROM habits WHERE id = ${habitId}
  `;
  return rows[0] ? mapRowToHabit(rows[0]) : null;
}

export async function updateHabit(habitId: string, updates: UpdateHabitDTO): Promise<Habit> {
  const setParts: string[] = [];
  const values: any[] = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      setParts.push(`${key} = $${values.length + 1}`);
      values.push(value);
    }
  });
  
  if (setParts.length === 0) {
    throw new Error('Aucune mise à jour fournie');
  }
  
  values.push(habitId); // Pour la clause WHERE
  
  const { rows } = await sql.query(`
    UPDATE habits 
    SET ${setParts.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING *
  `, values);
  
  return mapRowToHabit(rows[0]);
}

export async function deleteHabit(habitId: string): Promise<void> {
  await sql`DELETE FROM habits WHERE id = ${habitId}`;
}

// Habit Instances
export async function completeHabitInstance(
  habitId: string, 
  userId: string, 
  date: Date,
  notes?: string
): Promise<HabitInstance> {
  const dateStr = date.toISOString().split('T')[0];
  
  // Récupérer les infos de l'habitude pour l'XP
  const habit = await getHabitById(habitId);
  if (!habit) throw new Error('Habitude non trouvée');
  
  const { rows } = await sql`
    INSERT INTO habit_instances (habit_id, user_id, date, is_completed, completed_at, xp_earned, notes)
    VALUES (${habitId}, ${userId}, ${dateStr}, true, NOW(), ${habit.xpReward}, ${notes || null})
    ON CONFLICT (habit_id, user_id, date) 
    DO UPDATE SET 
      is_completed = true, 
      completed_at = NOW(), 
      xp_earned = ${habit.xpReward},
      notes = ${notes || null}
    RETURNING *
  `;
  
  // Mettre à jour l'XP utilisateur
  await updateUserXP(userId, habit.xpReward);
  
  // Logger l'XP
  await logXP(userId, habit.xpReward, 'habit', `Habitude complétée: ${habit.name}`, habitId);
  
  return mapRowToHabitInstance(rows[0]);
}

export async function uncompleteHabitInstance(
  habitId: string, 
  userId: string, 
  date: Date
): Promise<void> {
  const dateStr = date.toISOString().split('T')[0];
  
  await sql`
    UPDATE habit_instances 
    SET is_completed = false, completed_at = NULL, xp_earned = 0
    WHERE habit_id = ${habitId} AND user_id = ${userId} AND date = ${dateStr}
  `;
}

export async function getHabitInstancesForDate(
  userId: string, 
  date: Date
): Promise<HabitInstance[]> {
  const dateStr = date.toISOString().split('T')[0];
  
  const { rows } = await sql`
    SELECT hi.* FROM habit_instances hi
    JOIN habits h ON hi.habit_id = h.id
    WHERE hi.user_id = ${userId} AND hi.date = ${dateStr} AND h.is_active = true
    ORDER BY hi.created_at
  `;
  
  return rows.map(mapRowToHabitInstance);
}

export async function getCalendarMonth(
  userId: string, 
  year: number, 
  month: number
): Promise<CalendarDay[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const { rows } = await sql`
    SELECT 
      hi.date,
      h.id as habit_id,
      h.name as habit_name,
      h.category,
      hi.is_completed,
      hi.xp_earned
    FROM habit_instances hi
    JOIN habits h ON hi.habit_id = h.id
    WHERE hi.user_id = ${userId} 
      AND hi.date >= ${startDate.toISOString().split('T')[0]}
      AND hi.date <= ${endDate.toISOString().split('T')[0]}
      AND h.is_active = true
    ORDER BY hi.date, h.created_at
  `;
  
  // Grouper par date
  const dayMap = new Map<string, CalendarDay>();
  
  rows.forEach(row => {
    const dateKey = row.date;
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        date: new Date(row.date),
        habits: [],
        totalXpEarned: 0,
        completionRate: 0
      });
    }
    
    const day = dayMap.get(dateKey)!;
    day.habits.push({
      habitId: row.habit_id,
      habitName: row.habit_name,
      isCompleted: row.is_completed,
      category: row.category
    });
    
    if (row.is_completed) {
      day.totalXpEarned += row.xp_earned;
    }
  });
  
  // Calculer les taux de completion
  dayMap.forEach(day => {
    const completed = day.habits.filter(h => h.isCompleted).length;
    day.completionRate = day.habits.length > 0 ? (completed / day.habits.length) * 100 : 0;
  });
  
  return Array.from(dayMap.values());
}

// XP Logs
export async function logXP(
  userId: string, 
  amount: number, 
  source: 'habit' | 'quest' | 'bonus' | 'levelup',
  description: string,
  habitId?: string
): Promise<XPLog> {
  const { rows } = await sql`
    INSERT INTO xp_logs (user_id, habit_id, amount, source, description)
    VALUES (${userId}, ${habitId || null}, ${amount}, ${source}, ${description})
    RETURNING *
  `;
  return mapRowToXPLog(rows[0]);
}

export async function getUserXPLogs(userId: string, limit = 50): Promise<XPLog[]> {
  const { rows } = await sql`
    SELECT * FROM xp_logs 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return rows.map(mapRowToXPLog);
}

// User Stats
export async function getUserStats(userId: string): Promise<UserStats> {
  const [habitsCount, completionsToday, totalXP, streak] = await Promise.all([
    getHabitsCount(userId),
    getCompletionsToday(userId),
    getTotalXP(userId),
    getCurrentStreak(userId)
  ]);
  
  return {
    totalHabits: habitsCount.total,
    activeHabits: habitsCount.active,
    completedToday: completionsToday,
    currentStreak: streak.current,
    maxStreak: streak.max,
    totalXp: totalXP,
    level: calculateLevel(totalXP),
    habitsThisWeek: await getCompletionsThisWeek(userId),
    habitsThisMonth: await getCompletionsThisMonth(userId),
    favoriteCategory: await getFavoriteCategory(userId),
    perfectDays: await getPerfectDays(userId)
  };
}

// Utilitaires de mapping
function mapRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    level: row.level,
    currentXp: row.current_xp,
    totalXp: row.total_xp,
    streak: row.streak,
    maxStreak: row.max_streak,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    characterClass: row.character_class
  };
}

function mapRowToHabit(row: any): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    category: row.category,
    frequency: row.frequency,
    targetCount: row.target_count,
    xpReward: row.xp_reward,
    difficulty: row.difficulty,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    currentStreak: row.current_streak,
    maxStreak: row.max_streak,
    totalCompletions: row.total_completions
  };
}

function mapRowToHabitInstance(row: any): HabitInstance {
  return {
    id: row.id,
    habitId: row.habit_id,
    userId: row.user_id,
    date: new Date(row.date),
    isCompleted: row.is_completed,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    xpEarned: row.xp_earned,
    notes: row.notes
  };
}

function mapRowToXPLog(row: any): XPLog {
  return {
    id: row.id,
    userId: row.user_id,
    habitId: row.habit_id,
    amount: row.amount,
    source: row.source,
    description: row.description,
    createdAt: new Date(row.created_at)
  };
}

// Utilitaires
function getXPRewardForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 10;
    case 'medium': return 20;
    case 'hard': return 35;
    case 'epic': return 50;
    default: return 10;
  }
}

function calculateLevel(totalXp: number): number {
  // Formule: Level = floor(sqrt(totalXp / 100)) + 1
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

// Fonctions utilitaires pour les stats (à implémenter)
async function getHabitsCount(userId: string) {
  const { rows } = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN is_active THEN 1 END) as active
    FROM habits WHERE user_id = ${userId}
  `;
  return { total: parseInt(rows[0].total), active: parseInt(rows[0].active) };
}

async function getCompletionsToday(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await sql`
    SELECT COUNT(*) as count 
    FROM habit_instances 
    WHERE user_id = ${userId} AND date = ${today} AND is_completed = true
  `;
  return parseInt(rows[0].count);
}

async function getTotalXP(userId: string) {
  const { rows } = await sql`SELECT total_xp FROM users WHERE id = ${userId}`;
  return rows[0]?.total_xp || 0;
}

async function getCurrentStreak(userId: string) {
  const { rows } = await sql`SELECT streak, max_streak FROM users WHERE id = ${userId}`;
  return { current: rows[0]?.streak || 0, max: rows[0]?.max_streak || 0 };
}

async function getCompletionsThisWeek(userId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const { rows } = await sql`
    SELECT COUNT(*) as count 
    FROM habit_instances 
    WHERE user_id = ${userId} 
      AND date >= ${weekAgo.toISOString().split('T')[0]} 
      AND is_completed = true
  `;
  return parseInt(rows[0].count);
}

async function getCompletionsThisMonth(userId: string) {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  
  const { rows } = await sql`
    SELECT COUNT(*) as count 
    FROM habit_instances 
    WHERE user_id = ${userId} 
      AND date >= ${monthAgo.toISOString().split('T')[0]} 
      AND is_completed = true
  `;
  return parseInt(rows[0].count);
}

async function getFavoriteCategory(userId: string) {
  const { rows } = await sql`
    SELECT h.category, COUNT(*) as count
    FROM habit_instances hi
    JOIN habits h ON hi.habit_id = h.id
    WHERE hi.user_id = ${userId} AND hi.is_completed = true
    GROUP BY h.category
    ORDER BY count DESC
    LIMIT 1
  `;
  return rows[0]?.category || 'health';
}

async function getPerfectDays(userId: string) {
  // Jours où toutes les habitudes actives ont été complétées
  const { rows } = await sql`
    WITH daily_stats AS (
      SELECT 
        hi.date,
        COUNT(*) as total_habits,
        COUNT(CASE WHEN hi.is_completed THEN 1 END) as completed_habits
      FROM habit_instances hi
      JOIN habits h ON hi.habit_id = h.id
      WHERE hi.user_id = ${userId} AND h.is_active = true
      GROUP BY hi.date
    )
    SELECT COUNT(*) as perfect_days
    FROM daily_stats
    WHERE total_habits = completed_habits AND total_habits > 0
  `;
  return parseInt(rows[0].perfect_days);
}