# GameComplete - Déploiement sur Render

## Prérequis

1. Un compte GitHub
2. Un compte Render (gratuit) : https://render.com

## Étapes de déploiement

### 1. Pousser le code sur GitHub

```bash
cd /Users/michaelfellous/Desktop/GameComplete
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/gamecomplete.git
git push -u origin main
```

### 2. Déployer le Backend sur Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre repository GitHub `gamecomplete`
4. Configurez le service :
   - **Name**: `gamecomplete-backend`
   - **Root Directory**: `gamecomplete-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Ajoutez les variables d'environnement :
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `[générez une clé secrète aléatoire]`
   - `DB_FILE` = `gamecomplete.db`
   - `FRONTEND_URL` = `[vous l'ajouterez après avoir déployé le frontend]`

6. Cliquez sur "Create Web Service"
7. **IMPORTANT** : Notez l'URL du backend (exemple : `https://gamecomplete-backend.onrender.com`)

### 3. Déployer le Frontend sur Render

1. Sur Render, cliquez sur "New +" → "Static Site"
2. Sélectionnez votre repository `gamecomplete`
3. Configurez le site :
   - **Name**: `gamecomplete-frontend`
   - **Root Directory**: `gamecomplete-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Ajoutez la variable d'environnement :
   - `VITE_API_URL` = `[l'URL de votre backend notée à l'étape 2.7]`

5. Cliquez sur "Create Static Site"
6. **IMPORTANT** : Notez l'URL du frontend (exemple : `https://gamecomplete-frontend.onrender.com`)

### 4. Finaliser la configuration

1. Retournez sur le service backend dans Render
2. Ajoutez/modifiez la variable d'environnement :
   - `FRONTEND_URL` = `[l'URL de votre frontend notée à l'étape 3.6]`
3. Le backend va redémarrer automatiquement

### 5. Tester votre application

Allez sur l'URL du frontend et testez toutes les fonctionnalités !

## Notes importantes

- **Premier déploiement** : Le backend peut prendre 1-2 minutes à démarrer
- **Base de données** : SQLite sera créée automatiquement au premier lancement
- **Uploads** : Les avatars seront stockés dans le système de fichiers de Render
- **Plan gratuit** : Votre service s'endort après 15 min d'inactivité et prend ~30s à se réveiller

## Dépannage

Si le site ne fonctionne pas :
1. Vérifiez les logs sur Render Dashboard → Service → Logs
2. Vérifiez que `VITE_API_URL` dans le frontend correspond à l'URL du backend
3. Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL du frontend
4. Ouvrez la console navigateur (F12) pour voir les erreurs
