import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../lib/api';
import { clearEssayDraft } from '../lib/essayDraft';
import { useAuth } from './useAuth';

export function useLogout(onBefore) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const onBeforeRef = useRef(onBefore);
  useEffect(() => { onBeforeRef.current = onBefore; });

  return useCallback(async () => {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    clearEssayDraft();
    onBeforeRef.current?.();
    await refreshUser();
    navigate('/', { replace: true });
  }, [navigate, refreshUser]);
}
