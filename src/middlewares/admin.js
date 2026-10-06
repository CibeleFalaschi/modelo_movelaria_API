const auth = require('./auth');
const funcionarioModel = require('../models/funcionarioModel');

// Confere no banco (não só no token) que o usuário continua ativo e é administrador.
async function requireAdmin(req, res, next) {
  try {
    const user = await funcionarioModel.findById(req.user && req.user.userId);
    if (!user || !user.Ativo || user.Perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito ao administrador' });
    }
    req.admin = user;
    next();
  } catch (err) { next(err); }
}

// Sem nenhum funcionário cadastrado, o primeiro (que vira admin) pode ser criado sem login.
async function bootstrapOrAdmin(req, res, next) {
  try {
    if (await funcionarioModel.count() === 0) return next();
    auth(req, res, (err) => (err ? next(err) : requireAdmin(req, res, next)));
  } catch (err) { next(err); }
}

module.exports = { requireAdmin, bootstrapOrAdmin };
