import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Download } from 'lucide-react';
import API_BASE from '../config';

const COLUMNS = [
  { key: 'inflation_rate', label: 'Inflation Rate (%)', gold: false },
  { key: 'crude_oil_price', label: 'Crude Oil (USD)', gold: false },
  { key: 'stock_market_index', label: 'Stock Index (pts)', gold: false },
  { key: 'currency_exchange_rate', label: 'USD/INR Rate', gold: false },
  { key: 'gold_price', label: 'Gold Price (USD/oz)', gold: true },
];

export default function DatasetPage() {
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('gold_price');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  const fetchPage = (p) => {
    setLoading(true);
    fetch(`${API_BASE}/api/dataset?page=${p}&limit=${limit}`)
      .then(r => r.json())
      .then(d => {
        setDataset(d.dataset || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
        setPage(d.page || 1);
        setLoading(false);
      })
      .catch(() => { setError('Backend not running.'); setLoading(false); });
  };

  useEffect(() => { fetchPage(1); }, []);

  const sorted = [...dataset].sort((a, b) =>
    sortDir === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
  );

  const handleSort = (key) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 24px 80px' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase' }}>Pre-processed Dataset</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '16px' }}>Raw Data Explorer</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', lineHeight: '1.7', maxWidth: '700px' }}>
          The exact structured dataset used to train our Random Forest Regressor. {total.toLocaleString()} rows across 4 macroeconomic feature dimensions and 1 target variable.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Total Rows', value: total.toLocaleString() },
          { label: 'Feature Columns', value: '4' },
          { label: 'Target Variable', value: 'Gold Price' },
          { label: 'Data Type', value: 'Continuous Float' },
          { label: 'Random Seed', value: '42' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Download Button */}
      <div style={{ marginBottom: '24px' }}>
        <a href={`${API_BASE}/api/download/dataset`} download
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}>
          <Download size={16} /> Download Full Dataset (CSV)
        </a>
      </div>

      {error && <div style={{ color: 'var(--destructive)', padding: '20px', background: 'var(--muted)', borderRadius: 'var(--radius)', marginBottom: '24px' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="dataset-toolbar" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>gold_dataset.csv</span>
            <span style={{ background: 'var(--accent)', color: 'var(--accent-foreground)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
              Page {page} of {totalPages} ({limit} rows/page)
            </span>
          </div>
          {/* Pagination */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => fetchPage(page - 1)} disabled={page <= 1}
              style={{ padding: '6px 14px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: page <= 1 ? 'not-allowed' : 'pointer', background: 'var(--muted)', color: 'var(--foreground)', opacity: page <= 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            <button onClick={() => fetchPage(page + 1)} disabled={page >= totalPages}
              style={{ padding: '6px 14px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', background: 'var(--muted)', color: 'var(--foreground)', opacity: page >= totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
                <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                <div className="skeleton" style={{ height: '16px', width: '60%' }} />
                <div className="skeleton" style={{ height: '16px', width: '70%' }} />
                <div className="skeleton" style={{ height: '16px', width: '90%' }} />
                <div className="skeleton" style={{ height: '16px', width: '50%' }} />
              </div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', color: 'var(--muted-foreground)' }}>#</th>
                  {COLUMNS.map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)}
                      style={{ cursor: 'pointer', color: sortKey === col.key ? 'var(--primary)' : 'var(--muted-foreground)', userSelect: 'none' }}>
                      {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{(page - 1) * limit + idx + 1}</td>
                    {COLUMNS.map(col => (
                      <td key={col.key} style={{
                        fontFamily: 'var(--font-mono)',
                        color: col.gold ? 'var(--primary)' : 'var(--foreground)',
                        fontWeight: col.gold ? '700' : '400'
                      }}>
                        {col.gold ? `$${row[col.key].toFixed(2)}` : row[col.key].toFixed(4)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Variable Definitions */}
      <div style={{ marginTop: '40px' }} className="glass-panel">
        <div style={{ padding: '28px 32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Variable Definitions</h3>
          <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { feature: 'inflation_rate', range: '1.0 – 8.0 %', note: 'Annual CPI year-on-year change. Positively correlated with safe-haven demand for gold.' },
              { feature: 'crude_oil_price', range: '$50 – $120 / bbl', note: 'WTI Crude price. Rising oil signals inflation pressure on gold.' },
              { feature: 'stock_market_index', range: '3000 – 5500 pts', note: 'S&P 500 equivalent. Higher stocks reduce gold demand as risk appetite rises.' },
              { feature: 'currency_exchange_rate', range: '70 – 85 USD/INR', note: 'Weaker INR drives local gold demand, inflating price in domestic markets.' },
            ].map((v, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>{v.feature}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '6px' }}>Range: {v.range}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: '1.5' }}>{v.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
