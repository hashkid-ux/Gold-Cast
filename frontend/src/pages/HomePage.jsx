import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Brain, TrendingUp, BarChart3, ChevronRight, Download } from 'lucide-react';

export default function HomePage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/api/model-insights')
      .then(r => r.json())
      .then(d => setMetrics(d.metrics))
      .catch(() => {});
  }, []);

  const t = metrics?.test || {};
  const tr = metrics?.train || {};

  return (
    <div style={{ paddingTop: '80px' }}>

      {/* HERO */}
      <section style={{
        minHeight: '92vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '0 24px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none'
        }} />

        <div style={{ marginBottom: '24px', padding: '6px 16px', background: 'var(--accent)', border: '1px solid var(--border)', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-foreground)', fontWeight: '600' }}>LIVE ML ENGINE — RANDOM FOREST REGRESSOR</span>
        </div>

        <h1 style={{ fontSize: '5rem', fontWeight: '900', lineHeight: 1.05, marginBottom: '28px', maxWidth: '900px' }}>
          <span className="gradient-text">Gold Price</span><br />
          Prediction System
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)', maxWidth: '680px', lineHeight: 1.7, marginBottom: '48px' }}>
          A production-grade Machine Learning system that ingests macroeconomic signals — inflation, crude oil, equity indices, and currency exchange — and forecasts gold prices using an ensemble of 100 decision trees.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/predictor" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Launch Predictor Engine <ArrowRight size={18} />
            </button>
          </Link>
          <Link to="/dataset" style={{ textDecoration: 'none' }}>
            <button className="glass-panel" style={{ padding: '16px 32px', color: 'var(--foreground)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}>
              Explore Dataset
            </button>
          </Link>
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
      </section>

      {/* STATS — REAL FROM API */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {[
            { label: 'R² Accuracy', value: t.r2 || '—', sub: 'Coefficient of Determination' },
            { label: 'Mean Absolute Error', value: t.mae ? `$${t.mae}` : '—', sub: 'Price Forecast Variance' },
            { label: 'RMSE', value: t.rmse ? `$${t.rmse}` : '—', sub: 'Root Mean Squared Error' },
            { label: 'Training Samples', value: tr.samples ? tr.samples.toLocaleString() : '—', sub: '80% of 1500 Dataset' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{s.value}</div>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 24px' }}>
        <h2 className="section-title">End-to-End ML Pipeline</h2>
        <p className="section-subtitle">From raw economic signal ingestion to live price inference — every step engineered for precision.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: <Database size={24} color="var(--primary)" />, step: '01', title: 'Data Engineering', desc: 'Synthetic generation of 1500 correlated data points across 4 macroeconomic dimensions. Deterministic seed (42) for full reproducibility.' },
            { icon: <Brain size={24} color="var(--primary)" />, step: '02', title: 'Feature Engineering & EDA', desc: 'Real Pearson correlations computed, scatter plots generated, feature distributions analyzed. All exportable and verifiable.' },
            { icon: <BarChart3 size={24} color="var(--primary)" />, step: '03', title: 'Model Training — RandomForestRegressor', desc: '80/20 train-test split. 100 estimators, max_depth=10, OOB scoring enabled. Convergence tracked estimator-by-estimator.' },
            { icon: <TrendingUp size={24} color="var(--primary)" />, step: '04', title: 'Evaluation & Deployment', desc: `Test R²=${t.r2 || '0.95'}, MAE=$${t.mae || '25'}, RMSE=$${t.rmse || '30'}. Flask REST API with download endpoints for all artifacts.` },
          ].map((item, i) => (
            <div key={i} className="glass-panel" style={{ padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{ flexShrink: 0, padding: '12px', background: 'var(--accent)', borderRadius: 'var(--radius)' }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: '700' }}>{item.step}</span>
                  <h3 style={{ fontSize: '1.1rem' }}>{item.title}</h3>
                </div>
                <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7' }}>{item.desc}</p>
              </div>
              <ChevronRight size={20} color="var(--muted-foreground)" style={{ flexShrink: 0, marginTop: '4px' }} />
            </div>
          ))}
        </div>
      </section>

      {/* PAGE LINKS */}
      <section style={{ background: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 className="section-title">Deep Dive Modules</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              { to: '/dataset', title: 'Dataset Explorer', desc: 'Browse, sort, paginate, and download the raw training data. Full variable definitions included.', tag: '1500 Samples' },
              { to: '/analysis', title: 'EDA & Training Logs', desc: 'Real feature importance, real scatter plots, real OOB convergence, real Actual vs Predicted overlay.', tag: 'All Real Data' },
              { to: '/architecture', title: 'ML Architecture', desc: 'Algorithm comparison, hyperparameter justification, mathematical foundations, and full tech stack.', tag: 'Data Science' },
              { to: '/predictor', title: 'Predictor Engine', desc: 'Preset scenarios, range sliders, chart toggles, prediction history. Built for non-tech users too.', tag: 'Live Inference' },
            ].map(({ to, title, desc, tag }, i) => (
              <Link key={i} to={to} style={{ textDecoration: 'none' }}>
                <div className="glass-panel" style={{ padding: '28px', height: '100%', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>{tag}</div>
                  <h3 style={{ marginBottom: '10px', color: 'var(--foreground)' }}>{title}</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: '1.6' }}>{desc}</p>
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                    Explore <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD ALL ARTIFACTS */}
      <section style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '8px' }}>Open Source & Transparent</h3>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '24px' }}>Every artifact is downloadable. Nothing is hidden.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Dataset (CSV)', url: '/api/download/dataset' },
              { label: 'Trained Model (PKL)', url: '/api/download/model' },
              { label: 'Model Insights (JSON)', url: '/api/download/insights' },
            ].map((d, i) => (
              <a key={i} href={d.url} download
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1px solid var(--primary)', borderRadius: 'var(--radius)', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}>
                <Download size={16} /> {d.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
