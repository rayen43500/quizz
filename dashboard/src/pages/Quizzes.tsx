import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', topic: '', difficulty: 3, defaultTimerSec: 30 });

  const load = () => api.get('/quizzes').then((r) => setQuizzes(r.data.quizzes));

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/quizzes', form);
    setShowForm(false);
    setForm({ title: '', topic: '', difficulty: 3, defaultTimerSec: 30 });
    load();
  };

  const startSession = async (quizId: string) => {
    const { data: sessionData } = await api.post('/sessions', { quizId });
    await api.post(`/sessions/${sessionData.session._id}/launch`);
    window.location.href = `/app/sessions/${sessionData.session._id}/live`;
  };

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <header className="page-header" style={{ marginBottom: 0 }}>
          <h1>Mes Quiz</h1>
          <p className="page-subtitle">Créez et gérez vos évaluations interactives</p>
        </header>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau quiz'}
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={create}>
          <h3 style={{ marginBottom: 'var(--space-6)' }}>Nouveau quiz</h3>
          <div className="grid-2">
            <div>
              <label>Titre</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label>Sujet</label>
              <input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
            </div>
            <div>
              <label>Difficulté (1–5)</label>
              <input className="input" type="number" min={1} max={5} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: +e.target.value })} />
            </div>
            <div>
              <label>Timer (secondes)</label>
              <input className="input" type="number" value={form.defaultTimerSec} onChange={(e) => setForm({ ...form, defaultTimerSec: +e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>Créer le quiz</button>
        </form>
      )}

      <section>
        {quizzes.map((q) => (
          <article key={q._id} className="quiz-card">
            <div>
              <h3>{q.title}</h3>
              <p className="quiz-card-meta">
                {q.topic} · Niveau {q.difficulty} · {q.questionCount} questions
              </p>
            </div>
            <div className="quiz-card-actions">
              <Link to={`/app/quizzes/${q._id}`} className="btn btn-secondary">Éditer</Link>
              <button className="btn btn-primary" onClick={() => startSession(q._id)}>Lancer</button>
            </div>
          </article>
        ))}
        {quizzes.length === 0 && (
          <p className="empty-hint">Aucun quiz — créez votre premier pour démarrer une session live.</p>
        )}
      </section>
    </div>
  );
}
