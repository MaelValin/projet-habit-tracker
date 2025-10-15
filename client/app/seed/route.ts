import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Seed endpoint only available in development' }, { status: 403 });
  }

  try {
    await seedDatabase();
    return NextResponse.json({ message: 'Base de données initialisée avec succès!' });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation de la base de données' },
      { status: 500 }
    );
  }
}

async function seedDatabase() {
  // Créer les tables
  await sql`
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
  `;

  await sql`
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
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS habit_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMP DEFAULT NOW(),
      notes TEXT,
      value INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
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
  `;

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await sql`
    INSERT INTO users (email, password, name)
    VALUES ('test@example.com', ${hashedPassword}, 'Utilisateur Test')
    ON CONFLICT (email) DO UPDATE SET
      password = EXCLUDED.password,
      name = EXCLUDED.name
    RETURNING id
  `;

  const userId = user.rows[0].id;

  // Créer des habitudes de test
  const habits = [
    {
      title: 'Boire 8 verres d\'eau',
      description: 'Rester hydraté tout au long de la journée',
      category: 'health',
      frequency: 'daily',
      targetCount: 8
    },
    {
      title: 'Faire 30 minutes d\'exercice',
      description: 'Maintenir une routine d\'exercice régulière',
      category: 'fitness',
      frequency: 'daily',
      targetCount: 1
    },
    {
      title: 'Lire 20 pages',
      description: 'Développer l\'habitude de lecture quotidienne',
      category: 'learning',
      frequency: 'daily',
      targetCount: 20
    },
    {
      title: 'Méditer 10 minutes',
      description: 'Pratiquer la pleine conscience',
      category: 'mindfulness',
      frequency: 'daily',
      targetCount: 10
    }
  ];

  for (const habit of habits) {
    await sql`
      INSERT INTO habits (user_id, title, description, category, frequency, target_count)
      VALUES (${userId}, ${habit.title}, ${habit.description}, ${habit.category}, ${habit.frequency}, ${habit.targetCount})
      ON CONFLICT DO NOTHING
    `;
  }

  console.log('Base de données initialisée avec succès!');
}
