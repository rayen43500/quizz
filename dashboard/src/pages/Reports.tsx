import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    api.get('/reports').then((r) => setReports(r.data.reports));
  }, []);

  const viewReport = async (id: string) => {
    const { data } = await api.get(`/reports/${id}`);
    setSelected(data.report);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Rapports pédagogiques</h1>
        <p>Synthèses IA, concepts faibles, plans de révision</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Liste des rapports</h3>
          {reports.map((r) => (
            <div key={r._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => viewReport(r._id)}>
              <strong>{r.title}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(r.generatedAt).toLocaleString()}</p>
            </div>
          ))}
          {reports.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucun rapport — terminez une session pour en générer un.</p>}
        </div>

        {selected && (
          <div className="card">
            <h3>{selected.title}</h3>
            <p style={{ margin: '1rem 0' }}>{selected.summary}</p>
            <h4>Concepts faibles</h4>
            <ul>{selected.weakConcepts?.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
            <h4 style={{ marginTop: '1rem' }}>Recommandations</h4>
            <ul>{selected.recommendations?.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
            <h4 style={{ marginTop: '1rem' }}>Heatmap</h4>
            {selected.heatmap?.map((h: any) => (
              <div key={h.topic} style={{ marginBottom: '0.5rem' }}>
                <span>{h.topic}</span>
                <div style={{ background: 'var(--bg)', borderRadius: 4, height: 8, marginTop: 4 }}>
                  <div style={{ width: `${h.masteryPercent}%`, background: 'var(--primary)', height: '100%', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.masteryPercent}%</span>
              </div>
            ))}
            <h4 style={{ marginTop: '1rem' }}>Plan de révision</h4>
            {selected.revisionPlan?.map((d: any) => (
              <div key={d.day} style={{ marginBottom: '0.75rem' }}>
                <strong>Jour {d.day}: {d.title}</strong>
                <ul>{d.activities?.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
