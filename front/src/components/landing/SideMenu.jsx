import { BookOpen, FileText, Home, Plus, Settings, Trophy, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { icon: Home,     label: 'Início',        key: 'inicio',    to: '/',          auth: false },
  { icon: FileText, label: 'Redações',      key: 'redacoes',  to: '/historico', auth: true  },
  { icon: BookOpen, label: 'Estudar',       key: 'estudar',   to: null,         auth: false },
  { icon: Trophy,   label: 'Meu Progresso', key: 'progresso', to: null,         auth: false },
];

function SideMenu({ open, activeKey, onClose, onNova, onInicio, onAuthRequired }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const matchedKey = NAV_ITEMS.find((item) => item.to && item.to === pathname)?.key;
  const currentKey = activeKey ?? matchedKey ?? (pathname === '/' ? 'inicio' : null);
  const settingsActive = pathname === '/configuracoes';

  const handleNavClick = (item) => {
    if (item.auth && !user) { onAuthRequired?.(item.to); return; }
    onClose();
    if (item.key === 'inicio') { onInicio?.(); return; }
    if (item.to) { navigate(item.to); return; }
    alert('Em breve...'); // eslint-disable-line no-alert
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Painel lateral */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-52 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-slate-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Topo: X e + */}
        <div className="flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            title="Fechar menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={22} />
          </button>
          <button
            type="button"
            onClick={onNova}
            title="Nova Redação"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md transition-colors hover:bg-brand-hover"
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-0.5 px-3 py-1">
          {NAV_ITEMS.map((item) => {
            const { icon: Icon, label, key } = item;
            const isActive = key === currentKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-brand' : 'text-slate-400 dark:text-slate-500'}
                />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Rodapé: Configurações */}
        <div className="border-t border-slate-100 px-3 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={() => { onClose(); navigate('/configuracoes'); }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              settingsActive
                ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
            }`}
          >
            <Settings size={20} className={settingsActive ? 'text-brand' : 'text-slate-400 dark:text-slate-500'} />
            Configurações
          </button>
        </div>
      </div>
    </>
  );
}

export default SideMenu;
