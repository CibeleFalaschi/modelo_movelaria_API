const contatoModel = require('../models/contatoModel');

async function createContato(data) { return contatoModel.create(data); }
async function getContatoById(id) { return contatoModel.findById(id); }
async function updateContato(id, data) { return contatoModel.update(id, data); }
async function listContatos() { return contatoModel.list(); }

module.exports = { createContato, getContatoById, updateContato, listContatos };
