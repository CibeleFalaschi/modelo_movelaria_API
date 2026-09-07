const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, empresaController.create);
router.get('/', authMiddleware, empresaController.list);
router.get('/:id', authMiddleware, empresaController.getById);
router.put('/:id', authMiddleware, empresaController.update);

module.exports = router;
