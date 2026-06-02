import { totalColor } from '../../utils/scoreColors';
import OverallChart from './OverallChart';

function OverallScoreCard({ avgScore, monthlyData }) {
  return (
    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Nota Média Geral
      </p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-4xl font-bold ${totalColor(avgScore)}`}>{avgScore}</span>
        <span className="text-sm text-slate-400">/1000</span>
      </div>
      <div className="mt-4">
        <OverallChart monthlyData={monthlyData} avgScore={avgScore} />
      </div>
    </div>
  );
}

export default OverallScoreCard;
