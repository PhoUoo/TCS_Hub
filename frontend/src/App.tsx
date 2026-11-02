import { useState } from 'react';
import { useBoardStore } from './stores/boardStore';
import { Breadcrumbs } from './components/Board/Breadcrumbs';
import { InfiniteCanvas } from './components/Board/InfiniteCanvas';
import { NodeContentPanel } from './components/Board/NodeContentPanel';
import { HistoryPanel } from './components/Permissions/HistoryPanel';
import { AccessPanel } from './components/Permissions/AccessPanel';
import { UserCursor } from './components/Realtime/UserCursor';
import { ActiveUsersList } from './components/Realtime/ActiveUsersList';
import { LoginPage } from './components/Auth/LoginPage';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import type { NodeType } from './types/node';

const CREATE_TYPES: { type: NodeType; label: string }[] = [
  { type: 'level', label: '📁 Уровень' },
  { type: 'table', label: '📊 Таблица' },
  { type: 'doc', label: '📝 Документ' },
  { type: 'tg_chat', label: '💬 TG-чат' },
];

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('tcs_authed') === '1');
  const currentUser = useBoardStore((s) => s.currentUser);
  const globalRoles = useBoardStore((s) => s.globalRoles);
  const switchUser = useBoardStore((s) => s.switchUser);
  const mobileView = useBoardStore((s) => s.mobileView);
  const setMobileView = useBoardStore((s) => s.setMobileView);
  const focusNodeId = useBoardStore((s) => s.focusNodeId);
  const canWriteFocus = useBoardStore((s) => s.canWrite(s.focusNodeId));
  const createNode = useBoardStore((s) => s.createNode);
  const openEditor = useBoardStore((s) => s.openEditor);

  const peers = useRealtimeSync(authed && !mobileView);

  if (!authed) {
    return (
      <LoginPage
        onAuthenticated={() => {
          localStorage.setItem('tcs_authed', '1');
          setAuthed(true);
        }}
      />
    );
  }

  const role = globalRoles[currentUser.id] ?? 'member';
  const isAdminish = role === 'owner' || role === 'admin';

  return (
    <div className="flex h-screen flex-col bg-board">
      {/* Шапка */}
      <header className="z-20 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗂️</span>
          <span className="text-sm font-extrabold tracking-tight text-slate-900">TCS Hub</span>
        </div>

        <div className="hidden sm:block"><Breadcrumbs /></div>
        <div className="block sm:hidden"><Breadcrumbs /></div>

        <div className="ml-auto flex items-center gap-2">
          {!mobileView && (
            <>
              <button
                onClick={() => setMobileView(true)}
                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                title="Переключиться в мобильный view-only режим"
              >
                📱 Mobile view
              </button>
              <select
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.id)}
                className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px]"
                title="Сменить пользователя (демо ролей)"
              >
                {useBoardStore.getState().users.map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.username} [{globalRoles[u.id] ?? 'member'}]
                  </option>
                ))}
              </select>
            </>
          )}
          {mobileView && (
            <button
              onClick={() => setMobileView(false)}
              className="rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium text-white"
            >
              ← Выйти из мобильного режима
            </button>
          )}
          <ActiveUsersList peers={peers} />
        </div>
      </header>

      {mobileView && (
        <div className="border-b border-amber-200 bg-amber-50 px-3 py-1 text-center text-[11px] font-medium text-amber-700">
          Мобильный режим: только просмотр. Редактирование недоступно (ТЗ п.2.6).
        </div>
      )}

      {/* Панель создания нод */}
      {!mobileView && canWriteFocus && (
        <div className="z-10 flex items-center gap-1.5 border-b border-slate-200 bg-white/80 px-3 py-1.5 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Создать в «{useBoardStore.getState().getNode(focusNodeId)?.title}»:</span>
          {CREATE_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => {
                const title = window.prompt(`Название (${t.label}):`, t.type === 'tg_chat' ? 'Новый TG-чат' : 'Без названия')?.trim();
                if (!title) return;
                const n = createNode(focusNodeId, t.type, title);
                if (t.type !== 'level') openEditor(n.id);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto hidden text-[10px] text-slate-400 md:block">
            Двойной клик по level-ноде — провалиться · Backspace — вверх · Enter — открыть выбранную
          </span>
        </div>
      )}

      {/* Доска */}
      <main className="relative min-h-0 flex-1">
        <InfiniteCanvas />
        {peers.map((p) => (
          <UserCursor key={p.id} peer={p} />
        ))}
      </main>

      {/* Панели */}
      <NodeContentPanel />
      <HistoryPanel />
      <AccessPanel />

      <footer className="z-10 flex items-center justify-between border-t border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-400">
        <span>MVP demo: данные хранятся в памяти браузера. Backend (NestJS + PostgreSQL + Yjs) — в /backend.</span>
        {isAdminish && <span>вы — {role}: доступны все операции</span>}
      </footer>
    </div>
  );
}
