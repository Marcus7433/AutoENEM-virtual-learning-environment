import { Moon, Sun } from 'lucide-react';

function ThemeSettingsCard({ theme, onToggle }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-md dark:border-white/10 dark:bg-slate-900/70">
      <h2 className="text-base font-semibold text-slate-800 dark:text-white">Aparência</h2>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            {theme === 'dark' ? (
              <Moon size={20} className="text-brand" />
            ) : (
              <Sun size={20} className="text-brand" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? 'Tema escuro ativado' : 'Tema claro ativado'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={theme === 'dark'}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            theme === 'dark' ? 'bg-brand' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default ThemeSettingsCard;
