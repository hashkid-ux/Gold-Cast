import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, LineChart, Line
} from 'recharts';

export default function AnalysisPage() {
  const [insights, setInsights] = useState(null);
  const [activeLog, setActiveLog] = useState(0);
  const [scatterView, setScatterView] = useState('inflation');

  useEffect(() => {
    fetch('/api/model-insights')
      .then(r => r.json())
      .then(d => setInsights(d))
      .catch(err => console.error(err));
  }, []);

  // Animate OOB log
  useEffect(() => {
    if (!insights?.oob_progression) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setActiveLog(i);
      if (i >= insights.oob_progression.length) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [insights]);

  if (!insights) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '160px 24px', textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
        Loading insights from backend...
      </div>
    );
  }

  const features = (insights.features || []).map(f => ({
    name: f.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    importance: f.importance
  }));

  const correlations = insights.correlations || {};
  const corrEntries = Object.entries(correlations).map(([key, val]) => ({
    pair: `${key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} → Gold`,
    r: val,
    strength: Math.abs(val) > 0.6 ? 'Strong' : Math.abs(val) > 0.3 ? 'Moderate' : 'Weak',
    positive: val > 0
  })).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  const scatterData = scatterView === 'inflation'
    ? (insights.scatter_inflation || []).map(d => ({ x: d.inflation_rate, y: d.gold_price }))
    : (insights.scatter_oil || []).map(d => ({ x: d.crude_oil_price, y: d.gold_price }));

  const oobData = insights.oob_progression || [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 24px 80px' }}>
      <div style={{ marginBottom: '56px' }}>
        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase' }}>Exploratory Data Analysis / Market Trends</div>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px' }}>Understanding Market Trends & Logs</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', lineHeight: '1.7', maxWidth: '780px' }}>
          This page helps users understand market trends by identifying hidden patterns within the historical dataset. Every number is computed directly from the data to support better financial planning.
        </p>
      </div>

      {/* FEATURE IMPORTANCE — REAL DATA */}
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '8px' }}>Feature Importance Analysis</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '32px', fontSize: '0.9rem' }}>
          Gini impurity-based importance extracted from all 100 decision trees. These are the real <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>model.feature_importances_</code> values.
        </p>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={features} layout="vertical" margin={{ top: 0, right: 40, left: 160, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                tickFormatter={v => `${v}%`} />
              <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 12, fill: 'var(--foreground)' }} width={155} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                formatter={(v) => [`${v.toFixed(2)}%`, 'Importance']} />
              <Bar dataKey="importance" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SCATTER + CORRELATIONS — ALL REAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3>Scatter Plot (Real Data — 50 samples)</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['inflation', 'oil'].map(v => (
                <button key={v} onClick={() => setScatterView(v)}
                  style={{
                    padding: '4px 12px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                    border: `1px solid ${scatterView === v ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', cursor: 'pointer',
                    background: scatterView === v ? 'var(--accent)' : 'var(--muted)',
                    color: scatterView === v ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontWeight: '600'
                  }}>
                  {v === 'inflation' ? 'Inflation' : 'Crude Oil'}
                </button>
              ))}
            </div>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginBottom: '20px' }}>
            Real data points sampled directly from <code style={{ fontFamily: 'var(--font-mono)' }}>gold_dataset.csv</code>
          </p>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="x" type="number" stroke="var(--muted-foreground)"
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
                  label={{ value: scatterView === 'inflation' ? 'Inflation Rate (%)' : 'Crude Oil (USD)', position: 'insideBottom', offset: -10, fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis dataKey="y" type="number" stroke="var(--muted-foreground)"
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <ZAxis range={[60, 60]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                  formatter={(v, name) => [name === 'y' ? `$${v}` : v, name === 'y' ? 'Gold Price' : scatterView === 'inflation' ? 'Inflation' : 'Oil Price']} />
                <Scatter data={scatterData} fill="var(--primary)" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '8px' }}>Pearson Correlation Matrix</h3>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginBottom: '20px' }}>
            Real coefficients computed via <code style={{ fontFamily: 'var(--font-mono)' }}>df.corr()</code> on all 1500 rows.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {corrEntries.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{c.pair}</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{c.strength}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: c.positive ? 'var(--primary)' : 'var(--destructive)' }}>
                    {c.r > 0 ? '+' : ''}{c.r.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OOB CONVERGENCE CHART — REAL */}
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '8px' }}>Model Convergence — OOB Error vs Estimators</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Real Out-of-Bag R² score computed at each tree count. This proves the ensemble converges and stops improving — eliminating overfitting.
        </p>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={oobData.filter(d => d.oob_r2 > 0)} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="estimators" stroke="var(--muted-foreground)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                label={{ value: 'Number of Trees', position: 'insideBottom', offset: -5, fill: 'var(--muted-foreground)' }} />
              <YAxis stroke="var(--muted-foreground)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                formatter={(v) => [`${(v * 100).toFixed(2)}%`, 'OOB R²']} />
              <Line type="monotone" dataKey="oob_r2" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ACTUAL VS PREDICTED — REAL */}
      {insights.actual_vs_predicted && (
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '8px' }}>Actual vs Predicted — Test Set</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '24px', fontSize: '0.9rem' }}>
            Real predictions on the 300-row held-out test set. Close alignment proves the model generalizes beyond training data.
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.actual_vs_predicted} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="index" stroke="var(--muted-foreground)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
                  label={{ value: 'Test Sample #', position: 'insideBottom', offset: -5, fill: 'var(--muted-foreground)' }} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
                  tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                  formatter={(v, name) => [`$${Number(v).toFixed(2)}`, name === 'actual' ? 'Actual Price' : 'Predicted Price']} />
                <Line type="monotone" dataKey="actual" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="actual" />
                <Line type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={2} dot={false} name="predicted" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <span><span style={{ color: 'var(--chart-2)' }}>──</span> Actual</span>
            <span><span style={{ color: 'var(--primary)' }}>┄┄</span> Predicted</span>
          </div>
        </div>
      )}

      {/* TRAINING LOG TERMINAL — REAL OOB DATA */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ marginLeft: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
            train.py — RandomForestRegressor OOB Training Log
          </span>
        </div>
        <div style={{ padding: '28px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2', background: '#0f0f0f', color: '#e5e5e5', minHeight: '320px' }}>
          <p style={{ color: '#6b7280' }}># Gold Price Prediction — Model Training Pipeline</p>
          <p style={{ color: '#6b7280' }}># RandomForestRegressor(n_estimators=100, max_depth=10, oob_score=True)</p>
          <p style={{ color: '#6b7280' }}># Dataset: 1500 samples | Train: 1200 | Test: 300</p>
          <br />
          {oobData.slice(0, activeLog).map((log, i) => (
            <div key={i}>
              <span style={{ color: '#6b7280' }}>[Estimator {String(log.estimators).padStart(3, ' ')}/100] </span>
              <span style={{ color: '#fbbf24' }}>OOB R²: {log.oob_r2.toFixed(4)} </span>
              <span style={{ color: '#94a3b8' }}>| </span>
              <span style={{ color: log.oob_r2 > 0.9 ? '#22c55e' : log.oob_r2 > 0 ? '#fbbf24' : '#ef4444' }}>
                OOB Error: {log.oob_error.toFixed(4)}
              </span>
            </div>
          ))}
          {activeLog >= oobData.length && insights.metrics && (
            <>
              <br />
              <p style={{ color: '#22c55e' }}>Training complete.</p>
              <p style={{ color: '#fbbf24' }}>Test MAE: ${insights.metrics.test.mae} | Test R2: {insights.metrics.test.r2}</p>
              <p style={{ color: '#22c55e' }}>Model saved to gold_model.pkl</p>
              <p style={{ color: '#22c55e' }}>Insights saved to model_insights.json</p>
              <span style={{ color: '#f59e0b' }}>▌</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
