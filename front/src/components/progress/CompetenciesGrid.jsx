import CompetencyProgressCard from './CompetencyProgressCard';

function CompetenciesGrid({ competencies, monthlyData }) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-white">Competências Individuais</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {competencies.map((c) => (
          <CompetencyProgressCard
            key={c.numero}
            numero={c.numero}
            avg={c.avg}
            trend={c.trend}
            monthlyData={monthlyData}
          />
        ))}
      </div>
    </div>
  );
}

export default CompetenciesGrid;
