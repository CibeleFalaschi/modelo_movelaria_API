const contatoService = require('../services/contatoService');

async function create(req, res, next) {
  try {
    const { nome, telefone, email, origem } = req.body;
    if (!nome || !telefone || !email) return res.status(400).json({ error: 'nome, telefone e email são obrigatórios' });
    const result = await contatoService.createContato({ nome, telefone, email, origem });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try { const rows = await contatoService.listContatos(); res.json(rows); } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    const c = await contatoService.getContatoById(id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    await contatoService.updateContato(id, req.body);
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { create, list, getById, update };
