import { useEffect, useState } from 'react';
import api from '../api/client';
import Avatar from '../components/Avatar';
import '../components/Avatar.css';

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users/students').then((r) => setStudents(r.data.students));
  }, []);

  return (
    <div className="animate-in">
      <header className="page-header section-gap">
        <h1>Étudiants</h1>
        <p className="page-subtitle">Suivez la progression et la maîtrise par sujet de vos apprenants.</p>
      </header>

      <div className="grid-2">
        {students.map((s) => (
          <article key={s.id} className="card student-card">
            <div className="student-card-header">
              <Avatar src={s.avatar} firstName={s.firstName} lastName={s.lastName} size="lg" />
              <div>
                <h3>{s.firstName} {s.lastName}</h3>
                <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>{s.email}</p>
                {s.institution && <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>{s.institution}</p>}
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: s.successRate >= 70 ? 'var(--success)' : 'var(--accent)' }}>
                  {s.successRate}%
                </p>
                <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>{s.totalResponses} réponses</p>
              </div>
            </div>
            {s.topicsProgress?.length > 0 && (
              <div className="student-topics">
                {s.topicsProgress.map((t: any) => (
                  <div key={t.topic} className="heatmap-bar">
                    <div className="heatmap-bar-header">
                      <span>{t.topic}</span>
                      <span>{t.masteryPercent}%</span>
                    </div>
                    <div className="heatmap-track">
                      <div className="heatmap-fill" style={{ width: `${t.masteryPercent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      {students.length === 0 && <p className="empty-hint">Aucun étudiant inscrit pour le moment.</p>}
    </div>
  );
}
