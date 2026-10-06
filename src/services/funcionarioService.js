const funcionarioModel = require('../models/funcionarioModel');

async function getByLogin(login) {
  return funcionarioModel.findByLogin(login);
}

async function count() {
  return funcionarioModel.count();
}

async function getById(id) {
  return funcionarioModel.findById(id);
}

async function createFuncionario(data) {
  return funcionarioModel.create(data);
}

async function updateFuncionario(id, data) {
  return funcionarioModel.update(id, data);
}

async function listFuncionarios() {
  return funcionarioModel.list();
}

module.exports = {
  count,
  getByLogin,
  getById,
  createFuncionario,
  updateFuncionario,
  listFuncionarios
};