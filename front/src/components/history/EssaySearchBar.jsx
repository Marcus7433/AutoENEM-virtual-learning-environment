import { Filter, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const FILTER_OPTIONS = [
  { group: 'Data',  groupKey: 'date',  value: 'date-desc',  label: 'Redação mais nova'  },
  { group: 'Data',  groupKey: 'date',  value: 'date-asc',   label: 'Redação mais antiga' },
  { group: 'Nota',  groupKey: 'score', value: 'score-desc', label: 'Melhor Nota'         },
  { group: 'Nota',  groupKey: 'score', value: 'score-asc',  label: 'Pior Nota'           },
];

const GROUPS = ['Data', 'Nota'];

function EssaySearchBar({ value, onChange, sort, onSortChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filterCount = Object.values(sort).filter(Boolean).length;
  const hasFilter = filterCount > 0;

  const handleCheck = (groupKey, optValue) => {
    const current = sort[groupKey];
    onSortChange({ ...sort, [groupKey]: current === optValue ? null : optValue });
  };

  const handleClear = () => { onSortChange({ date: null, score: null }); setOpen(false); };

  return (
    <div className="mt-6 flex gap-2">
      <input
        value={value}
        onChange={onChange}
        placeholder="Buscar por tema..."
        className="flex-1 rounded-xl border border-white/40 bg-white/90 px-4 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition ${
            hasFilter
              ? 'bg-brand text-white hover:bg-brand-hover'
              : 'bg-white/90 text-slate-700 hover:bg-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Filter size={15} />
          Filtrar
          {hasFilter && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
              {filterCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-white/10">
            {GROUPS.map((group) => {
              const opts = FILTER_OPTIONS.filter((o) => o.group === group);
              const { groupKey } = opts[0];
              return (
                <div key={group} className="mb-3 last:mb-0">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {group}
                  </p>
                  <div className="space-y-1.5">
                    {opts.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        <input
                          type="checkbox"
                          checked={sort[groupKey] === opt.value}
                          onChange={() => handleCheck(groupKey, opt.value)}
                          className="h-3.5 w-3.5 accent-brand"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-white/10">
              <button
                type="button"
                onClick={handleClear}
                disabled={!hasFilter}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/5"
              >
                <X size={12} />
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EssaySearchBar;
