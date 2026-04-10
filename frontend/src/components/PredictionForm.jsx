import React, { useState } from 'react';
import { TrendingUp, DollarSign, BarChart3, Globe, Info } from 'lucide-react';

const FIELDS = [
  {
    name: 'inflation_rate', label: 'Inflation Rate (%)', icon: TrendingUp,
    placeholder: 'e.g. 5.2', min: 1, max: 8, step: 0.1,
    hint: 'Annual CPI change. Higher inflation drives gold demand as a hedge.',
    typical: '3–5% is normal. Above 6% is extreme.'
  },
  {
    name: 'crude_oil_price', label: 'Crude Oil Price (USD/bbl)', icon: DollarSign,
    placeholder: 'e.g. 82.50', min: 50, max: 120, step: 1,
    hint: 'WTI Crude barrel price. Rising oil signals inflation pressure on gold.',
    typical: '$60–$90 is normal. Above $100 is a spike.'
  },
  {
    name: 'stock_market_index', label: 'Stock Market Index (Points)', icon: BarChart3,
    placeholder: 'e.g. 4500', min: 3000, max: 5500, step: 50,
    hint: 'S&P 500 equivalent. Strong stocks reduce safe-haven gold demand.',
    typical: '4000–4800 is stable. Below 3500 signals recession.'
  },
  {
    name: 'currency_exchange_rate', label: 'Exchange Rate (USD to INR)', icon: Globe,
    placeholder: 'e.g. 83.10', min: 70, max: 85, step: 0.5,
    hint: 'Weaker rupee increases local gold prices, driving demand.',
    typical: '80–84 is current range.'
  },
];

const PRESETS = [
  { label: 'Stable Economy', values: { inflation_rate: '3.5', crude_oil_price: '75', stock_market_index: '4500', currency_exchange_rate: '82' } },
  { label: 'High Inflation', values: { inflation_rate: '7.5', crude_oil_price: '110', stock_market_index: '3200', currency_exchange_rate: '84' } },
  { label: 'Market Crash', values: { inflation_rate: '6.0', crude_oil_price: '95', stock_market_index: '3000', currency_exchange_rate: '85' } },
  { label: 'Bull Run', values: { inflation_rate: '2.0', crude_oil_price: '60', stock_market_index: '5400', currency_exchange_rate: '74' } },
];

export default function PredictionForm({ onPredict, loading }) {
  const [formData, setFormData] = useState({
    inflation_rate: '', crude_oil_price: '', stock_market_index: '', currency_exchange_rate: ''
  });
  const [expanded, setExpanded] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSlider = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const applyPreset = (preset) => {
    setFormData(preset.values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ marginBottom: '4px', color: 'var(--foreground)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        Economic Indicators
      </h3>

      {/* Quick Scenario Presets */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '8px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Quick Scenarios</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {PRESETS.map((p, i) => (
            <button key={i} type="button" onClick={() => applyPreset(p)}
              style={{
                padding: '8px 12px', fontSize: '0.75rem', fontWeight: '600',
                background: 'var(--muted)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--foreground)',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {FIELDS.map((field) => {
        const Icon = field.icon;
        const isExpanded = expanded === field.name;
        return (
          <div key={field.name} className="input-group" style={{ marginBottom: '4px' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon size={14} color="var(--primary)" />
              {field.label}
              <Info size={14} color="var(--muted-foreground)" style={{ cursor: 'pointer', marginLeft: 'auto' }}
                onClick={() => setExpanded(isExpanded ? null : field.name)} />
            </label>

            {isExpanded && (
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', padding: '8px 12px', background: 'var(--muted)', borderRadius: 'var(--radius)', lineHeight: '1.5', border: '1px solid var(--border)' }}>
                {field.hint}<br /><strong>{field.typical}</strong>
              </div>
            )}

            <input
              type="number" step={field.step} name={field.name}
              className="input-field" placeholder={field.placeholder}
              value={formData[field.name]} onChange={handleChange} required
            />

            {/* Range slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', minWidth: '32px' }}>{field.min}</span>
              <input
                type="range" min={field.min} max={field.max} step={field.step}
                value={formData[field.name] || field.min}
                onChange={(e) => handleSlider(field.name, e.target.value)}
                style={{ flex: 1, accentColor: 'var(--primary)', height: '4px' }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', minWidth: '32px', textAlign: 'right' }}>{field.max}</span>
            </div>
          </div>
        );
      })}

      <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
        {loading ? 'Running Inference...' : 'Forecast Gold Price'}
      </button>
    </form>
  );
}
