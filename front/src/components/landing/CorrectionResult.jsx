import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { COMPETENCIAS, getDica, totalColor } from '../../utils/scoreColors';
import CompetenciaCard from './CompetenciaCard';
import EssayPDF from '../EssayPDF';

function CorrectionResult({ feedback, resultRef, topic, content }) {
  const nota = feedback.nota ?? 0;

  return (
    <section
      ref={resultRef}
      className="mx-auto mt-6 max-w-2xl rounded-2xl bg-white p-6 shadow-md dark:bg-slate-900 dark:shadow-black/40"
    >
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resultado da Correção</p>
        <p className={`mt-1 text-7xl font-bold ${totalColor(nota)}`}>{nota}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          de 1000 pontos ({Math.round((nota / 1000) * 100)}%)
        </p>
      </div>

      <h3 className="mt-6 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Análise por Competência</h3>

      <div className="space-y-3">
        {COMPETENCIAS.map((nome, i) => {
          const n = i + 1;
          return (
            <CompetenciaCard
              key={n}
              numero={n}
              nome={nome}
              nota={feedback.feedback?.[`c${n}_nota`] ?? 0}
              feedbackText={feedback.feedback?.[`c${n}_feedback`] ?? ''}
            />
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold">Dica:</span> {getDica(nota)}
        </p>
      </div>

      {topic && content && (
        <div className="mt-4 flex justify-end">
          <PDFDownloadLink
            document={
              <EssayPDF
                topic={topic}
                content={content}
                nota={nota}
                feedback={feedback.feedback ?? {}}
              />
            }
            fileName={`correcao-${topic.slice(0, 40).replace(/\s+/g, '-')}.pdf`}
          >
            {({ loading }) => (
              <button
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow transition hover:opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                <Download size={15} />
                {loading ? 'Gerando PDF...' : 'Exportar PDF'}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </section>
  );
}

export default CorrectionResult;
