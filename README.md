# Quisi — AI-Enhanced Real-Time Learning Intelligence Platform

Plateforme éducative de graduation combinant quiz en direct, analytics pédagogiques, apprentissage adaptatif et intelligence artificielle.

## Architecture

```
Teacher Dashboard (React)     Student App (React Native Expo)
         │                              │
         └──────────┬───────────────────┘
                    │ REST + Socket.IO
         ┌──────────▼──────────┐
         │  Node.js + Express  │
         │  (Auth, Quiz, RT)   │
         └──────────┬──────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
 MongoDB Atlas   FastAPI AI    Socket.IO
                 (Analytics)   (Live sync)
```

## Stack

| Composant | Technologie |
|-----------|-------------|
| Dashboard enseignant | React + Vite + TypeScript |
| Application étudiant | React Native Expo |
| API temps réel | Node.js + Express + Socket.IO |
| Analytics & IA | Python FastAPI |
| Base de données | MongoDB Atlas |
| Auth | JWT |
| Déploiement | Docker Compose |

## Pages principales

| URL | Description |
|-----|-------------|
| http://localhost:5173/ | **Page d'accueil publique** — présentation, innovation, démo visuelle |
| http://localhost:5173/login | Connexion enseignant |
| http://localhost:5173/app | **Tableau de bord** — home enrichi, stats, sessions, IA |

## Démarrage rapide

### Prérequis

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Compte MongoDB Atlas (ou MongoDB local)
- Clé API OpenAI ou Google Gemini

### 1. Configuration

```bash
cp .env.example .env
# Remplir MONGODB_URI, JWT_SECRET, OPENAI_API_KEY ou GEMINI_API_KEY
```

### 2. Docker (recommandé)

```bash
docker compose up --build
```

Services :
- API Node : http://localhost:4000
- AI FastAPI : http://localhost:8000
- Dashboard : http://localhost:5173
- MongoDB : localhost:27017

### 3. Développement local

```bash
# Terminal 1 — MongoDB (si pas Docker)
docker run -d -p 27017:27017 mongo:7

# Terminal 2 — Backend Node
cd backend-node && npm install && npm run dev

# Terminal 3 — AI FastAPI
cd backend-ai && pip install -r requirements.txt && uvicorn app.main:app --reload

# Terminal 4 — Dashboard
cd dashboard && npm install && npm run dev

# Terminal 5 — Mobile
cd mobile && npm install && npx expo start

# Données de démo (après MongoDB démarré)
cd backend-node && npm run seed
```

### 4. Seed — données de démonstration

```bash
cd backend-node
npm run seed
```

Génère automatiquement :

| Données | Quantité |
|---------|----------|
| Enseignants | 2 (avec avatar) |
| Étudiants | 5 (avec avatar + heatmap) |
| Quiz | 3 (Probabilités, Algèbre, Fonctions) |
| Questions | 10 (QCM, Vrai/Faux, Sondage, Réponse courte) |
| Sessions | 4 (1 **active** avec code affiché, 2 terminées, 1 en attente) |
| Réponses | ~45 |
| Analytics + Rapports | 6 |

**Comptes après seed :**

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Enseignant | `teacher@quisi.edu` | `Teacher123!` |
| Étudiant | `student@quisi.edu` | `Student123!` |

Le terminal affiche le **code de la session live** (ex. `48CKTB`) pour tester l'app mobile.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture système complète |
| [docs/API.md](docs/API.md) | Documentation REST API |
| [docs/DATABASE.md](docs/DATABASE.md) | Schémas MongoDB |
| [docs/DIAGRAMS.md](docs/DIAGRAMS.md) | Diagrammes UML (classes, séquences) |
| [docs/USE_CASES.md](docs/USE_CASES.md) | Cas d'utilisation |
| [docs/ROADMAP.md](docs/ROADMAP.md) | MVP & plan production |

## Par acteur — fonctionnalités complètes

| Fonctionnalité | Enseignant (Dashboard) | Étudiant (Mobile) |
|----------------|------------------------|-------------------|
| Inscription / Connexion | ✅ | ✅ |
| Profil + photo | ✅ `/app/profile` | ✅ Profil |
| Mot de passe | ✅ | — |
| CRUD Quiz (4 types) | ✅ | — |
| Générateur IA quiz | ✅ | — |
| Sessions live + code | ✅ | ✅ Rejoindre |
| Réponses temps réel | ✅ Monitor | ✅ |
| Stats / heatmap | ✅ Analytics | ✅ Statistiques |
| Historique réponses | — | ✅ |
| Liste étudiants | ✅ `/app/students` | — |
| Rapports IA | ✅ | — |
| Chat éducatif | — | ✅ |
| Plan révision IA | — | ✅ |

## Fonctionnalités principales

- Quiz live (QCM, Vrai/Faux, Sondages, Réponses courtes)
- Sessions avec code unique & sync temps réel (< 1s)
- Analytics locales + interprétation IA
- Assistant pédagogique en direct
- Difficulté adaptative (groupe & individuel)
- Générateur de quiz IA
- Heatmap de connaissances
- Plans de révision intelligents
- Chat éducatif étudiant
- Détection comportements suspects
- Analytics prédictives
- Rapports pédagogiques complets

## Structure du projet

```
quisi/
├── backend-node/      # API REST + Socket.IO
├── backend-ai/        # FastAPI analytics + IA
├── dashboard/         # React Teacher Dashboard
├── mobile/            # React Native Expo
├── docs/              # Documentation technique
├── docker-compose.yml
└── .env.example
```

## Licence

Projet académique — Graduation Project.
