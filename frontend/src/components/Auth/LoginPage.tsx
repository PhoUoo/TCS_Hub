import { useState } from 'react';
import { TelegramLoginButton } from './TelegramLoginButton';

/** Страница логина: TG Login (рекомендуемый) + Email/пароль (альтернатива, ТЗ п.2.7) */
export function LoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [tab, setTab] = useState<'tg' | 'email'>('tg');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const emailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // в проде POST /api/auth/email -> {accessToken, refreshToken}
    if (email && pass) onAuthenticated();
    else alert('Введите email и пароль (демо: любой непустой)');
  };

  if (tab === 'email') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
        <form onSubmit={emailLogin} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-xl">
          <h1 className="text-lg font-extrabold text-slate-900">Вход по Email</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@techcrew.studio"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Пароль"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <button className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Войти
          </button>
          <button type="button" onClick={() => setTab('tg')} className="w-full text-center text-xs text-sky-600 underline">
            ← Через Telegram
          </button>
        </form>
      </div>
    );
  }

  return <TelegramLoginButton onDemoLogin={onAuthenticated} />;
}
