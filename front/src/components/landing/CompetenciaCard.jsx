import { CheckCircle } from 'lucide-react';
import { compBadge, compBar, compColor } from '../../utils/scoreColors';

function CompetenciaCard({ numero, nome, nota, feedbackText }) {
  const pct = Math.round((nota / 200) * 100);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/60">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${compBadge(nota)}`}>
          Competência {numero}
        </span>
        <span className={`text-xs font-semibold ${compColor(nota)}`}>
          {nota}/200
        </span>
      </div>

      <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200">{nome}</p>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${compBar(nota)}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {feedbackText && (
        <div className="mt-2.5 flex items-start gap-2">
          <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-500 dark:text-brand" />
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{feedbackText}</p>
        </div>
      )}
    </div>
  );
}

export default CompetenciaCard;
