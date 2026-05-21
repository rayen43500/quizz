import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const STATUS_LABELS: Record<string, string> = {
  waiting: 'En attente',
  active: 'En cours',
  paused: 'Pause',
  ended: 'Terminée',
};

export default function Sessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [launchQuizId, setLaunchQuizId] = useState('');

  const load = () => {
    api.get('/sessions').then((r) => setSessions(r.data.sessions));
    api.get('/quizzes').then((r) => setQuizzes(r.data.quizzes));
  };

  useEffect(() => { load(); }, []);

  const launchNew = async () => {
    if (!launchQuizId) return;
    const { data } = await api.post('/sessions', { quizId: launchQuizId });
    await api.post(`/sessions/${data.session._id}/launch`);
    window.location.href = `/app/sessions/${data.session._id}/live`;
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Sessions Live</h1>
          <p>Historique et lancement de sessions interactives</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Lancer une nouvelle session</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select className="input" style={{ maxWidth: 400 }} value={launchQuizId} onChange={(e) => setLaunchQuizId(e.target.value)}>
            <option value="">Sélectionner un quiz</option>
            {quizzes.map((q) => (
              <option key={q._id} value={q._id}>{q.title} ({q.questionCount} questions)</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={launchNew} disabled={!launchQuizId}>
            Lancer maintenant
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Toutes les sessions ({sessions.length})</h3>
        {sessions.map((s) => (
          <div key={s._id} className="list-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>{s.quizId?.title || 'Quiz'}</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                Code <span style={{ fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: 2 }}>{s.code}</span>
                · {s.participants?.length || 0} participants
                · {new Date(s.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`badge badge-${s.status === 'active' ? 'success' : 'warning'}`}>
                {STATUS_LABELS[s.status] || s.status}
              </span>
              {s.status === 'active' && (
                <Link to={`/app/sessions/${s._id}/live`} className="btn btn-primary">Ouvrir live</Link>
              )}
              {s.status === 'ended' && (
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    await api.post(`/reports/session/${s._id}`);
                    alert('Rapport généré — consultez Rapports');
                  }}
                >
                  Rapport
                </button>
              )}
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
            Aucune session — sélectionnez un quiz et lancez !
          </p>
        )}
      </div>
    </div>
  );
}
