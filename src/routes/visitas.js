const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, visitaController.create);
router.get('/', authMiddleware, visitaController.list);
router.get('/:id', authMiddleware, visitaController.getById);
router.put('/:id', authMiddleware, visitaController.update);
router.patch('/:id/status', authMiddleware, visitaController.patchStatus);

module.exports = router;
