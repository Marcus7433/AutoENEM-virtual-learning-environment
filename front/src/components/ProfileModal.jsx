import { FaGithub, FaGoogle } from 'react-icons/fa';

const PROVIDER_ICONS = {
  google: { Icon: FaGoogle, label: 'Conta Google', color: '#000000' },
  github: { Icon: FaGithub, label: 'Conta GitHub', color: '#000000' },
};

function detectProvider(user) {
  if (!user) return null;

  const candidates = [
    user.app_metadata?.provider,
    ...(user.app_metadata?.providers ?? []),
    ...(user.identities ?? []).map((i) => i?.provider),
    user.user_metadata?.iss,
    user.user_metadata?.provider_id,
    user.user_metadata?.avatar_url,
    user.user_metadata?.picture,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const v = String(raw).toLowerCase();
    if (v.includes('google')) return 'google';
    if (v.includes('github')) return 'github';
  }
  return null;
}

function ProfileModal({ user, onClose, onLogout }) {
  const provider = detectProvider(user);
  const providerInfo = provider ? PROVIDER_ICONS[provider] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800">Meu Perfil</h2>
        <p className="mt-1 text-xs text-slate-500">Informacoes da conta logada</p>

        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">E-mail</p>
          <p className="text-sm font-medium text-slate-800">{user.email ?? '-'}</p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <div className="flex items-center">
            {providerInfo && (
              <span title={providerInfo.label} aria-label={providerInfo.label}>
                <providerInfo.Icon size={20} style={{ color: providerInfo.color }} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
