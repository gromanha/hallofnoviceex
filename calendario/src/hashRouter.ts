import { useEffect, useState } from 'react';

export type RouteName = 'app' | 'admin';

function readHash(): RouteName {
  const h = (typeof window !== 'undefined' ? window.location.hash : '').toLowerCase();
  if (h.startsWith('#/admin')) return 'admin';
  return 'app';
}

export function useHashRoute(): [RouteName, (next: RouteName) => void] {
  const [route, setRoute] = useState<RouteName>(() => readHash());

  useEffect(() => {
    const onChange = () => setRoute(readHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (next: RouteName) => {
    const target = next === 'admin' ? '#/admin' : '#/';
    if (window.location.hash !== target) {
      window.location.hash = target;
    } else {
      setRoute(next);
    }
  };

  return [route, navigate];
}
