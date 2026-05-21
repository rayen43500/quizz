# API Documentation — Quisi

Base URL Node.js : `http://localhost:4000/api/v1`  
Base URL FastAPI : `http://localhost:8000/api/v1` (interne + health public)

Auth : `Authorization: Bearer <jwt_token>`

---

## Auth APIs

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/auth/register` | Inscription | public |
| POST | `/auth/login` | Connexion | public |
| GET | `/auth/me` | Profil courant | authenticated |
| PATCH | `/auth/profile` | Mise à jour profil | authenticated |
| POST | `/auth/avatar` | Upload photo (base64 data URL) | authenticated |
| DELETE | `/auth/avatar` | Supprimer photo | authenticated |
| PATCH | `/auth/password` | Changer mot de passe | authenticated |
| GET | `/stats/overview` | Stats globales enseignant | teacher |
| GET | `/stats/me` | Stats personnelles | authenticated |
| GET | `/users/students` | Liste étudiants + stats | teacher |

### POST /auth/register

```json
{
  "email": "teacher@school.edu",
  "password": "SecurePass123!",
  "firstName": "Marie",
  "lastName": "Dupont",
  "role": "teacher"
}
```

Response `201`:
```json
{
  "user": { "id": "...", "email": "...", "role": "teacher" },
  "token": "eyJhbG..."
}
```

### POST /auth/login

```json
{ "email": "student@school.edu", "password": "..." }
```

---

## Quiz APIs

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/quizzes` | Liste des quiz | teacher |
| POST | `/quizzes` | Créer quiz | teacher |
| GET | `/quizzes/:id` | Détail quiz | teacher |
| PATCH | `/quizzes/:id` | Modifier quiz | teacher |
| DELETE | `/quizzes/:id` | Supprimer quiz | teacher |

### POST /quizzes

```json
{
  "title": "Probabilités — Chapitre 3",
  "topic": "Probability",
  "difficulty": 3,
  "defaultTimerSec": 30,
  "description": "Quiz sur les événements conditionnels"
}
```

---

## Question APIs

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/quizzes/:quizId/questions` | Liste questions | teacher |
| POST | `/quizzes/:quizId/questions` | Ajouter question | teacher |
| PATCH | `/questions/:id` | Modifier | teacher |
| DELETE | `/questions/:id` | Supprimer | teacher |
| POST | `/quizzes/:quizId/questions/reorder` | Réordonner | teacher |

### POST /quizzes/:quizId/questions

```json
{
  "type": "multiple_choice",
  "text": "P(A|B) signifie ?",
  "options": [
    { "id": "a", "label": "Probabilité de A sachant B", "isCorrect": true },
    { "id": "b", "label": "Probabilité de B sachant A", "isCorrect": false }
  ],
  "explanation": "Notation conditionnelle standard",
  "difficulty": 3,
  "timerSec": 25,
  "points": 10
}
```

Types : `multiple_choice`, `true_false`, `poll`, `short_answer`

---

## Session APIs

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/sessions` | Créer session (code généré) | teacher |
| POST | `/sessions/:id/launch` | Lancer session | teacher |
| POST | `/sessions/:id/end` | Terminer | teacher |
| GET | `/sessions/:id` | Détail + métriques | teacher |
| GET | `/sessions/code/:code` | Info session par code | student |
| POST | `/sessions/join` | Rejoindre par code | student |
| POST | `/sessions/:id/next-question` | Question suivante | teacher |
| GET | `/sessions/:id/participants` | Participants actifs | teacher |
| GET | `/sessions/:id/live-stats` | Stats temps réel | teacher |

### POST /sessions/join

```json
{ "code": "AB3K9X" }
```

### POST /sessions/:id/next-question

```json
{ "questionIndex": 2 }
```

---

## Response APIs

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/responses` | Soumettre réponse | student |
| GET | `/responses/session/:sessionId` | Réponses session | teacher |
| GET | `/responses/me/progress` | Progression étudiant | student |

### POST /responses

```json
{
  "sessionId": "...",
  "questionId": "...",
  "answer": "a",
  "responseTimeMs": 4200
}
```

---

## Analytics APIs (Node → proxy FastAPI)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/analytics/session/:sessionId` | Métriques session | teacher |
| GET | `/analytics/student/:userId` | Progression étudiant | student/teacher |
| GET | `/analytics/heatmap` | Heatmap connaissances | authenticated |
| POST | `/analytics/predict` | Prédictions | teacher |

---

## Report APIs

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/reports/session/:sessionId` | Générer rapport | teacher |
| GET | `/reports` | Liste rapports | teacher |
| GET | `/reports/:id` | Détail rapport | teacher |
| GET | `/reports/:id/pdf` | Export (future) | teacher |

---

## AI APIs (Node proxy → FastAPI)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/ai/generate-quiz` | Générer quiz IA | teacher |
| POST | `/ai/live-assistant` | Recommandations live | teacher |
| POST | `/ai/chat` | Chat éducatif | student |
| POST | `/ai/revision-plan` | Plan de révision | student |
| POST | `/ai/explain-answer` | Explication réponse | student |

### POST /ai/generate-quiz

```json
{
  "topic": "Functions",
  "difficulty": 3,
  "questionCount": 10,
  "types": ["multiple_choice", "true_false"]
}
```

### POST /ai/chat

```json
{
  "message": "Why was my answer wrong?",
  "context": {
    "questionText": "...",
    "studentAnswer": "b",
    "correctAnswer": "a",
    "explanation": "..."
  }
}
```

---

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_session` | `{ sessionId, token }` | Rejoindre room |
| `leave_session` | `{ sessionId }` | Quitter |
| `answer:submit` | `{ questionId, answer, responseTimeMs }` | Réponse live |
| `question:show` | `{ questionId, index }` | (teacher) afficher question |
| `session:pause` | `{}` | Pause |
| `session:resume` | `{}` | Reprendre |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `session:started` | `{ session, code }` | Session lancée |
| `session:ended` | `{ sessionId }` | Fin |
| `participant:joined` | `{ user, count }` | Nouveau participant |
| `participant:left` | `{ userId, count }` | Départ |
| `question:show` | `{ question, timerSec, index }` | Question affichée |
| `answer:received` | `{ userId, isCorrect, stats }` | (teacher) réponse reçue |
| `stats:update` | `{ responseRate, successRate, ... }` | Stats live |
| `assistant:recommendation` | `{ message, priority }` | Conseil IA live |
| `difficulty:adjusted` | `{ level, reason }` | Adaptation |
| `suspicion:alert` | `{ userId, score, flags }` | Alerte triche |

---

## FastAPI Internal Endpoints

Header requis : `X-Internal-Key: <AI_SERVICE_INTERNAL_KEY>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analytics/compute` | Calcul métriques |
| POST | `/api/v1/analytics/live` | Assistant live |
| POST | `/api/v1/analytics/suspicion` | Détection suspicion |
| POST | `/api/v1/analytics/predict` | Prédictions |
| POST | `/api/v1/ai/insights` | Insights IA |
| POST | `/api/v1/ai/generate-quiz` | Génération quiz |
| POST | `/api/v1/ai/chat` | Chat |
| POST | `/api/v1/ai/revision-plan` | Plan révision |
| POST | `/api/v1/reports/generate` | Rapport complet |
| GET | `/health` | Health check |

---

## Codes d'erreur

| Code | Signification |
|------|---------------|
| 400 | Validation échouée |
| 401 | Non authentifié |
| 403 | Rôle insuffisant |
| 404 | Ressource introuvable |
| 409 | Conflit (ex: déjà répondu) |
| 429 | Rate limit |
| 500 | Erreur serveur |
| 503 | Service IA indisponible |
