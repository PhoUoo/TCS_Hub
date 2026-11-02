import { useBoardStore } from '../../stores/boardStore';
import { TableEditor } from '../Editors/TableEditor';
import { DocEditor } from '../Editors/DocEditor';
import { TGChatNode } from '../Nodes/TGChatNode';

/** Модальная панель просмотра/редактирования контента ноды */
export function NodeContentPanel() {
  const nodeId = useBoardStore((s) => s.editingNodeId);
  const close = () => useBoardStore.getState().openEditor(null);
  const node = useBoardStore((s) => (nodeId ? s.getNode(nodeId) : undefined));
  const canWrite = useBoardStore((s) => (nodeId ? s.canWrite(nodeId) : false));
  const openHistory = useBoardStore((s) => s.openHistory);

  if (!nodeId || !node) return null;

  const readOnly = !canWrite;
  const icon = node.type === 'table' ? '📊' : node.type === 'doc' ? '📝' : '💬';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-2 sm:p-6" onClick={close}>
      <div
        className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <span className="text-xl">{icon}</span>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{node.title}</div>
            <div className="text-[11px] text-slate-400">
              {node.type === 'table' ? 'Table Node' : node.type === 'doc' ? 'Doc Node' : 'TG Chat Node'}
              {readOnly && ' · только просмотр'}
            </div>
          </div>
          <button
            onClick={() => openHistory(node.id)}
            className="ml-auto rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
          >
            🕘 История
          </button>
          <button onClick={close} className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>
        </header>

        <div className="min-h-0 flex-1">
          {node.type === 'table' && <TableEditor nodeId={node.id} readOnly={readOnly} />}
          {node.type === 'doc' && <DocEditor nodeId={node.id} readOnly={readOnly} />}
          {node.type === 'tg_chat' && <TGChatNode nodeId={node.id} readOnly={readOnly} />}
          {node.type === 'level' && (
            <div className="p-6 text-sm text-slate-500">Level-нода не содержит контента — войдите в неё для навигации.</div>
          )}
        </div>
      </div>
    </div>
  );
}
