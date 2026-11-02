import { useBoardStore } from '../../stores/boardStore';

/** Хлебные крошки для навигации вверх по дереву (ТЗ п.2.1) */
export function Breadcrumbs() {
  const crumbs = useBoardStore((s) => s.breadcrumbs());
  const goToPath = useBoardStore((s) => s.goToPath);
  const goUp = useBoardStore((s) => s.goUp);
  const pathStack = useBoardStore((s) => s.pathStack);

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={goUp}
        disabled={pathStack.length === 0}
        className="mr-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        title="Назад (Backspace)"
      >
        ← Назад
      </button>
      {crumbs.map((n, i) => (
        <span key={n.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-slate-400">/</span>}
          <button
            onClick={() => goToPath(n.id)}
            className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
              i === crumbs.length - 1 ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
            style={i === crumbs.length - 1 ? { backgroundColor: n.color } : undefined}
          >
            {n.title}
          </button>
        </span>
      ))}
    </div>
  );
}
