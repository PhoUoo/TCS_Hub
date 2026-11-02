import { useBoardStore } from '../../stores/boardStore';
import type { AccessLevel } from '../../types/node';

/** Панель управления правами на ноду (ТЗ п.2.2): ACL-переопределения + роли */
export function AccessPanel() {
  const nodeId = useBoardStore((s) => s.permsPanelNodeId);
  const close = () => useBoardStore.getState().openPerms(null);
  const users = useBoardStore((s) => s.users);
  const acl = useBoardStore((s) => s.acl);
  const globalRoles = useBoardStore((s) => s.globalRoles);
  const setAcl = useBoardStore((s) => s.setAcl);
  const node = useBoardStore((s) => s.getNode(nodeId ?? ''));

  if (!nodeId || !node) return null;

  const OPTIONS: (AccessLevel | null)[] = [null, 'read', 'write', 'full'];
  const LABELS: Record<string, string> = { read: 'Чтение', write: 'Запись', full: 'Полный' };

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-xl">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <div className="text-sm font-bold text-slate-800">🔒 Права доступа</div>
          <div className="text-xs text-slate-500">нода: {node.title}</div>
        </div>
        <button onClick={close} className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>
      </header>

      <div className="flex-1 overflow-auto p-3 text-sm">
        <p className="mb-3 rounded-lg bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-500">
          Наследование: если для пользователя нет явной записи здесь, права берутся от родителя вплоть до root.
          Явное переопределение действует на поддерево этой ноды.
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="pb-2 font-medium">Пользователь</th>
              <th className="pb-2 font-medium">Глобально</th>
              <th className="pb-2 font-medium">На эту ноду</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const cur = acl[`${nodeId}:${u.id}`];
              return (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-2">
                    <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: u.color }} />
                    {u.username}
                  </td>
                  <td className="py-2 capitalize text-slate-500">{globalRoles[u.id] ?? 'member'}</td>
                  <td className="py-2">
                    <select
                      value={cur ?? ''}
                      onChange={(e) => setAcl(nodeId, u.id, (e.target.value === '' ? null : e.target.value) as AccessLevel | null)}
                      className="rounded border border-slate-300 bg-white px-1 py-0.5"
                    >
                      <option value="">по наследству</option>
                      {OPTIONS.filter((o): o is AccessLevel => o !== null).map((o) => (
                        <option key={o} value={o}>{LABELS[o]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </aside>
  );
}
