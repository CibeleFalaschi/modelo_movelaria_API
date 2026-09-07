const funcionarioService = require('../services/funcionarioService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function create(req, res, next) {
  try {
    const { nome, cargo, login, senha } = req.body;

    if (!nome || !login || !senha) {
      return res.status(400).json({
        error: 'nome, login e senha são obrigatórios'
      });
    }

    // Verifica se já existe um usuário com este login
    const existingUser = await funcionarioService.getByLogin(login);

    if (existingUser) {
      return res.status(409).json({
        error: 'Login já está em uso'
      });
    }

    // Verifica se o administrador já existe
    const admin = await funcionarioService.getByLogin('admin');

    // Se o admin já existir, exige JWT para criar novos funcionários
    if (admin) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          error: 'Authorization required to create funcionario'
        });
      }

      const parts = authHeader.split(' ');

      if (
        parts.length !== 2 ||
        !/^Bearer$/i.test(parts[0])
      ) {
        return res.status(401).json({
          error: 'Invalid Authorization header'
        });
      }

      const token = parts[1];

      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (e) {
        return res.status(401).json({
          error: 'Invalid or expired token'
        });
      }
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await funcionarioService.createFuncionario({
      nome,
      cargo,
      login,
      senhaHash
    });

    res.status(201).json(result);

  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const rows = await funcionarioService.listFuncionarios();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    const user = await funcionarioService.getById(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not found'
      });
    }

    res.json(user);

  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const data = req.body;

    if (data.senha) {
      data.senhaHash = await bcrypt.hash(data.senha, 10);
    }

    delete data.senha;

    await funcionarioService.updateFuncionario(id, data);

    res.status(204).end();

  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, update };