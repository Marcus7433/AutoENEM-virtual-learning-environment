import { X } from 'lucide-react';
import { useState } from 'react';
import { FaGithub, FaGoogle, FaUser } from 'react-icons/fa';
import { FiLock, FiMail } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { API } from '../lib/api';

function AuthModal({ open, initialMode = 'login', position = 'side', onClose, onSuccess }) {
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const name = String(formData.get('name') ?? '');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = mode === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || 'Erro ao autenticar.';
        setError(msg.toLowerCase().includes('rate limit')
          ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
          : msg);
        setLoading(false);
        return;
      }

      await refreshUser();
      setLoading(false);
      onSuccess?.();
      onClose?.();
    } catch {
      setError('Erro de conexao. Tente novamente.');
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError('');
    setLoading(true);

    // OAuth URL deve ser gerado no cliente para manter o code_verifier PKCE no localStorage
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
      return;
    }

    const width = 500;
    const height = 650;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      data.url,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,resizable=yes`,
    );

    if (!popup) {
      setError('Popup bloqueado pelo navegador. Permita popups para este site e tente novamente.');
      setLoading(false);
      return;
    }

    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'AUTH_SUCCESS') return;
      window.removeEventListener('message', onMessage);
      clearInterval(pollTimer);
      popup.close();
      setLoading(false);
      onSuccess?.();
      onClose?.();
    };

    window.addEventListener('message', onMessage);

    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener('message', onMessage);
        setLoading(false);
      }
    }, 500);
  };

  const isCentered = position === 'center';

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-black/20 px-4 backdrop-blur-sm ${
        isCentered ? 'items-center justify-center' : 'items-start justify-end pt-12'
      }`}
    >
      <div className="w-full max-w-[330px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-brand px-4 py-3 text-white">
          <h2 className="text-sm font-semibold tracking-tight">
            {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </h2>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-700">Nome Completo</label>
              <div className="relative">
                <FaUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  name="name"
                  placeholder="Seu nome completo"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">E-mail</label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                required
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">Senha</label>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                required
                name="password"
                type="password"
                placeholder="********"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Carregando...' : 'Criar conta'}
            </button>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          {mode === 'login' && (
            <>
              <p className="text-right text-[11px] text-emerald-700">Esqueci a senha?</p>
              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {loading ? 'Carregando...' : 'Entrar'}
              </button>
            </>
          )}

          <p className="text-center text-[11px] text-slate-600">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>

          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-slate-200" />
            <p className="text-[11px] text-slate-500">ou continue com</p>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleOAuth('google')}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <FaGoogle className="h-3.5 w-3.5 text-black" />
            Google
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleOAuth('github')}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <FaGithub className="h-3.5 w-3.5 text-slate-800" />
            </span>
            GitHub
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
