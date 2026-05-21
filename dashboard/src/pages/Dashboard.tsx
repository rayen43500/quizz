import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Dashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [services, setServices] = useState({ api: false, ai: false });
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    api.get('/stats/overview').then((r) => setOverview(r.data)).catch(() => {});
    api.get('/quizzes').then((r) => setQuizzes(r.data.quizzes)).catch(() => {});
    api.get('/sessions').then((r) => setSessions(r.data.sessions)).catch(() => {});
    api.get('/reports').then((r) => setReports(r.data.reports)).catch(() => {});
    api.get('/analytics/heatmap').then((r) => setHeatmap(r.data.heatmap)).catch(() => {});

    fetch(`${API_URL}/health`).then((r) => r.ok && setServices((s) => ({ ...s, api: true }))).catch(() => {});
    fetch(`${API_URL.replace('4000', '8000')}/health`)
      .then((r) => r.ok && setServices((s) => ({ ...s, ai: true })))
      .catch(() => {});
  }, []);

  const activeSessions = sessions.filter((s) => s.status === 'active').length;
  const chartData = heatmap.slice(0, 6).map((h) => ({ name: h.topic?.slice(0, 8), value: h.masteryPercent }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="home">
      <section className="home-hero card">
        <div className="home-hero-text">
          <span className="home-greeting">{greeting}, {user?.firstName} 👋</span>
          <h1>Votre centre de commande pédagogique</h1>
          <p>
            Lancez des sessions interactives, suivez la compréhension en temps réel et laissez l'IA
            vous guider vers de meilleures décisions d'enseignement.
          </p>
          <div className="home-hero-actions">
            <Link to="/app/quizzes" className="btn btn-primary">+ Créer un quiz</Link>
            <Link to="/app/ai-generator" className="btn btn-secondary">Générer avec IA</Link>
            {sessions.find((s) => s.status === 'active') && (
              <Link
                to={`/app/sessions/${sessions.find((s) => s.status === 'active')!._id}/live`}
                className="btn btn-secondary home-live-btn"
              >
                ● Session en cours
              </Link>
            )}
          </div>
        </div>
        <div className="home-hero-metrics">
          <div className="hero-metric">
            <span className="metric-label">Quiz</span>
            <span className="metric-value">{overview?.quizzes ?? quizzes.length}</span>
          </div>
          <div className="hero-metric">
            <span className="metric-label">Sessions</span>
            <span className="metric-value">{overview?.sessions ?? sessions.length}</span>
          </div>
          <div className="hero-metric highlight">
            <span className="metric-label">Live actives</span>
            <span className="metric-value">{overview?.activeSessions ?? activeSessions}</span>
          </div>
        </div>
      </section>

      <div className="home-stats grid-4">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>📚</div>
          <div>
            <p className="stat-label">Quiz créés</p>
            <h3>{overview?.quizzes ?? quizzes.length}</h3>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>🎯</div>
          <div>
            <p className="stat-label">Rapports générés</p>
            <h3>{overview?.reports ?? reports.length}</h3>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>⚡</div>
          <div>
            <p className="stat-label">Latence live</p>
            <h3 className="text-success">&lt;1s</h3>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🤖</div>
          <div>
            <p className="stat-label">Services</p>
            <h3 className="stat-services">
              <span className={services.api ? 'on' : 'off'}>API</span>
              <span className={services.ai ? 'on' : 'off'}>IA</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="home-grid grid-2">
        <div className="card home-chart-card">
          <h3>Maîtrise par sujet</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#2dd4bf" fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-hint">Créez des quiz pour voir les analytics</p>
          )}
          <Link to="/app/analytics" className="home-link">Voir heatmap complète →</Link>
        </div>

        <div className="card">
          <h3>Actions rapides</h3>
          <div className="quick-actions">
            <Link to="/app/quizzes" className="quick-action">
              <span>📝</span>
              <div>
                <strong>Gérer les quiz</strong>
                <small>QCM, Vrai/Faux, Sondages</small>
              </div>
            </Link>
            <Link to="/app/ai-generator" className="quick-action">
              <span>✨</span>
              <div>
                <strong>Générateur IA</strong>
                <small>Créer un quiz en secondes</small>
              </div>
            </Link>
            <Link to="/app/sessions" className="quick-action">
              <span>🎬</span>
              <div>
                <strong>Sessions live</strong>
                <small>Lancer & monitorer</small>
              </div>
            </Link>
            <Link to="/app/students" className="quick-action">
              <span>👥</span>
              <div>
                <strong>Étudiants</strong>
                <small>{overview?.students ?? 0} inscrits · photos & stats</small>
              </div>
            </Link>
            <Link to="/app/profile" className="quick-action">
              <span>👤</span>
              <div>
                <strong>Mon profil</strong>
                <small>Photo & mot de passe</small>
              </div>
            </Link>
            <Link to="/app/reports" className="quick-action">
              <span>📊</span>
              <div>
                <strong>Rapports</strong>
                <small>Synthèses pédagogiques</small>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="home-grid grid-2">
        <div className="card">
          <div className="card-header-row">
            <h3>Quiz récents</h3>
            <Link to="/app/quizzes">Tout voir</Link>
          </div>
          {quizzes.slice(0, 5).map((q) => (
            <div key={q._id} className="list-row">
              <div>
                <Link to={`/app/quizzes/${q._id}`} className="list-title">{q.title}</Link>
                <span className="list-meta">{q.topic} · {q.questionCount} questions</span>
              </div>
              <span className="badge badge-success">Niv. {q.difficulty}</span>
            </div>
          ))}
          {quizzes.length === 0 && (
            <p className="empty-hint">Aucun quiz — <Link to="/app/quizzes">créez votre premier</Link></p>
          )}
        </div>

        <div className="card">
          <div className="card-header-row">
            <h3>Sessions récentes</h3>
            <Link to="/app/sessions">Historique</Link>
          </div>
          {sessions.slice(0, 5).map((s) => (
            <div key={s._id} className="list-row">
              <div>
                <span className="list-title">{s.quizId?.title || 'Session'}</span>
                <span className="list-meta">Code {s.code}</span>
              </div>
              <span className={`badge badge-${s.status === 'active' ? 'success' : s.status === 'ended' ? 'warning' : 'danger'}`}>
                {s.status}
              </span>
              {s.status === 'active' && (
                <Link to={`/app/sessions/${s._id}/live`} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  Live
                </Link>
              )}
            </div>
          ))}
          {sessions.length === 0 && <p className="empty-hint">Aucune session — lancez un quiz</p>}
        </div>
      </div>

      <section className="home-innovation card">
        <h3>💡 Innovation Quisi</h3>
        <div className="innovation-pills">
          <span>Analytics hybrides</span>
          <span>Assistant live IA</span>
          <span>Adaptation difficulté</span>
          <span>Détection suspicion</span>
          <span>Prédictions décrochage</span>
        </div>
      </section>
    </div>
  );
}
