-- Script de création des tables pour le habit tracker
-- À exécuter dans Vercel Postgres

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{"timezone": "UTC", "notifications": {"daily": true, "weekly": true, "achievements": true}, "theme": "system"}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des habitudes
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'productivity', 'learning', 'fitness', 'mindfulness', 'other')),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  target_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des entrées d'habitudes (complétions)
CREATE TABLE IF NOT EXISTS habit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  value INTEGER DEFAULT 0, -- Pour les habitudes quantifiables
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('streak', 'completion', 'consistency', 'milestone')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des quêtes
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
  requirements JSONB NOT NULL,
  rewards JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des quêtes des utilisateurs
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habit_entries_user_id ON habit_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id ON habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(DATE(completed_at));
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_active ON user_quests(is_completed);

-- Fonctions utilitaires

-- Fonction pour calculer les streaks
CREATE OR REPLACE FUNCTION calculate_habit_streak(habit_id_param UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER) AS $$
BEGIN
  -- Cette fonction calculera les streaks pour une habitude donnée
  -- Implémentation simplifiée pour l'exemple
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(*)::INTEGER, 0) as current_streak,
    COALESCE(COUNT(*)::INTEGER, 0) as longest_streak
  FROM habit_entries 
  WHERE habit_id = habit_id_param 
    AND completed = true 
    AND completed_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at 
    BEFORE UPDATE ON habits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quests_updated_at ON quests;
CREATE TRIGGER update_quests_updated_at 
    BEFORE UPDATE ON quests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données de test (optionnel)
INSERT INTO quests (title, description, type, requirements, rewards) VALUES
('Premier pas', 'Créez votre première habitude', 'special', 
 '{"type": "create_habit", "targetValue": 1}', 
 '{"type": "xp", "value": 50}'),
('Consistance hebdomadaire', 'Complétez une habitude 7 jours consécutifs', 'weekly',
 '{"type": "maintain_streak", "targetValue": 7}',
 '{"type": "xp", "value": 100}'),
('Maître des habitudes', 'Maintenez 5 habitudes actives simultanément', 'monthly',
 '{"type": "active_habits", "targetValue": 5}',
 '{"type": "xp", "value": 200}')
ON CONFLICT DO NOTHING;