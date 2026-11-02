import { create } from 'zustand';
import type {
  AccessLevel,
  HubNode,
  NodeHistoryEntry,
  NodeType,
  TableContent,
  TgMessage,
  User,
} from '../types/node';
import {
  MOCK_DOCS,
  MOCK_NODES,
  MOCK_TABLES,
  MOCK_TG_MESSAGES,
  MOCK_USERS,
  NODE_COLORS,
  ROOT_ID,
} from '../services/mockData';

const uid = () => Math.random().toString(36).slice(2, 10);

interface BoardState {
  // данные
  nodes: HubNode[];
  tables: Record<string, TableContent>;
  docs: Record<string, string>;
  tgMessages: TgMessage[];
  history: NodeHistoryEntry[];
  users: User[];
  currentUser: User;
  /** Явные ACL-переопределения: `${nodeId}:${userId}` -> access */
  acl: Record<string, AccessLevel>;
  /** роли по умолчанию: userId -> глобальная роль */
  globalRoles: Record<string, 'owner' | 'admin' | 'editor' | 'viewer'>;

  // навигация
  focusNodeId: string; // в какую ноду "провалены"
  pathStack: string[]; // для кнопки Назад
  editingNodeId: string | null; // открытая панель контента
  historyPanelNodeId: string | null;
  permsPanelNodeId: string | null;
  mobileView: boolean;

  // actions
  enterNode: (id: string) => void;
  goUp: () => void;
  goToPath: (id: string) => void;
  openEditor: (id: string | null) => void;
  openHistory: (id: string | null) => void;
  openPerms: (id: string | null) => void;
  setMobileView: (v: boolean) => void;
  switchUser: (id: string) => void;

  childrenOf: (id: string) => HubNode[];
  getNode: (id: string) => HubNode | undefined;
  breadcrumbs: () => HubNode[];

  canRead: (nodeId: string) => boolean;
  canWrite: (nodeId: string) => boolean;
  canAdmin: (nodeId: string) => boolean;

  createNode: (parentId: string, type: NodeType, title: string) => HubNode;
  renameNode: (id: string, title: string) => void;
  moveNode: (id: string, newParentId: string, pos?: { x: number; y: number }) => boolean;
  deleteNode: (id: string) => void;
  setNodePosition: (id: string, x: number, y: number) => void;
  setAcl: (nodeId: string, userId: string, access: AccessLevel | null) => void;
  setGlobalRole: (userId: string, role: 'owner' | 'admin' | 'editor' | 'viewer') => void;

  updateTableCell: (nodeId: string, r: number, c: number, patch: Partial<TableContent['cells'][string]>) => void;
  addTableRow: (nodeId: string) => void;
  addTableCol: (nodeId: string) => void;
  saveDoc: (nodeId: string, html: string) => void;
  sendTgMessage: (nodeId: string, text: string) => void;
  restoreHistorySnapshot: (entryId: number) => void;
}

const initialHistory: NodeHistoryEntry[] = [
  {
    id: 1, nodeId: ROOT_ID, nodeTitle: 'TCS Hub', userId: 'u1', userName: 'Alex',
    action: 'created', timestamp: new Date(Date.now() - 86400e3 * 7).toISOString(),
    summary: 'Создана корневая доска',
  },
];

export const useBoardStore = create<BoardState>((set, get) => ({
  nodes: MOCK_NODES,
  tables: MOCK_TABLES,
  docs: MOCK_DOCS,
  tgMessages: MOCK_TG_MESSAGES,
  history: initialHistory,
  users: MOCK_USERS,
  currentUser: MOCK_USERS[0],
  acl: {},
  globalRoles: { u1: 'owner', u2: 'editor', u3: 'viewer' },

  focusNodeId: ROOT_ID,
  pathStack: [],
  editingNodeId: null,
  historyPanelNodeId: null,
  permsPanelNodeId: null,
  mobileView: false,

  enterNode: (id) => {
    const s = get();
    const node = s.getNode(id);
    if (!node || node.type !== 'level') return;
    if (!s.canRead(id)) return;
    set({ focusNodeId: id, pathStack: [...s.pathStack, s.focusNodeId] });
  },
  goUp: () => {
    const s = get();
    const cur = s.getNode(s.focusNodeId);
    if (!cur?.parentId) return;
    set({
      focusNodeId: cur.parentId,
      pathStack: s.pathStack.slice(0, -1),
    });
  },
  goToPath: (id) => {
    const s = get();
    const chain = s.breadcrumbs().map((n) => n.id);
    const idx = chain.indexOf(id);
    if (idx < 0) return;
    set({ focusNodeId: id, pathStack: s.pathStack.slice(0, idx) });
  },
  openEditor: (id) => set({ editingNodeId: id }),
  openHistory: (id) => set({ historyPanelNodeId: id }),
  openPerms: (id) => set({ permsPanelNodeId: id }),
  setMobileView: (v) => set({ mobileView: v, editingNodeId: null }),
  switchUser: (id) => {
    const u = get().users.find((x) => x.id === id);
    if (u) set({ currentUser: u });
  },

  childrenOf: (id) => get().nodes.filter((n) => n.parentId === id),
  getNode: (id) => get().nodes.find((n) => n.id === id),
  breadcrumbs: () => {
    const s = get();
    const chain: HubNode[] = [];
    let cur = s.getNode(s.focusNodeId);
    while (cur) {
      chain.unshift(cur);
      cur = cur.parentId ? s.getNode(cur.parentId) : undefined;
    }
    return chain;
  },

  // Права: рекурсивный обход от ноды до root + явные ACL (ТЗ п.2.2)
  canRead: (nodeId) => {
    const s = get();
    const role = s.globalRoles[s.currentUser.id];
    if (role === 'owner' || role === 'admin') return true;
    let curId: string | null = nodeId;
    while (curId) {
      const aclVal = s.acl[`${curId}:${s.currentUser.id}`];
      if (aclVal) return aclVal === 'read' || aclVal === 'write' || aclVal === 'full';
      const node = s.getNode(curId);
      if (!node) break;
      // member имеет read-only доступ к корневым level-нодам
      if (node.parentId === null && node.type === 'level') return true;
      curId = node.parentId;
    }
    return role === 'editor';
  },
  canWrite: (nodeId) => {
    const s = get();
    if (s.mobileView) return false; // мобильная версия view-only (ТЗ п.2.6)
    const role = s.globalRoles[s.currentUser.id];
    if (role === 'owner' || role === 'admin') return true;
    let curId: string | null = nodeId;
    while (curId) {
      const aclVal = s.acl[`${curId}:${s.currentUser.id}`];
      if (aclVal) return aclVal === 'write' || aclVal === 'full';
      const node = s.getNode(curId);
      if (!node) break;
      curId = node.parentId;
    }
    return role === 'editor';
  },
  canAdmin: (nodeId) => {
    const s = get();
    const role = s.globalRoles[s.currentUser.id];
    if (role === 'owner' || role === 'admin') return true;
    let curId: string | null = nodeId;
    while (curId) {
      const aclVal = s.acl[`${curId}:${s.currentUser.id}`];
      if (aclVal) return aclVal === 'full';
      const node = s.getNode(curId);
      if (!node) break;
      curId = node.parentId;
    }
    return false;
  },

  createNode: (parentId, type, title) => {
    const s = get();
    const parent = s.getNode(parentId)!;
    const siblings = s.childrenOf(parentId);
    const node: HubNode = {
      id: uid(),
      parentId,
      type,
      title,
      color: type === 'level' ? NODE_COLORS[siblings.length % NODE_COLORS.length] : parent.color,
      position: { x: parent.position.x + 200 + (siblings.length % 3) * 180, y: parent.position.y + 120 + siblings.length * 60 },
      createdBy: s.currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const entry: NodeHistoryEntry = {
      id: s.history.length + 1,
      nodeId: node.id,
      nodeTitle: node.title,
      userId: s.currentUser.id,
      userName: s.currentUser.username,
      action: 'created',
      timestamp: node.createdAt,
      summary: `Создана нода типа "${type}" в "${parent.title}"`,
    };
    const tables = { ...s.tables };
    const docs = { ...s.docs };
    if (type === 'table') tables[node.id] = { nodeId: node.id, rows: 3, cols: 3, cells: {} };
    if (type === 'doc') docs[node.id] = '<p></p>';
    set({ nodes: [...s.nodes, node], history: [...s.history, entry], tables, docs });
    return node;
  },

  renameNode: (id, title) => {
    const s = get();
    const old = s.getNode(id);
    if (!old) return;
    set({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, title, updatedAt: new Date().toISOString() } : n)),
      history: [
        ...s.history,
        {
          id: s.history.length + 1, nodeId: id, nodeTitle: title,
          userId: s.currentUser.id, userName: s.currentUser.username,
          action: 'updated', timestamp: new Date().toISOString(),
          summary: `Переименовано: "${old.title}" → "${title}"`,
        },
      ],
    });
  },

  moveNode: (id, newParentId, pos) => {
    const s = get();
    if (id === newParentId || id === ROOT_ID) return false;
    // запрет циклов: новый родитель не должен быть потомком id
    let cur: string | null = newParentId;
    while (cur) {
      if (cur === id) return false;
      cur = s.getNode(cur)?.parentId ?? null;
    }
    const old = s.getNode(id)!;
    const np = s.getNode(newParentId)!;
    const moved: HubNode = {
      ...old,
      parentId: newParentId,
      position: pos ?? { x: np.position.x + 200, y: np.position.y + 150 },
      updatedAt: new Date().toISOString(),
    };
    set({
      nodes: s.nodes.map((n) => (n.id === id ? moved : n)),
      history: [
        ...s.history,
        {
          id: s.history.length + 1, nodeId: id, nodeTitle: old.title,
          userId: s.currentUser.id, userName: s.currentUser.username,
          action: 'moved', timestamp: new Date().toISOString(),
          summary: `Перемещено: "${old.title}" → "${np.title}"`,
        },
      ],
    });
    return true;
  },

  deleteNode: (id) => {
    const s = get();
    if (id === ROOT_ID) return;
    const toDelete = new Set<string>();
    const collect = (nid: string) => {
      toDelete.add(nid);
      s.nodes.filter((n) => n.parentId === nid).forEach((c) => collect(c.id));
    };
    collect(id);
    const node = s.getNode(id)!;
    set({
      nodes: s.nodes.filter((n) => !toDelete.has(n.id)),
      focusNodeId: toDelete.has(s.focusNodeId) ? node.parentId ?? ROOT_ID : s.focusNodeId,
      editingNodeId: s.editingNodeId && toDelete.has(s.editingNodeId) ? null : s.editingNodeId,
      history: [
        ...s.history,
        {
          id: s.history.length + 1, nodeId: id, nodeTitle: node.title,
          userId: s.currentUser.id, userName: s.currentUser.username,
          action: 'deleted', timestamp: new Date().toISOString(),
          summary: `Удалено ${toDelete.size} нод(ы) (поддерево "${node.title}")`,
        },
      ],
    });
  },

  setNodePosition: (id, x, y) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, position: { x, y } } : n)),
    })),

  setAcl: (nodeId, userId, access) => {
    const s = get();
    const acl = { ...s.acl };
    const key = `${nodeId}:${userId}`;
    if (access === null) delete acl[key];
    else acl[key] = access;
    set({ acl });
  },
  setGlobalRole: (userId, role) =>
    set((s) => ({ globalRoles: { ...s.globalRoles, [userId]: role } })),

  updateTableCell: (nodeId, r, c, patch) => {
    const s = get();
    const t = s.tables[nodeId] ?? { nodeId, rows: 3, cols: 3, cells: {} };
    const key = `${r}:${c}`;
    const prev = t.cells[key] ?? { value: '' };
    const next = { ...t, cells: { ...t.cells, [key]: { ...prev, ...patch } } };
    set({
      tables: { ...s.tables, [nodeId]: next },
      history: [
        ...s.history,
        {
          id: s.history.length + 1, nodeId, nodeTitle: s.getNode(nodeId)?.title ?? nodeId,
          userId: s.currentUser.id, userName: s.currentUser.username,
          action: 'updated', timestamp: new Date().toISOString(),
          summary: `Ячейка ${key}: изменено содержимое`,
        },
      ],
    });
  },
  addTableRow: (nodeId) => {
    const s = get();
    const t = s.tables[nodeId] ?? { nodeId, rows: 0, cols: 3, cells: {} };
    set({ tables: { ...s.tables, [nodeId]: { ...t, rows: t.rows + 1 } } });
  },
  addTableCol: (nodeId) => {
    const s = get();
    const t = s.tables[nodeId] ?? { nodeId, rows: 3, cols: 0, cells: {} };
    set({ tables: { ...s.tables, [nodeId]: { ...t, cols: t.cols + 1 } } });
  },

  saveDoc: (nodeId, html) => {
    const s = get();
    const prev = s.docs[nodeId] ?? '';
    if (prev === html) return;
    set({
      docs: { ...s.docs, [nodeId]: html },
      history: [
        ...s.history,
        {
          id: s.history.length + 1, nodeId, nodeTitle: s.getNode(nodeId)?.title ?? nodeId,
          userId: s.currentUser.id, userName: s.currentUser.username,
          action: 'updated', timestamp: new Date().toISOString(),
          summary: 'Изменён текст документа',
          snapshot: { prev },
        } as NodeHistoryEntry & { snapshot?: { prev: string } },
      ],
    });
  },

  sendTgMessage: (nodeId, text) => {
    const s = get();
    const msg: TgMessage = {
      id: uid(),
      nodeId,
      text,
      senderName: s.currentUser.username,
      sentAt: new Date().toISOString(),
      outgoing: true,
    };
    set({ tgMessages: [...s.tgMessages, msg] });
    // имитация входящего ответа из Telegram (в проде — Telethon/Webhook, ТЗ п.2.5)
    setTimeout(() => {
      const st = get();
      st.tgMessages.find((m) => m.id === msg.id) &&
        set({
          tgMessages: [
            ...st.tgMessages,
            {
              id: uid(), nodeId, text: '✅ Доставлено в Telegram (бот)',
              senderName: 'TCS Bot', sentAt: new Date().toISOString(), outgoing: false,
            },
          ],
        });
    }, 1500);
  },

  restoreHistorySnapshot: (entryId) => {
    const s = get();
    const e = s.history.find((h) => h.id === entryId);
    if (!e) return;
    const snap = (e as unknown as { snapshot?: { prev: string } }).snapshot;
    if (snap && s.docs[e.nodeId] !== undefined) {
      set({ docs: { ...s.docs, [e.nodeId]: snap.prev } });
    }
  },
}));
