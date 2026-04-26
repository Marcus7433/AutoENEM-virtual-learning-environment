import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../AuthModal';
import PageHeader from '../landing/PageHeader';
import SideMenu from '../landing/SideMenu';
import ProfileModal from '../ProfileModal';
import { useAuth } from '../../hooks/useAuth';
import { AuthPromptContext } from '../../hooks/useAuthPrompt';
import { useLogout } from '../../hooks/useLogout';
import { clearEssayDraft } from '../../lib/essayDraft';

function PageShell({ children, onNova, onLogout }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalPosition, setAuthModalPosition] = useState('side');
  const [authRedirect, setAuthRedirect] = useState(null);

  const logout = useLogout(() => { setShowProfileModal(false); onLogout?.(); });

  const openAuth = useCallback((position = 'center') => {
    setAuthModalPosition(position);
    setShowAuthModal(true);
  }, []);

  const handleNova = () => {
    setShowSideMenu(false);
    clearEssayDraft();
    if (onNova) onNova();
    else navigate('/');
  };

  return (
    <AuthPromptContext.Provider value={openAuth}>
      <div className="min-h-screen bg-gradient-to-b from-brand from-0% via-brand-soft via-65% to-brand-faint px-4 py-4 font-sans text-slate-900 dark:from-[#111827] dark:via-[#1f2937] dark:to-black dark:text-slate-200 sm:px-6">
        <SideMenu
          open={showSideMenu}
          onClose={() => setShowSideMenu(false)}
          onNova={handleNova}
          onInicio={() => { setShowSideMenu(false); navigate('/'); }}
          onAuthRequired={(redirectTo) => {
            setAuthModalPosition('center');
            setShowAuthModal(true);
            setAuthRedirect(redirectTo ?? null);
          }}
        />

        <PageHeader
          user={user}
          menuOpen={showSideMenu}
          onMenuClick={() => setShowSideMenu((p) => !p)}
          onProfileClick={() => {
            if (user) { setShowProfileModal(true); return; }
            setAuthModalPosition('side');
            setShowAuthModal(true);
          }}
        />

        {children}

        <AuthModal
          open={showAuthModal}
          onClose={() => { setShowAuthModal(false); setAuthRedirect(null); }}
          onSuccess={() => {
            setShowAuthModal(false);
            const redirect = authRedirect;
            setAuthRedirect(null);
            if (redirect) navigate(redirect);
          }}
          position={authModalPosition}
        />

        {showProfileModal && user && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfileModal(false)}
            onLogout={logout}
          />
        )}
      </div>
    </AuthPromptContext.Provider>
  );
}

export default PageShell;
