const express = require('express');
const auth = require('../middlewares/auth');
const controller = require('../controllers/clienteController');

const router = express.Router();
router.get('/', auth, controller.list);
router.put('/:id', auth, controller.update);

module.exports = router;
