import { useEffect, useState } from 'react';
import { useBoardStore } from '../stores/boardStore';

export interface PresenceUser {
  id: string;
  username: string;
  color: string;
  x: number; // экранные координаты курсора
  y: number;
}

/**
 * Presence-индикаторы (ТЗ п.2.3).
 * MVP: симуляция на mock-пользователях. В проде — Yjs awareness через
 * WebSocket gateway (y-websocket/Hocuspocus), см. backend/src/modules/realtime.
 */
export function useRealtimeSync(enabled: boolean) {
  const users = useBoardStore((s) => s.users);
  const currentUser = useBoardStore((s) => s.currentUser);
  const [peers, setPeers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!enabled) {
      setPeers([]);
      return;
    }
    const others = users.filter((u) => u.id !== currentUser.id);
    const seeds = others.map((u, i) => ({
      u,
      px: Math.random() * 600 + 150,
      py: Math.random() * 400 + 120,
      vx: (i % 2 === 0 ? 1 : -1) * (0.7 + Math.random()),
      vy: (Math.random() - 0.5) * 1.2,
    }));
    const t = setInterval(() => {
      setPeers(
        seeds.map((s) => {
          s.px += s.vx * 6;
          s.py += s.vy * 6;
          if (s.px < 80 || s.px > window.innerWidth - 120) s.vx *= -1;
          if (s.py < 90 || s.py > window.innerHeight - 120) s.vy *= -1;
          return { id: s.u.id, username: s.u.username, color: s.u.color, x: s.px, y: s.py };
        }),
      );
    }, 100);
    return () => clearInterval(t);
  }, [enabled, users, currentUser.id]);

  return peers;
}
