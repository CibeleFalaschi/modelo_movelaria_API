const arquivoModel = require('../models/arquivoModel');
module.exports = { createArquivo: arquivoModel.create, getById: arquivoModel.findById, listArquivos: arquivoModel.list, listByOrcamento: arquivoModel.listByOrcamento, deleteArquivo: arquivoModel.remove };
