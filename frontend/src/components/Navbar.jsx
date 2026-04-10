import React, { useState, useEffect } from 'react';
import { Activity, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close menu on resize past mobile breakpoint
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const links = [
    { to: '/', label: 'Overview' },
    { to: '/dataset', label: 'Dataset' },
    { to: '/analysis', label: 'EDA & Logs' },
    { to: '/architecture', label: 'Architecture' },
    { to: '/predictor', label: 'Predictor Engine' },
  ];

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? 'var(--foreground)' : 'var(--muted-foreground)',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? '600' : '500',
    transition: 'color 0.2s ease',
    borderBottom: location.pathname === path ? '2px solid var(--primary)' : '2px solid transparent',
    paddingBottom: '4px',
  });

  const getMobileLinkStyle = (path) => ({
    color: location.pathname === path ? 'var(--primary)' : 'var(--foreground)',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? '700' : '500',
    fontSize: '1.1rem',
    padding: '14px 0',
    borderBottom: '1px solid var(--border)',
    display: 'block',
    transition: 'color 0.2s ease',
  });

  return (
    <>
      <nav className="navbar" style={{ paddingRight: '24px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--foreground)' }}>
          <Activity size={28} color="var(--primary)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Gold Cast</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div className="nav-links">
            {links.map(l => (
              <Link key={l.to} to={l.to} style={getLinkStyle(l.to)}>{l.label}</Link>
            ))}
          </div>
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--foreground)', padding: '4px', display: 'flex',
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
            background: 'var(--background)', zIndex: 999,
            padding: '24px 24px', overflowY: 'auto',
            animation: 'fadeSlideUp 0.25s ease forwards',
          }}
        >
          {links.map(l => (
            <Link key={l.to} to={l.to} style={getMobileLinkStyle(l.to)}>{l.label}</Link>
          ))}
        </div>
      )}
    </>
  );
}
