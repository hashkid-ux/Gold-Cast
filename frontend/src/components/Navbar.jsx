import React from 'react';
import { Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? 'var(--foreground)' : 'var(--muted-foreground)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    borderBottom: location.pathname === path ? '2px solid var(--primary)' : 'none',
    paddingBottom: '4px'
  });

  return (
    <nav className="navbar">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--foreground)' }}>
        <Activity size={28} color="var(--primary)" />
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Gold Cast</span>
      </Link>
      <div className="nav-links">
        <Link to="/" style={getLinkStyle('/')}>Overview</Link>
        <Link to="/dataset" style={getLinkStyle('/dataset')}>Dataset</Link>
        <Link to="/analysis" style={getLinkStyle('/analysis')}>EDA & Logs</Link>
        <Link to="/architecture" style={getLinkStyle('/architecture')}>Architecture</Link>
        <Link to="/predictor" style={getLinkStyle('/predictor')}>Predictor Engine</Link>
      </div>
    </nav>
  );
}
