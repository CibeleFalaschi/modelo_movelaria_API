const express = require('express');
const router = express.Router();
const contatoController = require('../controllers/contatoController');
const authMiddleware = require('../middlewares/auth');

router.post('/', contatoController.create);
router.get('/', authMiddleware, contatoController.list);
router.get('/:id', authMiddleware, contatoController.getById);
router.put('/:id', authMiddleware, contatoController.update);

module.exports = router;
