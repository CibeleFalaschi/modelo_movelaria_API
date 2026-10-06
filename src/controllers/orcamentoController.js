const orcamentoService = require('../services/orcamentoService');
const statusModel = require('../models/statusModel');
const arquivoModel = require('../models/arquivoModel');
const fs = require('fs');
const path = require('path');
const { uploadRoot } = require('../middlewares/upload');

async function create(req, res, next) {
  try {
    const result = await orcamentoService.createOrcamento(req.body);
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

async function uploadArquivo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const orcamento = await orcamentoService.getOrcamentoById(req.params.id);
    if (!orcamento) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    const tipo = ['briefing_inspiracao', 'projeto_tecnico'].includes(req.body.tipo) ? req.body.tipo : 'briefing_inspiracao';
    // multer entrega o nome original em latin1; converte para UTF-8 (acentos).
    const nome = Buffer.from(req.file.originalname, 'latin1').toString('utf8').slice(0, 255);
    const result = await arquivoModel.create({
      IDOrcamento: Number(req.params.id), NomeArquivo: nome,
      Caminho: path.relative(uploadRoot, req.file.path).split(path.sep).join('/'), Tipo: tipo
    });
    res.status(201).json({ id: result.ID, nome, tipo });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
}

async function listArquivos(req, res, next) {
  try {
    const rows = await arquivoModel.listByOrcamento(req.params.id);
    res.json(rows.map((a) => ({ id: a.ID, nome: a.NomeArquivo, tipo: a.Tipo, dataUpload: a.DataUpload })));
  } catch (err) { next(err); }
}

module.exports = { create, list, getById, update, patchStatus, uploadArquivo, listArquivos };
