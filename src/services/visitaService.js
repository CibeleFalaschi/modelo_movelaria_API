const visitaModel = require('../models/visitaModel');

async function updateStatus(id, statusId) {
  await visitaModel.updateStatus(id, statusId);
  return visitaModel.findById(id);
}

module.exports = {
  createVisita: visitaModel.create,
  getById: visitaModel.findById,
  updateVisita: visitaModel.update,
  listVisitas: visitaModel.list,
  updateStatus
};
