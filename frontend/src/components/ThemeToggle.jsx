import React, { useEffect, useState } from 'react';
import { MonitorCogIcon, MoonStarIcon, SunIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const THEME_OPTIONS = [
  {
    icon: MonitorCogIcon,
    value: 'system',
  },
  {
    icon: SunIcon,
    value: 'light',
  },
  {
    icon: MoonStarIcon,
    value: 'dark',
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ width: '96px', height: '32px' }} />;
  }

  return (
    <motion.div
      key={String(isMounted)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        backgroundColor: 'color-mix(in srgb, var(--muted) 80%, transparent)',
        padding: '2px',
        gap: '2px'
      }}
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          style={{
            position: 'relative',
            display: 'flex',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.2s',
            border: 'none',
            background: 'transparent',
            color: theme === option.value ? 'var(--foreground)' : 'var(--muted-foreground)'
          }}
          role="radio"
          aria-checked={theme === option.value}
          aria-label={`Switch to ${option.value} theme`}
          onClick={() => setTheme(option.value)}
        >
          {theme === option.value && (
            <motion.div
              layoutId="theme-option"
              transition={{ type: 'spring', bounce: 0.1, duration: 0.75 }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '4px',
                border: '1px solid color-mix(in srgb, var(--border) 50%, transparent)',
                background: 'var(--background)',
                zIndex: 0
              }}
            />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <option.icon size={14} />
          </div>
        </button>
      ))}
    </motion.div>
  );
}
