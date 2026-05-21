import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const FEATURES = [
  { icon: '⚡', title: 'Quiz en direct', desc: 'Synchronisation temps réel < 1 seconde via Socket.IO' },
  { icon: '🧠', title: 'Intelligence hybride', desc: 'Analytics locales + interprétation IA (OpenAI / Gemini)' },
  { icon: '📊', title: 'Analytics pédagogiques', desc: 'Score de compréhension, engagement, tendances' },
  { icon: '🎯', title: 'Apprentissage adaptatif', desc: 'Difficulté dynamique groupe & individuel' },
  { icon: '🛡️', title: 'Détection suspicion', desc: 'Alertes anti-triche en session live' },
  { icon: '📱', title: 'App mobile étudiant', desc: 'Rejoindre par code, répondre, chat éducatif' },
];

const INNOVATIONS = [
  'Assistant pédagogique live pendant les sessions',
  'Générateur de quiz par IA en un clic',
  'Heatmap de maîtrise par sujet',
  'Plans de révision intelligents sur 3–7 jours',
  'Prédictions : risque de décrochage & besoins de soutien',
];

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="landing-spinner" />
        <p>Chargement Quisi...</p>
      </div>
    );
  }

  if (user) return <Navigate to="/app" replace />;

  return (
    <div className="landing">
      <div className="landing-bg" aria-hidden />
      <header className="landing-header">
        <div className="landing-brand">
          <span className="landing-logo">Q</span>
          <span>Quisi</span>
        </div>
        <nav className="landing-nav">
          <a href="#features">Fonctionnalités</a>
          <a href="#innovation">Innovation</a>
          <Link to="/login" className="btn btn-secondary">Connexion</Link>
          <Link to="/register" className="btn btn-primary">Commencer</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-pill">Projet de graduation · EdTech IA</span>
          <h1>
            Transformez chaque quiz live en
            <span className="landing-gradient-text"> intelligence pédagogique</span>
          </h1>
          <p className="landing-hero-desc">
            Quisi n'est pas une simple application de quiz. C'est une plateforme complète qui combine
            temps réel, analytics éducatives et recommandations IA pour aider les enseignants à enseigner
            mieux — et les étudiants à progresser plus vite.
          </p>
          <div className="landing-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Créer un compte enseignant</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Se connecter</Link>
          </div>
          <div className="landing-stats">
            <div><strong>&lt;1s</strong><span>Latence live</span></div>
            <div><strong>4</strong><span>Types de questions</span></div>
            <div><strong>IA</strong><span>OpenAI / Gemini</span></div>
            <div><strong>100%</strong><span>Production-ready</span></div>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-mockup">
            <div className="mockup-bar">
              <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
              <span className="mockup-title">Session Live — Probabilités</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-metric">
                <span>Participants</span>
                <strong>24</strong>
              </div>
              <div className="mockup-metric">
                <span>Succès</span>
                <strong className="warn">42%</strong>
              </div>
              <div className="mockup-metric">
                <span>Compréhension</span>
                <strong>52</strong>
              </div>
              <div className="mockup-alert">
                <span className="badge badge-warning">Assistant IA</span>
                <p>72% des élèves ont échoué — envisagez des exemples plus simples.</p>
              </div>
              <div className="mockup-chart">
                {[40, 55, 42, 68, 45, 52].map((h, i) => (
                  <div key={i} className="mockup-bar-col" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <h2>Fonctionnalités complètes</h2>
        <p className="section-sub">Une stack moderne pour l'enseignement interactif</p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="innovation" className="landing-section landing-innovation">
        <div className="innovation-content">
          <h2>Pourquoi Quisi est innovant ?</h2>
          <p>
            Stratégie <strong>hybride</strong> : calcul local des métriques pédagogiques (sans ML custom),
            puis enrichissement par IA externe pour des recommandations actionnables en temps réel.
          </p>
          <ul className="innovation-list">
            {INNOVATIONS.map((item) => (
              <li key={item}><span className="check">✓</span>{item}</li>
            ))}
          </ul>
          <code className="formula">
            Score = 0.5 × Correctness + 0.3 × Participation + 0.2 × ResponseSpeed
          </code>
        </div>
        <div className="innovation-stack card">
          <h4>Stack technique</h4>
          <div className="stack-item"><span>Dashboard</span> React + Vite</div>
          <div className="stack-item"><span>Mobile</span> React Native Expo</div>
          <div className="stack-item"><span>API</span> Node.js + Socket.IO</div>
          <div className="stack-item"><span>IA</span> Python FastAPI</div>
          <div className="stack-item"><span>DB</span> MongoDB Atlas</div>
          <div className="stack-item"><span>Deploy</span> Docker Compose</div>
        </div>
      </section>

      <section className="landing-cta-section">
        <h2>Prêt à révolutionner vos cours ?</h2>
        <p>Comptes démo : teacher@quisi.edu / student@quisi.edu (après seed)</p>
        <Link to="/register" className="btn btn-primary btn-lg">Démarrer gratuitement</Link>
      </section>

      <footer className="landing-footer">
        <span>© 2026 Quisi — AI-Enhanced Real-Time Learning Intelligence Platform</span>
      </footer>
    </div>
  );
}
