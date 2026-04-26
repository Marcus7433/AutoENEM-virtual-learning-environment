import { Calendar, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { totalColor } from '../../utils/scoreColors';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function EssayCard({ essay, onDelete, onClick }) {
  const { topic, final_score, image_signed_url, created_at } = essay;
  const scoreColor = totalColor(final_score);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className="flex h-52 cursor-pointer flex-col rounded-2xl bg-white p-4 shadow-md transition hover:shadow-lg dark:bg-slate-900 dark:shadow-black/40 dark:hover:shadow-black/60"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          {image_signed_url ? (
            <img
              src={image_signed_url}
              alt="redacao"
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
              <FileText size={32} className="text-emerald-500 dark:text-brand" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <p className="line-clamp-3 min-w-0 flex-1 break-words text-base font-semibold leading-snug text-slate-800 dark:text-white">{topic}</p>
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev); }}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Mais opções"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(essay); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex justify-end pb-2">
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Calendar size={12} />
          {formatDate(created_at)}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 dark:border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${scoreColor}`}>Nota total</span>
          <span className={`font-bold ${scoreColor}`}>{final_score}/1000</span>
        </div>
      </div>
    </div>
  );
}

export default EssayCard;
