# Roadmap — Quisi

## Phase 0 — Fondations (Semaine 1-2) ✅

- [x] Architecture & documentation
- [x] Schémas MongoDB
- [x] Structure monorepo
- [x] Docker Compose
- [x] Auth JWT (teacher/student)
- [x] Modèles de données Mongoose

## Phase 1 — MVP (Semaine 3-6)

### Backend Node
- [x] CRUD Quiz & Questions (4 types)
- [x] Sessions (code, launch, end)
- [x] Socket.IO rooms & events core
- [x] Soumission réponses
- [x] Stats live basiques

### Backend AI
- [x] Comprehension score formula
- [x] Engagement & trends locaux
- [x] Intégration OpenAI/Gemini
- [x] Live assistant (seuil 50% échec)
- [x] Adaptive difficulty rules

### Frontend
- [x] Dashboard : auth, quiz list, editor
- [x] Dashboard : session live view
- [x] Mobile : auth, join code, answer UI

### Livrable MVP
Enseignant peut créer quiz, lancer session, voir réponses live.  
Étudiant peut rejoindre et répondre. Recommandation IA basique.

---

## Phase 2 — Intelligence (Semaine 7-9)

- [ ] AI Quiz Generator complet avec édition
- [ ] Knowledge Heatmap persistante
- [ ] Smart Revision Generator
- [ ] Educational Chat Assistant
- [ ] Suspicious behavior alerts UI
- [ ] Predictive analytics dashboard cards

---

## Phase 3 — Production (Semaine 10-12)

### Infrastructure
- [ ] MongoDB Atlas production cluster
- [ ] CI/CD GitHub Actions
- [ ] Environnements staging/prod
- [ ] Redis Socket.IO adapter (scaling)
- [ ] Monitoring (Sentry, health checks)
- [ ] Rate limiting & WAF

### Qualité
- [ ] Tests unitaires Jest (Node) — couverture 70%
- [ ] Tests pytest (FastAPI)
- [ ] Tests E2E Playwright (dashboard)
- [ ] Load test Socket.IO (100+ participants)
- [ ] Documentation OpenAPI Swagger UI

### Features production
- [ ] Export PDF rapports
- [ ] Notifications push mobile (Expo)
- [ ] Mode hors-ligne partiel (cache questions)
- [ ] Multi-langue (FR/EN)
- [ ] SSO Google (optionnel)

---

## Phase 4 — Post-graduation (optionnel)

- LMS integrations (Moodle, Canvas)
- Vidéo explicative générée IA
- Classement gamifié avancé
- Tableau blanc collaboratif
- API publique partenaires

---

## Planning détaillé MVP → Production

| Semaine | Objectif | Critère de succès |
|---------|----------|-------------------|
| S1 | Setup & Auth | Login teacher/student OK |
| S2 | Quiz CRUD | 4 types questions fonctionnels |
| S3 | Sessions + Socket | Latence < 1s mesurée |
| S4 | Analytics local | Comprehension score affiché |
| S5 | IA integration | Recommandations live reçues |
| S6 | Dashboard live | Charts temps réel |
| S7 | Mobile polish | Parcours étudiant fluide |
| S8 | Rapports | Rapport session généré |
| S9 | Suspicion + predict | Alertes fonctionnelles |
| S10 | Docker prod | Deploy staging OK |
| S11 | Tests & fixes | 0 bugs critiques |
| S12 | Soutenance | Démo live 15 min |

---

## Critères de performance

| Métrique | Cible MVP | Cible Production |
|----------|-----------|------------------|
| Latence Socket | < 1s | < 500ms p95 |
| API REST p95 | < 300ms | < 200ms |
| Concurrent users/session | 50 | 200 |
| Uptime | 95% | 99.5% |
| IA response | < 5s | < 3s (streaming) |

---

## Risques & mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Coût API IA | Moyen | Cache prompts, gpt-4o-mini, limites |
| Latence réseau | Élevé | Socket rooms, agrégation locale |
| Triche étudiants | Moyen | SuspicionScore + review teacher |
| MongoDB scale | Faible | Index, Atlas M10 si besoin |

---

## Definition of Done (Production)

1. Tous endpoints documentés testés
2. Docker `compose up` démarre stack complète
3. Démo live 30 participants sans dégradation
4. Rapport session avec heatmap + IA summary
5. README + docs à jour pour jury
