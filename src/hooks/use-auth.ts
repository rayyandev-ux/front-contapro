import { useState, useEffect } from 'react';
import { apiJson } from '@/lib/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const { ok } = await apiJson('/api/auth/me');
        if (!cancelled) {
          setIsAuthenticated(ok);
        }
      } catch (err) {
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    
    checkAuth();
    return () => { cancelled = true; };
  }, []);

  return { isAuthenticated, isLoading };
}
