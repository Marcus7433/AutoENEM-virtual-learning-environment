const supabase = require('../config/supabase');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

function setTokenCookies(res, session) {
  res.cookie('sb_access_token', session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: (session.expires_in ?? 3600) * 1000,
  });
  res.cookie('sb_refresh_token', session.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha obrigatorios.' });
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ message: error.message });

      setTokenCookies(res, data.session);
      return res.json({ user: data.user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async signup(req, res) {
    try {
      const { email, password, name } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha obrigatorios.' });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name || '' } },
      });
      if (error) return res.status(400).json({ message: error.message });

      if (data.session) setTokenCookies(res, data.session);
      return res.json({ user: data.user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Recebe o token do OAuth (trocado pelo cliente via PKCE) e define cookies
  static async setSession(req, res) {
    try {
      const { access_token, refresh_token } = req.body || {};
      if (!access_token) return res.status(400).json({ message: 'Token ausente.' });

      const { data: { user }, error } = await supabase.auth.getUser(access_token);
      if (error || !user) return res.status(401).json({ message: 'Token invalido.' });

      setTokenCookies(res, { access_token, refresh_token, expires_in: 3600 });
      return res.json({ user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async me(req, res) {
    return res.json({ user: req.user });
  }

  static async logout(req, res) {
    res.clearCookie('sb_access_token');
    res.clearCookie('sb_refresh_token');
    return res.json({ message: 'Logout realizado.' });
  }

  static async deleteAccount(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Nao autenticado.' });

      const { data: files } = await supabase.storage
        .from('essay-images')
        .list(userId, { limit: 1000 });
      if (files?.length) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from('essay-images').remove(paths);
      }

      await supabase.from('essays').delete().eq('user_id', userId);

      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) return res.status(400).json({ message: error.message });

      res.clearCookie('sb_access_token');
      res.clearCookie('sb_refresh_token');
      return res.json({ message: 'Conta deletada.' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
