const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const authMiddleware = require('../middlewares/auth');

router.post('/', funcionarioController.create);
router.get('/', authMiddleware, funcionarioController.list);
router.get('/:id', authMiddleware, funcionarioController.getById);
router.put('/:id', authMiddleware, funcionarioController.update);

module.exports = router;
