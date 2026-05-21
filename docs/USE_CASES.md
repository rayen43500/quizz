# Cas d'utilisation — Quisi

## Acteurs

| Acteur | Description |
|--------|-------------|
| **Enseignant (Teacher)** | Crée quiz, lance sessions, analyse performances |
| **Étudiant (Student)** | Rejoint sessions, répond, consulte progression |
| **Système IA** | Analytics, recommandations, génération contenu |
| **Système Temps Réel** | Synchronisation Socket.IO |

---

## UC-01 : Inscription enseignant

| Champ | Valeur |
|-------|--------|
| Acteur | Enseignant |
| Précondition | Email non utilisé |
| Flux principal | 1. Accède au dashboard 2. Remplit formulaire 3. Système valide 4. Compte créé 5. Redirection dashboard |
| Postcondition | Compte teacher en base, JWT émis |
| Extensions | E1: Email existant → erreur 409 |

---

## UC-02 : Créer un quiz

| Champ | Valeur |
|-------|--------|
| Acteur | Enseignant |
| Précondition | Authentifié teacher |
| Flux | 1. Nouveau quiz 2. Saisit titre, topic, difficulté 3. Ajoute questions (4 types) 4. Sauvegarde |
| Postcondition | Quiz + questions en MongoDB |

---

## UC-03 : Générer quiz par IA

| Champ | Valeur |
|-------|--------|
| Acteur | Enseignant |
| Flux | 1. Saisit topic, difficulté, nombre 2. Node → FastAPI → OpenAI 3. Questions générées 4. Enseignant valide/édite 5. Sauvegarde |
| Postcondition | Quiz pré-rempli modifiable |

---

## UC-04 : Lancer session live

| Champ | Valeur |
|-------|--------|
| Acteur | Enseignant |
| Flux | 1. Sélectionne quiz 2. Crée session (code 6 chars) 3. Launch 4. Socket broadcast `session:started` 5. Dashboard affiche participants |
| Postcondition | Session status=active, room Socket créée |

---

## UC-05 : Rejoindre session (étudiant)

| Champ | Valeur |
|-------|--------|
| Acteur | Étudiant |
| Flux | 1. Ouvre app mobile 2. Entre code 3. POST /sessions/join 4. Socket join_session 5. Attend questions |
| Postcondition | Participant enregistré, notifications live actives |

---

## UC-06 : Répondre en temps réel

| Champ | Valeur |
|-------|--------|
| Acteur | Étudiant |
| Flux | 1. Reçoit `question:show` 2. Sélectionne réponse 3. `answer:submit` 4. Node valide, stocke 5. Stats broadcast < 1s |
| Extensions | E1: Timer expiré → réponse refusée E2: Déjà répondu → 409 |

---

## UC-07 : Monitoring live enseignant

| Champ | Valeur |
|-------|--------|
| Acteur | Enseignant |
| Flux | 1. Dashboard session live 2. Reçoit stats:update 3. Graphiques temps réel 4. Reçoit assistant:recommendation si seuil échec |
| Postcondition | Décisions pédagogiques informées |

---

## UC-08 : Adaptation difficulté

| Champ | Valeur |
|-------|--------|
| Acteur | Système |
| Déclencheur | successRate calculé après chaque question |
| Règles | >80% ↑ / <50% ↓ / individuel si écart >30% |
| Flux | 1. FastAPI calcule 2. Node émet difficulty:adjusted 3. Prochaine question adaptée |

---

## UC-09 : Détection comportement suspect

| Champ | Valeur |
|-------|--------|
| Acteur | Système |
| Flux | 1. Analyse temps réponse, patterns 2. SuspicionScore 3. Si > seuil → suspicion:alert au teacher |
| Critères | Réponse < 500ms, réponses identiques, saut score anormal |

---

## UC-10 : Générer rapport de session

| Champ | Valeur |
|-------|--------|
| Acteur | Enseignant |
| Précondition | Session ended |
| Flux | 1. POST /reports/session/:id 2. Agrégation locale 3. IA synthèse 4. Heatmap + plan révision 5. Stockage reports |
| Postcondition | Rapport consultable, exportable |

---

## UC-11 : Chat éducatif étudiant

| Champ | Valeur |
|-------|--------|
| Acteur | Étudiant |
| Flux | 1. "Pourquoi ma réponse est fausse ?" 2. Contexte question envoyé 3. IA explique pédagogiquement 4. Affichage mobile |
| Postcondition | Compréhension améliorée, pas de réponse brute |

---

## UC-12 : Heatmap & plan révision

| Champ | Valeur |
|-------|--------|
| Acteur | Étudiant |
| Flux | 1. Consulte progression 2. GET heatmap par topic 3. Demande revision-plan IA 4. Plan 3-7 jours affiché |

---

## Matrice acteurs × fonctionnalités

| Fonctionnalité | Teacher | Student | Système |
|----------------|---------|---------|---------|
| Auth | ✓ | ✓ | |
| CRUD Quiz | ✓ | | |
| Session live | ✓ | join | sync |
| Répondre | | ✓ | |
| Dashboard analytics | ✓ | | calc |
| Rapports | ✓ | | ✓ |
| IA generate | ✓ | | ✓ |
| IA chat | | ✓ | ✓ |
| Suspicion alerts | ✓ | | ✓ |
