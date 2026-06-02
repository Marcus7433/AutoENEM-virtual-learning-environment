import { TrendingDown, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compColor } from '../../utils/scoreColors';

const COMP_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const COMP_NAMES = [
  'Domínio da escrita formal',
  'Compreensão da proposta',
  'Conhecimento sociocultural',
  'Coesão e coerência',
  'Proposta de intervenção',
];

function CompetencyProgressCard({ numero, avg, trend, monthlyData }) {
  const color = COMP_COLORS[numero - 1];
  const name = COMP_NAMES[numero - 1];
  const pct = Math.round((avg / 200) * 100);
  const dataKey = `c${numero}`;

  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Competência {numero}: {name}
      </p>

      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${compColor(avg)}`}>{avg}</span>
          <span className="text-sm text-slate-400">/200</span>
        </div>

        {trend !== 0 && (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend > 0
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {trend > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend > 0 ? '+' : ''}{trend}
          </div>
        )}
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {monthlyData.length >= 2 && (
        <div className="mt-3">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <XAxis dataKey="month" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} tick={false} height={1} />
              <YAxis axisLine={{ stroke: '#e5e7eb' }} tickLine={false} tick={false} width={1} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', fontSize: 11 }}
                formatter={(value) => [`${value} pts`, `C${numero}`]}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={1.5}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default CompetencyProgressCard;
