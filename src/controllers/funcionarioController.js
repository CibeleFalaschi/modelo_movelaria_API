const bcrypt = require('bcrypt');
const funcionarioModel = require('../models/funcionarioModel');

const PERFIS = ['admin', 'funcionario'];

function erro(status, message) {
  return Object.assign(new Error(message), { status });
}

function validarSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 6) throw erro(400, 'A senha deve ter ao menos 6 caracteres');
}

function validarLogin(login) {
  if (!/^[A-Za-z0-9._-]{3,50}$/.test(login || '')) throw erro(400, 'Login deve ter de 3 a 50 caracteres (letras, números, ponto, hífen ou _)');
}

async function create(req, res, next) {
  try {
    const { nome, cargo, login, senha } = req.body;
    if (!nome || !login || !senha) throw erro(400, 'nome, login e senha são obrigatórios');
    validarLogin(login);
    validarSenha(senha);
    if (await funcionarioModel.findByLogin(login)) throw erro(409, 'Login já está em uso');

    // O primeiro funcionário do sistema é sempre administrador.
    const primeiro = await funcionarioModel.count() === 0;
    const perfil = primeiro ? 'admin' : (req.body.perfil || 'funcionario');
    if (!PERFIS.includes(perfil)) throw erro(400, 'Perfil inválido');

    const result = await funcionarioModel.create({ nome, cargo, login, senhaHash: await bcrypt.hash(senha, 10), Perfil: perfil });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try { res.json(await funcionarioModel.list()); } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const user = await funcionarioModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) { next(err); }
}

// Nunca deixa o sistema sem administrador ativo, nem o admin se bloquear.
async function protegerAdmin(alvo, novo, adminLogado) {
  const perdeAdmin = alvo.Perfil === 'admin' && alvo.Ativo
    && ((novo.Perfil !== undefined && novo.Perfil !== 'admin') || (novo.Ativo !== undefined && !novo.Ativo));
  if (!perdeAdmin) return;
  if (alvo.ID === adminLogado.ID) throw erro(400, 'Você não pode remover seu próprio acesso de administrador');
  if (await funcionarioModel.countAdminsAtivos() <= 1) throw erro(400, 'É preciso manter ao menos um administrador ativo');
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const alvo = await funcionarioModel.findById(id);
    if (!alvo) throw erro(404, 'Funcionário não encontrado');

    const { nome, cargo, login, senha, perfil, ativo } = req.body;
    const data = {};
    if (nome !== undefined) { if (!String(nome).trim()) throw erro(400, 'Nome é obrigatório'); data.nome = String(nome).trim(); }
    if (cargo !== undefined) data.cargo = cargo || null;
    if (login !== undefined && login !== alvo.login) {
      validarLogin(login);
      if (await funcionarioModel.findByLogin(login)) throw erro(409, 'Login já está em uso');
      data.login = login;
    }
    if (perfil !== undefined) {
      if (!PERFIS.includes(perfil)) throw erro(400, 'Perfil inválido');
      data.Perfil = perfil;
    }
    if (ativo !== undefined) data.Ativo = ativo ? 1 : 0;
    if (senha) { validarSenha(senha); data.senhaHash = await bcrypt.hash(senha, 10); }

    await protegerAdmin(alvo, data, req.admin);
    await funcionarioModel.update(id, data);
    res.status(204).end();
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const alvo = await funcionarioModel.findById(id);
    if (!alvo) throw erro(404, 'Funcionário não encontrado');
    if (alvo.ID === req.admin.ID) throw erro(400, 'Você não pode excluir a si mesmo');
    await protegerAdmin(alvo, { Ativo: 0 }, req.admin);
    try {
      await funcionarioModel.remove(id);
    } catch (e) {
      if (e.code === 'ER_ROW_IS_REFERENCED_2') {
        throw erro(409, 'Este funcionário possui orçamentos ou prospecções vinculados e não pode ser excluído. Deixe-o inativo.');
      }
      throw e;
    }
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { create, list, getById, update, remove };
