# Diagrammes — Quisi

## Diagramme de classes (simplifié)

```mermaid
classDiagram
    class User {
        +ObjectId id
        +String email
        +String role
        +register()
        +login()
    }

    class Quiz {
        +ObjectId id
        +String title
        +String topic
        +Number difficulty
        +create()
        +update()
        +delete()
    }

    class Question {
        +ObjectId id
        +String type
        +String text
        +Array options
        +validateAnswer()
    }

    class Session {
        +ObjectId id
        +String code
        +String status
        +launch()
        +end()
        +nextQuestion()
        +addParticipant()
    }

    class Response {
        +ObjectId id
        +String answer
        +Number responseTimeMs
        +Boolean isCorrect
    }

    class AnalyticsEngine {
        +computeComprehensionScore()
        +computeEngagement()
        +detectSuspicion()
        +predictDropout()
    }

    class AIService {
        +generateInsights()
        +generateQuiz()
        +chat()
        +revisionPlan()
    }

    class SocketHub {
        +joinRoom()
        +broadcastStats()
        +emitRecommendation()
    }

    User "1" --> "*" Quiz : creates
    Quiz "1" --> "*" Question : contains
    Quiz "1" --> "*" Session : has
    Session "1" --> "*" Response : collects
    Session --> AnalyticsEngine : triggers
    AnalyticsEngine --> AIService : enriches
    Session --> SocketHub : syncs
```

---

## Séquence : Lancement session & première question

```mermaid
sequenceDiagram
    autonumber
    actor Teacher
    participant Dashboard
    participant NodeAPI
    participant SocketIO
    participant MongoDB
    actor Student
    participant Mobile

    Teacher->>Dashboard: Launch Session
    Dashboard->>NodeAPI: POST /sessions/:id/launch
    NodeAPI->>MongoDB: Update status=active
    NodeAPI->>SocketIO: Emit session:started
    SocketIO-->>Dashboard: session:started

    Student->>Mobile: Enter code AB3K9X
    Mobile->>NodeAPI: POST /sessions/join
    NodeAPI->>MongoDB: Add participant
    NodeAPI->>SocketIO: join_session room
    SocketIO-->>Dashboard: participant:joined

    Teacher->>Dashboard: Show Question 1
    Dashboard->>SocketIO: question:show
    SocketIO-->>Mobile: question:show

    Student->>Mobile: Select answer
    Mobile->>SocketIO: answer:submit
    SocketIO->>NodeAPI: Validate & save
    NodeAPI->>MongoDB: Insert response
    NodeAPI->>SocketIO: stats:update
    SocketIO-->>Dashboard: stats:update
```

---

## Séquence : Pipeline Analytics + IA

```mermaid
sequenceDiagram
    participant NodeAPI
    participant FastAPI
    participant AnalyticsModule
    participant AIModule
    participant OpenAI

    NodeAPI->>FastAPI: POST /analytics/compute
    FastAPI->>AnalyticsModule: calculate metrics
    AnalyticsModule-->>FastAPI: comprehensionScore, engagement...

    alt successRate < 50%
        NodeAPI->>FastAPI: POST /analytics/live
        FastAPI->>AnalyticsModule: check thresholds
        FastAPI->>AIModule: build prompt
        AIModule->>OpenAI: chat completion
        OpenAI-->>AIModule: recommendations
        AIModule-->>FastAPI: structured insights
        FastAPI-->>NodeAPI: assistant message
    end

    NodeAPI->>NodeAPI: Socket emit assistant:recommendation
```

---

## Séquence : Génération rapport

```mermaid
sequenceDiagram
    actor Teacher
    participant Dashboard
    participant NodeAPI
    participant FastAPI
    participant MongoDB

    Teacher->>Dashboard: Generate Report
    Dashboard->>NodeAPI: POST /reports/session/:id
    NodeAPI->>MongoDB: Fetch responses + session
    NodeAPI->>FastAPI: POST /reports/generate
    Note over FastAPI: Local metrics + AI summary + heatmap + revision
    FastAPI-->>NodeAPI: Full report payload
    NodeAPI->>MongoDB: Save reports collection
    NodeAPI-->>Dashboard: Report JSON
```

---

## Diagramme composants déploiement

```mermaid
flowchart TB
    subgraph clients [Clients]
        D[React Dashboard]
        M[Expo Mobile]
    end

    subgraph docker [Docker Compose]
        N[Node API :4000]
        F[FastAPI :8000]
        DB[(MongoDB :27017)]
        DV[Vite Dashboard :5173]
    end

    subgraph external [External]
        AI[OpenAI / Gemini]
        ATLAS[(MongoDB Atlas Prod)]
    end

    D --> N
    D --> DV
    M --> N
    N --> DB
    N --> F
    F --> AI
    N -.prod.-> ATLAS
```

---

## État session (machine à états)

```mermaid
stateDiagram-v2
    [*] --> waiting: create session
    waiting --> active: launch
    active --> paused: pause
    paused --> active: resume
    active --> ended: end session
    ended --> [*]
```

---

## Flux adaptatif difficulté

```mermaid
flowchart LR
    A[Question answered] --> B{successRate?}
    B -->|> 80%| C[difficulty + 1]
    B -->|< 50%| D[difficulty - 1]
    B -->|50-80%| E[unchanged]
    C --> F{Individual lag?}
    D --> F
    E --> F
    F -->|> 30% gap| G[Personalized easier Q]
    F -->|ok| H[Group difficulty Q]
```
