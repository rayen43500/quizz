import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function LiveSession() {
  const { id } = useParams();
  const { token } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState<any>({ responseRate: 0, successRate: 0, activeCount: 0, comprehensionScore: 0 });
  const [recommendation, setRecommendation] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ time: string; success: number }[]>([]);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [nextLoading, setNextLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    api.get(`/sessions/${id}`).then((r) => {
      setSession(r.data.session);
      setQuestionIndex(r.data.session?.currentQuestionIndex ?? -1);
    });
    api.get(`/sessions/${id}/participants`).then((r) => setParticipants(r.data.participants));
    refreshStats();

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;
    socket.emit('join_session', { sessionId: id });

    socket.on('stats:update', (s) => {
      setStats(s);
      setChartData((prev) => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), success: s.successRate }]);
    });
    socket.on('participant:joined', () => api.get(`/sessions/${id}/participants`).then((r) => setParticipants(r.data.participants)));
    socket.on('assistant:recommendation', (r) => setRecommendation(r));
    socket.on('difficulty:adjusted', (d) => setRecommendation({ message: `Difficulté ajustée: niveau ${d.level} — ${d.reason}`, priority: 'medium' }));
    socket.on('suspicion:alert', (a) => setRecommendation({ message: `⚠️ Alerte: ${a.displayName} — score suspicion ${a.score}`, priority: 'high' }));

    return () => { socket.disconnect(); };
  }, [id, token]);

  const refreshStats = () => {
    api.get(`/sessions/${id}/live-stats`).then((r) => {
      setStats(r.data.stats);
      if (r.data.recommendation) setRecommendation(r.data.recommendation);
    });
  };

  const nextQuestion = async () => {
    if (nextLoading) return;
    setNextLoading(true);
    const idx = questionIndex + 1;
    try {
      const { data } = await api.post(`/sessions/${id}/next-question`, { questionIndex: idx });
      setQuestionIndex(data.session?.currentQuestionIndex ?? idx);
    } catch (e: any) {
      alert(e.response?.data?.error || 'Impossible de passer a la question suivante');
    } finally {
      setNextLoading(false);
    }
  };

  const endSession = async () => {
    await api.post(`/sessions/${id}/end`);
    await api.post(`/reports/session/${id}`);
    alert('Session terminée — rapport généré');
  };

  if (!session) return <p>Chargement session...</p>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Session Live</h1>
          <p>Code: <strong style={{ fontSize: '1.5rem', letterSpacing: '0.2em', color: 'var(--primary)' }}>{session.code}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={nextQuestion} disabled={nextLoading}>
            {nextLoading ? 'Chargement...' : 'Question suivante'}
          </button>
          <button className="btn btn-danger" onClick={endSession}>Terminer</button>
        </div>
      </div>

      {recommendation && (
        <div className="live-assistant-banner card">
          <strong>Assistant pédagogique</strong>
          <p>{recommendation.message}</p>
          <span className={`badge badge-${recommendation.priority === 'high' ? 'danger' : 'warning'}`} style={{ marginTop: 'var(--space-2)' }}>
            {recommendation.priority}
          </span>
        </div>
      )}

      <div className="grid-4 live-metric-grid section-gap">
        <div className="card"><p>Participants</p><h2>{stats.activeCount || participants.length}</h2></div>
        <div className="card"><p>Taux de réponse</p><h2>{stats.responseRate}%</h2></div>
        <div className="card"><p>Taux de succès</p><h2 className={stats.successRate < 50 ? 'text-accent' : 'text-success'}>{stats.successRate}%</h2></div>
        <div className="card"><p>Compréhension</p><h2>{stats.comprehensionScore}</h2></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Évolution du succès</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" stroke="#8b9cb3" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#8b9cb3" />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #2d3a4f' }} />
              <Line type="monotone" dataKey="success" stroke="#2dd4bf" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Participants actifs</h3>
          {participants.map((p, i) => (
            <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{p.displayName}</span>
              <span style={{ color: 'var(--text-muted)' }}>{p.stats?.correct || 0}/{p.stats?.total || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
