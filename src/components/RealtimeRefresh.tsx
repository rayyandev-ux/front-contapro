'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RealtimeRefresh() {
  const router = useRouter();
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try { bc = new BroadcastChannel('contapro:mutated'); } catch {}
    bc?.addEventListener('message', () => { router.refresh(); });

    const onVis = () => { if (document.visibilityState === 'visible') router.refresh(); };
    document.addEventListener('visibilitychange', onVis);

    let curMonth = new Date().getMonth();
    let curYear = new Date().getFullYear();
    const tick = () => {
      const now = new Date();
      if (now.getMonth() !== curMonth || now.getFullYear() !== curYear) {
        curMonth = now.getMonth();
        curYear = now.getFullYear();
        router.refresh();
      }
    };
    const id = setInterval(tick, 60000);

    return () => {
      try { bc?.close(); } catch {}
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(id);
    };
  }, [router]);
  return null;
}