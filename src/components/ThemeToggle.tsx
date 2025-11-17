"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = t === 'dark' || t === 'light' ? (t as 'light' | 'dark') : (prefersDark ? 'dark' : 'light');
    setTheme(next);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    if (typeof window !== 'undefined') localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <button
      type="button"
      aria-label={mounted ? (theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro') : 'Cambiar tema'}
      onClick={toggle}
      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted ring-1 ring-border"
      suppressHydrationWarning
    >
      {mounted ? (theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )) : (
        <Moon className="h-4 w-4 opacity-0" />
      )}
      <span className="hidden sm:inline">{mounted ? (theme === 'dark' ? 'Claro' : 'Oscuro') : 'Tema'}</span>
    </button>
  );
}