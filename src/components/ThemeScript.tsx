"use client";
export default function ThemeScript() {
  const code = `(() => {
    try {
      const key = 'theme';
      let theme = localStorage.getItem(key);
      if (!theme) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
      }
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    } catch {}
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}