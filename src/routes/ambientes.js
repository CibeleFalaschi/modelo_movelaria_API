const express = require('express');
const router = express.Router();
const ambienteController = require('../controllers/ambienteController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, ambienteController.create);
router.get('/orcamento/:id', authMiddleware, ambienteController.listByOrcamento);
router.put('/:id', authMiddleware, ambienteController.update);
router.delete('/:id', authMiddleware, ambienteController.remove);

module.exports = router;
