const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const funcionarioModel = require('../models/funcionarioModel');

async function login(req, res, next) {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) return res.status(400).json({ error: 'login and senha required' });
    const user = await funcionarioModel.findByLogin(login);
    if (!user || !user.senhaHash || !user.Ativo) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(senha, user.senhaHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const payload = { userId: user.ID, nome: user.nome, perfil: user.Perfil };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await funcionarioModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };
