import { Award, Calendar, FileText, Target } from 'lucide-react';
import StatsCard from './StatsCard';

const STATS_CONFIG = [
  { key: 'total',      label: 'Redações Corrigidas',    icon: FileText, iconClass: 'text-blue-400',   valueClass: 'text-blue-500'   },
  { key: 'avgScore',   label: 'Nota Média Geral',        icon: Target,   iconClass: 'text-brand',       valueClass: 'text-brand'       },
  { key: 'bestScore',  label: 'Melhor Nota Alcançada',   icon: Award,    iconClass: 'text-amber-400',   valueClass: 'text-amber-500'  },
  { key: 'thisMonth',  label: 'Redações este Mês',       icon: Calendar, iconClass: 'text-purple-400',  valueClass: 'text-purple-500' },
];

function StatsGrid({ data }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS_CONFIG.map(({ key, label, icon, iconClass, valueClass }) => (
        <StatsCard
          key={key}
          icon={icon}
          iconClass={iconClass}
          value={data[key]}
          label={label}
          valueClass={valueClass}
        />
      ))}
    </div>
  );
}

export default StatsGrid;
