import { useEffect, useState } from 'react';
import EssayCard from '../components/history/EssayCard';
import EssayDetailModal from '../components/history/EssayDetailModal';
import EssaySearchBar from '../components/history/EssaySearchBar';
import DeleteConfirmModal from '../components/landing/DeleteConfirmModal';
import PageShell from '../components/layout/PageShell';
import { API } from '../lib/api';

function EssaysHistoryPage() {
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/essays`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then(setEssays)
      .catch(() => setEssays([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = essays.filter((e) =>
    e.topic.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCardClick = async (essay) => {
    try {
      setLoadingFeedback(true);
      const res = await fetch(`${API}/api/essays/${essay.id}`, { credentials: 'include' });
      if (!res.ok) {
        let msg = 'Erro ao carregar correção.';
        try { const d = await res.json(); msg = d.message || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      setSelectedFeedback(await res.json());
    } catch (err) {
      alert(err.message); // eslint-disable-line no-alert
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`${API}/api/essays/${pendingDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        let msg = 'Erro ao excluir redação.';
        try { const d = await res.json(); msg = d.message || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      setEssays((prev) => prev.filter((e) => e.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      alert(err.message); // eslint-disable-line no-alert
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto mt-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-white">Minhas Redações</h1>
        <p className="mt-1 text-sm text-white/80">
          Visualize e acompanhe todas as suas redações corrigidas
        </p>

        <EssaySearchBar value={search} onChange={(e) => setSearch(e.target.value)} />

        {loading ? (
          <p className="mt-12 text-center text-white/70">Carregando redações...</p>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-white/70">
            {search
              ? 'Nenhuma redação encontrada para essa busca.'
              : 'Você ainda não tem redações corrigidas.'}
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((essay) => (
              <EssayCard
                key={essay.id}
                essay={essay}
                onDelete={setPendingDelete}
                onClick={() => handleCardClick(essay)}
              />
            ))}
          </div>
        )}
      </div>

      <EssayDetailModal
        loading={loadingFeedback}
        data={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
      />

      {pendingDelete && (
        <DeleteConfirmModal
          isDeleting={isDeleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </PageShell>
  );
}

export default EssaysHistoryPage;
