const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, projetoController.create);
router.get('/', authMiddleware, projetoController.list);
router.get('/:id', authMiddleware, projetoController.getById);
router.put('/:id', authMiddleware, projetoController.update);
router.patch('/:id/status', authMiddleware, projetoController.patchStatus);

module.exports = router;
