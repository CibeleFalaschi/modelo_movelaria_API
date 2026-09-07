const empresaModel = require('../models/empresaModel');
module.exports = { createEmpresa: empresaModel.create, getById: empresaModel.findById, updateEmpresa: empresaModel.update, listEmpresas: empresaModel.list };
