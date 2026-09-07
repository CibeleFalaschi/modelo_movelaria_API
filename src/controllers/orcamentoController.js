const orcamentoService = require('../services/orcamentoService');
const statusModel = require('../models/statusModel');

async function create(req, res, next) {
  try {
    const payload = req.body;
    if (!payload.IDContato || !payload.IDStatusOrcamento || !payload.IDFuncionario || !payload.NumeroOrcamento || payload.Valor === undefined || !payload.DataSolicitacao) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const result = await orcamentoService.createOrcamento(payload);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const limit = req.query.limit || 100;
    const rows = await orcamentoService.listOrcamentos(limit);
    res.json(rows);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    const o = await orcamentoService.getOrcamentoById(id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    res.json(o);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    await orcamentoService.updateOrcamento(id, req.body);
    res.status(204).end();
  } catch (err) { next(err); }
}

async function patchStatus(req, res, next) {
  try {
    const id = req.params.id;
    const { IDStatusOrcamento } = req.body;
    if (!Number.isInteger(Number(IDStatusOrcamento)) || Number(IDStatusOrcamento) < 1) {
      return res.status(400).json({ error: 'IDStatusOrcamento deve ser um número inteiro positivo' });
    }
    if (!await statusModel.exists('orcamentos', Number(IDStatusOrcamento))) {
      return res.status(400).json({ error: 'Status de orçamento inválido' });
    }
    const updated = await orcamentoService.updateStatus(id, Number(IDStatusOrcamento));
    if (!updated) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(updated);
  } catch (err) { next(err); }
}

module.exports = { create, list, getById, update, patchStatus };
