# Finantia - Application de Gestion Financière Personnelle

Une application web open-source et complète pour gérer vos finances personnelles, développée avec Nuxt.js, Drizzle ORM, PostgreSQL et Firefly III.

## 🚀 Fonctionnalités

### Gestion Financière Complète
- **Tableau de bord interactif** avec visualisations en temps réel
- **Gestion budgétaire** avec suivi des dépenses par catégorie
- **Suivi des transactions** avec catégorisation automatique
- **Gestion des investissements** (actions, ETF, crypto-monnaies)
- **Calcul du patrimoine** avec répartition des actifs et passifs
- **Gestion multi-comptes** bancaires

### Technologies Utilisées
- **Frontend**: Nuxt.js 3, Vue 3, TailwindCSS
- **Backend**: Drizzle ORM, PostgreSQL
- **Visualisations**: Chart.js
- **Intégration bancaire**: Firefly III API
- **Conteneurisation**: Docker & Docker Compose

### Interface Moderne
- Design épuré et professionnel
- Tableau de bord interactif avec graphiques
- Modales pour l'ajout rapide de données
- Responsive design
- Animations fluides

## 📦 Installation

### Prérequis
- Docker et Docker Compose
- Node.js 18+ (pour le développement local)
- PostgreSQL 15+

### Installation Rapide avec Docker

1. **Cloner le repository**
```bash
git clone https://github.com/qldwin/finantia.git
cd finantia
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

3. **Lancer l'application avec Docker Compose**
```bash
docker-compose up -d
```

4. **Accéder à l'application**
- Application principale: http://localhost:3000
- Firefly III: http://localhost:8080
- Base de données: localhost:5432

### Installation pour le Développement

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer la base de données**
```bash
# Créer la base de données
createdb finantiadb

# Exécuter les migrations
npm run db:migrate
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

## 🏗️ Architecture du Projet

```
finantia/
├── components/          # Composants Vue réutilisables
├── stores/             # Stores Pinia pour l'état global
├── server/             # API côté serveur
├── public/             # Fichiers statiques
├── docker-compose.yml  # Configuration Docker
├── package.json        # Dépendances du projet
└── README.md          # Documentation
```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL=postgresql://finantia_user:finantia_password@localhost:5432/finantia

# Firefly III
FIREFLY_URL=http://localhost:8080
FIREFLY_ACCESS_TOKEN=your_firefly_token

# Application
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Configuration Firefly III

1. **Accéder à Firefly III**: http://localhost:8080
2. **Créer un compte administrateur**
3. **Générer un token API** dans les paramètres
4. **Configurer le token dans .env**

## 📊 Base de Données

### Schéma

La base de données inclut les tables suivantes :
- `users` - Utilisateurs
- `accounts` - Comptes bancaires
- `categories` - Catégories de transactions
- `transactions` - Transactions financières
- `budgets` - Budgets mensuels
- `investments` - Investissements et portefeuille
- `assets` - Actifs du patrimoine
- `liabilities` - Passifs et dettes

### Migration

```bash
# Générer une nouvelle migration
npm run db:generate

# Exécuter les migrations
npm run db:migrate

# Ouvrir le studio Drizzle
npm run db:studio
```

## 🎯 Utilisation

### Première Connexion

1. **Créer un compte utilisateur**
2. **Connecter vos comptes bancaires** via Firefly III
3. **Configurer vos catégories de dépenses**
4. **Définir vos budgets mensuels**

### Fonctionnalités Principales

#### Tableau de Bord
- Vue d'ensemble des finances
- Graphiques de tendances
- Alertes et notifications

#### Gestion Budgétaire
- Création de budgets par catégorie
- Suivi en temps réel des dépenses
- Alertes de dépassement

#### Investissements
- Suivi du portefeuille
- Performance des actifs
- Répartition par type d'investissement

#### Patrimoine
- Calcul de la valeur nette
- Évolution du patrimoine
- Répartition des actifs

## 🔒 Sécurité

- Authentification utilisateur
- Chiffrement des données sensibles
- Validation des entrées côté serveur
- Protection CSRF
- Sessions sécurisées

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur :
- Desktop (1920px+)
- Tablette (768px - 1024px)
- Mobile (320px - 768px)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de support

---

**Finantia** - Gérez vos finances avec confiance et simplicité.
