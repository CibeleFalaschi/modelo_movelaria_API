const orcamentoModel = require('../models/orcamentoModel');

async function createOrcamento(data) { return orcamentoModel.create(data); }
async function getOrcamentoById(id) { return orcamentoModel.findById(id); }
async function updateOrcamento(id, data) { return orcamentoModel.update(id, data); }
async function listOrcamentos(limit) { return orcamentoModel.list(limit); }
async function updateStatus(id, statusId) {
  await orcamentoModel.updateStatus(id, statusId);
  return orcamentoModel.findById(id);
}

module.exports = { createOrcamento, getOrcamentoById, updateOrcamento, listOrcamentos, updateStatus };
