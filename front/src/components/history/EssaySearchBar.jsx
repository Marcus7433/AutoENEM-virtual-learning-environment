import { Filter } from 'lucide-react';

function EssaySearchBar({ value, onChange }) {
  return (
    <div className="mt-6 flex gap-2">
      <input
        value={value}
        onChange={onChange}
        placeholder="Buscar por tema..."
        className="flex-1 rounded-xl border border-white/40 bg-white/90 px-4 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400"
      />
      <button
        type="button"
        onClick={() => alert('Em breve...')} // eslint-disable-line no-alert
        className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
      >
        <Filter size={15} />
        Filtrar
      </button>
    </div>
  );
}

export default EssaySearchBar;
