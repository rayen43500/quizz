import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', topic: '', difficulty: 3, defaultTimerSec: 30 });
  const [addQuestionNow, setAddQuestionNow] = useState(true);
  const [question, setQuestion] = useState({
    type: 'multiple_choice',
    text: '',
    options: [{ id: 'a', label: '', isCorrect: true }, { id: 'b', label: '', isCorrect: false }],
    correctAnswer: 'true',
    explanation: '',
    image: '',
    video: '',
    timerSec: 30,
  });

  const load = () => api.get('/quizzes').then((r) => setQuizzes(r.data.quizzes));

  useEffect(() => { load(); }, []);

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });

  const ensureCorrectOption = (opts: typeof question.options) => {
    if (opts.length === 0) return opts;
    if (opts.some((o) => o.isCorrect)) return opts;
    return opts.map((o, i) => ({ ...o, isCorrect: i === 0 }));
  };

  const addOption = () => {
    const nextId = String.fromCharCode(97 + question.options.length);
    const opts = [...question.options, { id: nextId, label: '', isCorrect: false }];
    setQuestion({ ...question, options: ensureCorrectOption(opts) });
  };

  const removeOption = (idx: number) => {
    const opts = question.options.filter((_, i) => i !== idx);
    setQuestion({ ...question, options: ensureCorrectOption(opts) });
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await api.post('/quizzes', form);
    if (addQuestionNow && question.text.trim()) {
      if ((question.type === 'multiple_choice' || question.type === 'poll') && question.options.length < 2) {
        alert('Ajoutez au moins 2 options.');
        return;
      }
      await api.post(`/quizzes/${data.quiz._id}/questions`, question);
    }
    setShowForm(false);
    setForm({ title: '', topic: '', difficulty: 3, defaultTimerSec: 30 });
    setAddQuestionNow(true);
    setQuestion({
      type: 'multiple_choice',
      text: '',
      options: [{ id: 'a', label: '', isCorrect: true }, { id: 'b', label: '', isCorrect: false }],
      correctAnswer: 'true',
      explanation: '',
      image: '',
      video: '',
      timerSec: 30,
    });
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

          <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-6)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={addQuestionNow}
                onChange={(e) => setAddQuestionNow(e.target.checked)}
              />
              Ajouter une premiere question maintenant
            </label>

            {addQuestionNow && (
              <div style={{ marginTop: '1rem' }}>
                <div className="grid-2">
                  <div>
                    <label>Type</label>
                    <select
                      className="input"
                      value={question.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        setQuestion({
                          ...question,
                          type,
                          correctAnswer: type === 'true_false' ? 'true' : question.correctAnswer,
                        });
                      }}
                    >
                      {['multiple_choice', 'true_false', 'poll', 'short_answer'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Timer (sec)</label>
                    <input
                      className="input"
                      type="number"
                      value={question.timerSec}
                      onChange={(e) => setQuestion({ ...question, timerSec: +e.target.value })}
                    />
                  </div>
                </div>

                <label style={{ display: 'block', marginTop: '0.75rem' }}>Enonce</label>
                <textarea
                  className="input"
                  rows={2}
                  value={question.text}
                  onChange={(e) => setQuestion({ ...question, text: e.target.value })}
                />

                {(question.type === 'multiple_choice' || question.type === 'poll') && question.options.map((opt, idx) => (
                  <div key={idx} style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {question.type === 'multiple_choice' && (
                      <input
                        type="radio"
                        name="new-question-correct"
                        checked={!!opt.isCorrect}
                        onChange={() => {
                          const opts = question.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                          setQuestion({ ...question, options: opts });
                        }}
                        title="Reponse correcte"
                      />
                    )}
                    <input
                      className="input"
                      placeholder={`Option ${opt.id}`}
                      value={opt.label}
                      onChange={(e) => {
                        const opts = [...question.options];
                        opts[idx] = { ...opt, label: e.target.value };
                        setQuestion({ ...question, options: opts });
                      }}
                    />
                    {question.options.length > 2 && (
                      <button type="button" className="btn btn-secondary" onClick={() => removeOption(idx)}>
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}

                {(question.type === 'multiple_choice' || question.type === 'poll') && (
                  <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={addOption}>
                    + Option
                  </button>
                )}

                {question.type === 'true_false' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label>Reponse correcte</label>
                    <select
                      className="input"
                      value={question.correctAnswer}
                      onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}
                    >
                      <option value="true">Vrai</option>
                      <option value="false">Faux</option>
                    </select>
                  </div>
                )}

                {question.type === 'short_answer' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label>Reponse correcte</label>
                    <input
                      className="input"
                      value={question.correctAnswer}
                      onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}
                    />
                  </div>
                )}

                <label style={{ display: 'block', marginTop: '0.75rem' }}>Explication</label>
                <input
                  className="input"
                  value={question.explanation}
                  onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
                />

                <div style={{ marginTop: '0.75rem' }}>
                  <label>Image (max 3MB)</label>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 3 * 1024 * 1024) {
                        alert('Image trop grande (max 3MB)');
                        return;
                      }
                      const dataUrl = await readFileAsDataUrl(file);
                      setQuestion({ ...question, image: dataUrl });
                    }}
                  />
                  {question.image && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img src={question.image} alt="Apercu" style={{ maxWidth: 240, borderRadius: 8, border: '1px solid var(--border)' }} />
                      <div>
                        <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setQuestion({ ...question, image: '' })}>
                          Retirer l'image
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <label>Mini video (max 15MB)</label>
                  <input
                    className="input"
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 15 * 1024 * 1024) {
                        alert('Video trop grande (max 15MB)');
                        return;
                      }
                      const dataUrl = await readFileAsDataUrl(file);
                      setQuestion({ ...question, video: dataUrl });
                    }}
                  />
                  {question.video && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <video src={question.video} controls style={{ maxWidth: 360, borderRadius: 8, border: '1px solid var(--border)' }} />
                      <div>
                        <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setQuestion({ ...question, video: '' })}>
                          Retirer la video
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
