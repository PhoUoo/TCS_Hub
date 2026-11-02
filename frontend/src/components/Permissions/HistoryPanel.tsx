import { useBoardStore } from '../../stores/boardStore';

/** Боковая панель истории изменений ноды (ТЗ п.2.4) */
export function HistoryPanel() {
  const nodeId = useBoardStore((s) => s.historyPanelNodeId);
  const close = () => useBoardStore.getState().openHistory(null);
  const history = useBoardStore((s) => s.history);
  const restore = useBoardStore((s) => s.restoreHistorySnapshot);

  if (!nodeId) return null;
  const entries = history.filter((h) => h.nodeId === nodeId).slice().reverse();
  const node = useBoardStore.getState().getNode(nodeId);

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-xl">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <div className="text-sm font-bold text-slate-800">🕘 История изменений</div>
          <div className="text-xs text-slate-500">{node?.title}</div>
        </div>
        <button onClick={close} className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>
      </header>
      <div className="flex-1 space-y-2 overflow-auto p-3 text-sm">
        {entries.length === 0 && (
          <div className="text-xs text-slate-400">Изменений для этой ноды пока нет.</div>
        )}
        {entries.map((h) => (
          <div key={h.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{new Date(h.timestamp).toLocaleString('ru-RU')}</span>
              <span
                className={`rounded-full px-2 py-0.5 font-semibold ${
                  h.action === 'created' ? 'bg-emerald-100 text-emerald-700'
                  : h.action === 'deleted' ? 'bg-red-100 text-red-700'
                  : h.action === 'moved' ? 'bg-amber-100 text-amber-700'
                  : 'bg-sky-100 text-sky-700'
                }`}
              >
                {h.action}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-700">{h.summary}</div>
            <div className="mt-1 text-[11px] text-slate-400">автор: {h.userName}</div>
            {(h as unknown as { snapshot?: { prev: string } }).snapshot && (
              <button
                onClick={() => restore(h.id)}
                className="mt-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] hover:bg-slate-100"
              >
                ↩ Откатить к предыдущей версии
              </button>
            )}
          </div>
        ))}
      </div>
      <footer className="border-t border-slate-200 p-3 text-[11px] text-slate-400">
        Версии хранятся 90 дней, старые архивируются в S3/R2 (ТЗ п.2.4).
      </footer>
    </aside>
  );
}
