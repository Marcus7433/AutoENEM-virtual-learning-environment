import { AlertCircle, Sparkles } from 'lucide-react';

const COMP_SHORT_NAMES = [
  'Domínio da escrita formal',
  'Compreensão da proposta',
  'Conhecimento sociocultural',
  'Coesão e coerência',
  'Proposta de intervenção',
];

function AlertBanners({ monthlyData, competencies }) {
  const len = monthlyData.length;

  const improvement = len >= 2 ? monthlyData[len - 1].avg - monthlyData[len - 2].avg : 0;
  const showSuccess = improvement > 0;

  const weakest = competencies.length > 0
    ? competencies.reduce((min, c) => (c.avg < min.avg ? c : min), competencies[0])
    : null;

  if (!showSuccess && !weakest) return null;

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {showSuccess && (
        <div className="flex items-start gap-3 rounded-2xl bg-brand p-4 text-white">
          <Sparkles size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Parabéns pelo progresso!</p>
            <p className="mt-0.5 text-sm text-white/90">
              Você melhorou <strong>{improvement} pontos</strong> na sua média geral este mês. Continue assim!
            </p>
          </div>
        </div>
      )}

      {weakest && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-500/30 dark:bg-slate-900">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">Ponto de Atenção</p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
              A <strong>Competência {weakest.numero}</strong> precisa de mais atenção —{' '}
              {COMP_SHORT_NAMES[weakest.numero - 1]}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlertBanners;
