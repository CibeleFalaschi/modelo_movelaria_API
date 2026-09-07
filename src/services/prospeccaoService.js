const prospeccaoModel = require('../models/prospeccaoModel');
const historicoModel = require('../models/historicoProspeccaoModel');
module.exports = { createProspeccao: prospeccaoModel.create, getById: prospeccaoModel.findById, updateProspeccao: prospeccaoModel.update, listProspeccoes: prospeccaoModel.list, createHistorico: historicoModel.create, listHistorico: historicoModel.listByProspeccao };
