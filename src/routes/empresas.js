const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const authMiddleware = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/admin');

// Dados da empresa saem impressos no contrato: só o administrador cria ou altera.
router.post('/', authMiddleware, requireAdmin, empresaController.create);
router.get('/', authMiddleware, empresaController.list);
router.get('/:id', authMiddleware, empresaController.getById);
router.put('/:id', authMiddleware, requireAdmin, empresaController.update);

module.exports = router;
