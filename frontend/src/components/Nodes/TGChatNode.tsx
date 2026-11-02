import { useEffect, useRef, useState } from 'react';
import { useBoardStore } from '../../stores/boardStore';

/**
 * TG Chat Node (ТЗ п.2.1 №4, п.2.5).
 * MVP: лента сообщений + отправка (имитация дублирования в Telegram через бота).
 * В проде: Telethon/grammY worker на backend, входящие — WebSocket/Webhook.
 */
export function TGChatNode({ nodeId, readOnly }: { nodeId: string; readOnly: boolean }) {
  const messages = useBoardStore((s) => s.tgMessages.filter((m) => m.nodeId === nodeId));
  const send = useBoardStore((s) => s.sendTgMessage);
  const [text, setText] = useState('');
  const [online] = useState(true); // индикатор подключения (в проде — статус бота)
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
        <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {online ? 'Бот @tcs_hub_bot онлайн' : 'Ошибка авторизации бота'}
        <span className="ml-auto">@tcs_team_chat</span>
      </div>

      <div ref={listRef} className="flex-1 space-y-2 overflow-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.outgoing ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                m.outgoing ? 'bg-sky-600 text-white' : 'bg-white text-slate-800'
              }`}
            >
              <div className={`mb-0.5 text-[11px] font-semibold ${m.outgoing ? 'text-sky-200' : 'text-sky-700'}`}>
                {m.senderName}
              </div>
              {m.text}
              {m.mediaUrl && (
                <a href={m.mediaUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[11px] underline">
                  📎 Медиафайл (presigned URL, 1 час)
                </a>
              )}
              <div className={`mt-1 text-right text-[10px] ${m.outgoing ? 'text-sky-200' : 'text-slate-400'}`}>
                {new Date(m.sentAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && <div className="p-4 text-center text-sm text-slate-400">Нет сообщений</div>}
      </div>

      {!readOnly && (
        <form
          className="flex gap-2 border-t border-slate-200 bg-white p-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            send(nodeId, text.trim());
            setText('');
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Сообщение в Telegram…"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
            Отправить ➤
          </button>
        </form>
      )}
    </div>
  );
}
