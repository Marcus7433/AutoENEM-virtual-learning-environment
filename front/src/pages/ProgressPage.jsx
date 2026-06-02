import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import AlertBanners from '../components/progress/AlertBanners';
import CompetenciesGrid from '../components/progress/CompetenciesGrid';
import OverallScoreCard from '../components/progress/OverallScoreCard';
import StatsGrid from '../components/progress/StatsGrid';
import PageShell from '../components/layout/PageShell';
import { API } from '../lib/api';

function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/essays/progress`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <div className="mx-auto mt-6 max-w-5xl pb-12">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-white" />
          <div>
            <h1 className="text-3xl font-bold text-white">Meu Progresso</h1>
            <p className="mt-0.5 text-sm text-white/80">
              Acompanhe sua evolução nas competências do ENEM
            </p>
          </div>
        </div>

        {loading && (
          <p className="mt-12 text-center text-white/70">Carregando progresso...</p>
        )}

        {!loading && !data && (
          <p className="mt-12 text-center text-white/70">
            Não foi possível carregar os dados. Tente novamente mais tarde.
          </p>
        )}

        {!loading && data && data.total === 0 && (
          <div className="mt-12 rounded-2xl bg-white/20 p-10 text-center dark:bg-white/5">
            <p className="text-lg font-semibold text-white">Nenhuma redação corrigida ainda</p>
            <p className="mt-1 text-sm text-white/70">
              Corrija sua primeira redação para começar a acompanhar seu progresso.
            </p>
          </div>
        )}

        {!loading && data && data.total > 0 && (
          <>
            <StatsGrid data={data} />
            <AlertBanners monthlyData={data.monthlyData} competencies={data.competencies} />
            <OverallScoreCard avgScore={data.avgScore} monthlyData={data.monthlyData} />
            <CompetenciesGrid competencies={data.competencies} monthlyData={data.monthlyData} />
          </>
        )}
      </div>
    </PageShell>
  );
}

export default ProgressPage;
