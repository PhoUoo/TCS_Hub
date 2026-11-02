import { useBoardStore } from '../../stores/boardStore';

/**
 * Telegram Login Widget (ТЗ п.2.7).
 * В проде: бэкенд проверяет hash initData (HMAC с BOT_TOKEN) и выдаёт JWT
 * (access 15 мин + refresh 30 дней). Здесь — демо-режим для локальной разработки.
 */
export function TelegramLoginButton({ onDemoLogin }: { onDemoLogin?: () => void }) {
  const switchUser = useBoardStore((s) => s.switchUser);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-1 text-center text-3xl">🗂️</div>
        <h1 className="text-center text-xl font-extrabold text-slate-900">TCS Hub</h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          Единое пространство Tech Crew Studio · внутреннее приложение
        </p>

        <button
          onClick={() => {
            // production: window.location = TG auth url; backend /api/auth/telegram проверяет initData
            if (onDemoLogin) onDemoLogin();
            else alert('Демо-режим: выберите пользователя ниже');
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2AABEE] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d94d1]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.93c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
          </svg>
          Login with Telegram
        </button>

        <div className="my-4 flex items-center gap-3 text-[11px] uppercase text-slate-400">
          <div className="h-px flex-1 bg-slate-200" /> или демо-вход <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-2">
          {useBoardStore.getState().users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                switchUser(u.id);
                onDemoLogin?.();
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: u.color }}
              >
                {u.username.slice(0, 1)}
              </span>
              <span>
                <span className="font-semibold text-slate-800">{u.username}</span>
                <span className="block text-[11px] text-slate-400">войти как этот пользователь</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
