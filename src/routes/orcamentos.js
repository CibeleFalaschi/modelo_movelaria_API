const express = require('express');
const router = express.Router();
const orcamentoController = require('../controllers/orcamentoController');
const authMiddleware = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.post('/', authMiddleware, orcamentoController.create);
router.get('/', authMiddleware, orcamentoController.list);
router.get('/:id', authMiddleware, orcamentoController.getById);
router.put('/:id', authMiddleware, orcamentoController.update);
router.post('/:id/arquivos', authMiddleware, upload.single('arquivo'), orcamentoController.uploadArquivo);
router.get('/:id/arquivos', authMiddleware, orcamentoController.listArquivos);
router.patch('/:id/status', authMiddleware, orcamentoController.patchStatus);

module.exports = router;
