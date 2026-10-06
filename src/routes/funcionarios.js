const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const authMiddleware = require('../middlewares/auth');
const { requireAdmin, bootstrapOrAdmin } = require('../middlewares/admin');

router.post('/', bootstrapOrAdmin, funcionarioController.create);
router.get('/', authMiddleware, funcionarioController.list);
router.get('/:id', authMiddleware, funcionarioController.getById);
router.put('/:id', authMiddleware, requireAdmin, funcionarioController.update);
router.delete('/:id', authMiddleware, requireAdmin, funcionarioController.remove);

module.exports = router;
