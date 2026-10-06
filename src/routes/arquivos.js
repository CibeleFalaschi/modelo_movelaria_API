const express = require('express');
const router = express.Router();
const arquivoController = require('../controllers/arquivoController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, arquivoController.create);
router.get('/', authMiddleware, arquivoController.list);
router.get('/:id', authMiddleware, arquivoController.getById);
router.get('/orcamento/:id', authMiddleware, arquivoController.listByOrcamento);
router.get('/:id/download', authMiddleware, arquivoController.download);
router.delete('/:id', authMiddleware, arquivoController.remove);

module.exports = router;
