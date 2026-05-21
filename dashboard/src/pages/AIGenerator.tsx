import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function AIGenerator() {
  const [form, setForm] = useState({ topic: 'Probability', difficulty: 3, questionCount: 5 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/generate-quiz', form);
      setResult(data);
    } catch {
      alert('Erreur génération — vérifiez la clé API IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Générateur de Quiz IA</h1>
        <p>Créez des questions automatiquement avec OpenAI / Gemini</p>
      </div>

      <form className="card" onSubmit={generate} style={{ maxWidth: 500 }}>
        <label>Topic / Sujet</label>
        <input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
        <label style={{ display: 'block', marginTop: '0.75rem' }}>Difficulté (1-5)</label>
        <input className="input" type="number" min={1} max={5} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: +e.target.value })} />
        <label style={{ display: 'block', marginTop: '0.75rem' }}>Nombre de questions</label>
        <input className="input" type="number" min={1} max={20} value={form.questionCount} onChange={(e) => setForm({ ...form, questionCount: +e.target.value })} />
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Génération...' : 'Générer avec IA'}
        </button>
      </form>

      {result && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Quiz créé: {result.quiz?.title}</h3>
          <p>{result.questions?.length} questions générées</p>
          {result.questions?.map((q: any, i: number) => (
            <div key={q._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>Q{i + 1}.</strong> {q.text}
              {q.explanation && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{q.explanation}</p>}
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate(`/app/quizzes/${result.quiz._id}`)}>
            Éditer le quiz
          </button>
        </div>
      )}
    </div>
  );
}
