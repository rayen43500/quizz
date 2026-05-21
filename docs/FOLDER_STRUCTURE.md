# Structure des dossiers — Quisi

```
projet validation/
├── README.md
├── .env.example
├── docker-compose.yml
├── .gitignore
│
├── docs/
│   ├── ARCHITECTURE.md      # Architecture système
│   ├── API.md               # Documentation REST complète
│   ├── DATABASE.md          # Schémas MongoDB
│   ├── DIAGRAMS.md          # UML classes & séquences
│   ├── USE_CASES.md         # Cas d'utilisation
│   ├── ROADMAP.md           # MVP & production
│   └── FOLDER_STRUCTURE.md  # Ce fichier
│
├── backend-node/            # API Node.js + Socket.IO
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       ├── models/          # Mongoose schemas
│       ├── controllers/
│       ├── routes/
│       ├── middlewares/
│       ├── services/        # aiClient, sessionStats
│       ├── socket/          # Socket.IO handlers
│       ├── utils/
│       └── scripts/seed.js
│
├── backend-ai/              # FastAPI Analytics + IA
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── models/schemas.py
│       ├── routers/
│       │   ├── analytics.py
│       │   ├── ai.py
│       │   └── reports.py
│       └── services/
│           ├── analytics_engine.py
│           └── ai_provider.py
│
├── dashboard/               # React Teacher Dashboard
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── api/client.ts
│       ├── context/AuthContext.tsx
│       ├── components/Layout.tsx
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── Quizzes.tsx
│       │   ├── QuizEditor.tsx
│       │   ├── LiveSession.tsx
│       │   ├── Reports.tsx
│       │   ├── Analytics.tsx
│       │   └── AIGenerator.tsx
│       └── styles/
│
└── mobile/                  # React Native Expo
    ├── App.tsx
    ├── app.json
    ├── package.json
    └── src/
        ├── api/client.ts
        ├── context/AuthContext.tsx
        ├── screens/
        │   ├── LoginScreen.tsx
        │   ├── JoinSessionScreen.tsx
        │   ├── QuizScreen.tsx
        │   ├── ProgressScreen.tsx
        │   └── ChatScreen.tsx
        └── styles/theme.ts
```

## Conventions

| Couche | Convention |
|--------|------------|
| Node controllers | `*Controller.js` — logique HTTP |
| Node services | Appels externes, calculs partagés |
| FastAPI routers | Un fichier par domaine |
| React pages | Une page = une route |
| Mobile screens | Une screen = un écran navigation |
