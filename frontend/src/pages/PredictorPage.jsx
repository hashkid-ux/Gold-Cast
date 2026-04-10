import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Line, Area, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, LineChart
} from 'recharts';
import PredictionForm from '../components/PredictionForm';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import API_BASE from '../config';

const CHART_TYPES = [
  { key: 'overlay', label: 'Overlay' },
  { key: 'line', label: 'Line' },
  { key: 'area', label: 'Area' },
  { key: 'bar', label: 'Bar' },
  { key: 'candle', label: 'Candle' },
];

// Deterministic OHLC from price
function genOHLC(price, i) {
  const s = Math.sin(i * 9301 + 49297) * 49979;
  const r = (o) => Math.abs(((s + o) % 100) / 100);
  const sp = price * 0.012;
  const open = price - sp + r(1) * sp * 2;
  const close = price + sp - r(2) * sp * 2;
  return {
    open: +open.toFixed(2), close: +close.toFixed(2),
    high: +(Math.max(open, close) + r(3) * sp * 0.7).toFixed(2),
    low: +(Math.min(open, close) - r(4) * sp * 0.7).toFixed(2),
    bullish: close >= open,
  };
}

// Candlestick renderer
const CandleStick = ({ data, yMin, yMax, chartHeight }) => {
  if (!data?.length) return null;
  const barW = Math.min(Math.floor((chartHeight * 2.2) / data.length), 10);
  const toY = (v) => chartHeight - ((v - yMin) / (yMax - yMin)) * chartHeight;

  return (
    <g>
      {data.map((d, i) => {
        if (!d.open) return null;
        const x = 60 + (i * ((chartHeight * 2.2) / data.length));
        const bodyTop = toY(Math.max(d.open, d.close));
        const bodyBot = toY(Math.min(d.open, d.close));
        const bh = Math.max(bodyBot - bodyTop, 1);
        const color = d.isForecast ? '#22c55e' : (d.bullish ? '#22c55e' : '#ef4444');
        return (
          <g key={i}>
            <line x1={x} y1={toY(d.high)} x2={x} y2={toY(d.low)} stroke={color} strokeWidth={1} />
            <rect x={x - barW / 2} y={bodyTop} width={barW} height={bh}
              fill={color} fillOpacity={d.isForecast ? 1 : 0.8} rx={1} />
          </g>
        );
      })}
    </g>
  );
};

export default function PredictorPage() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputs, setInputs] = useState(null);
  const [history, setHistory] = useState([]);
  const [chartType, setChartType] = useState('overlay');
  const [metrics, setMetrics] = useState(null);
  const [realChart, setRealChart] = useState([]);
  const [priceKey, setPriceKey] = useState(0); // for re-triggering animation

  useEffect(() => {
    fetch(`${API_BASE}/api/model-insights`)
      .then(r => r.json()).then(d => setMetrics(d.metrics)).catch(() => {});
    fetch(`${API_BASE}/api/chart-data`)
      .then(r => r.json()).then(d => setRealChart(d.chart || [])).catch(() => {});
  }, []);

  const handlePredict = async (formData) => {
    setLoading(true); setError(null); setInputs(formData);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Backend unavailable.');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPrediction(data.predicted_gold_price);
      setPriceKey(k => k + 1);
      setHistory(prev => [{ id: Date.now(), price: data.predicted_gold_price, ...formData }, ...prev].slice(0, 10));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Chart data with full ML prediction timeline + user's forecast extending it
  const chartData = realChart.map((d, i) => ({ ...d, ...genOHLC(d.actual, i) }));
  if (prediction) {
    const last = realChart[realChart.length - 1];
    // Add 2 intermediate connecting points to make transition smooth
    if (last) {
      const midPred = (last.predicted + prediction) / 2;
      chartData.push({
        label: '', index: realChart.length + 1, actual: null,
        predicted: midPred, residual: null, ...genOHLC(midPred, 80), isBridge: true,
      });
    }
    chartData.push({
      label: 'FORECAST', index: realChart.length + 2, actual: null,
      predicted: prediction, residual: null, ...genOHLC(prediction, 99), isForecast: true,
    });
  }

  const allP = [...realChart.flatMap(d => [d.actual, d.predicted]), ...(prediction ? [prediction] : [])].filter(Boolean);
  const yMin = allP.length ? Math.floor(Math.min(...allP) / 50) * 50 - 80 : 1400;
  const yMax = allP.length ? Math.ceil(Math.max(...allP) / 50) * 50 + 80 : 2600;
  const m = metrics?.test || {};

  // Compare prediction to dataset average
  const avgPrice = allP.length ? allP.reduce((a, b) => a + b, 0) / allP.length : 0;
  const pctDiff = prediction && avgPrice ? (((prediction - avgPrice) / avgPrice) * 100).toFixed(1) : null;
  const isAbove = pctDiff > 0;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '0.73rem', lineHeight: '1.9', minWidth: '200px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
        <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--foreground)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {d.isForecast ? '🟢 YOUR FORECAST' : d.isBridge ? '↗ Transition' : `Sample ${d.index}`}
        </div>
        {d.actual != null && <div style={{ color: 'var(--chart-2)' }}>● Actual: <strong>${d.actual.toLocaleString()}</strong></div>}
        {d.predicted != null && <div style={{ color: 'var(--primary)' }}>◌ AI Predicted: <strong>${d.predicted.toLocaleString()}</strong></div>}
        {d.residual != null && <div style={{ color: Math.abs(d.residual) > 30 ? '#ef4444' : '#22c55e' }}>Δ Error: <strong>${d.residual > 0 ? '+' : ''}{d.residual}</strong></div>}
        {d.open != null && !d.isBridge && (
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '6px', color: 'var(--muted-foreground)', fontSize: '0.68rem' }}>
            O ${d.open} · H ${d.high} · L ${d.low} · C ${d.close}
          </div>
        )}
      </div>
    );
  };

  const xAxisP = { dataKey: 'label', stroke: 'var(--muted-foreground)', tick: { fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--muted-foreground)' }, axisLine: false, tickLine: false, interval: 3 };
  const yAxisP = { stroke: 'var(--muted-foreground)', tick: { fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--muted-foreground)' }, tickFormatter: v => `$${v}`, axisLine: false, tickLine: false, domain: [yMin, yMax] };
  const gridP = <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />;
  const mg = { top: 10, right: 30, left: 10, bottom: 0 };

  const renderChart = () => {
    const actualLine = <Line type="monotone" dataKey="actual" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 2, fill: 'var(--chart-2)', strokeWidth: 0 }} name="Actual" connectNulls={false} />;
    const predLine = <Line type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={2} strokeDasharray="6 3" dot={(props) => {
      const { cx, cy, payload } = props;
      if (payload?.isForecast) return <circle cx={cx} cy={cy} r={7} fill="#22c55e" stroke="#fff" strokeWidth={2.5} />;
      if (payload?.isBridge) return null;
      return <circle cx={cx} cy={cy} r={2} fill="var(--primary)" strokeWidth={0} />;
    }} name="ML Predicted" connectNulls />;
    const forecastRef = prediction ? <ReferenceLine x="FORECAST" stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.4} /> : null;

    if (chartType === 'candle') {
      return (
        <ComposedChart data={chartData} margin={mg}>
          {gridP}<XAxis {...xAxisP} /><YAxis {...yAxisP} />
          <Tooltip content={<CustomTooltip />} />
          {actualLine}
          {predLine}
          {forecastRef}
          {/* Candle bodies via Bar custom shape */}
          <Bar dataKey="high" fill="transparent" barSize={10} shape={(props) => {
            const { x, y, width, payload } = props;
            if (!payload?.open || payload?.isBridge) return null;
            const yDom = [yMin, yMax];
            const ch = 380;
            const toY = (v) => ch - ((v - yDom[0]) / (yDom[1] - yDom[0])) * ch + 10;
            const { open, close, high, low, bullish, isForecast } = payload;
            const bt = toY(Math.max(open, close));
            const bb = toY(Math.min(open, close));
            const bh = Math.max(bb - bt, 2);
            const cx = x + width / 2;
            const cw = Math.min(width * 0.65, 8);
            const col = isForecast ? '#22c55e' : (bullish ? '#22c55e' : '#ef4444');
            return (
              <g>
                <line x1={cx} y1={toY(high)} x2={cx} y2={toY(low)} stroke={col} strokeWidth={1.2} />
                <rect x={cx - cw / 2} y={bt} width={cw} height={bh} fill={col} fillOpacity={0.85} rx={1} />
              </g>
            );
          }} />
        </ComposedChart>
      );
    }

    if (chartType === 'area') {
      return (
        <ComposedChart data={chartData} margin={mg}>
          <defs>
            <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.2}/><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.01}/></linearGradient>
            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15}/><stop offset="100%" stopColor="var(--primary)" stopOpacity={0.01}/></linearGradient>
          </defs>
          {gridP}<XAxis {...xAxisP}/><YAxis {...yAxisP}/>
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="actual" stroke="var(--chart-2)" strokeWidth={2} fill="url(#gA)" connectNulls={false} />
          <Area type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={2} fill="url(#gP)" strokeDasharray="6 3" connectNulls />
          {forecastRef}
        </ComposedChart>
      );
    }

    if (chartType === 'bar') {
      return (
        <ComposedChart data={chartData} margin={mg}>
          {gridP}<XAxis {...xAxisP}/><YAxis {...yAxisP}/>
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="actual" fill="var(--chart-2)" fillOpacity={0.6} radius={[2,2,0,0]} barSize={5} />
          <Bar dataKey="predicted" fill="var(--primary)" fillOpacity={0.6} radius={[2,2,0,0]} barSize={5} />
          {forecastRef}
        </ComposedChart>
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart data={chartData} margin={mg}>
          {gridP}<XAxis {...xAxisP}/><YAxis {...yAxisP}/>
          <Tooltip content={<CustomTooltip />} />
          {actualLine}{predLine}{forecastRef}
        </LineChart>
      );
    }

    // Overlay (default)
    return (
      <ComposedChart data={chartData} margin={mg}>
        <defs>
          <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.1}/><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.01}/></linearGradient>
        </defs>
        {gridP}<XAxis {...xAxisP}/><YAxis {...yAxisP}/>
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="actual" stroke="none" fill="url(#sG)" connectNulls={false} />
        {actualLine}{predLine}{forecastRef}
      </ComposedChart>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Inference Engine — Financial Planning Support</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '16px' }}>Gold Price Predictor</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', lineHeight: '1.7', maxWidth: '750px' }}>
          Data-driven solutions for smarter investment decisions. <strong style={{ color: 'var(--chart-2)' }}>Solid line</strong> = actual gold prices from dataset. <strong style={{ color: 'var(--primary)' }}>Dashed line</strong> = what the AI predicted for every point. Your forecast <strong>extends</strong> the AI line to forecast future trends.
        </p>
      </div>

      <div className="predictor-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
        {/* LEFT — FORM */}
        <div className="predictor-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <PredictionForm onPredict={handlePredict} loading={loading} />
            {error && <div style={{ color: 'var(--destructive)', marginTop: '12px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)' }}>⚠ {error}</div>}
          </div>

          {/* Model Specs */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model Specifications</div>
            {[
              { k: 'Algorithm', v: 'RandomForestRegressor' },
              { k: 'Estimators', v: '100 trees' },
              { k: 'Max Depth', v: '10 levels' },
              { k: 'Test R²', v: m.r2 || '—' },
              { k: 'Test MAE', v: m.mae ? `$${m.mae}` : '—' },
              { k: 'Test RMSE', v: m.rmse ? `$${m.rmse}` : '—' },
            ].map(({ k, v }) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{k}</span>
                <span style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — RESULTS + CHARTS */}
        <div className="predictor-chart-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ══════ PREMIUM PREDICTION DISPLAY ══════ */}
          <div className={`glass-panel ${prediction ? 'glow-panel' : ''}`} style={{
            padding: prediction ? '36px 32px' : '32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: prediction
              ? 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, var(--card) 40%, var(--card) 60%, rgba(245,158,11,0.06) 100%)'
              : 'var(--card)',
          }}>
            {/* Shimmer overlay when prediction exists */}
            {prediction && <div className="shimmer-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />}

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {prediction && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'tickerBlink 1.5s infinite' }} />}
                Model Forecast — GOLD / USD
              </div>

              {prediction ? (
                <div key={priceKey} className="price-reveal">
                  <div style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900',
                    background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    lineHeight: 1, marginBottom: '12px',
                  }}>
                    ${prediction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {/* Confidence + Delta badges */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '600',
                      background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)'
                    }}>
                      <Activity size={12} /> LIVE
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '600',
                      background: isAbove ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: isAbove ? '#22c55e' : '#ef4444',
                      border: `1px solid ${isAbove ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      {isAbove ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {isAbove ? '+' : ''}{pctDiff}% vs avg
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                      background: 'var(--muted)', color: 'var(--muted-foreground)',  border: '1px solid var(--border)'
                    }}>
                      ±${m.mae || 25} MAE
                    </span>
                  </div>

                  <div style={{ marginTop: '14px', color: 'var(--muted-foreground)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                    Ensemble consensus from 100 decision trees
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px 0' }}>
                  <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: '700', color: 'var(--muted-foreground)', opacity: 0.5 }}>
                    Awaiting Input
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginTop: '8px', opacity: 0.6 }}>
                    Select a scenario or enter values to forecast
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ══════ MAIN CHART ══════ */}
          <div className="glass-panel" style={{ padding: '24px 24px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '2px' }}>GOLD/USD — Actual vs AI Timeline</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                  30 real dataset samples · Full prediction overlay
                </p>
              </div>
              <div className="chart-type-selector" style={{ display: 'flex', gap: '2px', background: 'var(--muted)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border)' }}>
                {CHART_TYPES.map(t => (
                  <button key={t.key} onClick={() => setChartType(t.key)} style={{
                    padding: '5px 10px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)',
                    border: 'none', borderRadius: '4px', cursor: 'pointer',
                    background: chartType === t.key ? 'var(--background)' : 'transparent',
                    color: chartType === t.key ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontWeight: '600', transition: 'all 0.15s',
                    boxShadow: chartType === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '16px', height: '2.5px', background: 'var(--chart-2)', display: 'inline-block', borderRadius: '2px' }} />
                <span style={{ color: 'var(--chart-2)' }}>Actual (Real)</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '16px', height: '0', borderTop: '2px dashed var(--primary)', display: 'inline-block' }} />
                <span style={{ color: 'var(--primary)' }}>AI Predicted</span>
              </span>
              {prediction && (
                <span className="fade-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(34,197,94,0.08)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <span style={{ width: '7px', height: '7px', background: '#22c55e', display: 'inline-block', borderRadius: '50%' }} />
                  <span style={{ color: '#22c55e', fontWeight: '700' }}>Your Forecast</span>
                </span>
              )}
            </div>

            <div style={{ height: 'clamp(280px, 40vw, 400px)' }}>
              {realChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', justifyContent: 'center', padding: '24px' }}>
                  <div className="skeleton" style={{ height: '100%', minHeight: '200px', width: '100%' }} />
                </div>
              )}
            </div>
          </div>

          {/* ══════ RESIDUAL CHART ══════ */}
          {realChart.length > 0 && (
            <div className="glass-panel" style={{ padding: '20px 24px 14px' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '2px' }}>Error Distribution</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
                Actual − Predicted per sample · Green = over · Red = under · Zero = perfect
              </p>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={realChart} margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 8 }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis stroke="var(--muted-foreground)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10 }} tickFormatter={v => `$${v}`} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', fontFamily: 'var(--font-mono)', fontSize: '11px' }} formatter={(v) => [`$${v}`, 'Error']} />
                    <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                    <Bar dataKey="residual" radius={[2,2,0,0]} barSize={5}>
                      {realChart.map((e, i) => <Cell key={i} fill={e.residual >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.7} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ══════ INPUT ECHO ══════ */}
          {inputs && (
            <div className="glass-panel fade-slide-up" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)', marginBottom: '10px', textTransform: 'uppercase' }}>Inference Input Vector</div>
              <div className="input-vector-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { v: `${inputs.inflation_rate}%`, l: 'Inflation Rate' },
                  { v: `$${inputs.crude_oil_price}`, l: 'Crude Oil (WTI)' },
                  { v: `${inputs.stock_market_index} pts`, l: 'Stock Index' },
                  { v: `${inputs.currency_exchange_rate} INR`, l: 'Exchange Rate' },
                ].map(({ v, l }, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>{l}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary)', marginTop: '3px', fontSize: '0.9rem' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════ HISTORY ══════ */}
          {history.length > 0 && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)', marginBottom: '10px', textTransform: 'uppercase' }}>Prediction History ({history.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {history.map((h, i) => (
                  <div key={h.id} className={i === 0 ? 'fade-slide-up' : ''} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 14px', borderRadius: 'var(--radius)',
                    background: i === 0 ? 'rgba(34,197,94,0.06)' : 'var(--muted)',
                    border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                      Inf:{h.inflation_rate}% · Oil:${h.crude_oil_price} · Idx:{h.stock_market_index} · FX:{h.currency_exchange_rate}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: i === 0 ? '#22c55e' : 'var(--primary)', fontSize: '0.85rem' }}>
                      ${h.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
