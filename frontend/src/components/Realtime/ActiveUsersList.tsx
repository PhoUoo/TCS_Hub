import { useBoardStore } from '../../stores/boardStore';
import type { PresenceUser } from '../../hooks/useRealtimeSync';

/** Список активных пользователей в шапке (ТЗ п.2.3) */
export function ActiveUsersList({ peers }: { peers: PresenceUser[] }) {
  const currentUser = useBoardStore((s) => s.currentUser);
  const users = useBoardStore((s) => s.users);
  const activeIds = new Set([currentUser.id, ...peers.map((p) => p.id)]);

  return (
    <div className="flex items-center -space-x-2">
      {users
        .filter((u) => activeIds.has(u.id))
        .map((u) => (
          <div
            key={u.id}
            title={`${u.username}${u.id === currentUser.id ? ' (вы)' : ' — онлайн'}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow"
            style={{ backgroundColor: u.color }}
          >
            {u.username.slice(0, 1)}
          </div>
        ))}
      <span className="pl-3 text-[11px] text-slate-400">realtime: Yjs awareness*</span>
    </div>
  );
}
