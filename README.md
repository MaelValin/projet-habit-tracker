# 🎮 Habit Tracker - Application de Suivi d'Habitudes Gamifiée

Une application web moderne de suivi d'habitudes avec un système de gamification complet, construite avec Next.js 15 et React 19.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black.svg)
![React](https://img.shields.io/badge/React-19.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)

## ✨ Fonctionnalités

### 🎯 Système d'Habitudes
- **Création d'habitudes personnalisées** avec catégories (Santé, Fitness, Apprentissage, etc.)
- **Système de fréquence flexible** :
  - **Quotidien** : Habitude répétée chaque jour
  - **Hebdomadaire** : Habitude répétée chaque semaine le même jour
  - **Unique** : Habitude pour une date spécifique uniquement
- **Niveaux de difficulté** avec récompenses XP adaptées (Facile: 10 XP, Moyen: 20 XP, Difficile: 35 XP)

### 🏆 Gamification
- **Système d'expérience (XP)** avec progression automatique
- **Niveaux de personnage** (100 XP = 1 niveau)
- **Barre de progression visuelle** montrant l'avancement dans le niveau actuel
- **Récompenses immédiates** pour chaque habitude complétée

### 📅 Calendrier Interactif
- **Vue mensuelle** avec navigation fluide
- **Codage couleur intelligent** :
  - 🔵 **Bleu** : Journées avec toutes les habitudes complétées
  - 🔴 **Rouge** : Journées passées avec des habitudes incomplètes
  - ⚪ **Neutre** : Journées sans habitudes ou futures
- **Navigation temporelle** : Cliquez sur n'importe quelle date pour voir les habitudes
- **Mode lecture seule** pour les dates passées

### 🔐 Authentification
- **Inscription/Connexion sécurisée** avec NextAuth.js v5
- **Chiffrement des mots de passe** avec bcrypt
- **Sessions persistantes** avec gestion automatique

### 📱 Interface Moderne
- **Design responsive** optimisé pour mobile et desktop
- **Thème sombre** avec effets visuels élégants
- **Animations fluides** et feedback utilisateur
- **Interface intuitive** avec navigation simplifiée

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 18.0 ou supérieur
- **npm** ou **pnpm**

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/MaelValin/projet-habit-tracker.git
cd projet-habit-tracker/client
```

2. **Installer les dépendances**
```bash
npm install
# ou
pnpm install
```

3. **Configurer la base de données**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

4. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

Éditer `.env.local` :
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

5. **Démarrer l'application**
```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 15.5.5** - Framework React avec App Router
- **React 19** - Interface utilisateur moderne
- **TypeScript** - Typage statique pour plus de robustesse
- **Tailwind CSS** - Framework CSS utilitaire
- **Radix UI** - Composants UI accessibles

### Backend
- **Next.js API Routes** - API REST intégrée
- **Prisma ORM** - Gestion de base de données type-safe
- **SQLite** - Base de données locale pour le développement
- **NextAuth.js v5** - Authentification sécurisée

### Outils de Développement
- **ESLint** - Linter JavaScript/TypeScript
- **Prettier** - Formatage de code
- **Prisma Studio** - Interface d'administration de la BDD

## 📁 Structure du Projet

```
client/
├── app/                          # App Router Next.js 15
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentification
│   │   ├── habits/               # Gestion des habitudes
│   │   ├── calendar/             # Données calendrier
│   │   └── user/                 # Profil utilisateur
│   ├── dashboard/                # Page principale
│   ├── login/                    # Page de connexion
│   ├── register/                 # Page d'inscription
│   └── lib/                      # Utilitaires côté serveur
├── components/                   # Composants React
│   ├── ui/                       # Composants UI de base
│   ├── calendar.tsx              # Calendrier interactif
│   ├── dashboard.tsx             # Interface principale
│   ├── create-habit.tsx          # Modal de création d'habitudes
│   └── xp-bar.tsx               # Barre d'expérience
├── lib/                          # Utilitaires et configurations
│   ├── prisma.ts                 # Configuration Prisma
│   ├── auth.ts                   # Configuration NextAuth
│   ├── types.ts                  # Types TypeScript
│   └── utils.ts                  # Fonctions utilitaires
├── prisma/                       # Base de données
│   ├── schema.prisma             # Schéma de la BDD
│   └── migrations/               # Migrations
└── public/                       # Assets statiques
```

## 💾 Schéma de Base de Données

### Modèles Principaux

- **User** : Informations utilisateur, niveau, XP total
- **Habit** : Définition des habitudes avec catégorie et fréquence
- **HabitInstance** : Instances d'habitudes pour des dates spécifiques
- **XPLog** : Historique des gains d'expérience

### Relations
```
User (1) ─── (n) Habit
Habit (1) ─── (n) HabitInstance
User (1) ─── (n) XPLog
```

## 🎮 Guide Utilisateur

### Créer une Habitude
1. Cliquez sur le bouton **+** en bas à droite
2. Remplissez le nom et la description
3. Choisissez une catégorie et un niveau de difficulté
4. Sélectionnez la fréquence :
   - **Quotidien** : Répétée chaque jour
   - **Hebdomadaire** : Une fois par semaine
   - **Unique** : Pour une date spécifique
5. Confirmez la création

### Utiliser le Calendrier
- **Navigation** : Utilisez les flèches pour changer de mois
- **Sélection** : Cliquez sur une date pour voir ses habitudes
- **Complétion** : Cochez les habitudes d'aujourd'hui pour gagner de l'XP
- **Historique** : Les dates passées sont en lecture seule

### Système de Progression
- **Compléter une habitude** = Gain d'XP immédiat
- **100 XP** = 1 niveau supérieur
- **Barre de progression** montre l'avancement dans le niveau actuel

## 🔧 Développement

### Scripts Disponibles
```bash
npm run dev          # Démarrage en développement
npm run build        # Build de production
npm run start        # Démarrage en production
npm run lint         # Vérification du code
npm run db:push      # Mise à jour du schéma DB
npm run db:studio    # Interface Prisma Studio
npm run db:seed      # Données de test
```

### Architecture

L'application utilise l'**App Router** de Next.js 15 avec :
- **Server Components** pour les performances
- **Client Components** pour l'interactivité
- **API Routes** pour les opérations backend
- **Middleware** pour l'authentification

### Contribution
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Maël Valin** - Étudiant en développement web

## 🙏 Remerciements

- **Next.js Team** pour le framework extraordinaire
- **Prisma Team** pour l'ORM moderne
- **Radix UI** pour les composants accessibles
- **Tailwind CSS** pour le système de design

---

*Développé avec ❤️ dans le cadre d'un projet étudiant S5*