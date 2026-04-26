import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const API = 'http://localhost:3000';

function AuthCallbackPage() {
  useEffect(() => {
    const finalize = async (session) => {
      if (!session) return;

      await fetch(`${API}/api/auth/session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      }).catch(() => {});

      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
      }
      window.close();
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finalize(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        subscription.unsubscribe();
        finalize(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}

export default AuthCallbackPage;
