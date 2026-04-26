import { Menu, User, X } from 'lucide-react';

function PageHeader({ user, menuOpen, onMenuClick, onProfileClick }) {
  return (
    <>
      {/* Botão fixo — muda de Menu para X com animação */}
      <button
        type="button"
        onClick={onMenuClick}
        className="fixed left-4 top-4 z-50 h-10 w-10 rounded-full bg-white/90 text-brand shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 dark:bg-slate-800/90 dark:text-brand dark:shadow-black/40"
      >
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            menuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        >
          <Menu size={20} />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        >
          <X size={20} />
        </span>
      </button>

      {/* Header — espaçador mantém o profile alinhado à direita */}
      <header className="flex w-full items-center justify-between">
        <div className="h-10 w-10" />
        <button
          type="button"
          onClick={onProfileClick}
          className="flex items-center gap-1.5 rounded-full bg-green-50/90 px-4 py-2 text-xs font-medium text-brand shadow-sm transition-colors hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-700"
        >
          <User size={14} className="text-brand" />
          {user ? 'Meu Perfil' : 'Fazer login'}
        </button>
      </header>
    </>
  );
}

export default PageHeader;
