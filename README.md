# 📱 KalyBudget — Application Mobile de Gestion des Dépenses

> Application mobile moderne, simple et intuitive de gestion des dépenses personnelles développée avec **React Native**, **Expo SDK 57** et **TypeScript**.  
> Fonctionnement **100% hors-ligne** avec base de données locale **Expo SQLite** et **Drizzle ORM**.

---

## 🚀 Stack Technique

- **Framework Mobile** : [React Native](https://reactnative.dev/) avec [Expo SDK 57](https://expo.dev/)
- **Navigation** : [Expo Router](https://docs.expo.dev/router/introduction/) (architecture basée sur les fichiers avec Bottom Tabs)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Base de Données Locale** : [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **ORM** : [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm/expo-sqlite`)
- **Gestion d'État** : [Zustand](https://github.com/pmndrs/zustand)
- **Internationalisation (i18n)** : [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/) (Français & Anglais)
- **Formulaires & Validations** : [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icônes** : [Lucide React Native](https://lucide.dev/)

---

## ✨ Fonctionnalités Clés du MVP

### 1. 📊 Tableau de bord (Accueil)
- **Grande Alerte de Seuil** : S'affiche immédiatement au sommet de l'accueil lorsqu'un seuil est atteint (en **orange**) ou lorsqu'un budget est dépassé (en **rouge** avec solde négatif). Masquage automatique dès que le solde repasse au-dessus du seuil.
- **Carte Principale : Situation du budget** : Affichage du budget initial, total des dépenses, solde restant, pourcentage consommé et barre de progression dynamique. Sélecteur de prévision active en un clic.
- **Graphiques d'analyses** :
  - Répartition des dépenses par catégorie avec indicateurs de pourcentage.
  - Évolution des dépenses dans le temps avec sélecteur de période (**Jour**, **Semaine**, **Mois**).
- **Dernières dépenses** : Liste des transactions récentes avec montant, catégorie, date et accès direct aux détails.

### 2. 💰 Gestion des Prévisions de Budget
- Création et personnalisation d'un budget avec : Nom, Montant initial, Date de début, Date de fin, Seuil d'alerte en %.
- **Modification libre des dates** : Vous pouvez modifier les dates de début et de fin à tout moment sans supprimer les dépenses existantes.
- Recalcul automatique et instantané du montant restant et du pourcentage consommé dès qu'une dépense est ajoutée, modifiée ou supprimée.
- Suppression sécurisée avec boîte de dialogue de confirmation.

### 3. 🧾 Gestion des Dépenses
- Ajout et modification rapide : Titre, Montant, Catégorie, Date, Prévision de budget associée et Description facultative.
- Filtrage en temps réel par **catégorie** et par **période** (Toutes, Aujourd'hui, Semaine, Mois).
- Répercussion immédiate sur les calculs de budget (et transfert automatique entre deux budgets en cas de réattribution).
- Suppression avec confirmation et restitution instantanée du montant dans le solde disponible.

### 4. 🏷️ Gestion des Catégories
- Catégories par défaut intégrées : *Alimentation, Transport, Logement, Santé, Loisirs, Shopping, Factures, Autres*.
- Création de catégories personnalisées avec choix de nom, palette de couleurs et icônes Lucide.
- Protection des catégories par défaut : désactivation sécurisée au lieu de la suppression physique si des dépenses y sont rattachées pour préserver l'historique financier.

### 5. ⚠️ Système de Seuils d'Alerte en Pourcentage
- **Seuil par prévision** : Configurable indépendamment pour chaque prévision (ex: 20% d'un budget de 1 000 000 Ar déclenche une alerte quand le restant passe sous 200 000 Ar).
- **Seuil mensuel global** : Activation/désactivation et réglage du pourcentage depuis les paramètres pour suivre les dépenses globales du mois.

### 6. ⚙️ Paramètres & Personnalisation
- **Langue** : Français (FR) et Anglais (EN) avec bascule instantanée.
- **Devise** : **Ariary (Ar)** par défaut, Euro (€), Dollar ($), Franc CFA (FCFA), Livre (£).
- **Apparence** : Thème Clair, Thème Sombre et Thème Système respectant scrupuleusement la charte graphique spécifiée.
- **Statistiques de stockage** : Décompte en temps réel des enregistrements SQLite.

---

## 🗄️ Schéma Base de Données (SQLite & Drizzle ORM)

Les 4 tables sont définies dans `src/db/schema.ts` :

| Table | Colonnes principales | Description |
| :--- | :--- | :--- |
| `settings` | `id`, `currency`, `language`, `theme`, `monthly_threshold_enabled`, `monthly_threshold_percentage` | Préférences de l'utilisateur |
| `budgets` | `id`, `name`, `amount`, `start_date`, `end_date`, `threshold_enabled`, `threshold_percentage` | Prévisions budgétaires personnalisées |
| `categories` | `id`, `name`, `icon`, `color`, `is_default`, `is_active` | Catégories de dépenses |
| `transactions` | `id`, `budget_id`, `category_id`, `title`, `description`, `amount`, `transaction_date` | Dépenses enregistrées avec clés étrangères |

---

## 📁 Architecture du Projet

```text
├── app/                        # Navigation Expo Router (File-based routing)
│   ├── _layout.tsx             # Root layout avec StatusBar & initialisation
│   └── (tabs)/                 # Onglets principaux (Bottom Tabs)
│       ├── _layout.tsx         # Configuration de la barre de navigation
│       ├── index.tsx           # Écran Accueil (Dashboard & Alertes)
│       ├── expenses.tsx        # Écran Dépenses (Sous-onglets Dépenses, Prévisions, Catégories)
│       └── settings.tsx        # Écran Paramètres (Langue, Devise, Seuils, Thème)
│
├── src/
│   ├── components/             # Composants d'interface (Modals, Formulaires, Cartes)
│   │   ├── budgets/            # Modals de création, édition et détail des prévisions
│   │   ├── expenses/           # Modals d'ajout et consultation des dépenses
│   │   ├── categories/         # Gestion et édition des catégories
│   │   └── native/             # Composants React Native natifs (Icon, Chart, etc.)
│   │
│   ├── db/                     # Base de données locale
│   │   ├── schema.ts           # Schéma Drizzle ORM & types TypeScript
│   │   ├── client.ts           # Client Expo SQLite & Drizzle
│   │   └── sqliteStorage.ts    # Moteur de persistance locale hors-ligne
│   │
│   ├── stores/                 # Stores réactifs Zustand
│   │   ├── budgetStore.ts      # Gestion des prévisions et calculs de solde
│   │   ├── transactionStore.ts # Gestion des dépenses et filtres
│   │   ├── categoryStore.ts    # Gestion des catégories
│   │   └── settingsStore.ts    # Gestion des préférences utilisateur
│   │
│   ├── i18n/                   # Traductions complètes FR et EN
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── fr.json
│   │       └── en.json
│   │
│   ├── constants/
│   │   └── theme.ts            # Palette officielle clair/sombre & catégories par défaut
│   │
│   ├── types/                  # Définitions TypeScript
│   └── utils/                  # Fonctions utilitaires (devises, dates, calculs)
│
├── app.json                    # Configuration officielle Expo SDK 57
├── babel.config.js             # Configuration Babel pour Expo
├── metro.config.js             # Configuration du bundler Metro
├── drizzle.config.ts           # Configuration Drizzle ORM
└── package.json
```

---

## 📲 Démarrage et Exécution avec Expo

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- L'application mobile **Expo Go** installée sur votre smartphone (disponible sur [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) et [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)).

### 1. Installation des dépendances
```bash
npm install
```

### 2. Démarrer le serveur Expo
```bash
npx expo start
```
ou
```bash
npm start
```

### 3. Tester sur votre smartphone
1. Ouvrez le terminal où tourne la commande `npx expo start`.
2. Un **QR Code** apparaît dans la console.
3. **Android** : Ouvrez l'application **Expo Go** et appuyez sur *Scan QR Code*.
4. **iOS** : Ouvrez l'appareil photo natif de votre iPhone et scannez le QR code pour l'ouvrir dans **Expo Go**.

### 4. Commandes additionnelles
- Démarrer directement sur simulateur Android :
  ```bash
  npm run android
  ```
- Démarrer directement sur simulateur iOS :
  ```bash
  npm run ios
  ```
- Vérifier le typage TypeScript :
  ```bash
  npm run lint
  ```

---

## 🔒 Confidentialité & Hors-ligne

- **Aucune dépendance cloud** : Toutes les données financières saisies sont exclusivement stockées sur l'appareil de l'utilisateur dans la base SQLite locale.
- **Zéro télémétrie ni compte requis** : L'application est immédiatement opérationnelle dès le premier lancement.
