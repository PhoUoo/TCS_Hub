import type { HubNode, TableContent, TgMessage, User } from '../types/node';

export const ROOT_ID = 'root';

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'Alex (owner)', color: '#ef4444', createdAt: new Date().toISOString() },
  { id: 'u2', username: 'Maria', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: 'u3', username: 'Dmitry', color: '#10b981', createdAt: new Date().toISOString() },
];

const now = new Date().toISOString();

const n = (
  id: string,
  parentId: string | null,
  type: HubNode['type'],
  title: string,
  color: string,
  x: number,
  y: number,
): HubNode => ({
  id,
  parentId,
  type,
  title,
  color,
  position: { x, y },
  createdBy: 'u1',
  createdAt: now,
  updatedAt: now,
});

// Демонстрационное дерево (ТЗ: минимум 4 уровня глубины)
export const MOCK_NODES: HubNode[] = [
  n(ROOT_ID, null, 'level', 'TCS Hub', '#0f172a', 0, 0),

  n('video', ROOT_ID, 'level', '🎬 Видеопродакшн', '#6366f1', -520, -260),
  n('audio', ROOT_ID, 'level', '🎧 Аудиопродакшн', '#8b5cf6', -520, 0),
  n('photo', ROOT_ID, 'level', '📷 Фотография', '#ec4899', -520, 260),
  n('clients', ROOT_ID, 'level', '🤝 Клиенты', '#f59e0b', 0, 320),
  n('finance', ROOT_ID, 'level', '💰 Финансы', '#10b981', 260, -260),
  n('templates', ROOT_ID, 'level', '📁 Шаблоны', '#64748b', 260, 0),
  n('team-chat', ROOT_ID, 'tg_chat', '💬 Команда — общий чат', '#0ea5e9', 520, 260),

  n('video-clips', 'video', 'level', 'Клипы', '#4f46e5', -900, -420),
  n('video-ad', 'video', 'level', 'Реклама', '#4f46e5', -900, -260),
  n('video-table', 'video', 'table', 'Проекты (таблица)', '#6366f1', -900, -80),
  n('video-doc', 'video', 'doc', 'Бриф продакшна', '#6366f1', -760, -420),

  n('video-clips-music', 'video-clips', 'level', 'Музыкальные клипы', '#4338ca', -1260, -480),
  n('video-clips-event', 'video-clips', 'level', 'Ивент-роллики', '#4338ca', -1260, -340),
  n('video-clips-plan', 'video-clips-music', 'table', 'План съёмок', '#4338ca', -1600, -520),
  n('video-clips-notes', 'video-clips-music', 'doc', 'Заметки режиссёра', '#4338ca', -1600, -380),

  n('audio-podcasts', 'audio', 'level', 'Подкасты', '#7c3aed', -900, -60),
  n('audio-mixing', 'audio', 'level', 'Сведение', '#7c3aed', -900, 80),
  n('audio-table', 'audio-podcasts', 'table', 'Эпизоды', '#7c3aed', -1260, -80),

  n('photo-studio', 'photo', 'level', 'Студийная съёмка', '#db2777', -900, 180),
  n('photo-reportage', 'photo', 'level', 'Репортаж', '#db2777', -900, 340),

  n('clients-active', 'clients', 'level', 'Активные', '#d97706', -120, 560),
  n('clients-archive', 'clients', 'level', 'Архив', '#d97706', 140, 560),
  n('clients-table', 'clients-active', 'table', 'CRM-таблица', '#d97706', -260, 760),

  n('finance-invoices', 'finance', 'table', 'Счета', '#059669', 520, -320),
  n('finance-budget', 'finance', 'doc', 'Бюджет квартала', '#059669', 520, -160),

  n('templates-brief', 'templates', 'doc', 'Шаблон брифа', '#475569', 520, -40),
  n('templates-contract', 'templates', 'doc', 'Шаблон договора', '#475569', 520, 120),
];

export const MOCK_TABLES: Record<string, TableContent> = {
  'video-table': {
    nodeId: 'video-table',
    rows: 5,
    cols: 4,
    cells: {
      '0:0': { value: 'Проект', bold: true, bg: '#e0e7ff', border: true },
      '0:1': { value: 'Статус', bold: true, bg: '#e0e7ff', border: true },
      '0:2': { value: 'Дедлайн', bold: true, bg: '#e0e7ff', border: true },
      '0:3': { value: 'Ответственный', bold: true, bg: '#e0e7ff', border: true },
      '1:0': { value: 'Клип NEON — монтаж', border: true },
      '1:1': { value: 'В работе', bg: '#fef9c3', border: true },
      '1:2': { value: '31.10', border: true },
      '1:3': { value: 'Alex', border: true },
      '2:0': { value: 'Реклама CoFFeHouse', border: true },
      '2:1': { value: 'Сдано ✅', bg: '#dcfce7', border: true },
      '2:2': { value: '15.10', border: true },
      '2:3': { value: 'Maria', border: true },
      '3:0': { value: 'Aftermovie фестиваля', border: true },
      '3:1': { value: 'Съёмка', bg: '#fee2e2', border: true },
      '3:2': { value: '12.11', border: true },
      '3:3': { value: 'Dmitry', border: true },
    },
  },
  'clients-table': {
    nodeId: 'clients-table',
    rows: 4,
    cols: 3,
    cells: {
      '0:0': { value: 'Клиент', bold: true, bg: '#fef3c7', border: true },
      '0:1': { value: 'Контакт', bold: true, bg: '#fef3c7', border: true },
      '0:2': { value: 'Бюджет', bold: true, bg: '#fef3c7', border: true },
      '1:0': { value: 'CoFFeHouse', border: true },
      '1:1': { value: '@coffee_owner', border: true },
      '1:2': { value: '120 000 ₽', border: true },
      '2:0': { value: 'NEON records', border: true },
      '2:1': { value: '@neon_pr', border: true },
      '2:2': { value: '300 000 ₽', border: true },
    },
  },
  'finance-invoices': {
    nodeId: 'finance-invoices',
    rows: 4,
    cols: 3,
    cells: {
      '0:0': { value: '№ счёта', bold: true, bg: '#dcfce7', border: true },
      '0:1': { value: 'Дата', bold: true, bg: '#dcfce7', border: true },
      '0:2': { value: 'Сумма', bold: true, bg: '#dcfce7', border: true },
      '1:0': { value: 'INV-014', border: true },
      '1:1': { value: '02.10.2026', border: true },
      '1:2': { value: '45 000 ₽', border: true },
    },
  },
  'audio-table': {
    nodeId: 'audio-table',
    rows: 3,
    cols: 3,
    cells: {
      '0:0': { value: 'Эпизод', bold: true, bg: '#ede9fe', border: true },
      '0:1': { value: 'Гость', bold: true, bg: '#ede9fe', border: true },
      '0:2': { value: 'Статус', bold: true, bg: '#ede9fe', border: true },
      '1:0': { value: '#12 Как снимать звук на ивентах', border: true },
      '1:1': { value: '—', border: true },
      '1:2': { value: 'Монтаж', bg: '#fef9c3', border: true },
    },
  },
  'video-clips-plan': {
    nodeId: 'video-clips-plan',
    rows: 3,
    cols: 4,
    cells: {
      '0:0': { value: 'Смена', bold: true, bg: '#e0e7ff', border: true },
      '0:1': { value: 'Локация', bold: true, bg: '#e0e7ff', border: true },
      '0:2': { value: 'Свет', bold: true, bg: '#e0e7ff', border: true },
      '0:3': { value: 'Комментарий', bold: true, bg: '#e0e7ff', border: true },
      '1:0': { value: '08:00', border: true },
      '1:1': { value: 'Депо, цех 3', border: true },
      '1:2': { value: 'HMI ×2', border: true },
      '1:3': { value: 'Нужен дым-машина', border: true },
    },
  },
};

// DOC-контент хранится как HTML (в MVP; далее TipTap + Yjs)
export const MOCK_DOCS: Record<string, string> = {
  'video-doc': `<h2>Бриф продакшна</h2><p>Базовый шаблон брифа для видепроектов.</p><ul><li>Цель видео</li><li>Хронометраж</li><li>Референсы</li></ul><p><b>Обязательно</b> согласовать с клиентом до съёмки.</p>`,
  'finance-budget': `<h2>Бюджет Q4 2026</h2><p>Черновик. Ссылка на <a href="https://example.com">прошлый квартал</a>.</p><ul><li>Аренда техники — 180 000 ₽</li><li>Фрилансеры — 240 000 ₽</li></ul>`,
  'templates-brief': `<h2>Шаблон брифа</h2><ol><li>Задача</li><li>Аудитория</li><li>Каналы размещения</li><li>Бюджет и сроки</li></ol>`,
  'templates-contract': `<h2>Шаблон договора</h2><p>Юрист: дождаться финальной редакции.</p>`,
  'video-clips-notes': `<h2>Заметки режиссёра</h2><p>Идея: один дубль, steadicam, неоновый свет.</p><ul><li>Треки — утвердить до пятницы</li></ul>`,
};

export const MOCK_TG_MESSAGES: TgMessage[] = [
  { id: 'm1', nodeId: 'team-chat', text: 'Всем привет! Напоминаю про планёрку в 15:00', senderName: 'Alex', sentAt: new Date(Date.now() - 3600e3).toISOString(), outgoing: false },
  { id: 'm2', nodeId: 'team-chat', text: 'Отмашку клипа NEON выложил в таблицу «Проекты»', senderName: 'Maria', sentAt: new Date(Date.now() - 1800e3).toISOString(), outgoing: false },
  { id: 'm3', nodeId: 'team-chat', text: 'Принято 👍', senderName: 'Alex', sentAt: new Date(Date.now() - 900e3).toISOString(), outgoing: true },
];

export const NODE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#ef4444', '#64748b'];
