# 🎮 Habit Tracker - Application Gamifiée

Une application de suivi d'habitudes avec une interface gaming/hologramme qui transforme vos habitudes quotidiennes en aventure RPG.

## 🌐 Demo en ligne

🚀 **[Essayer l'application sur Vercel](https://projet-habit-tracker.vercel.app/login)**

L'application est déployée et accessible en ligne via le lien ci-dessus.

## ✨ Fonctionnalités

- **🎯 Système de gamification** : Gagnez de l'XP et montez de niveau
- **📅 Calendrier interactif** : Visualisez vos progrès quotidiens
- **🤖 Compagnon IA** : Motivation et conseils personnalisés
- **🏆 Système de quêtes** : Objectifs à long terme
- **🎨 Interface hologramme** : Design futuriste en bleu cyan
- **🔐 Authentification sécurisée** : NextAuth.js avec base de données

## 🚀 Technologies utilisées

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS, Radix UI
- **Authentification** : NextAuth.js v5 beta
- **Base de données** : Vercel Postgres
- **Validation** : Zod
- **Cryptographie** : bcrypt

## 📦 Installation

1. Installez les dépendances :
```bash
npm install
```

2. Configurez les variables d'environnement dans `.env.local` :
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

POSTGRES_URL="your-postgres-url"
# ... autres variables Postgres de Vercel
```

3. Créez le schéma de base de données avec le fichier `lib/schema.sql`

4. Lancez le serveur de développement :
```bash
npm run dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur

## 🎮 Utilisation

1. **Inscription** : Créez un compte sur `/register`
2. **Connexion** : Connectez-vous sur `/login`  
3. **Dashboard** : Gérez vos habitudes et suivez vos progrès
4. **Gamification** : Gagnez de l'XP en complétant vos habitudes quotidiennes

## 📁 Structure

- `app/` - Pages et API routes (Next.js 15 App Router)
- `components/` - Composants React réutilisables
- `lib/` - Utilitaires, types et configuration base de données
- `public/` - Assets statiques

## 🎨 Design

Interface hologramme avec thème bleu/cyan, effets de glow et animations fluides.

---

**Transformez vos habitudes en aventure gaming ! 🚀**
