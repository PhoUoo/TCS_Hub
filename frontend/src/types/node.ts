// Общие типы доменных сущностей TCS Hub (см. ТЗ п.3.3)

export type NodeType = 'level' | 'table' | 'doc' | 'tg_chat';

export interface NodePosition {
  x: number;
  y: number;
}

export interface HubNode {
  id: string;
  parentId: string | null;
  type: NodeType;
  title: string;
  /** hex-цвет для level-нод, например "#6366f1" */
  color: string;
  position: NodePosition;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AccessLevel = 'read' | 'write' | 'full';

export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  telegramId?: string;
  email?: string;
  username: string;
  avatarUrl?: string;
  color: string; // цвет курсора presence
  createdAt: string;
}

export interface NodePermission {
  nodeId: string;
  userId: string;
  access: AccessLevel;
}

export interface TableContent {
  nodeId: string;
  rows: number;
  cols: number;
  cells: Record<string, TableCell>; // ключ "r:c"
}

export interface TableCell {
  value: string;
  bold?: boolean;
  bg?: string; // фон ячейки
  border?: boolean;
}

export interface TgMessage {
  id: string;
  nodeId: string;
  text: string;
  senderName: string;
  senderTgId?: string;
  mediaUrl?: string;
  sentAt: string;
  outgoing: boolean;
}

export type HistoryAction = 'created' | 'updated' | 'moved' | 'deleted';

export interface NodeHistoryEntry {
  id: number;
  nodeId: string;
  nodeTitle: string;
  userId: string;
  userName: string;
  action: HistoryAction;
  timestamp: string;
  summary: string;
}
