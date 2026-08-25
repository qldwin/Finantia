# Audit de qualité du code

## Périmètre

Revue statique du code TypeScript/Vue avec priorité à la maintenabilité, au découpage des responsabilités, à la duplication et à la robustesse des conventions. Les changements indiqués comme appliqués sont présents dans le dépôt.

## Recommandations appliquées

### 1. Centraliser le cycle de vie des sessions

**Problème.** Les handlers de login, inscription et OAuth construisaient chacun une session avec des propriétés légèrement différentes. Cette duplication rendait les évolutions risquées et a permis des divergences dans la gestion de la 2FA.

**Changement.** `server/utils/auth.ts` expose désormais :

- `requireAuth` pour les sessions pleinement authentifiées ;
- `requirePendingTwoFactor` pour l'unique étape TOTP autorisée avant validation ;
- `establishUserSession` pour construire une session cohérente.

Les handlers `server/api/auth/login.post.ts`, `server/api/auth/register.post.ts` et les routes OAuth utilisent cette primitive. La logique OAuth commune est isolée dans `server/utils/oauth.ts`.

### 2. Isoler les règles de propriété des catégories

**Problème.** Les endpoints transaction et budget contenaient des validations d'identifiants mais aucune règle réutilisable pour vérifier les catégories.

**Changement.** `server/utils/categories.ts` contient maintenant `assertCategoryOwnership` et `assertCategoriesOwnership`. Les contrôles sont effectués en une requête pour les listes, dédupliquent les UUID et acceptent uniquement les catégories globales ou celles du propriétaire.

### 3. Réduire le couplage de l'import avec les catégories

**Problème.** Le service d'import chargeait toutes les catégories et pouvait utiliser un identifiant qui ne faisait pas partie du périmètre de l'utilisateur.

**Changement.** Le chargement de la `categoryMap` est filtré au niveau du service. Un `selectedCategoryId` inconnu dans ce périmètre n'est plus utilisé. Le handler valide les catégories sélectionnées avant de lancer la transaction d'import.

### 4. Remplacer les contrôles d'authentification ad hoc

**Problème.** Les endpoints de changement de mot de passe et de suppression de compte lisaient directement `getUserSession`, tandis que les autres utilisaient `requireAuth`.

**Changement.** Ces endpoints utilisent désormais `requireAuth`, ce qui réduit le nombre de chemins d'authentification et garantit le même comportement de session 2FA.

### 5. Découper les pages frontend métier

**Problème.** `app/pages/transactions.vue` mélangeait la barre d'actions, le tableau, le filtrage, l'import CSV et les appels CRUD. `app/pages/budget.vue` mélangeait le chargement, le calcul métier et tout le rendu d'une carte de budget.

**Changement.** Les responsabilités d'interface sont maintenant isolées dans :

- `app/components/transactions/TransactionToolbar.vue` pour la recherche, la sélection CSV et la création ;
- `app/components/transactions/TransactionTable.vue` pour l'affichage, le formatage et les actions d'une transaction ;
- `app/components/budgets/BudgetCard.vue` pour l'affichage d'un budget, sa progression et ses actions.

Les pages conservent uniquement l'orchestration des données, les appels API et les modales. Les états inutilisés et le chargement de catégories redondant ont été supprimés.

## Recommandations restantes

### Priorité haute

- Ajouter des tests unitaires à `server/utils/auth.ts`, `server/utils/categories.ts` et `server/utils/oauth.ts`.
- Ajouter des tests d'intégration pour les cas cross-tenant transaction/budget/import et pour OAuth avec 2FA activée.
- Introduire une gestion d'erreur serveur commune pour éviter les blocs `try/catch` répétitifs dans les endpoints.
- Définir des schémas Zod partagés dans `server/validation/` pour les UUID, montants, dates et payloads réutilisés.

### Priorité moyenne

- Remplacer les types `any` dans `server/services/transactions.service.ts` et `server/api` par des types dérivés des schémas Zod ou des types Drizzle.
- Extraire les constantes de domaine (`typeTransaction`, récurrence, devise) dans `server/domain/` au lieu de répéter des littéraux.
- Standardiser le style TypeScript : imports, points-virgules, indentation et noms (`typeTransaction` contre `typeTransactionsId`). Un formatter automatique doit être appliqué en CI.
- Séparer les fonctions de lecture, de mutation et de mapping dans `transactions.service.ts`, qui reste le fichier métier le plus dense.
- Ajouter une couche `server/repositories/` uniquement si les requêtes Drizzle se multiplient ; ne pas introduire cette abstraction tant qu'elle ne réduit pas effectivement la complexité.

### Priorité faible

- Ajouter des scripts `lint`, `typecheck` et `test` explicites dans `package.json`.
- Ajouter des limites de taille et des types aux props des composants Vue complexes, notamment `profile.vue`, `transactions.vue` et `budget.vue`.
- Découper `profile.vue` en composants `ProfileForm`, `EmailForm`, `PasswordForm` et `DeleteAccountDialog` lorsque les contrats de formulaire auront été typés.
- Extraire l'import CSV de `transactions.vue` dans un composable `useTransactionImport` après ajout de tests sur les formats de date et de montant.
- Supprimer les commentaires qui répètent le code et conserver uniquement les invariants métier ou de sécurité.
- Documenter les conventions dans un `CONTRIBUTING.md` : structure des modules, validation, accès DB, tests et gestion des erreurs.

## Résultat attendu

Les endpoints doivent rester minces : authentification, validation du payload, appel d'un service métier et réponse. Les services doivent porter les règles métier et d'autorisation ; les utilitaires doivent rester stateless et réutilisables. Toute nouvelle règle de sécurité ou de domaine doit être ajoutée à un point central et couverte par un test, plutôt que recopiée dans plusieurs routes.

## Vérification

`git diff --check` est propre. Le build n'a pas pu être exécuté dans cet environnement : les dépendances ne sont pas présentes et leur installation a échoué sur un timeout réseau lors du téléchargement de `@parcel/watcher-wasm`.
