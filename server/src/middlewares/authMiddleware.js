const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.sb_access_token;

  if (!token) {
    return res.status(401).json({ message: 'Nao autenticado.' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: 'Sessao invalida ou expirada.' });
  }

  req.user = user;
  return next();
};

module.exports = authMiddleware;
