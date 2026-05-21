import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api/client';

const COLORS = ['#fb7185', '#fbbf24', '#2dd4bf', '#4ade80', '#38bdf8'];

export default function Analytics() {
  const [heatmap, setHeatmap] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/heatmap').then((r) => setHeatmap(r.data.heatmap));
  }, []);

  return (
    <div className="animate-in">
      <header className="page-header section-gap">
        <h1>Analytics & Heatmap</h1>
        <p className="page-subtitle">Hiérarchie visuelle de la maîtrise par sujet — identifiez où concentrer l'effort pédagogique.</p>
      </header>

      <div className="card section-gap">
        <h3>Knowledge Heatmap</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={heatmap} layout="vertical">
            <XAxis type="number" domain={[0, 100]} stroke="rgba(148,163,184,0.6)" />
            <YAxis type="category" dataKey="topic" stroke="rgba(148,163,184,0.6)" width={120} />
            <Tooltip contentStyle={{ background: '#161b24', border: '1px solid #2a3444', borderRadius: 8 }} />
            <Bar dataKey="masteryPercent" radius={[0, 4, 4, 0]}>
              {heatmap.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-3 section-gap">
        {heatmap.map((h) => (
          <div key={h.topic} className="card">
            <h4>{h.topic}</h4>
            <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, fontFamily: 'var(--font-display)', color: h.masteryPercent < 50 ? 'var(--accent)' : 'var(--success)' }}>
              {h.masteryPercent}%
            </p>
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
              {h.masteryPercent < 50 ? 'Soutien recommandé' : h.masteryPercent > 80 ? 'Maîtrisé' : 'En progression'}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Formule — Comprehension Score</h3>
        <code className="formula" style={{ marginTop: 'var(--space-4)', display: 'block' }}>
          Score = 0.5 × Correctness + 0.3 × Participation + 0.2 × ResponseSpeed
        </code>
      </div>
    </div>
  );
}
