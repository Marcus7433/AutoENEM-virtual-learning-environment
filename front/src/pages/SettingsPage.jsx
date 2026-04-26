import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import AccountActionsCard from '../components/settings/AccountActionsCard';
import DeleteAccountModal from '../components/settings/DeleteAccountModal';
import ThemeSettingsCard from '../components/settings/ThemeSettingsCard';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';
import { useTheme } from '../hooks/useTheme';
import { API } from '../lib/api';
import { clearEssayDraft } from '../lib/essayDraft';

function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const logout = useLogout();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`${API}/api/auth/account`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        let msg = 'Erro ao deletar conta.';
        try { const d = await res.json(); msg = d.message || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      clearEssayDraft();
      await logout();
    } catch (err) {
      alert(err.message); // eslint-disable-line no-alert
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto mt-6 max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Configurações</h1>
          <p className="mt-1 text-sm text-white/80">Personalize sua experiência no aplicativo</p>
        </div>

        <ThemeSettingsCard theme={theme} onToggle={toggleTheme} />

        {user && (
          <AccountActionsCard
            onLogout={logout}
            onDeleteRequest={() => setShowDeleteConfirm(true)}
          />
        )}
      </section>

      {showDeleteConfirm && (
        <DeleteAccountModal
          isDeleting={isDeleting}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </PageShell>
  );
}

export default SettingsPage;
