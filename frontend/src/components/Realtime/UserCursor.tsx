import type { PresenceUser } from '../../hooks/useRealtimeSync';

/** Курсоры других пользователей на доске — Figma-style presence (ТЗ п.2.3) */
export function UserCursor({ peer }: { peer: PresenceUser }) {
  return (
    <div className="pointer-events-none fixed z-30 transition-transform duration-100" style={{ left: peer.x, top: peer.y }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={peer.color}>
        <path d="M5 3l14 7-6.5 1.5L9 18 5 3z" stroke="white" strokeWidth="1.5" />
      </svg>
      <div
        className="ml-3 -mt-1 w-max rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow"
        style={{ backgroundColor: peer.color }}
      >
        {peer.username}
      </div>
    </div>
  );
}
