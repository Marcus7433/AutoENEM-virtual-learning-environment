import { X } from 'lucide-react';
import CorrectionResult from '../landing/CorrectionResult';

function EssayDetailModal({ loading, data, onClose }) {
  if (!loading && !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-4 right-0 z-10 rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/30"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl bg-white p-12 dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400">Carregando correção...</p>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-2 max-w-2xl rounded-2xl bg-white p-6 shadow-md dark:bg-slate-900 dark:shadow-black/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tema</p>
              <p className="mt-1 text-base font-semibold text-slate-800 dark:text-white">{data.topic}</p>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Redação</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{data.content}</p>
            </div>

            <CorrectionResult feedback={data} />
          </>
        )}
      </div>
    </div>
  );
}

export default EssayDetailModal;
