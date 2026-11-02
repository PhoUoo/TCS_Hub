import type { HubNode } from '../../types/node';

const TYPE_BADGE: Record<HubNode['type'], { label: string; cls: string }> = {
  level: { label: 'Уровень', cls: 'bg-indigo-100 text-indigo-700' },
  table: { label: 'Таблица', cls: 'bg-emerald-100 text-emerald-700' },
  doc: { label: 'Документ', cls: 'bg-amber-100 text-amber-700' },
  tg_chat: { label: 'Telegram', cls: 'bg-sky-100 text-sky-700' },
};

export function NodeCard({
  node,
  childCount,
  selected,
  readOnly,
  onEnter,
  onOpen,
  onRename,
  onDelete,
  onPermissions,
  onHistory,
}: {
  node: HubNode;
  childCount: number;
  selected: boolean;
  readOnly: boolean;
  onEnter: () => void;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onPermissions: () => void;
  onHistory: () => void;
}) {
  const badge = TYPE_BADGE[node.type];
  const isLevel = node.type === 'level';

  return (
    <div
      className={`w-56 rounded-xl border-2 bg-white shadow-md transition-all ${
        selected ? 'ring-4 ring-blue-300' : ''
      } ${readOnly ? 'opacity-80' : ''}`}
      style={{ borderColor: node.color }}
      onDoubleClick={isLevel ? onEnter : onOpen}
      title={isLevel ? 'Двойной клик — провалиться в ноду' : 'Двойной клик — открыть контент'}
    >
      <div className="flex items-start justify-between px-3 pt-2">
        <div className="text-2xl leading-none">{isLevel ? '📁' : node.type === 'table' ? '📊' : node.type === 'doc' ? '📝' : '💬'}</div>
        <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>{badge.label}</span>
      </div>
      <div className="px-3 pb-1">
        <EditableTitle value={node.title} color={node.color} editable={!readOnly} onSave={onRename} />
        {isLevel && (
          <div className="mt-0.5 text-[11px] text-slate-500">
            {childCount} элемент(ов) · уровень навигации
          </div>
        )}
      </div>
      <div className="flex gap-1 border-t border-slate-100 px-2 py-1.5 text-[11px]">
        {isLevel ? (
          <button onClick={onEnter} className="rounded bg-indigo-600 px-2 py-0.5 font-medium text-white hover:bg-indigo-700">
            Войти →
          </button>
        ) : (
          <button onClick={onOpen} className="rounded bg-slate-800 px-2 py-0.5 font-medium text-white hover:bg-slate-900">
            Открыть
          </button>
        )}
        <button onClick={onHistory} className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100" title="История изменений">
          🕘
        </button>
        {!readOnly && (
          <button onClick={onPermissions} className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100" title="Права доступа">
            🔒
          </button>
        )}
        {!readOnly && !isRoot(node) && (
          <button
            onClick={() => confirm(`Удалить ноду «${node.title}» вместе с поддеревом?`) && onDelete()}
            className="ml-auto rounded px-1.5 py-0.5 text-red-400 hover:bg-red-50 hover:text-red-600"
            title="Удалить"
          >
            🗑
          </button>
        )}
      </div>
      {readOnly && <div className="px-3 pb-2 text-[10px] font-medium text-slate-400">только просмотр</div>}
    </div>
  );
}

const isRoot = (n: HubNode) => n.parentId === null;

function EditableTitle({
  value,
  color,
  editable,
  onSave,
}: {
  value: string;
  color: string;
  editable: boolean;
  onSave: (v: string) => void;
}) {
  return (
    <div
      className={`truncate text-sm font-bold ${editable ? 'cursor-text hover:underline' : ''}`}
      style={{ color }}
      contentEditable={false}
      onDoubleClick={(e) => {
        if (!editable) return;
        e.stopPropagation();
        const next = window.prompt('Новое название ноды:', value);
        if (next && next.trim()) onSave(next.trim());
      }}
    >
      {value}
    </div>
  );
}
