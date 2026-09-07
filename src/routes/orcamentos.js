const express = require('express');
const router = express.Router();
const orcamentoController = require('../controllers/orcamentoController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, orcamentoController.create);
router.get('/', authMiddleware, orcamentoController.list);
router.get('/:id', authMiddleware, orcamentoController.getById);
router.put('/:id', authMiddleware, orcamentoController.update);
router.patch('/:id/status', authMiddleware, orcamentoController.patchStatus);

module.exports = router;
