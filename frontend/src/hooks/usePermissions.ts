import { useBoardStore } from '../stores/boardStore';

/** Хук проверки прав доступа (ТЗ п.2.2). В проде — запрос к /api/permissions + кэш. */
export function usePermissions(nodeId?: string) {
  const canRead = useBoardStore((s) => s.canRead);
  const canWrite = useBoardStore((s) => s.canWrite);
  const canAdmin = useBoardStore((s) => s.canAdmin);
  const currentUser = useBoardStore((s) => s.currentUser);
  const globalRoles = useBoardStore((s) => s.globalRoles);
  const nodes = useBoardStore((s) => s.nodes); // подписка на изменения дерева
  const acl = useBoardStore((s) => s.acl);

  void nodes;
  void acl;

  return {
    role: globalRoles[currentUser.id] ?? 'member',
    canRead: nodeId ? canRead(nodeId) : true,
    canWrite: nodeId ? canWrite(nodeId) : false,
    canAdmin: nodeId ? canAdmin(nodeId) : false,
  };
}
