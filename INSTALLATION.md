# GameComplete - Guide d'Installation

Guide complet pour installer et lancer GameComplete en local.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **Node.js** (version 16 ou supérieure) : https://nodejs.org
- **npm** (inclus avec Node.js)
- **Git** : https://git-scm.com

## 🚀 Installation Complète

### 1. Cloner le repository

```bash
git clone https://github.com/Michael55988/GameComplete---finale-project.git
cd GameComplete---finale-project
```

### 2. Configuration du Backend

```bash
# Aller dans le dossier backend
cd gamecomplete-backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer le fichier .env (optionnel)
# Vous pouvez changer le JWT_SECRET pour plus de sécurité
```

**Contenu du fichier `.env` :**
```env
PORT=4000
JWT_SECRET=votre_cle_secrete_ici
DB_FILE=gamecomplete.db
FRONTEND_URL=http://localhost:5173
```

> **Note** : La base de données SQLite sera créée automatiquement au premier lancement.

### 3. Configuration du Frontend

```bash
# Ouvrir un NOUVEAU terminal
# Aller dans le dossier frontend
cd gamecomplete-frontend

# Installer les dépendances
npm install

# Créer le fichier .env (optionnel pour local)
# Le frontend utilise par défaut http://localhost:4000
```

Si vous voulez créer un fichier `.env` pour le frontend :
```env
VITE_API_URL=http://localhost:4000
```

### 4. Lancer l'application

Vous avez besoin de **2 terminaux ouverts** :

**Terminal 1 - Backend :**
```bash
cd gamecomplete-backend
npm start
```

Vous devriez voir :
```
GameComplete backend running on http://localhost:4000
```

**Terminal 2 - Frontend :**
```bash
cd gamecomplete-frontend
npm run dev
```

Vous devriez voir :
```
VITE v... ready in ...ms

➜  Local:   http://localhost:5173/
```

### 5. Accéder à l'application

Ouvrez votre navigateur et allez sur : **http://localhost:5173**

## 📝 Premiers pas

1. **Créer un compte** : Cliquez sur "Register" et créez un utilisateur
2. **Se connecter** : Connectez-vous avec vos identifiants
3. **Créer un match** : Cliquez sur "Create Match" et remplissez le formulaire
4. **Rejoindre un match** : Allez sur "Dashboard" et rejoignez un match
5. **Générer des équipes** : Une fois le match créé, générez automatiquement les équipes

## 🛠️ Commandes Utiles

### Backend
```bash
# Lancer en mode développement (avec auto-reload)
npm run dev

# Lancer en mode production
npm start
```

### Frontend
```bash
# Lancer en mode développement
npm run dev

# Builder pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## 📁 Structure du Projet

```
GameComplete/
├── gamecomplete-backend/        # API Node.js/Express
│   ├── routes/                  # Routes de l'API
│   ├── middleware/              # Middlewares (auth)
│   ├── uploads/                 # Avatars uploadés
│   ├── server.js               # Point d'entrée
│   ├── db.js                   # Configuration SQLite
│   └── .env                    # Variables d'environnement
│
└── gamecomplete-frontend/       # Application React
    ├── src/
    │   ├── components/         # Composants réutilisables
    │   ├── pages/              # Pages de l'application
    │   ├── api.js              # Configuration Axios
    │   └── App.jsx             # Composant principal
    └── .env                    # Variables d'environnement
```

## 🗃️ Base de Données

La base de données SQLite (`gamecomplete.db`) contient :
- **users** : Utilisateurs avec authentification
- **matches** : Matchs créés
- **match_players** : Joueurs inscrits aux matchs
- **ratings** : Évaluations des joueurs

La base de données est créée automatiquement au premier lancement du backend.

## 🐛 Dépannage

### Le backend ne démarre pas

**Erreur : "Port 4000 is already in use"**

Solution :
```bash
# Sur macOS/Linux
lsof -ti:4000 | xargs kill -9

# Ou changez le port dans le fichier .env
PORT=4001
```

### Le frontend ne se connecte pas au backend

Vérifiez que :
1. Le backend est bien lancé sur http://localhost:4000
2. Le fichier `.env` du frontend pointe vers `http://localhost:4000`
3. Rechargez la page (Cmd+R ou Ctrl+R)

### Erreur CORS

Si vous voyez une erreur CORS dans la console :
- Vérifiez que `FRONTEND_URL` dans le backend `.env` est bien `http://localhost:5173`
- Relancez le backend

### La page reste blanche

1. Vérifiez la console du navigateur (F12)
2. Vérifiez que le frontend est bien lancé
3. Essayez un hard refresh : Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)

## 🔐 Sécurité

**Important** :
- Le fichier `.env` ne doit JAMAIS être partagé ou commité sur Git
- Changez le `JWT_SECRET` en production
- Utilisez des mots de passe forts pour vos comptes

## 📦 Technologies Utilisées

### Backend
- Node.js + Express
- SQLite (base de données)
- JWT (authentification)
- Bcrypt (hashage de mots de passe)
- Multer (upload de fichiers)

### Frontend
- React 19
- Vite (build tool)
- React Router DOM (routing)
- Axios (HTTP client)

## 🌐 Version en Ligne

Si vous préférez tester la version déployée en ligne :
**https://gamecomplete-frontend.onrender.com**

(Note : Le premier chargement peut prendre 30 secondes car le serveur gratuit se met en veille)

## 💡 Support

En cas de problème :
1. Vérifiez que Node.js et npm sont bien installés : `node -v` et `npm -v`
2. Vérifiez que les ports 4000 et 5173 sont libres
3. Consultez les logs dans les terminaux backend et frontend
4. Vérifiez la console du navigateur (F12)

## 📧 Contact

Projet développé par **Michael Fellous**
- GitHub : https://github.com/Michael55988
- Repository : https://github.com/Michael55988/GameComplete---finale-project

---

**Bon test ! ⚽🎮**
