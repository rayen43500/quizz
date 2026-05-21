import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

const TYPES = ['multiple_choice', 'true_false', 'poll', 'short_answer'];

export default function QuizEditor() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQ, setNewQ] = useState({
    type: 'multiple_choice',
    text: '',
    options: [{ id: 'a', label: '', isCorrect: true }, { id: 'b', label: '', isCorrect: false }],
    correctAnswer: 'true',
    explanation: '',
    image: '',
    video: '',
    timerSec: 30,
  });

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });

  const ensureCorrectOption = (opts: typeof newQ.options) => {
    if (opts.length === 0) return opts;
    if (opts.some((o) => o.isCorrect)) return opts;
    return opts.map((o, i) => ({ ...o, isCorrect: i === 0 }));
  };

  const addOption = () => {
    const nextId = String.fromCharCode(97 + newQ.options.length);
    const opts = [...newQ.options, { id: nextId, label: '', isCorrect: false }];
    setNewQ({ ...newQ, options: ensureCorrectOption(opts) });
  };

  const removeOption = (idx: number) => {
    const opts = newQ.options.filter((_, i) => i !== idx);
    setNewQ({ ...newQ, options: ensureCorrectOption(opts) });
  };

  const load = () => api.get(`/quizzes/${id}`).then((r) => {
    setQuiz(r.data.quiz);
    setQuestions(r.data.questions);
  });

  useEffect(() => { load(); }, [id]);

  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/quizzes/${id}/questions`, newQ);
    setNewQ({
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

  const deleteQuestion = async (qid: string) => {
    await api.delete(`/questions/${qid}`);
    load();
  };

  if (!quiz) return <p>Chargement...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{quiz.title}</h1>
        <p>{quiz.topic} — {questions.length} questions</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Questions ({questions.length})</h3>
        {questions.map((q, i) => (
          <div key={q._id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <strong>Q{i + 1}.</strong> [{q.type}] {q.text}
            <button className="btn btn-danger" style={{ float: 'right', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => deleteQuestion(q._id)}>Supprimer</button>
          </div>
        ))}
      </div>

      <form className="card" onSubmit={addQuestion}>
        <h3>Ajouter une question</h3>
        <div className="grid-2" style={{ marginTop: '1rem' }}>
          <div>
            <label>Type</label>
            <select
              className="input"
              value={newQ.type}
              onChange={(e) => {
                const type = e.target.value;
                setNewQ({
                  ...newQ,
                  type,
                  correctAnswer: type === 'true_false' ? 'true' : newQ.correctAnswer,
                });
              }}
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Timer (sec)</label>
            <input className="input" type="number" value={newQ.timerSec} onChange={(e) => setNewQ({ ...newQ, timerSec: +e.target.value })} />
          </div>
        </div>
        <label style={{ display: 'block', marginTop: '0.75rem' }}>Énoncé</label>
        <textarea className="input" rows={2} value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} required />

        {(newQ.type === 'multiple_choice' || newQ.type === 'poll') && newQ.options.map((opt, idx) => (
          <div key={idx} style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {newQ.type === 'multiple_choice' && (
              <input
                type="radio"
                name="correct-option"
                checked={!!opt.isCorrect}
                onChange={() => {
                  const opts = newQ.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                  setNewQ({ ...newQ, options: opts });
                }}
                title="Réponse correcte"
              />
            )}
            <input
              className="input"
              placeholder={`Option ${opt.id}`}
              value={opt.label}
              onChange={(e) => {
                const opts = [...newQ.options];
                opts[idx] = { ...opt, label: e.target.value };
                setNewQ({ ...newQ, options: opts });
              }}
            />
            {newQ.options.length > 2 && (
              <button type="button" className="btn btn-secondary" onClick={() => removeOption(idx)}>
                Supprimer
              </button>
            )}
          </div>
        ))}

        {(newQ.type === 'multiple_choice' || newQ.type === 'poll') && (
          <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={addOption}>
            + Option
          </button>
        )}

        {newQ.type === 'true_false' && (
          <div style={{ marginTop: '0.5rem' }}>
            <label>Réponse correcte</label>
            <select
              className="input"
              value={newQ.correctAnswer}
              onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
            >
              <option value="true">Vrai</option>
              <option value="false">Faux</option>
            </select>
          </div>
        )}

        {newQ.type === 'short_answer' && (
          <div style={{ marginTop: '0.5rem' }}>
            <label>Réponse correcte</label>
            <input className="input" value={newQ.correctAnswer} onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })} />
          </div>
        )}

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
              setNewQ({ ...newQ, image: dataUrl });
            }}
          />
          {newQ.image && (
            <div style={{ marginTop: '0.5rem' }}>
              <img src={newQ.image} alt="Apercu" style={{ maxWidth: 240, borderRadius: 8, border: '1px solid var(--border)' }} />
              <div>
                <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setNewQ({ ...newQ, image: '' })}>
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
              setNewQ({ ...newQ, video: dataUrl });
            }}
          />
          {newQ.video && (
            <div style={{ marginTop: '0.5rem' }}>
              <video src={newQ.video} controls style={{ maxWidth: 360, borderRadius: 8, border: '1px solid var(--border)' }} />
              <div>
                <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setNewQ({ ...newQ, video: '' })}>
                  Retirer la video
                </button>
              </div>
            </div>
          )}
        </div>

        <label style={{ display: 'block', marginTop: '0.75rem' }}>Explication</label>
        <input className="input" value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })} />

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Ajouter</button>
      </form>
    </div>
  );
}
