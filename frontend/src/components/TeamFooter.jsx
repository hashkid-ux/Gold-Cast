import React from 'react';

export default function TeamFooter() {
  return (
    <footer style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: '80px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--muted-foreground)' }}>Gold Cast</h3>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: '8px' }}>Batch Number : 16</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginTop: '32px', color: 'var(--foreground)' }}>
        <div className="glass-panel" style={{ padding: '16px 24px' }}>
          <strong>Lanka Ramakrishna</strong><br />
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>2411CS030247</span>
        </div>
        <div className="glass-panel" style={{ padding: '16px 24px' }}>
          <strong>M Purushotham</strong><br />
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>2411CS030252</span>
        </div>
        <div className="glass-panel" style={{ padding: '16px 24px' }}>
          <strong>Mallela Harshavardhan</strong><br />
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>2411CS030260</span>
        </div>
        <div className="glass-panel" style={{ padding: '16px 24px' }}>
          <strong>Kummari Sai Kiran</strong><br />
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>2411CS030238</span>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Dataset (CSV)', url: '/api/download/dataset' },
            { label: 'Model (PKL)', url: '/api/download/model' },
            { label: 'Insights (JSON)', url: '/api/download/insights' },
          ].map((d, i) => (
            <a key={i} href={d.url} download
              style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', textDecoration: 'none', padding: '6px 16px', border: '1px solid var(--primary)', borderRadius: 'var(--radius)' }}>
              Download {d.label}
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '40px', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
        <p>Year / Semester: II/II | Branch / Section: DS / Group-3</p>
      </div>
    </footer>
  );
}
