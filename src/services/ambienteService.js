const ambienteModel = require('../models/ambienteModel');
module.exports = { createAmbiente: ambienteModel.create, getById: ambienteModel.findById, updateAmbiente: ambienteModel.update, deleteAmbiente: ambienteModel.remove, listByOrcamento: ambienteModel.listByOrcamento };
