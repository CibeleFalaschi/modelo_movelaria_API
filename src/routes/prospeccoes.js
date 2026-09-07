const express = require('express');
const router = express.Router();
const prospeccaoController = require('../controllers/prospeccaoController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, prospeccaoController.create);
router.get('/', authMiddleware, prospeccaoController.list);
router.get('/:id', authMiddleware, prospeccaoController.getById);
router.put('/:id', authMiddleware, prospeccaoController.update);
router.post('/:id/historico', authMiddleware, prospeccaoController.createHistorico);
router.get('/:id/historico', authMiddleware, prospeccaoController.listHistorico);

module.exports = router;
