# 🏦 Système Multi-Comptes - Implémentation Complète

Ce document décrit toutes les fonctionnalités implémentées pour le système de gestion multi-comptes dans AirGap.

## 📋 Table des Matières

- [🎯 Fonctionnalités Principales](#-fonctionnalités-principales)
- [📁 Structure des Fichiers](#-structure-des-fichiers)
- [🔧 API Backend](#-api-backend)
- [🎨 Frontend Components](#-frontend-components)
- [📄 Pages Vue](#-pages-vue)
- [🚀 Utilisation](#-utilisation)
- [🔒 Sécurité](#-sécurité)
- [📊 Exemples de Données](#-exemples-de-données)

---

## 🎯 Fonctionnalités Principales

### 1. Gestion des Comptes Bancaires

- ✅ **Création de comptes** : Ajoutez de nouveaux comptes bancaires avec nom, type, solde initial et devise
- ✅ **Modification de comptes** : Modifiez les informations d'un compte existant
- ✅ **Suppression de comptes** : Supprimez un compte (avec vérification qu'il n'a pas de transactions)
- ✅ **Liste des comptes** : Affichez tous vos comptes avec leurs soldes
- ✅ **Détails du compte** : Page dédiée pour chaque compte avec ses transactions

### 2. Tableau de Bord Amélioré

- ✅ **Sélecteur de compte** : Filtrez les données (solde, revenus, dépenses) par compte
- ✅ **Affichage par compte** : Cartes montrant le solde de chaque compte
- ✅ **Vue globale** : Affichage du solde total de tous les comptes
- ✅ **Statistiques par compte** : Revenus et dépenses du mois pour chaque compte

### 3. Transfert entre Comptes

- ✅ **Transfert de fonds** : Transférez de l'argent d'un compte à un autre
- ✅ **Validation du solde** : Vérification que le compte source a suffisamment de fonds
- ✅ **Création automatique de transactions** : Une transaction de dépense est créée sur le compte source, une transaction de revenu sur le compte destination
- ✅ **Historique des transferts** : Tous les transferts apparaissent dans l'historique des transactions

### 4. Gestion des Transactions par Compte

- ✅ **Association de compte** : Chaque transaction peut être associée à un compte spécifique
- ✅ **Filtrage par compte** : Filtrez les transactions par compte dans le tableau de bord
- ✅ **Sélection de compte** : Lors de la création d'une transaction, sélectionnez le compte concerné
- ✅ **Import CSV par compte** : Importez des transactions vers un compte spécifique

### 5. Composants Réutilisables

- ✅ **AccountModal** : Modal pour créer/modifier un compte
- ✅ **AccountCard** : Carte d'affichage élégante pour un compte
- ✅ **AccountBalance** : Composant pour afficher les soldes avec formatage
- ✅ **AccountSelector** : Sélecteur dropdown pour choisir un compte
- ✅ **AccountTransferModal** : Modal pour effectuer des transferts entre comptes

---

## 📁 Structure des Fichiers

```
AirGap/
├── app/
│   ├── components/
│   │   ├── accounts/
│   │   │   ├── AccountModal.vue          # Modal création/modification compte
│   │   │   ├── AccountCard.vue            # Carte d'affichage compte
│   │   │   ├── AccountBalance.vue         # Affichage solde
│   │   │   ├── AccountSelector.vue        # Sélecteur de compte
│   │   │   └── AccountTransferModal.vue   # Modal de transfert
│   │   └── TransactionModal.vue          # MODIFIÉ: Ajout sélection compte
│   ├── pages/
│   │   ├── index.vue                     # MODIFIÉ: Redirection vers /dashboard
│   │   ├── dashboard.vue                  # NOUVEAU: Dashboard avec filtres
│   │   └── accounts/
│   │       ├── index.vue                 # NOUVEAU: Liste des comptes
│   │       └── [id].vue                  # NOUVEAU: Détails d'un compte
│   └── components/
│       └── Header-navbar-components.vue  # MODIFIÉ: Ajout lien Comptes
│
└── server/
    ├── api/
    │   └── accounts/
    │       ├── index.get.ts               # Liste tous les comptes
    │       ├── index.post.ts              # Créer un compte
    │       ├── [id]/
    │       │   ├── index.get.ts           # Détails d'un compte
    │       │   ├── index.patch.ts          # Modifier un compte
    │       │   └── index.delete.ts         # Supprimer un compte
    │       ├── transfer.post.ts           # Transfert entre comptes
    │       └── import.post.ts              # Import CSV vers un compte
    └── services/
        └── transactions.service.ts         # MODIFIÉ: Retourne accountId
```

---

## 🔧 API Backend

### Endpoints Disponibles

#### Comptes

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| GET | `/api/accounts` | Liste tous les comptes de l'utilisateur | ✅ Requise |
| POST | `/api/accounts` | Créer un nouveau compte | ✅ Requise |
| GET | `/api/accounts/:id` | Détails d'un compte spécifique | ✅ Requise |
| PATCH | `/api/accounts/:id` | Modifier un compte | ✅ Requise |
| DELETE | `/api/accounts/:id` | Supprimer un compte | ✅ Requise |

#### Transferts

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| POST | `/api/accounts/transfer` | Transférer des fonds entre comptes | ✅ Requise |

#### Import

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| POST | `/api/accounts/import` | Importer des transactions vers un compte | ✅ Requise |

### Schémas de Requêtes

#### Créer un Compte (POST /api/accounts)

```json
{
  "accountName": "Compte Courant - BNP",
  "accountType": "Compte Courant",
  "balance": 1500.00,
  "currency": "EUR"
}
```

#### Transfert entre Comptes (POST /api/accounts/transfer)

```json
{
  "fromAccountId": "uuid-du-compte-source",
  "toAccountId": "uuid-du-compte-destination",
  "amount": 100.00,
  "description": "Virement épargne",
  "date": "2024-01-15"
}
```

#### Import CSV vers un Compte (POST /api/accounts/import)

```json
{
  "accountId": "uuid-du-compte",
  "transactions": [
    {
      "date": "2024-01-15",
      "description": "Salaire",
      "amount": 2500.00,
      "typeTransaction": "revenu"
    },
    {
      "date": "2024-01-16",
      "description": "Courses",
      "amount": -150.00,
      "typeTransaction": "depense"
    }
  ]
}
```

### Schémas de Réponses

#### Liste des Comptes (GET /api/accounts)

```json
{
  "accounts": [
    {
      "id": "uuid",
      "userId": "uuid",
      "accountName": "Compte Courant",
      "accountType": "Compte Courant",
      "balance": "1500.00",
      "currency": "EUR",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Détails d'un Compte (GET /api/accounts/:id)

```json
{
  "account": {
    "id": "uuid",
    "userId": "uuid",
    "accountName": "Compte Courant",
    "accountType": "Compte Courant",
    "balance": "1500.00",
    "currency": "EUR",
    "currentBalance": 1650.00,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Transfert Réussi (POST /api/accounts/transfer)

```json
{
  "success": true,
  "message": "Transfert de 100 EUR effectué avec succès",
  "fromAccount": {
    "id": "uuid",
    "name": "Compte Courant",
    "newBalance": 1400.00
  },
  "toAccount": {
    "id": "uuid",
    "name": "Livret A"
  },
  "amount": 100.00,
  "date": "2024-01-15T00:00:00.000Z"
}
```

---

## 🎨 Frontend Components

### AccountModal

**Props:**
- `modelValue` (Boolean) - Contrôle l'affichage du modal
- `account` (Object) - Compte à modifier (null pour création)

**Events:**
- `update:modelValue` - Met à jour l'état du modal
- `account-saved` - Émis quand un compte est sauvegardé

**Utilisation:**
```vue
<AccountModal
    v-model="showAccountModal"
    :account="selectedAccount"
    @account-saved="onAccountSaved"
/>
```

### AccountCard

**Props:**
- `account` (Object) - Compte à afficher
- `transactions` (Array) - Transactions pour calculer le solde actuel
- `clickable` (Boolean) - Si la carte est cliquable
- `showActions` (Boolean) - Afficher les boutons d'action
- `showView` (Boolean) - Afficher le bouton Voir
- `showEdit` (Boolean) - Afficher le bouton Modifier
- `showDelete` (Boolean) - Afficher le bouton Supprimer
- `showProgress` (Boolean) - Afficher la barre de progression
- `showStats` (Boolean) - Afficher les statistiques
- `showFooter` (Boolean) - Afficher le pied de carte

**Events:**
- `click` - Émis quand la carte est cliquée
- `view` - Émis quand on clique sur Voir
- `edit` - Émis quand on clique sur Modifier
- `delete` - Émis quand on clique sur Supprimer

**Utilisation:**
```vue
<AccountCard
    :account="account"
    :transactions="allTransactions"
    clickable
    show-stats
    @click="viewAccount(account)"
/>
```

### AccountBalance

**Props:**
- `balance` (Number) - Solde à afficher
- `initialBalance` (Number) - Solde initial pour comparaison
- `previousBalance` (Number) - Solde précédent pour calculer la variation
- `currency` (String) - Devise (default: 'EUR')
- `label` (String) - Libellé à afficher
- `size` (String) - Taille: 'xs', 'sm', 'md', 'lg' (default: 'md')
- `centered` (Boolean) - Centrer le contenu
- `showCurrency` (Boolean) - Afficher la devise
- `showChange` (Boolean) - Afficher la variation
- `showDetails` (Boolean) - Afficher les détails
- `loading` (Boolean) - État de chargement

**Utilisation:**
```vue
<AccountBalance
    :balance="accountBalance"
    :initial-balance="initialBalance"
    size="lg"
    show-change
/>
```

### AccountSelector

**Props:**
- `modelValue` (String) - ID du compte sélectionné ('all' pour tous)
- `disabled` (Boolean) - Désactiver le sélecteur
- `triggerClass` (String) - Classes CSS pour le trigger
- `showBalance` (Boolean) - Afficher les soldes dans le dropdown

**Events:**
- `update:modelValue` - Met à jour le compte sélectionné
- `account-changed` - Émis quand le compte change

**Utilisation:**
```vue
<AccountSelector
    v-model="selectedAccountId"
    @account-changed="onAccountChange"
/>
```

### AccountTransferModal

**Props:**
- `modelValue` (Boolean) - Contrôle l'affichage du modal

**Events:**
- `update:modelValue` - Met à jour l'état du modal
- `transfer-completed` - Émis quand un transfert est terminé

**Utilisation:**
```vue
<AccountTransferModal
    v-model="showTransferModal"
    @transfer-completed="onTransferCompleted"
/>
```

---

## 📄 Pages Vue

### /accounts

Page de liste de tous les comptes avec:
- Cartes récapitulatives (nombre de comptes, solde total, revenus/dépenses du mois)
- Grille de cartes des comptes
- Tableau détaillé des comptes
- Boutons pour créer un nouveau compte ou effectuer un transfert

### /accounts/[id]

Page de détails d'un compte spécifique avec:
- Résumé du compte (solde initial, solde actuel, revenus/dépenses du mois)
- Boutons d'action (nouvelle transaction, modifier, transfert, supprimer)
- Liste des transactions du compte
- Modal pour créer/modifier des transactions
- Modal pour effectuer des transferts

### /dashboard

Tableau de bord amélioré avec:
- Sélecteur de compte pour filtrer les données
- Cartes de résumé (solde total, revenus, dépenses)
- Cartes des soldes par compte (cliquables)
- Graphiques filtrés par compte sélectionné

---

## 🚀 Utilisation

### 1. Créer un Nouveau Compte

```javascript
// Appel API
const response = await $fetch('/api/accounts', {
  method: 'POST',
  body: {
    accountName: 'Mon Compte Épargne',
    accountType: 'Livret A',
    balance: 5000.00,
    currency: 'EUR'
  }
})

// Résultat
console.log(response.account) // { id: 'uuid', accountName: 'Mon Compte Épargne', ... }
```

### 2. Transférer des Fonds

```javascript
// Appel API
const response = await $fetch('/api/accounts/transfer', {
  method: 'POST',
  body: {
    fromAccountId: 'uuid-compte-source',
    toAccountId: 'uuid-compte-destination',
    amount: 200.00,
    description: 'Virement mensuel'
  }
})

// Résultat
console.log(response.success) // true
console.log(response.message) // "Transfert de 200 EUR effectué avec succès"
```

### 3. Filtrer les Transactions par Compte

```javascript
// Dans le dashboard
const filteredTransactions = computed(() => {
  if (selectedAccountId.value === 'all') {
    return allTransactions.value
  }
  return allTransactions.value.filter(t => t.accountId === selectedAccountId.value)
})
```

### 4. Calculer le Solde d'un Compte

```javascript
const getAccountBalance = (account) => {
  const initialBalance = parseFloat(account.balance) || 0
  const accountTransactions = allTransactions.value.filter(t => t.accountId === account.id)
  const transactionsBalance = accountTransactions.reduce((sum, t) => {
    const amount = parseFloat(t.amount) || 0
    return sum + (t.typeTransaction === 'revenu' ? amount : -amount)
  }, 0)
  return initialBalance + transactionsBalance
}
```

---

## 🔒 Sécurité

### Vérifications Implémentées

1. **Authentification** : Toutes les API nécessitent une session utilisateur valide
2. **Propriété des Comptes** : Vérification que l'utilisateur est propriétaire du compte avant toute opération
3. **Validation des Données** : Utilisation de Zod pour valider toutes les entrées
4. **Solde Suffisant** : Vérification que le compte source a suffisamment de fonds avant un transfert
5. **Suppression de Compte** : Impossible de supprimer un compte qui contient des transactions

### Exemples de Vérification

```typescript
// Dans transfer.post.ts
const [fromAccount] = await db
    .select()
    .from(accounts)
    .where(and(
        eq(accounts.id, fromAccountId),
        eq(accounts.userId, user.id)  // Vérification de propriété
    ))

if (!fromAccount) throw createError({ statusCode: 404, message: 'Compte source introuvable' })

// Vérification du solde
const currentFromBalance = parseFloat(fromAccount.balance) + parseFloat(fromBalance?.balance || '0')
if (currentFromBalance < amount) {
    throw createError({
        statusCode: 400,
        message: `Solde insuffisant sur le compte ${fromAccount.accountName}`
    })
}
```

---

## 📊 Exemples de Données

### Structure d'un Compte

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "accountName": "Compte Courant - BNP Paribas",
  "accountType": "Compte Courant",
  "balance": "2500.00",
  "currency": "EUR",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-15T14:30:00.000Z"
}
```

### Structure d'une Transaction avec Compte

```json
{
  "id": "789e1234-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Salaire Janvier",
  "amount": "2500.00",
  "typeTransaction": "revenu",
  "devise": "EUR",
  "date": "2024-01-05T00:00:00.000Z",
  "category": {
    "id": "cat-uuid",
    "name": "Salaire"
  }
}
```

### Types de Comptes Supportés

- Compte Courant
- Livret A
- LDDS
- PEL
- CEL
- Compte Épargne
- Compte Titre
- Crédit
- Autre

### Devise Supportées

- EUR (Euro)
- USD (Dollar Américain)
- GBP (Livre Sterling)
- CHF (Franc Suisse)
- CAD (Dollar Canadien)

---

## 🎯 Prochaines Étapes (Optionnelles)

1. **Rapports Avancés**
   - Rapports par compte
   - Comparaison entre comptes
   - Export des données par compte

2. **Catégorisation par Compte**
   - Permettre des catégories spécifiques à certains comptes
   - Règles de catégorisation différentes par compte

3. **Budget par Compte**
   - Budgets spécifiques à chaque compte
   - Alertes de dépassement par compte

4. **Synchronisation Bancaire**
   - Connexion aux APIs bancaires pour récupérer les transactions
   - Mise à jour automatique des soldes

5. **Notifications**
   - Alertes de solde faible
   - Notifications de transferts

6. **Partage de Comptes**
   - Comptes partagés entre plusieurs utilisateurs
   - Permissions de lecture/écriture

---

## 📚 Documentation Additionnelle

- [API Reference](https://github.com/AirGap-org/AirGap/blob/master/server/api/accounts/)
- [Components Reference](https://github.com/AirGap-org/AirGap/tree/master/app/components/accounts/)
- [Pull Request #184](https://github.com/AirGap-org/AirGap/pull/184)

---

## 🤝 Contribution

Pour contribuer à l'amélioration de ce système:

1. Forker le dépôt
2. Créer une branche de feature (`git checkout -b feature/ma-fonctionnalite`)
3. Commiter vos changements (`git commit -m 'Ajout de ma fonctionnalite'`)
4. Pousser vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

---

**Version:** 1.0.0  
**Dernière mise à jour:** 19 Août 2025  
**Auteur:** Vibe Code (avec Mistral AI)  
**Pull Request:** [#184](https://github.com/AirGap-org/AirGap/pull/184)
