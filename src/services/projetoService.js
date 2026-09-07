const projetoModel = require('../models/projetoModel');

async function updateStatus(id, statusId) {
  await projetoModel.updateStatus(id, statusId);
  return projetoModel.findById(id);
}

module.exports = {
  createProjeto: projetoModel.create,
  getById: projetoModel.findById,
  updateProjeto: projetoModel.update,
  listProjetos: projetoModel.list,
  updateStatus
};
